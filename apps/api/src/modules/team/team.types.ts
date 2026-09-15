import { Coordinates, TeamMemberStatus } from '@whosonsite/shared'

export interface CreateTeamMemberData {
  companyId: string
  userId?: string
  name: string
  phone: string
  status?: TeamMemberStatus
  location?: Coordinates
  createdBy?: string
}

export interface NearbyTeamMemberQuery {
  companyId: string
  lat: number
  lng: number
  radiusMeters?: number
}

export interface TeamMemberQueryResult {
  id: string
  companyId: string
  userId: string | null
  name: string
  phone: string
  status: TeamMemberStatus
  location: Coordinates | null
  lastLocationAt: string | null
  distanceMeters?: number
}
