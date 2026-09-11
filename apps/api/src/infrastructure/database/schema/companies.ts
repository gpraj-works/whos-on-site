import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from './common'

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  primaryColor: text('primary_color').default('teal').notNull(),
  ...timestamps()
})
