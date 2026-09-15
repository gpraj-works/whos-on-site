import { JobAssignedEvent, JobDto, JobStatus } from '@whosonsite/shared'
import { BadRequestError, NotFoundError } from '../../common/app-error'
import { withTransaction } from '../../infrastructure/database/client'
import { emitToCompany } from '../../infrastructure/socket/socket.events'
import { enqueueNotificationJob } from '../../jobs/queues/notification.queue'
import { findTeamMemberById } from '../teamMembers/teamMember.repository'
import * as jobRepo from './job.repository'
import { canTransition } from './job.state-machine'

/** Assign a teamMember to a job within an atomic transaction */
export async function assignTeamMemberToJob(
  jobId: string,
  teamMemberId: string,
  companyId: string,
  userId: string
): Promise<JobDto> {
  // Verify job belongs to company
  const job = await jobRepo.findJobById(jobId, companyId)
  if (!job) {
    throw new NotFoundError('Job not found')
  }

  // Verify teamMember belongs to company
  const tech = await findTeamMemberById(teamMemberId, companyId)
  if (!tech) {
    throw new NotFoundError('TeamMember not found or does not belong to company')
  }

  // Check if job is in a valid state to assign
  if (job.status === JobStatus.COMPLETE || job.status === JobStatus.CANCELLED) {
    throw new BadRequestError(`Cannot assign teamMember to a job that is '${job.status}'`)
  }

  const updatedJob = await withTransaction(async (tx) => {
    // Record assignment history entry
    await jobRepo.createAssignmentRecord(
      {
        companyId,
        jobId,
        teamMemberId,
        assignedBy: userId
      },
      tx
    )

    // Update job assignment column
    await jobRepo.updateJobAssignment(jobId, companyId, teamMemberId, tx)

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
            note: `Assigned to teamMember ${tech.name}`
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
    teamMemberId,
    assignedAt: new Date().toISOString()
  })

  // Enqueue notification job
  enqueueNotificationJob({
    companyId,
    jobId: updatedJob.id,
    type: 'tech_assigned',
    payload: {
      jobId: updatedJob.id,
      teamMemberId,
      assignedBy: userId
    }
  })

  return updatedJob
}

/** Unassign a teamMember from a job within an atomic transaction */
export async function unassignTeamMemberFromJob(
  jobId: string,
  companyId: string,
  userId: string
): Promise<JobDto> {
  const job = await jobRepo.findJobById(jobId, companyId)
  if (!job) {
    throw new NotFoundError('Job not found')
  }

  if (!job.assignedTeamMemberId) {
    throw new BadRequestError('Job is not currently assigned to any teamMember')
  }

  if (job.status === JobStatus.COMPLETE || job.status === JobStatus.CANCELLED) {
    throw new BadRequestError(`Cannot unassign teamMember from a job that is '${job.status}'`)
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
          note: 'Unassigned teamMember'
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
