'use client'

import { QueryProvider } from './query-provider'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  )
}
