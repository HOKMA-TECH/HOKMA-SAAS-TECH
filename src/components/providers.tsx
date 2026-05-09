'use client'

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AuthProvider, useAuth } from '@/features/auth/auth-context'

function TenantCacheBoundary() {
  const { activeTenant, user, memberships } = useAuth()
  const lastTenantRef = useRef<string | null>(null)
  const lastUserRef = useRef<string | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const currentUserId = user?.id ?? null
    const previousUserId = lastUserRef.current
    const previousTenant = lastTenantRef.current

    if (previousUserId && previousUserId !== currentUserId) {
      queryClient.clear()
    }

    if (previousTenant && previousTenant !== activeTenant) {
      queryClient.removeQueries({ queryKey: ['tenant', previousTenant] })
      queryClient.invalidateQueries({ queryKey: ['tenant'] })
    }

    if (activeTenant && !memberships.some((m) => m.tenant_id === activeTenant && m.status === 'active')) {
      queryClient.removeQueries({ queryKey: ['tenant', activeTenant] })
      queryClient.invalidateQueries({ queryKey: ['tenant'] })
    }

    lastTenantRef.current = activeTenant
    lastUserRef.current = currentUserId
  }, [activeTenant, memberships, queryClient, user?.id])

  return null
}

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantCacheBoundary />
        {children}
      </AuthProvider>
    </QueryClientProvider>
  )
}
