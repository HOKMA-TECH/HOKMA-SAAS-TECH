import { createHash } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyTurnstileToken } from '@/lib/security/turnstile'

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return 'unknown'
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    email?: string
    password?: string
    displayName?: string
    turnstileToken?: string
    mode?: 'create_tenant' | 'join_tenant'
    tenantName?: string
    joinCode?: string
    requestedRole?: string
  }
  const email = (body.email ?? '').trim().toLowerCase()
  const password = body.password ?? ''
  const displayName = (body.displayName ?? '').trim()
  const token = (body.turnstileToken ?? '').trim()
  const mode = body.mode === 'create_tenant' ? 'create_tenant' : 'join_tenant'
  const tenantName = (body.tenantName ?? '').trim()
  const joinCode = (body.joinCode ?? '').trim().toUpperCase()
  const requestedRole = (body.requestedRole ?? 'corretor').trim().toLowerCase()
  const ip = getIp(req)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!email || !password || !token || !supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json({ error: 'Requisicao invalida.' }, { status: 400 })
  }
  if (mode === 'create_tenant' && !tenantName) {
    return NextResponse.json({ error: 'Informe o nome da imobiliaria para criar o tenant.' }, { status: 400 })
  }
  if (mode === 'join_tenant' && !joinCode) {
    return NextResponse.json({ error: 'Informe o codigo de convite da imobiliaria.' }, { status: 400 })
  }

  const publicClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: rateData } = await publicClient.rpc('rpc_auth_rate_limit_check_v2', {
    p_identifier: email,
    p_ip: ip,
    p_action: 'sign_up',
  })

  const rateLimit = {
    allowed: Boolean((rateData as { allowed?: boolean } | null)?.allowed),
    retryAfterSeconds: Number((rateData as { retry_after_seconds?: number } | null)?.retry_after_seconds ?? 30),
  }

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: `Muitas tentativas. Aguarde ${rateLimit.retryAfterSeconds}s e tente novamente.` }, { status: 429 })
  }

  const captcha = await verifyTurnstileToken({ token, remoteIp: ip === 'unknown' ? null : ip })
  if (!captcha.ok) {
    await publicClient.rpc('rpc_record_auth_attempt_v2', {
      p_identifier: email,
      p_ip: ip,
      p_action: 'sign_up',
      p_success: false,
      p_details: { source: 'api_signup', reason: 'captcha_failed', captcha_code: captcha.code ?? null },
    })
    return NextResponse.json({ error: `Falha na verificacao anti-bot (${captcha.code ?? 'verification-failed'}).` }, { status: 400 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data: createdUser, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    user_metadata: { display_name: displayName },
    email_confirm: true,
  })

  await publicClient.rpc('rpc_record_auth_attempt_v2', {
    p_identifier: email,
    p_ip: ip,
    p_action: 'sign_up',
    p_success: !error,
    p_details: { source: 'api_signup', reason: error ? 'create_user_failed' : 'create_user_success' },
  })

  if (error) {
    return NextResponse.json({ error: error.message || 'Nao foi possivel criar conta.' }, { status: 400 })
  }

  if (mode === 'create_tenant' && createdUser.user) {
    const baseSlug = tenantName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40)
    const slugCandidates = [
      baseSlug || `tenant-${Date.now()}`,
      `${baseSlug || 'tenant'}-${Date.now().toString().slice(-4)}`,
      `${baseSlug || 'tenant'}-${Math.random().toString(36).slice(2, 6)}`,
    ]

    let tenantId: string | null = null
    let tenantError: string | null = null
    for (const slug of slugCandidates) {
      const insertTenant = await adminClient.from('tenants').insert({
        slug,
        legal_name: tenantName,
        created_by: createdUser.user.id,
      }).select('id').single()
      if (!insertTenant.error && insertTenant.data?.id) {
        tenantId = insertTenant.data.id
        tenantError = null
        break
      }
      tenantError = insertTenant.error?.message ?? 'Falha ao criar tenant.'
    }

    if (!tenantId) {
      return NextResponse.json({ error: `Conta criada, mas falhou ao criar imobiliaria: ${tenantError ?? 'Falha desconhecida.'}` }, { status: 400 })
    }

    const membershipInsert = await adminClient.from('tenant_memberships').insert({
      tenant_id: tenantId,
      user_id: createdUser.user.id,
      role: 'administrador',
      status: 'active',
      requested_by: createdUser.user.id,
      approved_by: createdUser.user.id,
    })

    if (membershipInsert.error) {
      return NextResponse.json({ error: `Conta criada, mas falhou ao associar usuario ao tenant: ${membershipInsert.error.message}` }, { status: 400 })
    }
  }

  if (mode === 'join_tenant' && createdUser.user) {
    const allowedRoles = new Set(['corretor', 'coordenador', 'gerente', 'diretor', 'administrador'])
    const role = allowedRoles.has(requestedRole) ? requestedRole : 'corretor'
    const codeHash = createHash('sha256').update(joinCode).digest('hex')

    const joinCodeLookup = await adminClient
      .from('tenant_join_codes')
      .select('id, tenant_id, expires_at, status')
      .eq('code_hash', codeHash)
      .eq('status', 'active')
      .maybeSingle()

    if (joinCodeLookup.error || !joinCodeLookup.data?.tenant_id) {
      return NextResponse.json({ error: 'Codigo de convite invalido ou expirado.' }, { status: 400 })
    }

    const nowIso = new Date().toISOString()
    if (joinCodeLookup.data.expires_at && joinCodeLookup.data.expires_at < nowIso) {
      await adminClient.from('tenant_join_codes').update({ status: 'expired' }).eq('id', joinCodeLookup.data.id)
      return NextResponse.json({ error: 'Codigo de convite expirado.' }, { status: 400 })
    }

    const membershipInsert = await adminClient.from('tenant_memberships').insert({
      tenant_id: joinCodeLookup.data.tenant_id,
      user_id: createdUser.user.id,
      role,
      status: 'active',
      requested_by: createdUser.user.id,
      approved_by: createdUser.user.id,
    })

    if (membershipInsert.error) {
      return NextResponse.json({ error: `Conta criada, mas falhou ao entrar na imobiliaria: ${membershipInsert.error.message}` }, { status: 400 })
    }

    await adminClient
      .from('tenant_join_codes')
      .update({ status: 'used', used_at: new Date().toISOString(), used_by: createdUser.user.id })
      .eq('id', joinCodeLookup.data.id)
      .eq('status', 'active')
  }

  return NextResponse.json({ ok: true })
}
