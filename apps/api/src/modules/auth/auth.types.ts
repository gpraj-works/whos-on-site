import { UserRole } from '@routeboard/shared'

export interface CreateCompanyData {
  name: string
}

export interface CreateUserData {
  companyId: string
  email: string
  passwordHash: string
  role: UserRole
}

export interface CreateRefreshTokenData {
  companyId: string
  userId: string
  tokenHash: string
  expiresAt: Date
}
