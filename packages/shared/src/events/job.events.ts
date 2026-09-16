import { JobStatus } from '../enums/index'
import { JobDto } from '../types/index'

export interface JobCreatedEvent {
  companyId: string
  jobId: string
  customerId?: string
  status: JobStatus
  assignedAgentId?: string | null
  createdAt?: string
  job?: JobDto
}

export interface JobAssignedEvent {
  companyId: string
  jobId: string
  agentId: string
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
