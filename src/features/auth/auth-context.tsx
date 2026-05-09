'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import type { AuthState, Membership, Profile } from '@/features/auth/types'
import { CRITICAL_MFA_CAPABILITIES, getCapabilitiesForRole } from '@/features/auth/capabilities'

type AuthContextValue = AuthState & {
  signIn: (email: string, password: string, turnstileToken: string) => Promise<{ error: string | null }>
  signUp: (input: { email: string; password: string; displayName: string; mode: 'create_tenant' | 'join_tenant'; tenantName?: string; joinCode?: string; requestedRole?: string; turnstileToken: string }) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  sendPasswordRecoveryEmail: (email: string) => Promise<{ error: string | null }>
  updatePassword: (password: string) => Promise<{ error: string | null }>
  refreshAuthState: () => Promise<void>
  selectActiveTenant: (tenantId: string) => void
  enrollTotp: () => Promise<{ qr: string | null; secret: string | null; error: string | null }>
  verifyTotp: (factorId: string, code: string) => Promise<{ error: string | null }>
  disableTotp: (factorId: string) => Promise<{ error: string | null }>
  retryMfaChallenge: (factorId: string) => Promise<{ challengeId: string | null; error: string | null }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function loadProfile(user: User): Promise<Profile | null> {
  const { data } = await supabase.from('profiles').select('id,display_name,avatar_path,status').eq('id', user.id).maybeSingle()
  return data as Profile | null
}

async function loadMemberships(): Promise<Membership[]> {
  const { data } = await supabase.rpc('rpc_list_my_tenants')
  if (!data) return []
  return data.map((row: { tenant_id: string; role: string }) => ({
    id: `${row.tenant_id}-${row.role}`,
    tenant_id: row.tenant_id,
    user_id: '',
    role: row.role as Membership['role'],
    status: 'active',
    directorate_id: null,
    team_id: null,
    coordination_id: null,
  }))
}

async function checkAuthRateLimit(identifier: string, action: 'sign_in' | 'sign_up' | 'password_recovery'): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  const { data } = await supabase.rpc('rpc_auth_rate_limit_check', {
    p_identifier: identifier,
    p_action: action,
  })

  const allowed = Boolean((data as { allowed?: boolean } | null)?.allowed)
  const retryAfterSeconds = Number((data as { retry_after_seconds?: number } | null)?.retry_after_seconds ?? 0)
  return { allowed, retryAfterSeconds }
}

