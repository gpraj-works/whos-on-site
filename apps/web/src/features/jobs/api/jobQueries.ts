import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  CreateJobInput,
  JobFilterQuery,
  JobStatus,
  UpdateJobInput
} from '@whosonsite/shared'

import { jobKeys } from '../../../app/query/keys'
import {
  assignJob,
  cancelJob,
  createJob,
  getJob,
  getJobHistory,
  listJobs,
  unassignJob,
  updateJob,
  updateJobStatus
} from './jobApi'

export function useJobs(filters?: JobFilterQuery) {
  return useQuery({
    queryKey: jobKeys.list(filters || {}),
    queryFn: () => listJobs(filters)
  })
}

export function useJob(id: string | null | undefined) {
  return useQuery({
    queryKey: id ? jobKeys.detail(id) : ['jobs', 'none'],
    queryFn: () => (id ? getJob(id) : null),
    enabled: Boolean(id)
  })
}

export function useJobHistory(id: string | null | undefined) {
  return useQuery({
    queryKey: id ? jobKeys.history(id) : ['jobs', 'history', 'none'],
    queryFn: () => (id ? getJobHistory(id) : []),
    enabled: Boolean(id)
  })
}

export function useCreateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateJobInput) => createJob(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
    }
  })
}

export function useUpdateJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateJobInput }) => updateJob(id, input),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) })
    }
  })
}

export function useCancelJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => cancelJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: jobKeys.history(id) })
    }
  })
}

export function useAssignJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, technicianId }: { id: string; technicianId: string }) =>
      assignJob(id, technicianId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: jobKeys.history(id) })
    }
  })
}

export function useUnassignJob() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => unassignJob(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: jobKeys.history(id) })
    }
  })
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: JobStatus; note?: string }) =>
      updateJobStatus(id, status, note),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
      queryClient.invalidateQueries({ queryKey: jobKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: jobKeys.history(id) })
    }
  })
}
