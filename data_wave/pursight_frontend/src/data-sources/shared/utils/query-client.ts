import { QueryClient } from '@tanstack/react-query'
import { persistQueryClient } from '@tanstack/react-query-persist-client'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 2,
    },
  },
})

// Create an async wrapper around sessionStorage to satisfy AsyncStorage interface
const asyncSessionStorage = typeof window !== 'undefined'
  ? {
      getItem: async (key: string) => window.sessionStorage.getItem(key),
      setItem: async (key: string, value: string) => {
        window.sessionStorage.setItem(key, value)
      },
      removeItem: async (key: string) => {
        window.sessionStorage.removeItem(key)
      },
    }
  : (undefined as any)

const persister = createAsyncStoragePersister({ storage: asyncSessionStorage })

if (typeof window !== 'undefined') {
  persistQueryClient({
    queryClient,
    persister,
    maxAge: 30 * 60 * 1000, // 30 minutes
    hydrateOptions: {
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          refetchOnMount: false,
        },
      },
    },
  })
}

