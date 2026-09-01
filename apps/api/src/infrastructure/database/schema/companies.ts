import { pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from './common.js'

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  ...timestamps()
})
