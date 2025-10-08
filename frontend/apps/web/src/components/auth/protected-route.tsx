'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/stores/auth'

interface ProtectedRouteProps {
  readonly children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [isReady, setIsReady] = useState(false)
  const hasStoredToken = useMemo(() => {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem('health_platform_token')
  }, [])

  useEffect(() => {
    // Mark component as ready after mount to allow Zustand rehydration
    setIsReady(true)
  }, [])

  useEffect(() => {
    // Redirect only after initial readiness and when clearly unauthenticated
    if (isReady && !isAuthenticated && !hasStoredToken) {
      router.push('/login')
    }
  }, [isReady, isAuthenticated, hasStoredToken, router])

  // Don't render children if not authenticated
  if (!isAuthenticated && (!isReady || !hasStoredToken)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
