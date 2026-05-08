'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { mockUsuarios, mockEquipes } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  UsersRound,
  Target,
  Megaphone,
  BarChart3,
  Search,
  Plus,
  MoreHorizontal,
  Shield,
  Mail,
  CheckCircle,
  XCircle,
  Settings,
  Edit,
  Trash2,
  TrendingUp,
  Building2,
} from 'lucide-react'

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Painel Administrativo</h1>
          <p className="text-muted-foreground">
            Gerencie usuários, equipes e configurações do sistema
          </p>
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
          { label: 'Usuários Ativos', value: mockUsuarios.filter((u) => u.status === 'ativo').length, icon: Users, color: 'bg-blue-100 text-blue-700' },
          { label: 'Equipes', value: mockEquipes.length, icon: UsersRound, color: 'bg-purple-100 text-purple-700' },
          { label: 'Meta do Mês', value: '76%', icon: Target, color: 'bg-green-100 text-green-700' },
          { label: 'Anúncios Ativos', value: '12', icon: Megaphone, color: 'bg-orange-100 text-orange-700' },
        ].map((stat, index) => (
          <Card key={stat.label} className="hover:shadow-sm transition-shadow">
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
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="usuarios" className="space-y-6">
        <TabsList>
          <TabsTrigger value="usuarios" className="gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="equipes" className="gap-2">
            <UsersRound className="h-4 w-4" />
            Equipes
          </TabsTrigger>
          <TabsTrigger value="metas" className="gap-2">
            <Target className="h-4 w-4" />
            Metas
          </TabsTrigger>
          <TabsTrigger value="anuncios" className="gap-2">
            <Megaphone className="h-4 w-4" />
            Anúncios
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Usuários Tab */}
        <TabsContent value="usuarios" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissões</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsuarios.map((usuario, index) => (
                  <motion.tr
                    key={usuario.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {usuario.nome.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{usuario.nome}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {usuario.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="gap-1">
                        <Shield className="h-3 w-3" />
                        {usuario.perfil}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {usuario.status === 'ativo' ? (
                        <Badge className="bg-green-100 text-green-700 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {usuario.permissoes.slice(0, 2).map((p) => (
                          <Badge key={p} variant="outline" className="text-xs">
                            {p}
                          </Badge>
                        ))}
                        {usuario.permissoes.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{usuario.permissoes.length - 2}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2">
                            <Edit className="h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <Settings className="h-4 w-4" />
                            Permissões
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Desativar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Equipes Tab */}
        <TabsContent value="equipes" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Equipe
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockEquipes.map((equipe, index) => (
              <motion.div
                key={equipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{equipe.nome}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Users className="h-3 w-3" />
                          {equipe.membros} membros
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Gerenciar membros</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Líder:</span>
                      <span className="font-medium">{equipe.lider}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Meta Mensal</span>
                        <span className="font-semibold">
                          R$ {(equipe.metaMensal / 1000).toFixed(0)}k
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Vendas</span>
                        <span className="font-semibold">
                          R$ {(equipe.vendas / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Desempenho</span>
                        <span className={cn(
                          'font-semibold',
                          equipe.desempenho >= 100 ? 'text-green-600' : 'text-yellow-600'
                        )}>
                          {equipe.desempenho}%
                        </span>
                      </div>
                      <Progress value={Math.min(equipe.desempenho, 100)} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Metas Tab */}
        <TabsContent value="metas" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Meta
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metas Mensais</CardTitle>
                <CardDescription>Progresso das metas do mês atual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'Vendas Totais', current: 890000, target: 1200000 },
                  { label: 'Novos Leads', current: 245, target: 300 },
                  { label: 'Visitas Realizadas', current: 78, target: 100 },
                  { label: 'Propostas Enviadas', current: 42, target: 50 },
                ].map((meta) => {
                  const progress = (meta.current / meta.target) * 100
                  return (
                    <div key={meta.label} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{meta.label}</span>
                        <span className="text-sm text-muted-foreground">
                          {typeof meta.current === 'number' && meta.current > 1000 
                            ? `R$ ${(meta.current / 1000).toFixed(0)}k / R$ ${(meta.target / 1000).toFixed(0)}k`
                            : `${meta.current} / ${meta.target}`
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={progress} className="h-2 flex-1" />
                        <span className={cn(
                          'text-sm font-semibold min-w-[48px] text-right',
                          progress >= 100 ? 'text-green-600' : progress >= 70 ? 'text-yellow-600' : 'text-red-600'
                        )}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Metas por Equipe</CardTitle>
                <CardDescription>Desempenho comparativo das equipes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mockEquipes.map((equipe, index) => (
                  <div key={equipe.id} className="flex items-center gap-4">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      'bg-orange-100 text-orange-700'
                    )}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{equipe.nome}</span>
                        <Badge variant={equipe.desempenho >= 100 ? 'default' : 'secondary'}>
                          {equipe.desempenho}%
                        </Badge>
                      </div>
                      <Progress value={Math.min(equipe.desempenho, 100)} className="h-1.5 mt-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Anúncios Tab */}
        <TabsContent value="anuncios" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Anúncio
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { titulo: 'Campanha de Verão', status: 'ativo', periodo: '01/01 - 28/02', impressoes: 12500, cliques: 890 },
              { titulo: 'Lançamento Aurora', status: 'ativo', periodo: '15/01 - 15/02', impressoes: 8200, cliques: 645 },
              { titulo: 'Black Friday', status: 'finalizado', periodo: '20/11 - 30/11', impressoes: 45000, cliques: 3200 },
            ].map((anuncio, index) => (
              <motion.div
                key={anuncio.titulo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{anuncio.titulo}</CardTitle>
                        <CardDescription>{anuncio.periodo}</CardDescription>
                      </div>
                      <Badge variant={anuncio.status === 'ativo' ? 'default' : 'secondary'}>
                        {anuncio.status === 'ativo' ? 'Ativo' : 'Finalizado'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Impressões</p>
                        <p className="text-lg font-semibold">{anuncio.impressoes.toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground">Cliques</p>
                        <p className="text-lg font-semibold">{anuncio.cliques.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 text-sm">
                      <span className="text-muted-foreground">CTR</span>
                      <span className="font-semibold text-green-600">
                        {((anuncio.cliques / anuncio.impressoes) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Relatórios Tab */}
        <TabsContent value="relatorios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Relatórios Administrativos</CardTitle>
              <CardDescription>Visão consolidada do negócio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: 'Relatório de Vendas', icon: BarChart3, desc: 'Análise completa de vendas' },
                  { label: 'Produtividade', icon: TrendingUp, desc: 'Métricas da equipe' },
                  { label: 'Financeiro', icon: Building2, desc: 'Receitas e despesas' },
                  { label: 'Comparativo', icon: Target, desc: 'Metas vs realizado' },
                ].map((relatorio) => (
                  <Button
                    key={relatorio.label}
                    variant="outline"
                    className="h-auto py-6 flex-col gap-2 hover:border-primary/50"
                  >
                    <relatorio.icon className="h-8 w-8 text-primary" />
                    <span className="font-medium">{relatorio.label}</span>
                    <span className="text-xs text-muted-foreground">{relatorio.desc}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
