import { UserRole } from '@whosonsite/shared'

export interface CreateCompanyData {
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
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
