'use client'

import { FormEvent, useState } from 'react'
import { useAuth } from '@/features/auth/auth-context'
import { validateStrongPassword } from '@/features/auth/password-policy'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errors = validateStrongPassword(password)
    if (errors.length > 0) {
      setMsg(errors[0])
      return
    }
    const result = await updatePassword(password)
    setMsg(result.error ?? 'Senha atualizada com sucesso.')
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Definir nova senha</h1>
      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nova senha forte" />
      <Button type="submit" className="w-full">Atualizar senha</Button>
      {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
    </form>
  )
}
