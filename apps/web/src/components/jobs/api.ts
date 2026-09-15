import {
  CreateJobInput,
  JobDto,
  JobFilterQuery,
  JobStatus,
  JobStatusHistoryDto,
  UpdateJobInput
} from '@whosonsite/shared'
import { apiClient } from '../../lib/api'

export async function listJobs(filters?: JobFilterQuery): Promise<JobDto[]> {
  const params = new URLSearchParams()
  if (filters?.status) params.append('status', filters.status)
  if (filters?.assignedTechnicianId)
    params.append('assignedTechnicianId', filters.assignedTechnicianId)
  if (filters?.date) params.append('date', filters.date)
  if (filters?.limit !== undefined) params.append('limit', String(filters.limit))
  if (filters?.offset !== undefined) params.append('offset', String(filters.offset))

  const queryString = params.toString() ? `?${params.toString()}` : ''
  return apiClient<JobDto[]>(`/jobs${queryString}`)
}

export async function getJob(id: string): Promise<JobDto> {
  return apiClient<JobDto>(`/jobs/${id}`)
}

export async function createJob(input: CreateJobInput): Promise<JobDto> {
  return apiClient<JobDto>('/jobs', {
    method: 'POST',
    body: JSON.stringify(input)
  })
}

export async function updateJob(id: string, input: UpdateJobInput): Promise<JobDto> {
  return apiClient<JobDto>(`/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  })
}

export async function cancelJob(id: string): Promise<JobDto> {
  return updateJobStatus(id, JobStatus.CANCELLED, 'Job cancelled')
}

export async function assignJob(id: string, technicianId: string): Promise<JobDto> {
  return apiClient<JobDto>(`/jobs/${id}/assign`, {
    method: 'POST',
    body: JSON.stringify({ technicianId })
  })
}

export async function unassignJob(id: string): Promise<JobDto> {
  return apiClient<JobDto>(`/jobs/${id}/unassign`, {
    method: 'POST'
  })
}

export async function updateJobStatus(
  id: string,
  status: JobStatus,
  note?: string
): Promise<JobDto> {
  return apiClient<JobDto>(`/jobs/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status, note })
  })
}

export async function getJobHistory(id: string): Promise<JobStatusHistoryDto[]> {
  return apiClient<JobStatusHistoryDto[]>(`/jobs/${id}/status-history`)
}
