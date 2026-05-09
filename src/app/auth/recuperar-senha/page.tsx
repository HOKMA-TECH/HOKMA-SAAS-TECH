'use client'

import { FormEvent, useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import { TurnstileWidget } from '@/features/auth/turnstile-widget'
import { resolveCaptchaToken } from '@/features/auth/captcha'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function RecoverPasswordPage() {
  const { sendPasswordRecoveryEmail } = useAuth()
  const [email, setEmail] = useState('')
  const [captcha, setCaptcha] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!resolveCaptchaToken(captcha)) {
      setMessage('Conclua a verificacao anti-bot.')
      return
    }
    await sendPasswordRecoveryEmail(email)
    setMessage('Se o email existir, voce recebera instrucoes de recuperacao.')
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Recuperar senha</h1>
      <Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TurnstileWidget onTokenChange={setCaptcha} />
      <Button type="submit" className="w-full">Enviar</Button>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </form>
  )
}
