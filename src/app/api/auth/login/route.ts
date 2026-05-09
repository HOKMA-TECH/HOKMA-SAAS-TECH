import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyTurnstileToken } from '@/lib/security/turnstile'

function getIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return 'unknown'
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { email?: string; turnstileToken?: string; success?: boolean }
  const email = (body.email ?? '').trim().toLowerCase()
  const token = (body.turnstileToken ?? '').trim()
  const ip = getIp(req)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!email || !token || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Requisicao invalida.' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: rateData } = await supabase.rpc('rpc_auth_rate_limit_check_v2', {
    p_identifier: email,
    p_ip: ip,
    p_action: 'sign_in',
  })

  const rateLimit = {
    allowed: Boolean((rateData as { allowed?: boolean } | null)?.allowed),
    retryAfterSeconds: Number((rateData as { retry_after_seconds?: number } | null)?.retry_after_seconds ?? 30),
  }

  if (!rateLimit.allowed) {
    return NextResponse.json({ error: `Muitas tentativas. Aguarde ${rateLimit.retryAfterSeconds}s e tente novamente.`, retryAfterSeconds: rateLimit.retryAfterSeconds }, { status: 429 })
  }

  const captcha = await verifyTurnstileToken({ token, remoteIp: ip === 'unknown' ? null : ip })
  if (!captcha.ok) {
    await supabase.rpc('rpc_record_auth_attempt_v2', {
      p_identifier: email,
      p_ip: ip,
      p_action: 'sign_in',
      p_success: false,
      p_details: { source: 'api_login', reason: 'captcha_failed', captcha_code: captcha.code ?? null },
    })
    return NextResponse.json({ error: 'Falha na verificacao anti-bot.' }, { status: 400 })
  }

  if (typeof body.success === 'boolean') {
    await supabase.rpc('rpc_record_auth_attempt_v2', {
      p_identifier: email,
      p_ip: ip,
      p_action: 'sign_in',
      p_success: body.success,
      p_details: { source: 'api_login', reason: body.success ? 'auth_success' : 'auth_failed' },
    })
  }

  return NextResponse.json({ ok: true })
}
