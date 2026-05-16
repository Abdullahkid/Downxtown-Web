'use client'

/**
 * QueryProvider — wraps the app in TanStack Query's QueryClientProvider.
 *
 * Creates a stable QueryClient instance with a 60-second stale time so that
 * data fetched during SSR is not immediately re-fetched on the client.
 *
 * Requirements: 24.7
 */

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface QueryProviderProps {
  children: React.ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  // useState ensures a single QueryClient instance per component lifecycle,
  // avoiding re-creation on every render while still being safe for SSR
  // (each request gets its own client when rendered server-side).
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000, // 60 seconds — data is fresh for 1 minute
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
