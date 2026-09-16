import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '../../lib/api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Do not retry on 401/403 errors
        if (error instanceof ApiError && (error.statusCode === 401 || error.statusCode === 403)) {
          return false
        }
        return failureCount < 2
      },
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  }
})
