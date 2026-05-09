'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/auth-context'

export default function Home() {
  const router = useRouter()
  const { isLoading, isAuthenticated, hasPendingAccessRequest, needsTenantSelection, activeTenant } = useAuth()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.replace('/login')
      return
    }
    if (hasPendingAccessRequest) {
      router.replace('/auth/aguardando-aprovacao')
      return
    }
    if (needsTenantSelection) {
      router.replace('/auth/selecionar-tenant')
      return
    }
    if (!activeTenant) {
      router.replace('/auth/sem-tenant')
      return
    }
    router.replace('/dashboard')
  }, [router, isLoading, isAuthenticated, hasPendingAccessRequest, needsTenantSelection, activeTenant])

  return null
}
