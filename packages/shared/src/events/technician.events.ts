import { TechnicianStatus } from '../enums/index'
import { Coordinates } from '../schemas/index'
import { TechnicianDto } from '../types/index'

export interface TechnicianLocationUpdatedEvent {
  companyId: string
  technicianId: string
  lat: number
  lng: number
  location?: Coordinates
  updatedAt: string
}

export interface TechnicianStatusChangedEvent {
  companyId: string
  technicianId: string
  status: TechnicianStatus
  updatedAt?: string
  technician?: TechnicianDto
}

export interface LocationPingEvent {
  companyId?: string
  technicianId?: string
  lat: number
  lng: number
  timestamp?: string
}
