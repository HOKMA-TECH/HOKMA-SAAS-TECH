'use client'

import { type ReactNode } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import { CRITICAL_MFA_CAPABILITIES, getCapabilitiesForRole, type Capability } from '@/features/auth/capabilities'
import type { AccessContext } from '@/features/auth/route-capabilities'

type UseCanOptions = {
  mode?: 'all' | 'any'
  context?: AccessContext
}

export function useCan(capability: Capability | Capability[], options: UseCanOptions = {}): boolean {
  const { activeMembership, isPlatformAdmin } = useAuth()
  const context = options.context ?? 'tenant'
  const mode = options.mode ?? 'all'
  if (context === 'platform' && !isPlatformAdmin) return false
  if (context === 'tenant' && activeMembership?.role === 'master_admin') return false

  const caps = getCapabilitiesForRole(activeMembership?.role)
  const required = Array.isArray(capability) ? capability : [capability]
  return mode === 'all' ? required.every((cap) => caps.includes(cap)) : required.some((cap) => caps.includes(cap))
}

export function useCanAll(capabilities: Capability[], context: AccessContext = 'tenant'): boolean {
  return useCan(capabilities, { mode: 'all', context })
}

export function useCanAny(capabilities: Capability[], context: AccessContext = 'tenant'): boolean {
  return useCan(capabilities, { mode: 'any', context })
}

export function useRequiresMfaByCapability(): boolean {
  const { activeMembership } = useAuth()
  const caps = getCapabilitiesForRole(activeMembership?.role)
  return caps.some((cap) => CRITICAL_MFA_CAPABILITIES.has(cap))
}

export function Can({ capability, fallback = null, children, mode = 'all', context = 'tenant' }: { capability: Capability | Capability[]; fallback?: ReactNode; children: ReactNode; mode?: 'all' | 'any'; context?: AccessContext }) {
  const allowed = useCan(capability, { mode, context })
  return allowed ? <>{children}</> : <>{fallback}</>
}
