import { timestamp } from 'drizzle-orm/pg-core'

/** Reusable created_at timestamp column */
export const createdAt = () =>
  timestamp('created_at', { withTimezone: true }).defaultNow().notNull()

/** Reusable updated_at timestamp column */
export const updatedAt = () =>
  timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()

/** Reusable created_at and updated_at timestamp columns */
export const timestamps = () => ({
  createdAt: createdAt(),
  updatedAt: updatedAt()
})
