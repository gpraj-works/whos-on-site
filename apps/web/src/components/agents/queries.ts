import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { agentKeys } from '../../app/query/keys'
import { createAgent, listAgents, nearbyAgents } from './api'

export function useAgents() {
  return useQuery({
    queryKey: agentKeys.list(),
    queryFn: () => listAgents()
  })
}

export function useNearbyAgents(coords: { lat: number; lng: number } | null) {
  return useQuery({
    queryKey: coords ? agentKeys.nearby(coords) : ['agents', 'nearby', 'none'],
    queryFn: () => (coords ? nearbyAgents(coords.lat, coords.lng) : []),
    enabled: Boolean(coords)
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
