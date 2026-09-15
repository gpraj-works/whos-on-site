import { TeamMemberStatus } from '../enums/index'
import { Coordinates } from '../schemas/index'
import { TeamMemberDto } from '../types/index'

export interface TeamMemberLocationUpdatedEvent {
  companyId: string
  teamMemberId: string
  lat: number
  lng: number
  location?: Coordinates
  updatedAt: string
}

export interface TeamMemberStatusChangedEvent {
  companyId: string
  teamMemberId: string
  status: TeamMemberStatus
  updatedAt?: string
  teamMember?: TeamMemberDto
}

export interface LocationPingEvent {
  companyId?: string
  teamMemberId?: string
  lat: number
  lng: number
  timestamp?: string
}
