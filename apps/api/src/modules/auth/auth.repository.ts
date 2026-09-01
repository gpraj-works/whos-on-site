import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../../infrastructure/database/client';
import { companies, refreshTokens, users } from '../../infrastructure/database/schema/index';
import { CreateCompanyData, CreateRefreshTokenData, CreateUserData } from './auth.types';

export async function createCompany(data: CreateCompanyData) {
  const [company] = await db.insert(companies).values(data).returning();
  return company;
}

export async function createUser(data: CreateUserData) {
  const [user] = await db.insert(users).values(data).returning();
  return user;
}

export async function findUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase()));
  return user || null;
}

export async function findUserById(id: string) {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
}

export async function createRefreshToken(data: CreateRefreshTokenData) {
  const [token] = await db.insert(refreshTokens).values(data).returning();
  return token;
}

export async function findActiveRefreshTokenByHash(tokenHash: string) {
  const [token] = await db
    .select()
    .from(refreshTokens)
    .where(and(eq(refreshTokens.tokenHash, tokenHash), isNull(refreshTokens.revokedAt)));
  return token || null;
}

export async function revokeRefreshToken(id: string) {
  const [token] = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, id))
    .returning();
  return token || null;
}

export async function revokeUserRefreshTokens(userId: string) {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt)));
}
