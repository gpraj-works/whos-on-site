import { AnyPgColumn, timestamp, uuid } from 'drizzle-orm/pg-core'
import { companies } from './companies.js'
import { users } from './users.js'

// Company tenant scope helper
export const companyId = () =>
  uuid('company_id')
    .references(() => companies.id, { onDelete: 'cascade' })
    .notNull()

// Reusable timestamp helpers
export const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).defaultNow().notNull()

export const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()

export const timestamps = () => ({
  createdAt: createdAt(),
  updatedAt: updatedAt()
})

// Reusable user audit helpers
export const createdBy = () =>
  uuid('created_by').references((): AnyPgColumn => users.id, { onDelete: 'set null' })

export const updatedBy = () =>
  uuid('updated_by').references((): AnyPgColumn => users.id, { onDelete: 'set null' })

export const auditUserFields = () => ({
  createdBy: createdBy(),
  updatedBy: updatedBy()
})
