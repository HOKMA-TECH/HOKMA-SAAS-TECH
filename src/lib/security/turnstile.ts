export async function verifyTurnstileToken(input: { token: string; remoteIp?: string | null }): Promise<{ ok: boolean; code?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) return { ok: false, code: 'missing-secret' }

  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', input.token)
  if (input.remoteIp) body.set('remoteip', input.remoteIp)

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    cache: 'no-store',
  })

  if (!response.ok) return { ok: false, code: 'verification-http-error' }

  const data = (await response.json()) as { success?: boolean; 'error-codes'?: string[] }
  if (data.success) return { ok: true }
  return { ok: false, code: data['error-codes']?.[0] ?? 'verification-failed' }
}
