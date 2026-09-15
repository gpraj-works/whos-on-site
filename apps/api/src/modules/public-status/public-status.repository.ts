import dayjs from 'dayjs'
import { asc, eq } from 'drizzle-orm'
import { CustomerStatusDto, JobStatus } from '@whosonsite/shared'
import { DatabaseClient, db } from '../../infrastructure/database/client'
import {
  companies,
  customers,
  jobs,
  jobStatusHistory,
  technicians
} from '../../infrastructure/database/schema/index'

export async function findPublicJobByShareToken(
  token: string,
  client: DatabaseClient = db
): Promise<CustomerStatusDto | null> {
  const [jobRow] = await client
    .select({
      jobId: jobs.id,
      status: jobs.status,
      scheduledAt: jobs.scheduledAt,
      updatedAt: jobs.updatedAt,
      notes: jobs.notes,
      companyName: companies.name,
      companyPrimaryColor: companies.primaryColor,
      customerName: customers.name,
      technicianName: technicians.name
    })
    .from(jobs)
    .innerJoin(companies, eq(jobs.companyId, companies.id))
    .innerJoin(customers, eq(jobs.customerId, customers.id))
    .leftJoin(technicians, eq(jobs.assignedTechnicianId, technicians.id))
    .where(eq(jobs.shareToken, token))

  if (!jobRow) {
    return null
  }

  const isTerminalState = jobRow.status === 'complete' || jobRow.status === 'cancelled'
  if (isTerminalState) {
    const hoursSinceUpdate = dayjs().diff(dayjs(jobRow.updatedAt), 'hour')
    if (hoursSinceUpdate >= 48) {
      return null
    }
  }

  const historyRows = await client
    .select({
      toStatus: jobStatusHistory.toStatus,
      changedAt: jobStatusHistory.changedAt,
      note: jobStatusHistory.note
    })
    .from(jobStatusHistory)
    .where(eq(jobStatusHistory.jobId, jobRow.jobId))
    .orderBy(asc(jobStatusHistory.changedAt))

  return {
    jobId: jobRow.jobId,
    companyName: jobRow.companyName,
    companyPrimaryColor: jobRow.companyPrimaryColor || '#0d9488',
    status: jobRow.status as JobStatus,
    customerName: jobRow.customerName,
    technicianName: jobRow.technicianName || null,
    scheduledAt: jobRow.scheduledAt ? dayjs(jobRow.scheduledAt).toISOString() : null,
    updatedAt: dayjs(jobRow.updatedAt).toISOString(),
    notes: jobRow.notes || null,
    history: historyRows.map((h) => ({
      toStatus: h.toStatus as JobStatus,
      changedAt: dayjs(h.changedAt).toISOString(),
      note: h.note || null
    }))
  }
}
