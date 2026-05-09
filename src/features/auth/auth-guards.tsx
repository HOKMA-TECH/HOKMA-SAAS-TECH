'use client'

import { useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/auth-context'
import { useCan } from '@/features/auth/authorization'
import type { Capability } from '@/features/auth/capabilities'
import { getRouteCapabilityRule } from '@/features/auth/route-capabilities'

export function AuthenticatedGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoading, isAuthenticated, hasPendingAccessRequest, needsTenantSelection, activeTenant, isMfaRequired, activeMembership } = useAuth()
  const activeRole = activeMembership?.role
  const canClientes = useCan('clientes.read')
  const canAgenda = useCan('agenda.read')
  const canTarefas = useCan('tarefas.read')
  const canRelatorios = useCan('relatorios.read')
  const canSettings = useCan('tenant.settings.manage')
  const canAudit = useCan('tenant.audit.read')
  const canPlatformManage = useCan('platform.tenants.manage', { context: 'platform' })

  const capabilityMap: Record<Capability, boolean> = useMemo(() => ({
    'clientes.read': canClientes,
    'clientes.create': false,
    'clientes.update': false,
    'clientes.delete': false,
    'clientes.assign': false,
    'clientes.export': false,
    'documentos.read': false,
    'documentos.upload': false,
    'documentos.delete': false,
    'documentos.generate_signed_url': false,
    'agenda.read': canAgenda,
    'agenda.create': false,
    'agenda.update': false,
    'agenda.manage_team': false,
    'tarefas.read': canTarefas,
    'tarefas.create': false,
    'tarefas.assign': false,
    'tarefas.complete': false,
    'tarefas.report.read': false,
    'tarefas.report.export': false,
    'relatorios.read': canRelatorios,
    'relatorios.export': false,
    'usuarios.invite': false,
    'usuarios.approve': false,
    'usuarios.suspend': false,
    'usuarios.change_role': false,
    'tenant.settings.manage': canSettings,
    'tenant.audit.read': canAudit,
    'platform.tenants.manage': canPlatformManage,
    'platform.audit.read': false,
  }), [canClientes, canAgenda, canTarefas, canRelatorios, canSettings, canAudit, canPlatformManage])

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
    if (isMfaRequired) {
      router.replace('/auth/mfa')
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

    const routeRule = getRouteCapabilityRule(pathname)
    if (!routeRule) return
    if (routeRule.context === 'platform' && activeRole !== 'master_admin') {
      router.replace('/403')
      return
    }
    if (routeRule.context === 'tenant' && activeRole === 'master_admin') {
      router.replace('/403')
      return
    }
    if (routeRule.capability && !capabilityMap[routeRule.capability]) {
      router.replace('/403')
    }
  }, [router, pathname, isLoading, isAuthenticated, hasPendingAccessRequest, needsTenantSelection, activeTenant, isMfaRequired, capabilityMap, activeRole])

  if (isLoading || !isAuthenticated || hasPendingAccessRequest || needsTenantSelection || !activeTenant || isMfaRequired) {
    return <main className="p-8 text-sm text-muted-foreground">Carregando contexto seguro...</main>
  }

  return <>{children}</>
}
