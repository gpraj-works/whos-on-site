import { index, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { technicians } from './technicians'
import { postgisGeometry } from '../custom-types/postgis'
import { auditUserFields, companyId, timestamps } from './common'

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
    companyId: companyId(),
    customerName: text('customer_name').notNull(),
    customerPhone: text('customer_phone').notNull(),
    address: text('address').notNull(),
    location: postgisGeometry('location'),
    status: jobStatusEnum('status').default('unassigned').notNull(),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
    assignedTechnicianId: uuid('assigned_technician_id').references(() => technicians.id, {
      onDelete: 'set null'
    }),
    notes: text('notes'),
    ...timestamps(),
    ...auditUserFields()
  },
  (table) => [
    index('jobs_company_status_idx').on(table.companyId, table.status),
    index('jobs_assigned_technician_id_idx').on(table.assignedTechnicianId)
  ]
)
