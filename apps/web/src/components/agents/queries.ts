import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { agentKeys } from '../../app/query/keys'
import { createAgent, listAgents } from './api'

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
