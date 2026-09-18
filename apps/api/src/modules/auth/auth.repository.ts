import { and, eq, isNull } from 'drizzle-orm'
import { dayjs } from '@whosonsite/shared'
import { DatabaseClient, db } from '../../infrastructure/database/client'
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
    .set({ revokedAt: dayjs().toDate() })
    .where(eq(refreshTokens.id, id))
    .returning()
  return token || null
}

export async function revokeUserRefreshTokens(userId: string, client: DatabaseClient = db) {
  await client
    .update(refreshTokens)
    .set({ revokedAt: dayjs().toDate() })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)))
}

export async function updateUserPassword(
  userId: string,
  passwordHash: string,
  client: DatabaseClient = db
) {
  const [user] = await client
    .update(users)
    .set({ passwordHash, updatedAt: dayjs().toDate() })
    .where(eq(users.id, userId))
    .returning()
  return user || null
}

