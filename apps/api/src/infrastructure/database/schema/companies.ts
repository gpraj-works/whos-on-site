import { doublePrecision, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from './common'

export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  primaryColor: text('primary_color').default('teal').notNull(),
  ...timestamps()
})

