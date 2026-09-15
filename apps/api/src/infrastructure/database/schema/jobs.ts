import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { agents } from './agents'
import { customers } from './customers'
import { postgisGeometry } from '../custom-types/postgis'
import { timestamps } from './common'
import { companyId } from './company'
import { auditUserFields } from './audit'

export const jobStatusEnum = pgEnum('job_status', [
  'unassigned',
  'assigned',
  'en_route',
  'on_site',
  'complete',
  'cancelled'
])

export const jobs = pgTable(
  'jobs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    shareToken: uuid('share_token').defaultRandom().notNull(),
    companyId: companyId(),
    customerId: uuid('customer_id')
      .references(() => customers.id, { onDelete: 'no action' })
      .notNull(),
    location: postgisGeometry('location'),
    status: jobStatusEnum('status').default('unassigned').notNull(),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    assignedAgentId: uuid('assigned_agent_id').references(() => agents.id, {
      onDelete: 'set null'
    }),
    notes: text('notes'),
    ...timestamps(),
    ...auditUserFields()
  },
  (table) => [
    index('jobs_company_status_idx').on(table.companyId, table.status),
    index('jobs_assigned_agent_id_idx').on(table.assignedAgentId),
    index('jobs_customer_id_idx').on(table.customerId),
    uniqueIndex('jobs_share_token_idx').on(table.shareToken)
  ]
)
