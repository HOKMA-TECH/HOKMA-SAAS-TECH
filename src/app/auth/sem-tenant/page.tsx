'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/auth-context'

export default function NoTenantPage() {
  const router = useRouter()
  const { user, isPlatformAdmin } = useAuth()

  useEffect(() => {
    if (isPlatformAdmin) {
      router.replace('/platform')
    }
  }, [isPlatformAdmin, router])

  if (isPlatformAdmin) {
    return <main className="mx-auto max-w-xl space-y-3 p-8 text-sm text-muted-foreground">Redirecionando para o contexto platform...</main>
  }

  return (
    <main className="mx-auto max-w-xl space-y-3 p-8">
      <h1 className="text-2xl font-semibold">Sem tenant ativo</h1>
      <p className="text-sm text-muted-foreground">Sua conta ({user?.email}) ainda nao possui acesso operacional ativo.</p>
      <p className="text-sm text-muted-foreground">Solicite acesso a um tenant ou aguarde aprovacao administrativa.</p>
    </main>
  )
}
