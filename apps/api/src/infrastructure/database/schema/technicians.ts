import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users.js'
import { postgisGeometry } from '../custom-types/postgis.js'
import { auditUserFields, companyId, timestamps } from './common.js'

export const technicianStatusEnum = pgEnum('technician_status', ['available', 'busy', 'offline'])

export const technicians = pgTable(
  'technicians',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: companyId(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    currentLocation: postgisGeometry('current_location'),
    status: technicianStatusEnum('status').default('offline').notNull(),
    lastLocationAt: timestamp('last_location_at', { withTimezone: true }),
    ...timestamps(),
    ...auditUserFields()
  },
  (table) => [
    index('technicians_company_id_idx').on(table.companyId),
    index('technicians_status_idx').on(table.status),
    index('technicians_company_status_idx').on(table.companyId, table.status)
  ]
)
