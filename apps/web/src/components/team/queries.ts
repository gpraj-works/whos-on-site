import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teamMemberKeys } from '../../app/query/keys'
import { createTeamMember, listTeamMembers, nearbyTeamMembers } from './api'

export function useTeamMembers() {
  return useQuery({
    queryKey: teamMemberKeys.list(),
    queryFn: () => listTeamMembers()
  })
}

export function useNearbyTeamMembers(coords: { lat: number; lng: number } | null) {
  return useQuery({
    queryKey: coords ? teamMemberKeys.nearby(coords) : ['teamMembers', 'nearby', 'none'],
    queryFn: () => (coords ? nearbyTeamMembers(coords.lat, coords.lng) : []),
    enabled: Boolean(coords)
  })
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; phone: string; status?: string }) => createTeamMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamMemberKeys.all })
    }
  })
}
