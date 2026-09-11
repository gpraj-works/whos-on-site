import dayjs from 'dayjs'
import { and, desc, eq, sql } from 'drizzle-orm'
import { Coordinates, CustomerDto, JobDto, JobStatus, JobStatusHistoryDto } from '@routeboard/shared'
import { DatabaseClient, db } from '../../infrastructure/database/client'
import {
  customers,
  jobAssignments,
  jobs,
  jobStatusHistory,
  technicians,
  users
} from '../../infrastructure/database/schema/index'
import {
  CreateAssignmentData,
  CreateJobData,
  CreateStatusHistoryData,
  JobFilterParams,
  UpdateJobData
} from './job.types'

/** Helper to format database job row into JobDto */
function mapJobRow(row: Record<string, unknown>): JobDto {
  const customerAdditionalInfo = row.customerAdditionalInfo
  const additionalInfo = customerAdditionalInfo
    ? typeof customerAdditionalInfo === 'string'
      ? JSON.parse(customerAdditionalInfo)
      : customerAdditionalInfo
    : null

  const customerIdC = row.customerIdC as string | undefined
  const customer: CustomerDto | null = customerIdC
    ? {
        id: customerIdC,
        companyId: row.customerCompanyId as string,
        name: row.customerNameC as string,
        email: (row.customerEmail as string | null) || null,
        mobile: row.customerMobile as string,
        address: row.customerAddress as string,
        additionalInfo,
        createdAt: dayjs(row.customerCreatedAt as Date | string).toISOString(),
        updatedAt: dayjs(row.customerUpdatedAt as Date | string).toISOString()
      }
    : null

  return {
    id: row.id as string,
    companyId: row.companyId as string,
    customerId: row.customerId as string,
    customer,
    location: (row.location as Coordinates | null) || null,
    status: row.status as JobStatus,
    scheduledAt: row.scheduledAt ? dayjs(row.scheduledAt as Date | string).toISOString() : null,
    assignedTechnicianId: (row.assignedTechnicianId as string | null) || null,
    assignedTechnicianName: (row.assignedTechnicianName as string | null) || null,
    notes: (row.notes as string | null) || null,
    createdAt: dayjs(row.createdAt as Date | string).toISOString(),
    updatedAt: dayjs(row.updatedAt as Date | string).toISOString()
  }
}

/** Create a new job record */
export async function createJob(
  data: CreateJobData,
  client: DatabaseClient = db
): Promise<JobDto> {
  const locationSql = data.location
    ? sql`ST_SetSRID(ST_MakePoint(${data.location.lng}, ${data.location.lat}), 4326)`
    : null

  const [row] = await client
    .insert(jobs)
    .values({
      companyId: data.companyId,
      customerId: data.customerId,
      location: locationSql,
      status: 'unassigned',
      scheduledAt: data.scheduledAt ? dayjs(data.scheduledAt).toDate() : null,
      notes: data.notes || null,
      createdBy: data.createdBy || null
    })
    .returning()

  return mapJobRow(row)
}

/** Find job by ID and company ID */
export async function findJobById(
  id: string,
  companyId: string,
  client: DatabaseClient = db
): Promise<JobDto | null> {
  const [row] = await client
    .select({
      id: jobs.id,
      companyId: jobs.companyId,
      customerId: jobs.customerId,
      location: jobs.location,
      status: jobs.status,
      scheduledAt: jobs.scheduledAt,
      assignedTechnicianId: jobs.assignedTechnicianId,
      assignedTechnicianName: technicians.name,
      notes: jobs.notes,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
      customerIdC: customers.id,
      customerCompanyId: customers.companyId,
      customerNameC: customers.name,
      customerEmail: customers.email,
      customerMobile: customers.mobile,
      customerAddress: customers.address,
      customerAdditionalInfo: customers.additionalInfo,
      customerCreatedAt: customers.createdAt,
      customerUpdatedAt: customers.updatedAt
    })
    .from(jobs)
    .leftJoin(technicians, eq(jobs.assignedTechnicianId, technicians.id))
    .leftJoin(customers, eq(jobs.customerId, customers.id))
    .where(and(eq(jobs.id, id), eq(jobs.companyId, companyId)))

  if (!row) return null
  return mapJobRow(row)
}

/** Find jobs with filters (status, technician, date, pagination) */
export async function findJobs(
  params: JobFilterParams,
  client: DatabaseClient = db
): Promise<JobDto[]> {
  const conditions = [eq(jobs.companyId, params.companyId)]

  if (params.status) {
    conditions.push(eq(jobs.status, params.status))
  }

  if (params.assignedTechnicianId) {
    conditions.push(eq(jobs.assignedTechnicianId, params.assignedTechnicianId))
  }

  if (params.date) {
    const startOfDay = dayjs(params.date).startOf('day').toDate()
    const endOfDay = dayjs(params.date).endOf('day').toDate()

    conditions.push(sql`${jobs.scheduledAt} >= ${startOfDay} AND ${jobs.scheduledAt} <= ${endOfDay}`)
  }

  const limit = params.limit || 50
  const offset = params.offset || 0

  const rows = await client
    .select({
      id: jobs.id,
      companyId: jobs.companyId,
      customerId: jobs.customerId,
      location: jobs.location,
      status: jobs.status,
      scheduledAt: jobs.scheduledAt,
      assignedTechnicianId: jobs.assignedTechnicianId,
      assignedTechnicianName: technicians.name,
      notes: jobs.notes,
      createdAt: jobs.createdAt,
      updatedAt: jobs.updatedAt,
      customerIdC: customers.id,
      customerCompanyId: customers.companyId,
      customerNameC: customers.name,
      customerEmail: customers.email,
      customerMobile: customers.mobile,
      customerAddress: customers.address,
      customerAdditionalInfo: customers.additionalInfo,
      customerCreatedAt: customers.createdAt,
      customerUpdatedAt: customers.updatedAt
    })
    .from(jobs)
    .leftJoin(technicians, eq(jobs.assignedTechnicianId, technicians.id))
    .leftJoin(customers, eq(jobs.customerId, customers.id))
    .where(and(...conditions))
    .orderBy(desc(jobs.createdAt))
    .limit(limit)
    .offset(offset)

  return rows.map(mapJobRow)
}

