'use client'

import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { mockPortais } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Plus,
  Globe,
  RefreshCcw,
  Settings2,
  ExternalLink,
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  MoreHorizontal,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const statusConfig = {
  ativo: { label: 'Ativo', color: 'bg-green-100 text-green-700' },
  inativo: { label: 'Inativo', color: 'bg-gray-100 text-gray-700' },
}

const integracaoConfig = {
  sincronizado: { label: 'Sincronizado', icon: CheckCircle, color: 'text-green-600' },
  pendente: { label: 'Pendente', icon: Clock, color: 'text-yellow-600' },
  erro: { label: 'Erro', icon: AlertTriangle, color: 'text-red-600' },
}

export default function PortaisPage() {
  const totalLeads = mockPortais.reduce((acc, p) => acc + p.leads, 0)
  const totalAnuncios = mockPortais.reduce((acc, p) => acc + p.anunciosAtivos, 0)
  const portaisAtivos = mockPortais.filter((p) => p.status === 'ativo').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Portais</h1>
          <p className="text-muted-foreground">
            Gerencie suas integrações com portais imobiliários
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Sincronizar Todos
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Conectar Portal
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Portais Ativos', value: portaisAtivos, icon: Globe, color: 'bg-primary/10 text-primary' },
          { label: 'Total de Anúncios', value: totalAnuncios, icon: FileText, color: 'bg-blue-100 text-blue-700' },
          { label: 'Leads Gerados', value: totalLeads, icon: Users, color: 'bg-green-100 text-green-700' },
          { label: 'Taxa de Conversão', value: '4.2%', icon: TrendingUp, color: 'bg-purple-100 text-purple-700' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <Card className="hover:shadow-sm transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={cn('p-3 rounded-lg', stat.color)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Portals Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {mockPortais.map((portal, index) => {
          const IntegracaoIcon = integracaoConfig[portal.integracaoStatus as keyof typeof integracaoConfig].icon
          const integracaoColor = integracaoConfig[portal.integracaoStatus as keyof typeof integracaoConfig].color
          const integracaoLabel = integracaoConfig[portal.integracaoStatus as keyof typeof integracaoConfig].label

          return (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Card className="group hover:shadow-md transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Globe className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-semibold">
                          {portal.nome}
                        </CardTitle>
                        <Badge 
                          variant="secondary" 
                          className={cn('mt-1', statusConfig[portal.status as keyof typeof statusConfig].color)}
                        >
                          {statusConfig[portal.status as keyof typeof statusConfig].label}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <RefreshCcw className="h-4 w-4" />
                          Sincronizar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Settings2 className="h-4 w-4" />
                          Configurar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <ExternalLink className="h-4 w-4" />
                          Abrir Portal
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Desconectar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Integration Status */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status da Integração</span>
                    <div className={cn('flex items-center gap-1', integracaoColor)}>
                      <IntegracaoIcon className="h-4 w-4" />
                      <span className="font-medium">{integracaoLabel}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Anúncios</span>
                      </div>
                      <p className="text-xl font-semibold mt-1">{portal.anunciosAtivos}</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Leads</span>
                      </div>
                      <p className="text-xl font-semibold mt-1">{portal.leads}</p>
                    </div>
                  </div>

                  {/* Last Sync */}
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      Última sincronização: {format(new Date(portal.ultimaSincronizacao), "d 'de' MMM, HH:mm", { locale: ptBR })}
                    </span>
                    <Button variant="ghost" size="sm" className="h-7 gap-1">
                      <RefreshCcw className="h-3 w-3" />
                      Sync
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}

        {/* Add New Portal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full min-h-[280px] border-dashed hover:border-primary/50 hover:bg-muted/30 transition-all cursor-pointer group">
            <CardContent className="flex flex-col items-center justify-center h-full text-center">
              <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <Plus className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="font-medium mt-4">Conectar Novo Portal</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Integre mais portais para aumentar sua visibilidade
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
