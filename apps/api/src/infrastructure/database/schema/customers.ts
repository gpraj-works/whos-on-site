import { doublePrecision, index, jsonb, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from './common'
import { companyId } from './company'
import { auditUserFields } from './audit'

export const customers = pgTable(
  'customers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: companyId(),
    name: text('name').notNull(),
    email: text('email'),
    mobile: text('mobile').notNull(),
    address: text('address').notNull(),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    additionalInfo: jsonb('additional_info'),
    ...timestamps(),
    ...auditUserFields()
  },
  (table) => [
    index('customers_company_id_idx').on(table.companyId),
    index('customers_name_idx').on(table.name)
  ]
)
