import {
  CreateJobInput,
  JobCreatedEvent,
  JobDto,
  JobFilterQuery,
  JobStatus,
  JobStatusChangedEvent,
  JobStatusHistoryDto,
  UpdateJobInput,
  UserRole
} from '@whosonsite/shared'
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/app-error'
import { withTransaction } from '../../infrastructure/database/client'
import { emitToCompany } from '../../infrastructure/socket/socket.events'
import {
  enqueueDelayedReminderJob,
  enqueueNotificationJob
} from '../../jobs/queues/notification.queue'
import { dayjs } from '@whosonsite/shared'
import { findCustomerById } from '../customers/customer.repository'
import { findCompanyAgents } from '../agents/agent.repository'
import * as jobRepo from './job.repository'
import { canTransition } from './job.state-machine'

/** Resolve and verify the customer belongs to the company */
async function resolveCustomer(customerId: string, companyId: string) {
  const customer = await findCustomerById(customerId, companyId)
  if (!customer) {
    throw new NotFoundError('Customer not found or does not belong to your company')
  }
  return customer
}

/** Create a new job record */
export async function createNewJob(
  input: CreateJobInput,
  companyId: string,
  userId: string
): Promise<JobDto> {
  await resolveCustomer(input.customerId, companyId)

  const job = await jobRepo.createJob({
    companyId,
    customerId: input.customerId,
    location: input.location,
    scheduledAt: input.scheduledAt,
    notes: input.notes,
    createdBy: userId
  })

  // Create initial status history entry for UNASSIGNED
  await jobRepo.createStatusHistory({
    companyId,
    jobId: job.id,
    fromStatus: null,
    toStatus: JobStatus.UNASSIGNED,
    changedBy: userId,
    note: 'Job created'
  })

  // Emit job:created event after persistence
  emitToCompany<JobCreatedEvent>(companyId, 'job:created', {
    companyId,
    jobId: job.id,
    customerId: job.customerId,
    status: job.status,
    assignedAgentId: job.assignedAgentId,
    createdAt: job.createdAt,
    job
  })

  // Enqueue notification job
  enqueueNotificationJob({
    companyId,
    jobId: job.id,
    type: 'job_created',
    payload: { jobId: job.id, status: job.status, customerId: job.customerId }
  })

  // Enqueue delayed reminder job
  enqueueDelayedReminderJob(companyId, job.id)

  return job
}

/** Get job details by ID */
export async function getJobDetail(
  jobId: string,
  companyId: string,
  userRole: UserRole,
  userId: string
): Promise<JobDto> {
  const job = await jobRepo.findJobById(jobId, companyId)
  if (!job) {
    throw new NotFoundError('Job not found')
  }

  // If user is agent, verify they are assigned to this job
  if (userRole === UserRole.AGENT) {
    const techList = await findCompanyAgents(companyId)
    const currentTech = techList.find((t) => t.userId === userId)
    if (!currentTech || job.assignedAgentId !== currentTech.id) {
      throw new ForbiddenError('You can only view jobs assigned to you')
    }
  }

  return job
}

/** List company jobs with filters */
export async function listCompanyJobs(
  query: JobFilterQuery,
  companyId: string,
  userRole: UserRole,
  userId: string
): Promise<JobDto[]> {
  let filterAgentId = query.assignedAgentId

  // If user is agent, force filter to their agent ID
  if (userRole === UserRole.AGENT) {
    const techList = await findCompanyAgents(companyId)
    const currentTech = techList.find((t) => t.userId === userId)
    if (!currentTech) {
      return []
    }
    filterAgentId = currentTech.id
  }

  return jobRepo.findJobs({
    companyId,
    status: query.status,
    assignedAgentId: filterAgentId,
    date: query.date,
    limit: query.limit,
    offset: query.offset
  })
}

