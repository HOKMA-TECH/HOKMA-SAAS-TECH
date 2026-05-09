import type { Capability } from '@/features/auth/capabilities'

export type AccessContext = 'tenant' | 'platform'

export type RouteCapabilityRule = {
  prefix: string
  context: AccessContext
  capability?: Capability
}

export const ROUTE_CAPABILITY_RULES: RouteCapabilityRule[] = [
  { prefix: '/dashboard', context: 'tenant' },
  { prefix: '/clientes', context: 'tenant', capability: 'clientes.read' },
  { prefix: '/agenda', context: 'tenant', capability: 'agenda.read' },
  { prefix: '/tarefas', context: 'tenant', capability: 'tarefas.read' },
  { prefix: '/chat', context: 'tenant', capability: 'documentos.read' },
  { prefix: '/empreendimentos', context: 'tenant', capability: 'clientes.read' },
  { prefix: '/relatorios', context: 'tenant', capability: 'relatorios.read' },
  { prefix: '/admin', context: 'tenant', capability: 'tenant.audit.read' },
  { prefix: '/configuracoes', context: 'tenant', capability: 'tenant.settings.manage' },
  { prefix: '/platform', context: 'platform', capability: 'platform.tenants.manage' },
]

export function getRouteCapabilityRule(pathname: string | null): RouteCapabilityRule | null {
  if (!pathname) return null
  return ROUTE_CAPABILITY_RULES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`)) ?? null
}
