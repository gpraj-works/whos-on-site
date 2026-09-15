import { Coordinates, AgentStatus } from '@whosonsite/shared'

export interface CreateAgentData {
  companyId: string
  userId?: string
  name: string
  phone: string
  status?: AgentStatus
  location?: Coordinates
  createdBy?: string
}

export interface NearbyAgentQuery {
  companyId: string
  lat: number
  lng: number
  radiusMeters?: number
}

export interface AgentQueryResult {
  id: string
  companyId: string
  userId: string | null
  name: string
  phone: string
  status: AgentStatus
  location: Coordinates | null
  lastLocationAt: string | null
  distanceMeters?: number
}
