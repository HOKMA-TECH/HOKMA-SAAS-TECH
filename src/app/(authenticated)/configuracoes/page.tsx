'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Building2, ShieldCheck, KeyRound, Users, Copy } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-context'
import { useCan } from '@/features/auth/authorization'
import { tenantQueryKey } from '@/lib/query/tenant-query-key'
import { generateTenantJoinCode, listTenantMemberships } from '@/features/admin/tenant-admin-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export default function ConfiguracoesPage() {
  const { activeTenant, memberships, isMfaEnabled, setMfaEnabled } = useAuth()
  const canManageSettings = useCan('tenant.settings.manage')
  const canReadAudit = useCan('tenant.audit.read')
  const [joinCode, setJoinCode] = useState<string | null>(null)
  const [joinCodeError, setJoinCodeError] = useState<string | null>(null)
  const [isSavingMfa, setIsSavingMfa] = useState(false)

  const onGenerateJoinCode = async () => {
    if (!activeTenant) return
    const result = await generateTenantJoinCode(activeTenant)
    setJoinCodeError(result.error)
    if (result.code) setJoinCode(result.code)
  }

  const onToggleMfa = async (enabled: boolean) => {
    setIsSavingMfa(true)
    const result = await setMfaEnabled(enabled)
    setIsSavingMfa(false)
    if (result.error) alert(result.error)
  }

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
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Segurança da conta</CardTitle>
          <CardDescription>MFA opcional por conta. Ative para exigir verificação TOTP no login.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Exigir MFA nesta conta</p>
            <p className="text-xs text-muted-foreground">Quando ativo, você será direcionado para configuração/verificação MFA.</p>
          </div>
          <Switch checked={isMfaEnabled} disabled={isSavingMfa} onCheckedChange={(checked) => void onToggleMfa(checked)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> Join code e onboarding</CardTitle>
          <CardDescription>Controles iniciais de acesso e estado do onboarding.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => void onGenerateJoinCode()} disabled={!activeTenant}>Gerar join code</Button>
            {joinCode ? (
              <Button variant="outline" className="gap-2" onClick={() => void navigator.clipboard.writeText(joinCode)}>
                <Copy className="h-4 w-4" /> Copiar
              </Button>
            ) : null}
          </div>
          {joinCode ? <p className="font-mono text-foreground">{joinCode}</p> : <p>- O fluxo de join code segue protegido por RPC e RLS da etapa 3.5.</p>}
          {joinCodeError ? <p className="text-destructive">{joinCodeError}</p> : null}
          <p>- Aprovacao/rejeicao de membros ocorre no Painel Admin mediante capability apropriada.</p>
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
