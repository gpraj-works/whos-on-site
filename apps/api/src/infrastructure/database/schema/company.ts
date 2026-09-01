import { uuid } from 'drizzle-orm/pg-core'
import { companies } from './companies'

/** Reusable company_id reference column */
export const companyId = () =>
  uuid('company_id')
    .references(() => companies.id, { onDelete: 'cascade' })
    .notNull()
