'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, ShieldCheck, KeyRound, Users } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-context'
import { useCan } from '@/features/auth/authorization'
import { tenantQueryKey } from '@/lib/query/tenant-query-key'
import { listTenantMemberships } from '@/features/admin/tenant-admin-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ConfiguracoesPage() {
  const { activeTenant, memberships } = useAuth()
  const canManageSettings = useCan('tenant.settings.manage')
  const canReadAudit = useCan('tenant.audit.read')

  const membershipsQuery = useQuery({
    queryKey: tenantQueryKey(activeTenant, 'tenant-config-memberships'),
    queryFn: async () => {
      if (!activeTenant) return []
      const result = await listTenantMemberships(activeTenant)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!activeTenant && canReadAudit,
  })

  const summary = useMemo(() => {
    const rows = membershipsQuery.data ?? []
    return {
      active: rows.filter((r) => r.status === 'active').length,
      pending: rows.filter((r) => r.status === 'pending').length,
      revoked: rows.filter((r) => r.status === 'revoked').length,
    }
  }, [membershipsQuery.data])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configuracoes do tenant</h1>
        <p className="text-sm text-muted-foreground">Base administrativa inicial da Etapa 4 (sem modulos sensiveis avancados).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Identidade do tenant</CardTitle>
          <CardDescription>Contexto ativo e estado operacional basico.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Badge variant="outline" className="justify-center py-2">Tenant ativo: {activeTenant ?? 'nao selecionado'}</Badge>
          <Badge variant="outline" className="justify-center py-2">Memberships locais: {memberships.length}</Badge>
          <Badge variant={canManageSettings ? 'default' : 'secondary'} className="justify-center py-2">{canManageSettings ? 'Gestao habilitada' : 'Sem gestao de settings'}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-4 w-4" /> Status de membros</CardTitle>
          <CardDescription>Visao resumida para operacao administrativa minima.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Badge className="justify-center py-2">Ativos: {summary.active}</Badge>
          <Badge variant="secondary" className="justify-center py-2">Pendentes: {summary.pending}</Badge>
          <Badge variant="outline" className="justify-center py-2">Revogados: {summary.revoked}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> Join code e onboarding</CardTitle>
          <CardDescription>Controles iniciais de acesso e estado do onboarding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>- O fluxo de join code segue protegido por RPC e RLS da etapa 3.5.</p>
          <p>- Aprovacao/rejeicao de membros ocorre no Painel Admin mediante capability apropriada.</p>
          <p>- Acoes criticas permanecem sujeitas a MFA obrigatorio conforme politica definida.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Postura de seguranca</CardTitle>
          <CardDescription>Garantias de seguranca mantidas nesta etapa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>- UI de configuracao nao substitui validacao backend.</p>
          <p>- Dados exibidos respeitam contexto tenant e capacidades formais.</p>
          <p>- Acesso sem permissao continua protegido por guard + fallback em /403.</p>
        </CardContent>
      </Card>
    </div>
  )
}
