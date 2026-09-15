import { index, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jobs } from './jobs'
import { teamMembers } from './team-members'
import { users } from './users'
import { companyId } from './company'

export const jobAssignments = pgTable(
  'job_assignments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: companyId(),
    jobId: uuid('job_id')
      .references(() => jobs.id, { onDelete: 'cascade' })
      .notNull(),
    teamMemberId: uuid('team_member_id')
      .references(() => teamMembers.id, { onDelete: 'cascade' })
      .notNull(),
    assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
    assignedBy: uuid('assigned_by').references(() => users.id, { onDelete: 'set null' })
  },
  (table) => [
    index('job_assignments_company_idx').on(table.companyId),
    index('job_assignments_job_idx').on(table.jobId)
  ]
)
