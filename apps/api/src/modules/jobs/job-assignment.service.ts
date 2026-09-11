import { JobAssignedEvent, JobDto, JobStatus } from '@whosonsite/shared'
import { BadRequestError, NotFoundError } from '../../common/app-error'
import { withTransaction } from '../../infrastructure/database/client'
import { emitToCompany } from '../../infrastructure/socket/socket.events'
import { enqueueNotificationJob } from '../../jobs/queues/notification.queue'
import { findTechnicianById } from '../technicians/technician.repository'
import * as jobRepo from './job.repository'
import { canTransition } from './job.state-machine'

/** Assign a technician to a job within an atomic transaction */
export async function assignTechnicianToJob(
  jobId: string,
  technicianId: string,
  companyId: string,
  userId: string
): Promise<JobDto> {
  // Verify job belongs to company
  const job = await jobRepo.findJobById(jobId, companyId)
  if (!job) {
    throw new NotFoundError('Job not found')
  }

  // Verify technician belongs to company
  const tech = await findTechnicianById(technicianId, companyId)
  if (!tech) {
    throw new NotFoundError('Technician not found or does not belong to company')
  }

  // Check if job is in a valid state to assign
  if (job.status === JobStatus.COMPLETE || job.status === JobStatus.CANCELLED) {
    throw new BadRequestError(`Cannot assign technician to a job that is '${job.status}'`)
  }

  const updatedJob = await withTransaction(async (tx) => {
    // Record assignment history entry
    await jobRepo.createAssignmentRecord(
      {
        companyId,
        jobId,
        technicianId,
        assignedBy: userId
      },
      tx
    )

    // Update job assignment column
    await jobRepo.updateJobAssignment(jobId, companyId, technicianId, tx)

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
            note: `Assigned to technician ${tech.name}`
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
    technicianId,
    assignedAt: new Date().toISOString()
  })

  // Enqueue notification job
  enqueueNotificationJob({
    companyId,
    jobId: updatedJob.id,
    type: 'tech_assigned',
    payload: {
      jobId: updatedJob.id,
      technicianId,
      assignedBy: userId
    }
  })

  return updatedJob
}

/** Unassign a technician from a job within an atomic transaction */
export async function unassignTechnicianFromJob(
  jobId: string,
  companyId: string,
  userId: string
): Promise<JobDto> {
  const job = await jobRepo.findJobById(jobId, companyId)
  if (!job) {
    throw new NotFoundError('Job not found')
  }

  if (!job.assignedTechnicianId) {
    throw new BadRequestError('Job is not currently assigned to any technician')
  }

  if (job.status === JobStatus.COMPLETE || job.status === JobStatus.CANCELLED) {
    throw new BadRequestError(`Cannot unassign technician from a job that is '${job.status}'`)
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
          note: 'Unassigned technician'
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
