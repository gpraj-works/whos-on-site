import { useQuery } from '@tanstack/react-query'
import { technicianKeys } from '../../app/query/keys'
import { listTechnicians, nearbyTechnicians } from './api'

export function useTechnicians() {
  return useQuery({
    queryKey: technicianKeys.list(),
    queryFn: () => listTechnicians()
  })
}

export function useNearbyTechnicians(coords: { lat: number; lng: number } | null) {
  return useQuery({
    queryKey: coords ? technicianKeys.nearby(coords) : ['technicians', 'nearby', 'none'],
    queryFn: () => (coords ? nearbyTechnicians(coords.lat, coords.lng) : []),
    enabled: Boolean(coords)
  })
}
