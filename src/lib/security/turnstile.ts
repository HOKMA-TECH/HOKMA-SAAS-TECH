function normalizeIp(ip?: string | null): string | null {
  if (!ip) return null
  const trimmed = ip.trim()
  if (!trimmed) return null
  const noBrackets = trimmed.replace(/^\[|\]$/g, '')
  const ipv4WithPort = noBrackets.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/)
  const candidate = ipv4WithPort ? ipv4WithPort[1] : noBrackets
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(candidate)) return candidate
  if (/^[a-fA-F0-9:]+$/.test(candidate)) return candidate
  return null
}

export async function verifyTurnstileToken(input: { token: string; remoteIp?: string | null }): Promise<{ ok: boolean; code?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY ?? process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY
  if (!secret) return { ok: false, code: 'missing-secret' }

  const body = new URLSearchParams()
  body.set('secret', secret)
  body.set('response', input.token)
  const remoteIp = normalizeIp(input.remoteIp)
  if (remoteIp) body.set('remoteip', remoteIp)

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
