import crypto from 'crypto'
import argon2 from 'argon2'
import { dayjs } from '@whosonsite/shared'
import jwt from 'jsonwebtoken'
import {
  AuthResponse,
  AuthUser,
  CompanyDto,
  JwtPayload,
  RegisterRequest,
  UserRole
} from '@whosonsite/shared'
import { env } from '../../config/env'
import { withTransaction } from '../../infrastructure/database/client'
import { logger } from '../../infrastructure/logging/logger'
import { BadRequestError } from '../../common/app-error'
import {
  sendCompanyRegistrationEmail,
  sendPasswordResetEmail
} from '../../infrastructure/email'
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
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '15m'
  })
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
    createdAt: dayjs(user.createdAt).toISOString()
  }
}

function formatCompany(company: {
  id: string
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
  primaryColor?: string | null
  createdAt: Date
  updatedAt: Date
}): CompanyDto {
  return {
    id: company.id,
    name: company.name,
    email: company.email || null,
    phone: company.phone || null,
    address: company.address || null,
    latitude: company.latitude ?? null,
    longitude: company.longitude ?? null,
    primaryColor: company.primaryColor || 'teal',
    createdAt: dayjs(company.createdAt).toISOString(),
    updatedAt: dayjs(company.updatedAt).toISOString()
  }
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const existingUser = await authRepo.findUserByEmail(data.email)
  if (existingUser) {
    throw new Error('A user with this email address already exists.')
  }

  const passwordHash = await argon2.hash(data.password)

  const authResponse = await withTransaction(async (tx) => {
    const company = await authRepo.createCompany(
      {
        name: data.companyName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        address: data.address,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null
      },
      tx
    )

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
    const expiresAt = dayjs().add(7, 'day').toDate()

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
      }),
      company: formatCompany(company)
    }
  })

  // Asynchronously dispatch company registration welcome email
  sendCompanyRegistrationEmail({
    to: data.email,
    companyName: data.companyName,
    phone: data.phone,
    address: data.address
  }).catch((err) => {
    logger.warn({ err, email: data.email }, 'Failed to dispatch company registration email')
  })

  return authResponse
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

  const company = await authRepo.findCompanyById(user.companyId)

  const accessToken = generateAccessToken({
    id: user.id,
    companyId: user.companyId,
    role: user.role as UserRole
  })
  const refreshToken = generateOpaqueToken()
  const tokenHash = hashToken(refreshToken)
  const expiresAt = dayjs().add(7, 'day').toDate()

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
    }),
    company: company ? formatCompany(company) : undefined
  }
}

export async function refreshToken(rawRefreshToken: string): Promise<AuthResponse> {
  const tokenHash = hashToken(rawRefreshToken)

  let tokenRecord = await authRepo.findActiveRefreshTokenByHash(tokenHash)

  if (!tokenRecord) {
    // Grace period check for concurrent network requests (within 10 seconds of revocation)
    const existingToken = await authRepo.findRefreshTokenByHash(tokenHash)
    if (
      existingToken &&
      existingToken.revokedAt &&
      dayjs().diff(dayjs(existingToken.revokedAt), 'second') <= 10
    ) {
      tokenRecord = existingToken
    } else {
      throw new Error('Invalid or revoked refresh token.')
    }
  }

  if (dayjs().isAfter(tokenRecord.expiresAt)) {
    await authRepo.revokeRefreshToken(tokenRecord.id)
    throw new Error('Refresh token expired. Please log in again.')
  }

  // Rotation-on-use: Revoke old refresh token if not already revoked
  if (!tokenRecord.revokedAt) {
    await authRepo.revokeRefreshToken(tokenRecord.id)
  }

  const user = await authRepo.findUserById(tokenRecord.userId)
  if (!user) {
    throw new Error('User associated with token no longer exists.')
  }

  const company = await authRepo.findCompanyById(user.companyId)

  const newAccessToken = generateAccessToken({
    id: user.id,
    companyId: user.companyId,
    role: user.role as UserRole
  })
  const newRefreshToken = generateOpaqueToken()
  const newTokenHash = hashToken(newRefreshToken)
  const newExpiresAt = dayjs().add(7, 'day').toDate()

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
    }),
    company: company ? formatCompany(company) : undefined
  }
}

export async function logout(rawRefreshToken: string): Promise<void> {
  const tokenHash = hashToken(rawRefreshToken)
  const tokenRecord = await authRepo.findActiveRefreshTokenByHash(tokenHash)
  if (tokenRecord) {
    await authRepo.revokeRefreshToken(tokenRecord.id)
  }
}

export async function getCurrentUser(
  userId: string
): Promise<{ user: AuthUser; company?: CompanyDto }> {
  const user = await authRepo.findUserById(userId)
  if (!user) {
    throw new Error('User not found.')
  }
  const company = await authRepo.findCompanyById(user.companyId)

  return {
    user: formatAuthUser({ ...user, role: user.role as UserRole }),
    company: company ? formatCompany(company) : undefined
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await authRepo.findUserByEmail(email)
  if (!user) {
    // Return early to prevent user enumeration
    return
  }

  const resetToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      type: 'password_reset'
    },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  const resetUrl = `${env.APP_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`

  sendPasswordResetEmail({
    to: user.email,
    resetUrl
  }).catch((err) => {
    logger.warn({ err, email: user.email }, 'Failed to dispatch password reset email')
  })
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  let decoded: { userId: string; email: string; type: string }
  try {
    decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string
      email: string
      type: string
    }
  } catch {
    throw new BadRequestError('Invalid or expired password reset link.')
  }

  if (decoded.type !== 'password_reset' || !decoded.userId) {
    throw new BadRequestError('Invalid password reset link.')
  }

  const user = await authRepo.findUserById(decoded.userId)
  if (!user) {
    throw new BadRequestError('User not found.')
  }

  const passwordHash = await argon2.hash(newPassword)

  await withTransaction(async (tx) => {
    await authRepo.updateUserPassword(user.id, passwordHash, tx)
    await authRepo.revokeUserRefreshTokens(user.id, tx)
  })
}

