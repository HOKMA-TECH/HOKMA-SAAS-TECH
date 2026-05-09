'use client'

import { motion } from 'framer-motion'
import { DashboardEmptyState, DashboardHero, DashboardSection, DashboardShortcutCard, DashboardStatCard } from '@/components/dashboard/role-dashboard'
import { SalesChart, LeadsOriginChart, FunnelChart, UpcomingSchedule, DiretoriaView } from '@/components/dashboard/charts'
import { useAuth } from '@/features/auth/auth-context'
import { useCan } from '@/features/auth/authorization'
import { 
  Target,
  Activity,
  Clock3,
  Users,
  Calendar,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Settings,
  Shield,
} from 'lucide-react'

export default function DashboardPage() {
  const { profile, activeMembership, activeTenant } = useAuth()
  const role = activeMembership?.role ?? 'corretor'
  const canClients = useCan('clientes.read')
  const canAgenda = useCan('agenda.read')
  const canTasks = useCan('tarefas.read')
  const canChat = useCan('documentos.read')
  const canReports = useCan('relatorios.read')
  const canAdmin = useCan('tenant.audit.read')
  const canSettings = useCan('tenant.settings.manage')
  const canPlatform = useCan('platform.tenants.manage', { context: 'platform' })

  const roleStats: Record<string, Array<{ title: string; value: string | number; description: string; tone: 'slate' | 'blue' | 'green' | 'amber' }>> = {
    corretor: [
      { title: 'Clientes ativos', value: 0, description: 'Carteira pessoal ativa', tone: 'blue' },
      { title: 'Tarefas pendentes', value: 0, description: 'Pendencias do dia', tone: 'amber' },
      { title: 'Agendamentos', value: 0, description: 'Proximas visitas', tone: 'slate' },
    ],
    coordenador: [
      { title: 'Corretores no escopo', value: 0, description: 'Time acompanhado', tone: 'blue' },
      { title: 'Tarefas da coordenacao', value: 0, description: 'Backlog de coordenacao', tone: 'amber' },
      { title: 'Produtividade', value: '0%', description: 'Ritmo da equipe', tone: 'green' },
    ],
    gerente: [
      { title: 'Time ativo', value: 0, description: 'Pessoas em operacao', tone: 'blue' },
      { title: 'Metas do periodo', value: '0%', description: 'Atingimento atual', tone: 'green' },
      { title: 'Pendencias criticas', value: 0, description: 'Itens com prioridade', tone: 'amber' },
    ],
    diretor: [
      { title: 'Performance diretoria', value: '0%', description: 'Consolidado estrategico', tone: 'green' },
      { title: 'Relatorios chave', value: 0, description: 'Indicadores prontos', tone: 'blue' },
      { title: 'Governanca', value: 'OK', description: 'Estado de controles', tone: 'slate' },
    ],
    administrador: [
      { title: 'Usuarios ativos', value: 0, description: 'Membros em operacao', tone: 'blue' },
      { title: 'Aprovacoes pendentes', value: 0, description: 'Fluxos aguardando acao', tone: 'amber' },
      { title: 'Saude do tenant', value: 'Estavel', description: 'Status operacional basico', tone: 'green' },
    ],
    master_admin: [
      { title: 'Tenants monitorados', value: 0, description: 'Escopo de plataforma', tone: 'blue' },
      { title: 'Alertas de seguranca', value: 0, description: 'Janela recente', tone: 'amber' },
      { title: 'Saude da plataforma', value: 'Estavel', description: 'Visao executiva global', tone: 'green' },
    ],
  }

  const stats = roleStats[role] ?? roleStats.corretor

  const stats = [
    { 
      title: 'Vendas Concluídas', 
      value: 0, 
      description: '0% de conclusão no período',
      icon: DollarSign,
      iconColor: 'blue' as const,
    },
    { 
      title: 'Em Análise', 
      value: 2, 
      description: 'Clientes aguardando decisão',
      icon: TrendingUp,
      iconColor: 'indigo' as const,
    },
    { 
      title: 'Aprovados', 
      value: 1, 
      description: 'Aprovado, condicionado e contrato',
      icon: CheckCircle2,
      iconColor: 'green' as const,
    },
    { 
      title: 'Leads Ativos', 
      value: 0, 
      description: 'Leads abertos e ganhos',
      icon: Users,
      iconColor: 'orange' as const,
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardHero title={`Bem-vindo, ${profile?.display_name ?? 'time HOKMA'}`} subtitle={`Visao ${role} no tenant ${activeTenant ?? 'nao selecionado'}. Conteudo orientado por capability.`} />

      <DashboardSection title="Atalhos operacionais" description="Acesso rapido aos modulos permitidos no seu contexto.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {canClients ? <DashboardShortcutCard title="Clientes" description="Gerencie carteira e oportunidades." href="/clientes" icon={Users} /> : null}
          {canAgenda ? <DashboardShortcutCard title="Agenda" description="Acompanhe compromissos e visitas." href="/agenda" icon={Calendar} /> : null}
          {canTasks ? <DashboardShortcutCard title="Tarefas" description="Fluxo diario da operacao." href="/tarefas" icon={CheckSquare} /> : null}
          {canChat ? <DashboardShortcutCard title="Chat" description="Comunicacao operacional." href="/chat" icon={MessageSquare} /> : null}
          {canReports ? <DashboardShortcutCard title="Relatorios" description="Leituras gerenciais e performance." href="/relatorios" icon={BarChart3} /> : null}
          {canAdmin ? <DashboardShortcutCard title="Painel Admin" description="Governanca do tenant e auditoria." href="/admin" icon={Shield} /> : null}
          {canSettings ? <DashboardShortcutCard title="Configuracoes" description="Controles basicos do tenant." href="/configuracoes" icon={Settings} /> : null}
        </div>
      </DashboardSection>

      {canPlatform ? (
        <DashboardSection title="Contexto de plataforma" description="Voce esta em contexto global de plataforma.">
          <div className="grid gap-4 sm:grid-cols-2">
            <DashboardShortcutCard title="Painel Platform" description="Gestao global de tenants e auditoria." href="/platform" icon={Shield} />
          </div>
        </DashboardSection>
      ) : null}

      <DashboardSection title="Resumo do seu escopo" description="Indicadores iniciais por role com base pronta para dados reais autorizados.">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <DashboardStatCard key={stat.title} title={stat.title} value={stat.value} description={stat.description} tone={stat.tone} />
          ))}
        </div>
      </DashboardSection>

      <DashboardSection title="Fluxo operacional" description="Blocos comuns da operacao diaria, exibidos por permissao.">
        <div className="grid gap-6 lg:grid-cols-2">
          <FunnelChart />
          <UpcomingSchedule />
        </div>
      </DashboardSection>

      <DashboardSection title="Tendencias" description="Visoes para acompanhamento do periodo e planejamento.">
        <div className="grid gap-6 lg:grid-cols-2">
          <SalesChart />
          <LeadsOriginChart />
        </div>
      </DashboardSection>

      {['coordenador', 'gerente', 'diretor', 'administrador', 'master_admin'].includes(role) ? (
        <DashboardSection title="Visao agregada" description="Camada de acompanhamento de equipe e estrutura para perfis de gestao.">
          <DiretoriaView />
        </DashboardSection>
      ) : null}

      {!canClients && !canAgenda && !canTasks ? (
        <DashboardEmptyState title="Sem modulos operacionais habilitados" description="Seu perfil atual nao possui capabilities basicas para operacao diaria. Solicite revisao de acesso ao administrador do tenant." ctaLabel="Ir para 403" ctaHref="/403" />
      ) : null}
    </div>
  )
}
