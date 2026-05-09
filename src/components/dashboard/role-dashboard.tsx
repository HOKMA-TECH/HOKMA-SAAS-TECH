'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function DashboardHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border/60 bg-gradient-to-br from-slate-50 to-white p-6">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
    </motion.div>
  )
}

export function DashboardSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

export function DashboardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
}

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, idx) => (
        <Card key={idx} className="animate-pulse border-border/60">
          <CardContent className="p-4">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="mt-3 h-7 w-16 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-32 rounded bg-slate-200" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function DashboardTenantSummary({ tenantId, role }: { tenantId: string | null; role: string | null }) {
  return (
    <Card className="border-border/60 bg-gradient-to-r from-white to-slate-50">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Contexto Tenant</p>
        <p className="mt-1 text-sm font-medium">Tenant ativo: {tenantId ?? 'nao selecionado'}</p>
        <p className="mt-1 text-xs text-muted-foreground">Role ativa: {role ?? 'sem role'}</p>
      </CardContent>
    </Card>
  )
}

export function DashboardPlatformSummary() {
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-blue-700">Contexto Platform</p>
        <p className="mt-1 text-sm font-medium text-blue-900">Visao global habilitada para master admin</p>
        <p className="mt-1 text-xs text-blue-700">Dados de tenant nao sao misturados neste painel.</p>
      </CardContent>
    </Card>
  )
}

export function DashboardShortcutCard({ title, description, href, icon: Icon }: { title: string; description: string; href: string; icon: LucideIcon }) {
  return (
    <Link href={href}>
      <Card className="h-full border-border/60 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="rounded-lg border bg-slate-50 p-2">
              <Icon className="h-4 w-4 text-slate-700" />
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <CardTitle className="text-sm">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}

export function DashboardEmptyState({ title, description, ctaLabel, ctaHref }: { title: string; description: string; ctaLabel?: string; ctaHref?: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm font-medium">{title}</p>
        <p className="max-w-lg text-sm text-muted-foreground">{description}</p>
        {ctaLabel && ctaHref ? (
          <Link href={ctaHref}>
            <Button variant="outline" size="sm">{ctaLabel}</Button>
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function DashboardStatCard({
  title,
  value,
  description,
  tone = 'slate',
}: {
  title: string
  value: string | number
  description: string
  tone?: 'slate' | 'blue' | 'green' | 'amber'
}) {
  const toneClass = {
    slate: 'bg-slate-50 border-slate-200 text-slate-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
  }

  return (
    <Card className={cn('border', toneClass[tone])}>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
