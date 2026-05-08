import { PageHeader } from '@/components/layout/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { StatCard } from '@/components/shared/stat-card'

export default function PlatformPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform"
        description="Visao master-admin para governanca da plataforma multi-tenant (fundacao da etapa 1)."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard title="Tenants ativos" value="--" helper="Conectado ao backend futuro" />
        <StatCard title="Integracoes" value="--" helper="Sem comandos nativos expostos nesta etapa" />
        <StatCard title="Alertas de seguranca" value="--" helper="Pipeline definido para proximas etapas" />
      </section>

      <EmptyState
        title="Modulo em preparacao"
        description="A estrutura visual e de navegacao esta pronta. A logica real sera ligada ao backend seguro nas proximas etapas."
      />
    </div>
  )
}
