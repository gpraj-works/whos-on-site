import crypto from 'crypto'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { AuthResponse, AuthUser, JwtPayload, RegisterRequest, UserRole } from '@routeboard/shared'
import { env } from '../../config/env'
import { withTransaction } from '../../infrastructure/database/client'
import * as authRepo from './auth.repository'

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function generateOpaqueToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function generateAccessToken(user: { id: string; companyId: string; role: UserRole }): string {
  const payload: JwtPayload = {
    userId: user.id,
    companyId: user.companyId,
    role: user.role
  }
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '15m' })
}

function formatAuthUser(user: {
  id: string
  companyId: string
  email: string
  role: UserRole
  createdAt: Date
}): AuthUser {
  return {
    id: user.id,
    companyId: user.companyId,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt.toISOString()
  }
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const existingUser = await authRepo.findUserByEmail(data.email)
  if (existingUser) {
    throw new Error('A user with this email address already exists.')
  }

  const passwordHash = await argon2.hash(data.password)

  return withTransaction(async (tx) => {
    const company = await authRepo.createCompany({ name: data.companyName }, tx)

    const user = await authRepo.createUser(
      {
        companyId: company.id,
        email: data.email.toLowerCase(),
        passwordHash,
        role: UserRole.OWNER
      },
      tx
    )

    const accessToken = generateAccessToken({
      id: user.id,
      companyId: user.companyId,
      role: user.role as UserRole
    })
    const refreshToken = generateOpaqueToken()
    const tokenHash = hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await authRepo.createRefreshToken(
      {
        companyId: company.id,
        userId: user.id,
        tokenHash,
        expiresAt
      },
      tx
    )

    return {
      accessToken,
      refreshToken,
      user: formatAuthUser({
        ...user,
        role: user.role as UserRole
      })
    }
  })
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const user = await authRepo.findUserByEmail(email)
  if (!user) {
    throw new Error('Invalid email or password.')
  }

  const validPassword = await argon2.verify(user.passwordHash, password)
  if (!validPassword) {
    throw new Error('Invalid email or password.')
  }

  const accessToken = generateAccessToken({
    id: user.id,
    companyId: user.companyId,
    role: user.role as UserRole
  })
  const refreshToken = generateOpaqueToken()
  const tokenHash = hashToken(refreshToken)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await authRepo.createRefreshToken({
    companyId: user.companyId,
    userId: user.id,
    tokenHash,
    expiresAt
  })

  return {
    accessToken,
    refreshToken,
    user: formatAuthUser({
      ...user,
      role: user.role as UserRole
    })
  }
}

export async function refreshToken(rawRefreshToken: string): Promise<AuthResponse> {
  const tokenHash = hashToken(rawRefreshToken)

  const activeToken = await authRepo.findActiveRefreshTokenByHash(tokenHash)
  if (!activeToken) {
    throw new Error('Invalid or revoked refresh token.')
  }

  if (new Date() > activeToken.expiresAt) {
    await authRepo.revokeRefreshToken(activeToken.id)
    throw new Error('Refresh token expired. Please log in again.')
  }

  // Rotation-on-use: Revoke old refresh token
  await authRepo.revokeRefreshToken(activeToken.id)

  const user = await authRepo.findUserById(activeToken.userId)
  if (!user) {
    throw new Error('User associated with token no longer exists.')
  }

  const newAccessToken = generateAccessToken({
    id: user.id,
    companyId: user.companyId,
    role: user.role as UserRole
  })
  const newRefreshToken = generateOpaqueToken()
  const newTokenHash = hashToken(newRefreshToken)
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await authRepo.createRefreshToken({
    companyId: user.companyId,
    userId: user.id,
    tokenHash: newTokenHash,
    expiresAt: newExpiresAt
  })

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: formatAuthUser({
      ...user,
      role: user.role as UserRole
    })
  }
}

export async function logout(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashToken(rawRefreshToken)
  const tokenRecord = await authRepo.findActiveRefreshTokenByHash(tokenHash)
  if (tokenRecord) {
    await authRepo.revokeRefreshToken(tokenRecord.id)
  }
}
