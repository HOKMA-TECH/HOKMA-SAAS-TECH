'use client'

import { useRouter } from 'next/navigation'
import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/auth-context'

export default function AccessDeniedPage() {
  const router = useRouter()
  const { activeMembership } = useAuth()
  const isPlatformContext = activeMembership?.role === 'master_admin'

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <section className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-700">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <p className="mb-3 rounded-full border border-amber-300 bg-amber-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
          Acesso negado
        </p>
        <h1 className="text-balance text-4xl font-semibold text-slate-900">Voce nao tem permissao para acessar esta area.</h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
          Esta acao exige capacidades de seguranca especificas. Se voce acredita que isso e um engano, entre em contato com o administrador responsavel.
        </p>
        <div className="mt-8 flex w-full max-w-md gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button className="flex-1 gap-2" onClick={() => router.push(isPlatformContext ? '/platform' : '/dashboard')}>
            <LayoutDashboard className="h-4 w-4" />
            Ir ao painel
          </Button>
        </div>
      </section>
    </main>
  )
}
