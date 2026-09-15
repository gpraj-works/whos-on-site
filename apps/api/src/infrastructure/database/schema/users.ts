import { index, pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from './common'
import { companyId } from './company'
import { auditUserFields } from './audit'

export const userRoleEnum = pgEnum('user_role', ['owner', 'admin', 'dispatcher', 'teamMember'])

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: companyId(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').default('dispatcher').notNull(),
    ...timestamps(),
    ...auditUserFields()
  },
  (table) => [index('users_company_id_idx').on(table.companyId)]
)
