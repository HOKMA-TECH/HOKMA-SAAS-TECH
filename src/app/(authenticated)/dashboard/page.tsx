'use client'

import { motion } from 'framer-motion'
import { StatCard } from '@/components/dashboard/stat-card'
import { 
  SalesChart, 
  LeadsOriginChart, 
  FunnelChart, 
  UpcomingSchedule,
  DiretoriaView 
} from '@/components/dashboard/charts'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  TrendingUp, 
  CheckCircle2, 
  Users,
  Calendar, 
  Plus,
} from 'lucide-react'

export default function DashboardPage() {
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
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do desempenho da sua imobiliária
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Últimos 30 dias
        </Button>
      </motion.div>

      {/* Stats Grid - 4 cards uniformes */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 auto-rows-fr">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            iconColor={stat.iconColor}
            index={index}
          />
        ))}
      </div>

      {/* Funil e Agendamentos */}
      <div className="grid gap-6 lg:grid-cols-2">
        <FunnelChart />
        <UpcomingSchedule />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart />
        <LeadsOriginChart />
      </div>

      {/* Visão por Diretoria */}
      <DiretoriaView />
    </div>
  )
}
