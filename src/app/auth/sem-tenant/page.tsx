'use client'

import { useAuth } from '@/features/auth/auth-context'

export default function NoTenantPage() {
  const { user } = useAuth()
  return (
    <main className="mx-auto max-w-xl space-y-3 p-8">
      <h1 className="text-2xl font-semibold">Sem tenant ativo</h1>
      <p className="text-sm text-muted-foreground">Sua conta ({user?.email}) ainda nao possui acesso operacional ativo.</p>
      <p className="text-sm text-muted-foreground">Solicite acesso a um tenant ou aguarde aprovacao administrativa.</p>
    </main>
  )
}
