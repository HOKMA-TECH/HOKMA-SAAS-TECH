type Entry = {
  attempts: number[]
  blockedUntil: number
  strikes: number
}

const ipStore = new Map<string, Entry>()
const emailStore = new Map<string, Entry>()

const IP_WINDOW_MS = 5 * 60 * 1000
const EMAIL_WINDOW_MS = 10 * 60 * 1000
const IP_LIMIT = 10
const EMAIL_LIMIT = 5

function getOrCreate(store: Map<string, Entry>, key: string): Entry {
  const existing = store.get(key)
  if (existing) return existing
  const created: Entry = { attempts: [], blockedUntil: 0, strikes: 0 }
  store.set(key, created)
  return created
}

function prune(entry: Entry, now: number, windowMs: number) {
  entry.attempts = entry.attempts.filter((t) => now - t <= windowMs)
}

export function checkLoginLimit(ip: string, email: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const ipEntry = getOrCreate(ipStore, ip)
  const emailEntry = getOrCreate(emailStore, email.toLowerCase())

  if (ipEntry.blockedUntil > now || emailEntry.blockedUntil > now) {
    const retryAfterMs = Math.max(ipEntry.blockedUntil - now, emailEntry.blockedUntil - now, 0)
    return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) }
  }

  prune(ipEntry, now, IP_WINDOW_MS)
  prune(emailEntry, now, EMAIL_WINDOW_MS)

  if (ipEntry.attempts.length >= IP_LIMIT || emailEntry.attempts.length >= EMAIL_LIMIT) {
    return { allowed: false, retryAfterSeconds: 30 }
  }

  return { allowed: true, retryAfterSeconds: 0 }
}

export function registerLoginAttempt(ip: string, email: string, success: boolean): void {
  const now = Date.now()
  const ipEntry = getOrCreate(ipStore, ip)
  const emailEntry = getOrCreate(emailStore, email.toLowerCase())

  ipEntry.attempts.push(now)
  emailEntry.attempts.push(now)

  if (success) {
    ipEntry.strikes = 0
    emailEntry.strikes = 0
    return
  }

  ipEntry.strikes += 1
  emailEntry.strikes += 1

  const strikeLevel = Math.max(ipEntry.strikes, emailEntry.strikes)
  const cooldownSeconds = strikeLevel >= 3 ? 120 : strikeLevel === 2 ? 60 : 30
  const blockedUntil = now + cooldownSeconds * 1000
  ipEntry.blockedUntil = Math.max(ipEntry.blockedUntil, blockedUntil)
  emailEntry.blockedUntil = Math.max(emailEntry.blockedUntil, blockedUntil)
}
