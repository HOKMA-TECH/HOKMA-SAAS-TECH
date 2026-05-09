'use client'

import { useEffect, useRef } from 'react'

type TurnstileWidgetProps = {
  onTokenChange: (token: string | null) => void
  refreshSignal?: number
}

export function TurnstileWidget({ onTokenChange, refreshSignal = 0 }: TurnstileWidgetProps) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const onTokenChangeRef = useRef(onTokenChange)

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange
  }, [onTokenChange])

  useEffect(() => {
    onTokenChangeRef.current(null)
    if (!siteKey || !containerRef.current || typeof window === 'undefined') return

    const w = window as Window & {
      turnstile?: {
        render: (el: HTMLElement, opts: Record<string, unknown>) => string
        reset: (id?: string) => void
      }
    }

    const renderWidget = () => {
      if (!w.turnstile || !containerRef.current || widgetIdRef.current) return false

      widgetIdRef.current = w.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onTokenChangeRef.current(token),
        'expired-callback': () => onTokenChangeRef.current(null),
        'error-callback': () => onTokenChangeRef.current(null),
      })

      return true
    }

    if (renderWidget()) {
      return () => {
        if (widgetIdRef.current) {
          w.turnstile?.reset(widgetIdRef.current)
          widgetIdRef.current = null
        }
      }
    }

    const interval = window.setInterval(() => {
      renderWidget()
    }, 200)

    return () => {
      window.clearInterval(interval)
      if (widgetIdRef.current) {
        w.turnstile?.reset(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [siteKey])

  useEffect(() => {
    const w = window as Window & {
      turnstile?: {
        reset: (id?: string) => void
      }
    }
    if (!widgetIdRef.current || !w.turnstile) return
    w.turnstile.reset(widgetIdRef.current)
    onTokenChangeRef.current(null)
  }, [refreshSignal])

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">
        {`Verificacao anti-bot ativa (Turnstile). Site key: ${siteKey ? 'configurada' : 'nao configurada'}.`}
      </p>
      <div ref={containerRef} className="mt-2" />
    </div>
  )
}
