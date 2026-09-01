import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jobs, jobStatusEnum } from './jobs'
import { users } from './users'
import { companyId } from './company'

export const jobStatusHistory = pgTable(
  'job_status_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: companyId(),
    jobId: uuid('job_id')
      .references(() => jobs.id, { onDelete: 'cascade' })
      .notNull(),
    fromStatus: jobStatusEnum('from_status'),
    toStatus: jobStatusEnum('to_status').notNull(),
    changedBy: uuid('changed_by').references(() => users.id, { onDelete: 'set null' }),
    changedAt: timestamp('changed_at', { withTimezone: true }).defaultNow().notNull(),
    note: text('note')
  },
  (table) => [
    index('job_status_history_job_changed_idx').on(table.jobId, table.changedAt),
    index('job_status_history_company_idx').on(table.companyId)
  ]
)
