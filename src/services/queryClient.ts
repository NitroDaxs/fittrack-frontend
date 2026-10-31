import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './http'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // A 4xx will fail the same way again; only retry what might be temporary.
      retry: (failureCount, error) => {
        const status = error instanceof ApiError ? error.status : undefined
        return failureCount < 2 && (status === undefined || status >= 500)
      },
    },
  },
})
