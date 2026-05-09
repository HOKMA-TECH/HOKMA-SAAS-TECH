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
