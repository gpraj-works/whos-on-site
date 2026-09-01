import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'
import { createdAt } from './common'
import { companyId } from './company'
import { createdBy } from './audit'

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: companyId(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: createdAt(),
    createdBy: createdBy()
  },
  (table) => [
    index('refresh_tokens_token_hash_idx').on(table.tokenHash),
    index('refresh_tokens_company_user_idx').on(table.companyId, table.userId),
    index('refresh_tokens_user_revoked_idx').on(table.userId, table.revokedAt, table.expiresAt)
  ]
)
