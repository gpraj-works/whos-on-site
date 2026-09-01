import { UserRole } from '../enums/index'

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
