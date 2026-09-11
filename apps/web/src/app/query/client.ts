import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error: unknown) => {
        // Do not retry on 401/403 errors
        const statusCode =
          typeof error === 'object' && error !== null && 'statusCode' in error
            ? (error as { statusCode?: number }).statusCode
            : undefined
        if (statusCode === 401 || statusCode === 403) return false
        return failureCount < 2
      },
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  }
})
