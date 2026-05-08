const SENSITIVE_KEYS = ['password', 'token', 'secret', 'key', 'authorization', 'cookie']

function redact(value: unknown): unknown {
  if (!value || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map(redact)
  const entries = Object.entries(value as Record<string, unknown>).map(([k, v]) => {
    const isSensitive = SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s))
    return [k, isSensitive ? '[REDACTED]' : redact(v)]
  })
  return Object.fromEntries(entries)
}

export const safeLogger = {
  info: (message: string, context?: unknown) => console.info(message, context ? redact(context) : ''),
  warn: (message: string, context?: unknown) => console.warn(message, context ? redact(context) : ''),
  error: (message: string, context?: unknown) => console.error(message, context ? redact(context) : ''),
}
