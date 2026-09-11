import { JobStatus } from '../enums/index'
import { JobDto } from '../types/index'

export interface JobCreatedEvent {
  companyId: string
  jobId: string
  customerId?: string
  status: JobStatus
  assignedTechnicianId?: string | null
  createdAt?: string
  job?: JobDto
}

export interface JobUpdatedEvent {
  companyId: string
  jobId: string
  status?: JobStatus
  assignedTechnicianId?: string | null
  notes?: string | null
  updatedAt?: string
  job?: JobDto
}

export interface JobAssignedEvent {
  companyId: string
  jobId: string
  technicianId: string
  assignedAt?: string
}

export interface JobStatusChangedEvent {
  companyId: string
  jobId: string
  status: JobStatus
  fromStatus?: JobStatus | null
  changedBy?: string | null
  changedAt: string
}

export interface JobCancelledEvent {
  companyId: string
  jobId: string
  reason?: string | null
  cancelledAt: string
}
