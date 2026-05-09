export function isDesktopRuntime(): boolean {
  if (typeof window === 'undefined') return false
  const ua = window.navigator.userAgent || ''
  const hasTauriUa = ua.toLowerCase().includes('tauri')
  const hasTauriGlobal = '__TAURI_INTERNALS__' in window || '__TAURI__' in window
  return hasTauriUa || hasTauriGlobal
}

export function resolveCaptchaToken(stateToken: string | null): string | null {
  if (stateToken) return stateToken
  if (typeof document !== 'undefined') {
    const input = document.querySelector('input[name="cf-turnstile-response"]') as HTMLInputElement | null
    const domToken = input?.value?.trim() ?? ''
    if (domToken) return domToken
  }
  return null
}
