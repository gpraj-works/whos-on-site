import { UserRole } from '../enums/index.js'

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
