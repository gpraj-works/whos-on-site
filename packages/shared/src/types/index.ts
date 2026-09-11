import { JobStatus, TechnicianStatus, UserRole } from '../enums/index'
import { Coordinates } from '../schemas/index'

export interface HealthResponse {
  status: 'ok' | 'error'
  timestamp: string
  uptime: number
}

export interface ReadinessResponse {
  status: 'ready' | 'not_ready'
  services: {
    postgres: boolean
    redis: boolean
  }
  timestamp: string
}

export interface JwtPayload {
  userId: string
  companyId: string
  role: UserRole
}

export interface CompanyDto {
  id: string
  name: string
  primaryColor: string
  createdAt: string
  updatedAt: string
}

export interface CustomerDto {
  id: string
  companyId: string
  name: string
  email: string | null
  mobile: string
  address: string
  additionalInfo: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface AuthUser {
  id: string
  companyId: string
  email: string
  role: UserRole
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
  company?: CompanyDto
}

export interface RegisterRequest {
  companyName: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface TokenRefreshRequest {
  refreshToken: string
}

export interface JobDto {
  id: string
  companyId: string
  customerId: string
  customer: CustomerDto | null
  location: Coordinates | null
  status: JobStatus
  scheduledAt: string | null
  assignedTechnicianId: string | null
  assignedTechnicianName?: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface JobStatusHistoryDto {
  id: string
  companyId: string
  jobId: string
  fromStatus: JobStatus | null
  toStatus: JobStatus
  changedBy: string | null
  changedByName?: string | null
  changedAt: string
  note: string | null
}

export interface TechnicianDto {
  id: string
  companyId: string
  userId: string
  name: string
  phone: string
  status: TechnicianStatus
  location: Coordinates | null
  lastLocationAt: string | null
  distanceMeters?: number
}
