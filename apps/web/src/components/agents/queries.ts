import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { agentKeys } from '../../app/query/keys'
import { createAgent, listAgents, updateAgent, deleteAgent } from './api'

export function useAgents() {
  return useQuery({
    queryKey: agentKeys.list(),
    queryFn: () => listAgents()
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; phone: string; status?: string }) => createAgent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all })
    }
  })
}

export function useUpdateAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data
    }: {
      id: string
      data: { name?: string; phone?: string; status?: string }
    }) => updateAgent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all })
    }
  })
}

export function useDeleteAgent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAgent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: agentKeys.all })
    }
  })
}
