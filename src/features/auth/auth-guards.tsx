'use client'

import { useEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/auth-context'
import { getCapabilitiesForRole, type Capability } from '@/features/auth/capabilities'
import { getRouteCapabilityRule } from '@/features/auth/route-capabilities'

export function AuthenticatedGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoading, isAuthenticated, hasPendingAccessRequest, needsTenantSelection, activeTenant, isMfaRequired, activeMembership } = useAuth()
  const activeRole = activeMembership?.role
  const capabilityMap: Record<Capability, boolean> = useMemo(() => {
    const roleCaps = getCapabilitiesForRole(activeRole)
    return {
      'leads.read': roleCaps.includes('leads.read'),
      'leads.create': roleCaps.includes('leads.create'),
      'leads.update': roleCaps.includes('leads.update'),
      'leads.assign': roleCaps.includes('leads.assign'),
      'leads.convert': roleCaps.includes('leads.convert'),
      'leads.view_sensitive': roleCaps.includes('leads.view_sensitive'),
      'clients.read': roleCaps.includes('clients.read'),
      'clients.create': roleCaps.includes('clients.create'),
      'clients.update': roleCaps.includes('clients.update'),
      'clients.assign': roleCaps.includes('clients.assign'),
      'clients.export': roleCaps.includes('clients.export'),
      'clients.view_sensitive': roleCaps.includes('clients.view_sensitive'),
      'clientes.read': roleCaps.includes('clientes.read'),
      'clientes.create': roleCaps.includes('clientes.create'),
      'clientes.update': roleCaps.includes('clientes.update'),
      'clientes.delete': roleCaps.includes('clientes.delete'),
      'clientes.assign': roleCaps.includes('clientes.assign'),
      'clientes.export': roleCaps.includes('clientes.export'),
      'documentos.read': roleCaps.includes('documentos.read'),
      'documentos.upload': roleCaps.includes('documentos.upload'),
      'documentos.delete': roleCaps.includes('documentos.delete'),
      'documentos.generate_signed_url': roleCaps.includes('documentos.generate_signed_url'),
      'agenda.read': roleCaps.includes('agenda.read'),
      'agenda.create': roleCaps.includes('agenda.create'),
      'agenda.update': roleCaps.includes('agenda.update'),
      'agenda.manage_team': roleCaps.includes('agenda.manage_team'),
      'tarefas.read': roleCaps.includes('tarefas.read'),
      'tarefas.create': roleCaps.includes('tarefas.create'),
      'tarefas.assign': roleCaps.includes('tarefas.assign'),
      'tarefas.complete': roleCaps.includes('tarefas.complete'),
      'tarefas.report.read': roleCaps.includes('tarefas.report.read'),
      'tarefas.report.export': roleCaps.includes('tarefas.report.export'),
      'relatorios.read': roleCaps.includes('relatorios.read'),
      'relatorios.export': roleCaps.includes('relatorios.export'),
      'usuarios.invite': roleCaps.includes('usuarios.invite'),
      'usuarios.approve': roleCaps.includes('usuarios.approve'),
      'usuarios.suspend': roleCaps.includes('usuarios.suspend'),
      'usuarios.change_role': roleCaps.includes('usuarios.change_role'),
      'crm.notes.create': roleCaps.includes('crm.notes.create'),
      'crm.notes.read': roleCaps.includes('crm.notes.read'),
      'crm.stage.move': roleCaps.includes('crm.stage.move'),
      'tenant.settings.manage': roleCaps.includes('tenant.settings.manage'),
      'tenant.audit.read': roleCaps.includes('tenant.audit.read'),
      'platform.tenants.manage': roleCaps.includes('platform.tenants.manage'),
      'platform.audit.read': roleCaps.includes('platform.audit.read'),
    }
  }, [activeRole])

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
