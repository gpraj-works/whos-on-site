import { index, jsonb, pgEnum, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jobs } from './jobs'
import { createdAt } from './common'
import { companyId } from './company'
import { createdBy } from './audit'

export const notificationTypeEnum = pgEnum('notification_type', [
  'job_delayed',
  'tech_assigned',
  'daily_summary'
])

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: companyId(),
    jobId: uuid('job_id').references(() => jobs.id, { onDelete: 'set null' }),
    type: notificationTypeEnum('type').notNull(),
    payload: jsonb('payload').default({}),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: createdAt(),
    createdBy: createdBy()
  },
  (table) => [index('notifications_company_idx').on(table.companyId)]
)
