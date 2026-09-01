import { JobStatus, UserRole } from '../enums/index'
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
  customerName: string
  customerPhone: string
  address: string
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
