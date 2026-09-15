import { AgentStatus } from '../enums/index'
import { Coordinates } from '../schemas/index'
import { AgentDto } from '../types/index'

export interface AgentLocationUpdatedEvent {
  companyId: string
  agentId: string
  lat: number
  lng: number
  location?: Coordinates
  updatedAt: string
}

export interface AgentStatusChangedEvent {
  companyId: string
  agentId: string
  status: AgentStatus
  updatedAt?: string
  agent?: AgentDto
}

export interface LocationPingEvent {
  companyId?: string
  agentId?: string
  lat: number
  lng: number
  timestamp?: string
}
