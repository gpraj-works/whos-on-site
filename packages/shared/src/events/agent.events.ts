import { AgentStatus } from '../enums/index'
import { AgentDto } from '../types/index'

export interface AgentLocationUpdatedEvent {
  companyId: string
  agentId: string
  lat: number
  lng: number
  updatedAt: string
}

export interface AgentStatusChangedEvent {
  companyId: string
  agentId: string
  status: AgentStatus
  updatedAt?: string
  agent?: AgentDto
}
