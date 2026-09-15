import { Coordinates, JobStatus } from '@whosonsite/shared'

export interface CreateJobData {
  companyId: string
  customerId: string
  location?: Coordinates
  scheduledAt?: string
  notes?: string
  createdBy?: string
}

export interface UpdateJobData {
  customerId?: string
  location?: Coordinates
  scheduledAt?: string | null
  notes?: string | null
  updatedBy?: string
}

export interface JobFilterParams {
  companyId: string
  status?: JobStatus
  assignedAgentId?: string
  date?: string
  limit?: number
  offset?: number
}

export interface CreateStatusHistoryData {
  companyId: string
  jobId: string
  fromStatus: JobStatus | null
  toStatus: JobStatus
  changedBy?: string
  note?: string
}

export interface CreateAssignmentData {
  companyId: string
  jobId: string
  agentId: string
  assignedBy?: string
}
