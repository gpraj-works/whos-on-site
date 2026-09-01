import { index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jobs } from './jobs.js'
import { technicians } from './technicians.js'
import { users } from './users.js'
import { companyId } from './common.js'

export const jobAssignments = pgTable(
  'job_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: companyId(),
    jobId: uuid('job_id')
      .references(() => jobs.id, { onDelete: 'cascade' })
      .notNull(),
    technicianId: uuid('technician_id')
      .references(() => technicians.id, { onDelete: 'cascade' })
      .notNull(),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
    assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' })
  },
  (table) => [
    index('job_assignments_company_idx').on(table.companyId),
    index('job_assignments_job_idx').on(table.jobId)
  ]
)
