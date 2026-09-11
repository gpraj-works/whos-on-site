import { and, eq, isNull, sql } from 'drizzle-orm'
import { DatabaseClient, db, executeRaw } from '../../infrastructure/database/client'
import { companies, refreshTokens, users } from '../../infrastructure/database/schema/index'
import { CreateCompanyData, CreateRefreshTokenData, CreateUserData } from './auth.types'

export async function createCompany(data: CreateCompanyData, client: DatabaseClient = db) {
  const [company] = await client.insert(companies).values(data).returning()
  return company
}

export async function findCompanyById(id: string, client: DatabaseClient = db) {
  const [company] = await client.select().from(companies).where(eq(companies.id, id))
  return company || null
}

export async function createUser(data: CreateUserData, client: DatabaseClient = db) {
  const [user] = await client.insert(users).values(data).returning()
  return user
}

export async function findUserByEmail(email: string, client: DatabaseClient = db) {
  const [user] = await client.select().from(users).where(eq(users.email, email.toLowerCase()))
  return user || null
}

export async function findUserById(id: string, client: DatabaseClient = db) {
  const [user] = await client.select().from(users).where(eq(users.id, id))
  return user || null
}

export async function createRefreshToken(
  data: CreateRefreshTokenData,
  client: DatabaseClient = db
) {
  const [token] = await client.insert(refreshTokens).values(data).returning()
  return token
}

export async function findActiveRefreshTokenByHash(tokenHash: string, client: DatabaseClient = db) {
  const [token] = await client
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)))
  return token || null
}

export async function findRefreshTokenByHash(tokenHash: string, client: DatabaseClient = db) {
  const [token] = await client
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash))
  return token || null
}

export async function revokeRefreshToken(id: string, client: DatabaseClient = db) {
  const [token] = await client
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, id))
    .returning()
  return token || null
}

export async function revokeUserRefreshTokens(userId: string, client: DatabaseClient = db) {
  await client
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)))
}

/**
 * Example native SQL query for complex multi-table joins or custom raw SQL expressions.
 */
export async function findActiveUserWithCompanyNative(userId: string, client: DatabaseClient = db) {
  const query = sql`
    SELECT 
      u.id AS user_id,
      u.email,
      u.role,
      c.id AS company_id,
      c.name AS company_name
    FROM users u
    JOIN companies c ON u.company_id = c.id
    WHERE u.id = ${userId}
  `
  const [result] = await executeRaw<{
    user_id: string
    email: string
    role: string
    company_id: string
    company_name: string
  }>(query, client)

  return result || null
}
