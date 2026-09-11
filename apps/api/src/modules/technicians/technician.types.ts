import { Coordinates, TechnicianStatus } from '@whosonsite/shared'

export interface CreateTechnicianData {
  companyId: string
  userId?: string
  name: string
  phone: string
  status?: TechnicianStatus
  location?: Coordinates
  createdBy?: string
}

export interface NearbyTechnicianQuery {
  companyId: string
  lat: number
  lng: number
  radiusMeters?: number
}

export interface TechnicianQueryResult {
  id: string
  companyId: string
  userId: string | null
  name: string
  phone: string
  status: TechnicianStatus
  location: Coordinates | null
  lastLocationAt: string | null
  distanceMeters?: number
}
