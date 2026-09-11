import { useQuery } from '@tanstack/react-query'
import { fetchAnalyticsSummary } from './api'

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => fetchAnalyticsSummary(),
    refetchInterval: 30000
  })
}
