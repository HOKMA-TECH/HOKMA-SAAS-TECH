import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyTurnstileToken } from '@/lib/security/turnstile'

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return 'unknown'
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { email?: string; password?: string; displayName?: string; turnstileToken?: string }
  const email = (body.email ?? '').trim().toLowerCase()
  const password = body.password ?? ''
  const displayName = (body.displayName ?? '').trim()
  const token = (body.turnstileToken ?? '').trim()
  const ip = getIp(req)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!email || !password || !token || !supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json({ error: 'Requisicao invalida.' }, { status: 400 })
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
    return NextResponse.json({ error: 'Falha na verificacao anti-bot.' }, { status: 400 })
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error } = await adminClient.auth.admin.createUser({
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

  return NextResponse.json({ ok: true })
}
