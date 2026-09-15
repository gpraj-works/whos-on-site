import { JobAssignedEvent, JobDto, JobStatus } from '@whosonsite/shared'
import { BadRequestError, NotFoundError } from '../../common/app-error'
import { withTransaction } from '../../infrastructure/database/client'
import { emitToCompany } from '../../infrastructure/socket/socket.events'
import { enqueueNotificationJob } from '../../jobs/queues/notification.queue'
import { findAgentById } from '../agents/agent.repository'
import * as jobRepo from './job.repository'
import { canTransition } from './job.state-machine'

/** Assign a agent to a job within an atomic transaction */
export async function assignAgentToJob(
  jobId: string,
  agentId: string,
  companyId: string,
  userId: string
): Promise<JobDto> {
  // Verify job belongs to company
  const job = await jobRepo.findJobById(jobId, companyId)
  if (!job) {
    throw new NotFoundError('Job not found')
  }

  // Verify agent belongs to company
  const tech = await findAgentById(agentId, companyId)
  if (!tech) {
    throw new NotFoundError('Agent not found or does not belong to company')
  }

  // Check if job is in a valid state to assign
  if (job.status === JobStatus.COMPLETE || job.status === JobStatus.CANCELLED) {
    throw new BadRequestError(`Cannot assign agent to a job that is '${job.status}'`)
  }

  const updatedJob = await withTransaction(async (tx) => {
    // Record assignment history entry
    await jobRepo.createAssignmentRecord(
      {
        companyId,
        jobId,
        agentId,
        assignedBy: userId
      },
      tx
    )

    // Update job assignment column
    await jobRepo.updateJobAssignment(jobId, companyId, agentId, tx)

    // Transition status to ASSIGNED if currently UNASSIGNED
    if (job.status === JobStatus.UNASSIGNED) {
      if (canTransition(JobStatus.UNASSIGNED, JobStatus.ASSIGNED)) {
        await jobRepo.updateJobStatus(jobId, companyId, JobStatus.ASSIGNED, tx)
        await jobRepo.createStatusHistory(
          {
            companyId,
            jobId,
            fromStatus: JobStatus.UNASSIGNED,
            toStatus: JobStatus.ASSIGNED,
            changedBy: userId,
            note: `Assigned to agent ${tech.name}`
          },
          tx
        )
      }
    }

    const updatedJob = await jobRepo.findJobById(jobId, companyId, tx)
    if (!updatedJob) {
      throw new NotFoundError('Job not found after assignment')
    }
    return updatedJob
  })

  // Emit job:assigned event after transaction commit
  emitToCompany<JobAssignedEvent>(companyId, 'job:assigned', {
    companyId,
    jobId: updatedJob.id,
    agentId,
    assignedAt: new Date().toISOString()
  })

  // Enqueue notification job
  enqueueNotificationJob({
    companyId,
    jobId: updatedJob.id,
    type: 'tech_assigned',
    payload: {
      jobId: updatedJob.id,
      agentId,
      assignedBy: userId
    }
  })

  return updatedJob
}

/** Unassign a agent from a job within an atomic transaction */
export async function unassignAgentFromJob(
  jobId: string,
  companyId: string,
  userId: string
): Promise<JobDto> {
  const job = await jobRepo.findJobById(jobId, companyId)
  if (!job) {
    throw new NotFoundError('Job not found')
  }

  if (!job.assignedAgentId) {
    throw new BadRequestError('Job is not currently assigned to any agent')
  }

  if (job.status === JobStatus.COMPLETE || job.status === JobStatus.CANCELLED) {
    throw new BadRequestError(`Cannot unassign agent from a job that is '${job.status}'`)
  }

  return withTransaction(async (tx) => {
    await jobRepo.updateJobAssignment(jobId, companyId, null, tx)

    if (job.status === JobStatus.ASSIGNED) {
      await jobRepo.updateJobStatus(jobId, companyId, JobStatus.UNASSIGNED, tx)
      await jobRepo.createStatusHistory(
        {
          companyId,
          jobId,
          fromStatus: JobStatus.ASSIGNED,
          toStatus: JobStatus.UNASSIGNED,
          changedBy: userId,
          note: 'Unassigned agent'
        },
        tx
      )
    }

    const updatedJob = await jobRepo.findJobById(jobId, companyId, tx)
    if (!updatedJob) {
      throw new NotFoundError('Job not found after unassignment')
    }
    return updatedJob
  })
}