/** Update job details */
export async function updateJob(
  id: string,
  companyId: string,
  data: UpdateJobData,
  client: DatabaseClient = db
): Promise<JobDto | null> {
  const updatePayload: Record<string, unknown> = {
    updatedAt: dayjs().toDate()
  }

  if (data.customerId !== undefined) updatePayload.customerId = data.customerId
  if (data.notes !== undefined) updatePayload.notes = data.notes
  if (data.updatedBy !== undefined) updatePayload.updatedBy = data.updatedBy

  if (data.scheduledAt !== undefined) {
    updatePayload.scheduledAt = data.scheduledAt ? dayjs(data.scheduledAt).toDate() : null
  }

  if (data.location !== undefined) {
    updatePayload.location = data.location
      ? sql`ST_SetSRID(ST_MakePoint(${data.location.lng}, ${data.location.lat}), 4326)`
      : null
  }

  const [row] = await client
    .update(jobs)
    .set(updatePayload)
    .where(and(eq(jobs.id, id), eq(jobs.companyId, companyId)))
    .returning()

  if (!row) return null
  return findJobById(id, companyId, client)
}

/** Update job status */
export async function updateJobStatus(
  id: string,
  companyId: string,
  status: JobStatus,
  client: DatabaseClient = db
): Promise<JobDto | null> {
  const [row] = await client
    .update(jobs)
    .set({
      status,
      updatedAt: dayjs().toDate()
    })
    .where(and(eq(jobs.id, id), eq(jobs.companyId, companyId)))
    .returning()

  if (!row) return null
  return findJobById(id, companyId, client)
}

/** Update job technician assignment */
export async function updateJobAssignment(
  id: string,
  companyId: string,
  technicianId: string | null,
  client: DatabaseClient = db
): Promise<JobDto | null> {
  const [row] = await client
    .update(jobs)
    .set({
      assignedTechnicianId: technicianId,
      updatedAt: dayjs().toDate()
    })
    .where(and(eq(jobs.id, id), eq(jobs.companyId, companyId)))
    .returning()

  if (!row) return null
  return findJobById(id, companyId, client)
}

/** Insert record into job_status_history table */
export async function createStatusHistory(
  data: CreateStatusHistoryData,
  client: DatabaseClient = db
) {
  const [row] = await client
    .insert(jobStatusHistory)
    .values({
      companyId: data.companyId,
      jobId: data.jobId,
      fromStatus: data.fromStatus,
      toStatus: data.toStatus,
      changedBy: data.changedBy || null,
      changedAt: dayjs().toDate(),
      note: data.note || null
    })
    .returning()

  return row
}

/** Get status history trail for a job */
export async function findJobStatusHistory(
  jobId: string,
  companyId: string,
  client: DatabaseClient = db
): Promise<JobStatusHistoryDto[]> {
  const rows = await client
    .select({
      id: jobStatusHistory.id,
      companyId: jobStatusHistory.companyId,
      jobId: jobStatusHistory.jobId,
      fromStatus: jobStatusHistory.fromStatus,
      toStatus: jobStatusHistory.toStatus,
      changedBy: jobStatusHistory.changedBy,
      changedByName: users.email,
      changedAt: jobStatusHistory.changedAt,
      note: jobStatusHistory.note
    })
    .from(jobStatusHistory)
    .leftJoin(users, eq(jobStatusHistory.changedBy, users.id))
    .where(and(eq(jobStatusHistory.jobId, jobId), eq(jobStatusHistory.companyId, companyId)))
    .orderBy(desc(jobStatusHistory.changedAt))

  return rows.map((r) => ({
    id: r.id,
    companyId: r.companyId,
    jobId: r.jobId,
    fromStatus: r.fromStatus as JobStatus | null,
    toStatus: r.toStatus as JobStatus,
    changedBy: r.changedBy,
    changedByName: r.changedByName || null,
    changedAt: dayjs(r.changedAt).toISOString(),
    note: r.note || null
  }))
}

/** Insert record into job_assignments table */
export async function createAssignmentRecord(
  data: CreateAssignmentData,
  client: DatabaseClient = db
) {
  const [row] = await client
    .insert(jobAssignments)
    .values({
      companyId: data.companyId,
      jobId: data.jobId,
      technicianId: data.technicianId,
      assignedBy: data.assignedBy || null,
      assignedAt: dayjs().toDate()
    })
    .returning()

  return row
}