async function recordAuthAttempt(identifier: string, action: 'sign_in' | 'sign_up' | 'password_recovery', success: boolean, details?: Record<string, string | number | boolean | null>) {
  await supabase.rpc('rpc_record_auth_attempt', {
    p_identifier: identifier,
    p_action: action,
    p_success: success,
    p_details: details ?? {},
  })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [activeTenant, setActiveTenant] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshAuthState = async () => {
    setIsLoading(true)
    const { data } = await supabase.auth.getSession()
    setSession(data.session)
    setUser(data.session?.user ?? null)
    if (data.session?.user) {
      const [p, m] = await Promise.all([loadProfile(data.session.user), loadMemberships()])
      setProfile(p)
      setMemberships(m)
      setActiveTenant(null)
    } else {
      setProfile(null)
      setMemberships([])
      setActiveTenant(null)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshAuthState()
    }, 0)
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      void refreshAuthState()
    })
    return () => {
      window.clearTimeout(timer)
      listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string, turnstileToken: string) => {
    const guard = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, turnstileToken }),
    })

    const guardJson = (await guard.json().catch(() => ({}))) as { error?: string }
    if (!guard.ok) {
      return { error: guardJson.error ?? 'Falha na verificacao anti-bot (verification-failed).' }
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, turnstileToken, success: !error }),
    }).catch(() => null)

    await recordAuthAttempt(email, 'sign_in', !error, {
      source: 'app_auth',
      reason: error?.message ?? null,
      code: (error as { code?: string } | null)?.code ?? null,
    })
    if (!error) return { error: null }

    const code = (error as { code?: string } | null)?.code ?? null
    if (code === 'email_not_confirmed') return { error: 'Conta criada, mas o e-mail ainda nao foi confirmado.' }
    if (code === 'invalid_credentials') return { error: 'Falha ao autenticar (invalid_credentials). Verifique e-mail e senha.' }
    return { error: `Falha ao autenticar (${code ?? 'unknown_error'}): ${error.message}` }
  }

  const signUp = async (input: { email: string; password: string; displayName: string; mode: 'create_tenant' | 'join_tenant'; tenantName?: string; joinCode?: string; requestedRole?: string; turnstileToken: string }) => {
    const rateLimit = await checkAuthRateLimit(input.email, 'sign_up')
    if (!rateLimit.allowed) {
      return { error: `Muitas tentativas. Aguarde ${rateLimit.retryAfterSeconds}s e tente novamente.` }
    }

    const signupGuard = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: input.email,
        password: input.password,
        displayName: input.displayName,
        mode: input.mode,
        tenantName: input.tenantName,
        joinCode: input.joinCode,
        requestedRole: input.requestedRole,
        turnstileToken: input.turnstileToken,
      }),
    })

    const signupJson = (await signupGuard.json().catch(() => ({}))) as { error?: string }
    if (!signupGuard.ok) {
      await recordAuthAttempt(input.email, 'sign_up', false, { source: 'app_auth', reason: 'api_signup_rejected' })
      return { error: signupJson.error ?? 'Nao foi possivel criar a conta com os dados informados.' }
    }

    const { data: signInData, error } = await supabase.auth.signInWithPassword({ email: input.email, password: input.password })
    await recordAuthAttempt(input.email, 'sign_up', !error, {
      source: 'app_auth',
      reason: error?.message ?? null,
      code: (error as { code?: string } | null)?.code ?? null,
    })
    if (error || !signInData.session) {
      const code = (error as { code?: string } | null)?.code ?? null
      return { error: `Conta criada, mas nao foi possivel iniciar sessao automaticamente (${code ?? 'unknown_error'}).` }
    }

    if (input.mode === 'create_tenant') return { error: null }

    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setActiveTenant(null)
  }

  const sendPasswordRecoveryEmail = async (email: string) => {
    const rateLimit = await checkAuthRateLimit(email, 'password_recovery')
    if (!rateLimit.allowed) {
      return { error: `Muitas tentativas. Aguarde ${rateLimit.retryAfterSeconds}s e tente novamente.` }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-senha` })
    await recordAuthAttempt(email, 'password_recovery', !error, { source: 'app_auth' })
    return { error: error ? 'Nao foi possivel iniciar recuperacao.' : null }
  }

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error ? 'Nao foi possivel atualizar senha.' : null }
  }

  const activeMembership = memberships.find((m) => m.tenant_id === activeTenant) ?? null
  const hasPendingAccessRequest = memberships.some((m) => m.status === 'pending')
  const needsTenantSelection = !!user && memberships.filter((m) => m.status === 'active').length > 1 && !activeTenant
  const roleMfaRequired = !!user && ['master_admin', 'administrador', 'diretor', 'gerente'].includes(activeMembership?.role ?? '')
  const capabilityMfaRequired = getCapabilitiesForRole(activeMembership?.role).some((cap) => CRITICAL_MFA_CAPABILITIES.has(cap))
  const isMfaRequired = roleMfaRequired || capabilityMfaRequired

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    profile,
    memberships,
    activeTenant,
    activeMembership,
    isAuthenticated: !!user,
    isLoading,
    isMfaRequired,
    needsTenantSelection,
    hasPendingAccessRequest,
    signIn,
    signUp,
    signOut,
    sendPasswordRecoveryEmail,
    updatePassword,
    refreshAuthState,
    selectActiveTenant: setActiveTenant,
    enrollTotp: async () => {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error) return { qr: null, secret: null, error: 'Falha ao iniciar cadastro MFA.' }
      return { qr: data.totp.qr_code, secret: data.totp.secret, error: null }
    },
    verifyTotp: async (factorId: string, code: string) => {
      const challenge = await supabase.auth.mfa.challenge({ factorId })
      if (challenge.error) return { error: 'Falha no desafio MFA.' }
      const verify = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code })
      return { error: verify.error ? 'Codigo MFA invalido.' : null }
    },
    disableTotp: async (factorId: string) => {
      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      return { error: error ? 'Nao foi possivel desativar MFA.' : null }
    },
    retryMfaChallenge: async (factorId: string) => {
      const challenge = await supabase.auth.mfa.challenge({ factorId })
      return { challengeId: challenge.data?.id ?? null, error: challenge.error ? 'Nao foi possivel gerar novo desafio MFA.' : null }
    },
  }), [user, session, profile, memberships, activeTenant, activeMembership, isLoading, isMfaRequired, needsTenantSelection, hasPendingAccessRequest])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
