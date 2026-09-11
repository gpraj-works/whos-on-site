import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { jobKeys, technicianKeys } from '../../app/query/keys'
import { connectSocket } from './client'
import { registerSocketHandlers } from './events'

/**
 * Custom React hook subscribing to real-time Socket.io events
 * and feeding updates into the TanStack React Query cache.
 */
export function useSocketEvents(enabled = true): void {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled) return

    const socket = connectSocket()

    const cleanup = registerSocketHandlers(socket, {
      onJobCreated: () => {
        queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
      },
      onJobAssigned: (event) => {
        queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
        queryClient.invalidateQueries({ queryKey: jobKeys.detail(event.jobId) })
        queryClient.invalidateQueries({ queryKey: jobKeys.history(event.jobId) })
        queryClient.invalidateQueries({ queryKey: technicianKeys.all })
      },
      onJobStatusChanged: (event) => {
        queryClient.invalidateQueries({ queryKey: jobKeys.lists() })
        queryClient.invalidateQueries({ queryKey: jobKeys.detail(event.jobId) })
        queryClient.invalidateQueries({ queryKey: jobKeys.history(event.jobId) })
      },
      onTechnicianLocationUpdated: () => {
        queryClient.invalidateQueries({ queryKey: technicianKeys.all })
      },
      onTechnicianStatusChanged: () => {
        queryClient.invalidateQueries({ queryKey: technicianKeys.all })
      }
    })

    return () => {
      cleanup()
    }
  }, [enabled, queryClient])
}
