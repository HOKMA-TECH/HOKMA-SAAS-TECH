'use client'

import { DashboardEmptyState, DashboardPlatformSummary, DashboardSection, DashboardShortcutCard, DashboardStatCard } from '@/components/dashboard/role-dashboard'
import { Shield, Building2, FileText, AlertTriangle } from 'lucide-react'

export default function PlatformPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
        <h1 className="text-2xl font-semibold tracking-tight text-blue-950">Painel Global da Plataforma</h1>
        <p className="mt-2 text-sm text-blue-800">Contexto exclusivo de master admin para governanca multi-tenant, auditoria e estado operacional global.</p>
      </div>

      <DashboardPlatformSummary />

      <DashboardSection title="Resumo executivo" description="Indicadores globais com placeholders estruturados preparados para conexao com fontes seguras.">
        <div className="grid gap-4 md:grid-cols-3">
          <DashboardStatCard title="Tenants ativos" value="--" description="Aguardando feed de platform metrics" tone="blue" />
          <DashboardStatCard title="Auditorias abertas" value="--" description="Fila global de revisao" tone="amber" />
          <DashboardStatCard title="Saude da plataforma" value="Estavel" description="Monitoramento operacional basico" tone="green" />
        </div>
      </DashboardSection>

      <DashboardSection title="Atalhos de governanca" description="Acessos de plataforma sem mistura com contexto tenant.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardShortcutCard title="Tenants" description="Gestao global de tenants" href="/platform" icon={Building2} />
          <DashboardShortcutCard title="Auditoria" description="Eventos e trilhas da plataforma" href="/platform" icon={FileText} />
          <DashboardShortcutCard title="Seguranca" description="Alertas e postura de risco" href="/platform" icon={AlertTriangle} />
          <DashboardShortcutCard title="Governanca" description="Controles executivos" href="/platform" icon={Shield} />
        </div>
      </DashboardSection>

      <DashboardSection title="Status da onda" description="Este painel ja diferencia visual e funcionalmente contexto platform de contexto tenant.">
        <DashboardEmptyState title="Dados globais em expansao" description="A arquitetura de dashboard global esta pronta. A proxima onda conecta datasets reais de plataforma com controles de auditoria e seguranca." ctaLabel="Voltar ao dashboard" ctaHref="/dashboard" />
      </DashboardSection>
    </div>
  )
}
