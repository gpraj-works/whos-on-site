import { AnyPgColumn, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'

/** Reusable created_by user audit column */
export const createdBy = () =>
  uuid('created_by').references((): AnyPgColumn => users.id, { onDelete: 'set null' })

/** Reusable updated_by user audit column */
export const updatedBy = () =>
  uuid('updated_by').references((): AnyPgColumn => users.id, { onDelete: 'set null' })

/** Reusable created_by and updated_by user audit columns */
export const auditUserFields = () => ({
  createdBy: createdBy(),
  updatedBy: updatedBy()
})
