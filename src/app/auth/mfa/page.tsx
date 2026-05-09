"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/auth-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function MfaPage() {
  const router = useRouter()
  const { enrollTotp, verifyTotp, disableTotp, retryMfaChallenge } = useAuth()
  const [factorId, setFactorId] = useState('')
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  const onEnroll = async () => {
    setIsBusy(true)
    const result = await enrollTotp()
    if (result.error) {
      setMessage(result.error)
      setIsBusy(false)
      return
    }
    setFactorId(result.factorId ?? '')
    setQrCode(result.qr)
    setSecret(result.secret)
    setMessage('Cadastro MFA iniciado. Escaneie o QR code e valide o primeiro codigo.')
    setIsBusy(false)
  }

  const onVerify = async () => {
    setIsBusy(true)
    const result = await verifyTotp(factorId, code)
    setMessage(result.error ?? 'MFA verificado com sucesso.')
    if (!result.error) {
      router.replace('/')
      router.refresh()
    }
    setIsBusy(false)
  }

  const onRetry = async () => {
    setIsBusy(true)
    const result = await retryMfaChallenge(factorId)
    setMessage(result.error ?? `Novo desafio gerado: ${result.challengeId}`)
    setIsBusy(false)
  }

  const onDisable = async () => {
    setIsBusy(true)
    const result = await disableTotp(factorId)
    setMessage(result.error ?? 'MFA desativado com sucesso.')
    setIsBusy(false)
  }

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-8">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Verificacao MFA</CardTitle>
            <CardDescription>Roles elevadas exigem MFA obrigatorio. Conclua o ciclo de cadastro e verificacao TOTP.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={onEnroll} disabled={isBusy}>Iniciar cadastro TOTP</Button>
            {qrCode ? <img src={qrCode} alt="QR Code MFA" className="h-44 w-44 rounded-md border border-border bg-white p-2" /> : null}
            {secret ? <p className="text-xs text-muted-foreground">Codigo manual (backup): {secret}</p> : null}
            <Input placeholder="Factor ID" value={factorId} onChange={(e) => setFactorId(e.target.value)} />
            <Input placeholder="Codigo TOTP" value={code} onChange={(e) => setCode(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <Button onClick={onVerify} disabled={isBusy}>Verificar MFA</Button>
              <Button variant="outline" onClick={onRetry} disabled={isBusy}>Retry challenge</Button>
              <Button variant="destructive" onClick={onDisable} disabled={isBusy}>Desativar MFA</Button>
            </div>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
        </Card>
      </motion.div>
    </main>
  )
}
