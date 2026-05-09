'use client'

import { useAuth } from '@/features/auth/auth-context'
import { Button } from '@/components/ui/button'

export default function SelectTenantPage() {
  const { memberships, selectActiveTenant } = useAuth()
  const active = memberships.filter((m) => m.status === 'active')

  return (
    <main className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Selecione um tenant</h1>
      <p className="text-sm text-muted-foreground">Por seguranca, a selecao e obrigatoria a cada novo login.</p>
      {active.map((membership) => (
        <Button key={membership.id} className="w-full justify-start" onClick={() => selectActiveTenant(membership.tenant_id)}>
          {membership.tenant_id} - {membership.role}
        </Button>
      ))}
    </main>
  )
}