/** Update job details */
export async function updateJobDetails(
  jobId: string,
  companyId: string,
  input: UpdateJobInput,
  userId: string
): Promise<JobDto> {
  const existing = await jobRepo.findJobById(jobId, companyId)
  if (!existing) {
    throw new NotFoundError('Job not found')
  }

  if (existing.status === JobStatus.COMPLETE || existing.status === JobStatus.CANCELLED) {
    throw new BadRequestError(`Cannot update details for a job that is '${existing.status}'`)
  }

  if (input.customerId !== undefined) {
    await resolveCustomer(input.customerId, companyId)
  }

  const updated = await jobRepo.updateJob(jobId, companyId, {
    customerId: input.customerId,
    location: input.location,
    scheduledAt: input.scheduledAt === null ? undefined : input.scheduledAt,
    notes: input.notes === null ? undefined : input.notes,
    updatedBy: userId
  })

  if (!updated) {
    throw new NotFoundError('Failed to update job')
  }
  return updated
}

/** Transition job status with state machine enforcement and audit log */
export async function changeJobStatus(
  jobId: string,
  targetStatus: JobStatus,
  companyId: string,
  userId: string,
  userRole: UserRole,
  note?: string
): Promise<JobDto> {
  const job = await jobRepo.findJobById(jobId, companyId)
  if (!job) {
    throw new NotFoundError('Job not found')
  }

  if (job.status === targetStatus) {
    return job
  }

  // If agent, verify assigned to this job
  if (userRole === UserRole.AGENT) {
    const techList = await findCompanyAgents(companyId)
    const currentTech = techList.find((t) => t.userId === userId)
    if (!currentTech || job.assignedAgentId !== currentTech.id) {
      throw new ForbiddenError('Agents can only update status for their assigned jobs')
    }
  }

  // Validate state transition using State Machine
  if (!canTransition(job.status, targetStatus)) {
    throw new BadRequestError(
      `Illegal status transition: Cannot transition job from '${job.status}' to '${targetStatus}'`
    )
  }

  const updatedJob = await withTransaction(async (tx) => {
    await jobRepo.updateJobStatus(jobId, companyId, targetStatus, tx)
    await jobRepo.createStatusHistory(
      {
        companyId,
        jobId,
        fromStatus: job.status,
        toStatus: targetStatus,
        changedBy: userId,
        note: note || `Status changed from ${job.status} to ${targetStatus}`
      },
      tx
    )

    const updated = await jobRepo.findJobById(jobId, companyId, tx)
    if (!updated) {
      throw new NotFoundError('Job not found after status change')
    }
    return updated
  })

  // Emit job:statusChanged event after transaction commit
  emitToCompany<JobStatusChangedEvent>(companyId, 'job:statusChanged', {
    companyId,
    jobId: updatedJob.id,
    status: updatedJob.status,
    fromStatus: job.status,
    changedBy: userId,
    changedAt: dayjs().toISOString()
  })

  // Enqueue notification job
  enqueueNotificationJob({
    companyId,
    jobId: updatedJob.id,
    type: 'job_status_changed',
    payload: {
      jobId: updatedJob.id,
      fromStatus: job.status,
      toStatus: updatedJob.status,
      changedBy: userId
    }
  })

  return updatedJob
}

/** Get status history trail for a job */
export async function getJobStatusHistoryTrail(
  jobId: string,
  companyId: string
): Promise<JobStatusHistoryDto[]> {
  const job = await jobRepo.findJobById(jobId, companyId)
  if (!job) {
    throw new NotFoundError('Job not found')
  }
  return jobRepo.findJobStatusHistory(jobId, companyId)
}

/** Cancel a job */
export async function cancelJob(
  jobId: string,
  companyId: string,
  userId: string,
  note?: string
): Promise<JobDto> {
  return changeJobStatus(
    jobId,
    JobStatus.CANCELLED,
    companyId,
    userId,
    UserRole.ADMIN,
    note || 'Job cancelled'
  )
}
