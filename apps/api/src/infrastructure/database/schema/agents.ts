import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'
import { postgisGeometry } from '../custom-types/postgis'
import { timestamps } from './common'
import { companyId } from './company'
import { auditUserFields } from './audit'

export const agentStatusEnum = pgEnum('agent_status', ['available', 'busy', 'offline'])

export const agents = pgTable(
  'agents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: companyId(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    currentLocation: postgisGeometry('current_location'),
    status: agentStatusEnum('status').default('offline').notNull(),
    lastLocationAt: timestamp('last_location_at', { withTimezone: true }),
    ...timestamps(),
    ...auditUserFields()
  },
  (table) => [
    index('agents_company_id_idx').on(table.companyId),
    index('agents_status_idx').on(table.status),
    index('agents_company_status_idx').on(table.companyId, table.status)
  ]
)
