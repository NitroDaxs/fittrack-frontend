import { MutationCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import i18n from '../i18n'
import { ApiError, errorMessage, fieldErrorsOf } from './http'

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    // Every failed write shows a toast, except field errors, which the form shows.
    onError: (error) => {
      if (Object.keys(fieldErrorsOf(error)).length === 0) toast.error(errorMessage(error))
    },
  }),
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

// Cached data includes dates formatted for the language it was fetched in.
i18n.on('languageChanged', () => void queryClient.invalidateQueries())
