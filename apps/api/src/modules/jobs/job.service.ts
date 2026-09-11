import { CreateJobInput, JobDto, JobFilterQuery, JobStatus, JobStatusHistoryDto, UpdateJobInput, UserRole } from '@routeboard/shared'
import { BadRequestError, ForbiddenError, NotFoundError } from '../../common/app-error'
import { withTransaction } from '../../infrastructure/database/client'
import { findCustomerById } from '../customers/customer.repository'
import { findCompanyTechnicians } from '../technicians/technician.repository'
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

  // If user is technician, verify they are assigned to this job
  if (userRole === UserRole.TECHNICIAN) {
    const techList = await findCompanyTechnicians(companyId)
    const currentTech = techList.find((t) => t.userId === userId)
    if (!currentTech || job.assignedTechnicianId !== currentTech.id) {
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
  let filterTechnicianId = query.assignedTechnicianId

  // If user is technician, force filter to their technician ID
  if (userRole === UserRole.TECHNICIAN) {
    const techList = await findCompanyTechnicians(companyId)
    const currentTech = techList.find((t) => t.userId === userId)
    if (!currentTech) {
      return []
    }
    filterTechnicianId = currentTech.id
  }

  return jobRepo.findJobs({
    companyId,
    status: query.status,
    assignedTechnicianId: filterTechnicianId,
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

  // If technician, verify assigned to this job
  if (userRole === UserRole.TECHNICIAN) {
    const techList = await findCompanyTechnicians(companyId)
    const currentTech = techList.find((t) => t.userId === userId)
    if (!currentTech || job.assignedTechnicianId !== currentTech.id) {
      throw new ForbiddenError('Technicians can only update status for their assigned jobs')
    }
  }

  // Validate state transition using State Machine
  if (!canTransition(job.status, targetStatus)) {
    throw new BadRequestError(
      `Illegal status transition: Cannot transition job from '${job.status}' to '${targetStatus}'`
    )
  }

  return withTransaction(async (tx) => {
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
