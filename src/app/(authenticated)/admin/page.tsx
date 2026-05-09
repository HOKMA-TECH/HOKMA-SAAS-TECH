'use client'

import { useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Shield, UserCheck, UserX, UserCog, RefreshCw, Copy, KeyRound } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-context'
import { useCan } from '@/features/auth/authorization'
import { tenantQueryKey } from '@/lib/query/tenant-query-key'
import { generateTenantJoinCode, listTenantMemberships, reviewMembership, updateMembershipRole, updateMembershipStatus } from '@/features/admin/tenant-admin-api'
import type { AdminMembershipRow, MembershipStatusFilter } from '@/features/admin/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const roleOptions: AdminMembershipRow['role'][] = ['corretor', 'coordenador', 'gerente', 'diretor', 'administrador']

export default function AdminPage() {
  const queryClient = useQueryClient()
  const { activeTenant, activeMembership, isMfaRequired } = useAuth()
  const canApprove = useCan('usuarios.approve')
  const canSuspend = useCan('usuarios.suspend')
  const canChangeRole = useCan('usuarios.change_role')
  const canReadAudit = useCan('tenant.audit.read')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<MembershipStatusFilter>('all')
  const [isMutating, setIsMutating] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState<string | null>(null)
  const [joinCodeError, setJoinCodeError] = useState<string | null>(null)

  const membershipsQuery = useQuery({
    queryKey: tenantQueryKey(activeTenant, 'admin-memberships'),
    queryFn: async () => {
      if (!activeTenant) return []
      const result = await listTenantMemberships(activeTenant)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!activeTenant && canReadAudit,
  })

  const filtered = useMemo(() => {
    const source = membershipsQuery.data ?? []
    return source.filter((row) => {
      const matchesStatus = statusFilter === 'all' ? true : row.status === statusFilter
      const keyword = search.trim().toLowerCase()
      const matchesSearch = keyword.length === 0 || row.role.toLowerCase().includes(keyword) || row.user_id.toLowerCase().includes(keyword)
      return matchesStatus && matchesSearch
    })
  }, [membershipsQuery.data, search, statusFilter])

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: tenantQueryKey(activeTenant, 'admin-memberships') })
  }

  const onGenerateJoinCode = async () => {
    if (!activeTenant) return
    const result = await generateTenantJoinCode(activeTenant)
    setJoinCodeError(result.error)
    if (result.code) setJoinCode(result.code)
  }

  const guardedMutation = async (id: string, action: () => Promise<{ error: string | null }>) => {
    if (isMfaRequired && (canApprove || canChangeRole)) {
      alert('MFA obrigatorio para executar acoes criticas de governanca.')
      return
    }
    setIsMutating(id)
    const result = await action()
    setIsMutating(null)
    if (result.error) {
      alert(result.error)
      return
    }
    await refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Admin do Tenant</h1>
          <p className="text-sm text-muted-foreground">Governanca minima: membros, aprovacoes, roles e status.</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => void refresh()}>
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Controles de acesso</CardTitle>
          <CardDescription>Tenant: {activeTenant ?? 'nao selecionado'} | Role: {activeMembership?.role ?? 'sem role ativa'}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <Badge variant={canApprove ? 'default' : 'secondary'} className="justify-center py-2">{canApprove ? 'Pode aprovar membros' : 'Sem aprovacao'}</Badge>
          <Badge variant={canChangeRole ? 'default' : 'secondary'} className="justify-center py-2">{canChangeRole ? 'Pode trocar role' : 'Sem troca de role'}</Badge>
          <Badge variant={canSuspend ? 'default' : 'secondary'} className="justify-center py-2">{canSuspend ? 'Pode suspender' : 'Sem suspensao'}</Badge>
          <Badge variant={canReadAudit ? 'default' : 'secondary'} className="justify-center py-2">{canReadAudit ? 'Pode auditar' : 'Sem auditoria'}</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> Join code de convite</CardTitle>
          <CardDescription>Gere um codigo para novos usuarios entrarem no tenant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => void onGenerateJoinCode()} disabled={!activeTenant}>Gerar join code</Button>
            {joinCode ? (
              <Button variant="outline" className="gap-2" onClick={() => void navigator.clipboard.writeText(joinCode)}>
                <Copy className="h-4 w-4" /> Copiar
              </Button>
            ) : null}
          </div>
          {joinCode ? <p className="text-sm font-mono">{joinCode}</p> : <p className="text-sm text-muted-foreground">Nenhum join code gerado nesta sessao.</p>}
          {joinCodeError ? <p className="text-sm text-destructive">{joinCodeError}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membros do tenant</CardTitle>
          <CardDescription>Lista segura por RPC autorizada e operacoes por capability.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por role ou user id" className="pl-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as MembershipStatusFilter)}>
              <SelectTrigger><SelectValue placeholder="Filtrar status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="rejected">Rejeitados</SelectItem>
                <SelectItem value="revoked">Revogados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filtered.map((row) => (
              <div key={row.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">Membro {row.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">User: {row.user_id}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">Role: {row.role}</Badge>
                      <Badge variant={row.status === 'active' ? 'default' : 'secondary'}>Status: {row.status}</Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {row.status === 'pending' ? (
                      <>
                        <Button size="sm" disabled={!canApprove || isMutating === row.id} className="gap-1" onClick={() => void guardedMutation(row.id, () => reviewMembership(row.id, true, 'Aprovado pela governanca do tenant'))}>
                          <UserCheck className="h-4 w-4" /> Aprovar
                        </Button>
                        <Button size="sm" variant="outline" disabled={!canApprove || isMutating === row.id} className="gap-1" onClick={() => void guardedMutation(row.id, () => reviewMembership(row.id, false, 'Rejeitado pela governanca do tenant'))}>
                          <UserX className="h-4 w-4" /> Rejeitar
                        </Button>
                      </>
                    ) : null}

                    <Select
                      disabled={!canChangeRole || isMutating === row.id}
                      value={row.role}
                      onValueChange={(newRole) => void guardedMutation(row.id, () => updateMembershipRole(row.id, newRole as AdminMembershipRow['role']))}
                    >
                      <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {row.status === 'active' ? (
                      <Button size="sm" variant="outline" disabled={!canSuspend || isMutating === row.id} className="gap-1" onClick={() => void guardedMutation(row.id, () => updateMembershipStatus(row.id, 'revoked'))}>
                        <Shield className="h-4 w-4" /> Suspender
                      </Button>
                    ) : null}

                    {row.status === 'revoked' ? (
                      <Button size="sm" variant="outline" disabled={!canSuspend || isMutating === row.id} className="gap-1" onClick={() => void guardedMutation(row.id, () => updateMembershipStatus(row.id, 'active'))}>
                        <UserCog className="h-4 w-4" /> Reativar
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Nenhum membro encontrado para o filtro selecionado.</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
