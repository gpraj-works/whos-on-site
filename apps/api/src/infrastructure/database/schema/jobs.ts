import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { teamMembers } from './team-members'
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
    assignedTeamMemberId: uuid('assigned_team_member_id').references(() => teamMembers.id, {
      onDelete: 'set null'
    }),
    notes: text('notes'),
    ...timestamps(),
    ...auditUserFields()
  },
  (table) => [
    index('jobs_company_status_idx').on(table.companyId, table.status),
    index('jobs_assigned_team_member_id_idx').on(table.assignedTeamMemberId),
    index('jobs_customer_id_idx').on(table.customerId),
    uniqueIndex('jobs_share_token_idx').on(table.shareToken)
  ]
)
