'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { mockTarefas } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Plus,
  Calendar,
  User,
  Flag,
  MoreHorizontal,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const statusConfig = {
  pendente: { label: 'Pendente', icon: Circle, color: 'text-yellow-600' },
  em_andamento: { label: 'Em Andamento', icon: Clock, color: 'text-blue-600' },
  concluida: { label: 'Concluída', icon: CheckCircle2, color: 'text-green-600' },
}

const priorityConfig = {
  alta: { label: 'Alta', color: 'bg-red-100 text-red-700 border-red-200' },
  media: { label: 'Média', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  baixa: { label: 'Baixa', color: 'bg-blue-100 text-blue-700 border-blue-200' },
}

export default function TarefasPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState('todas')

  const filteredTarefas = mockTarefas.filter((tarefa) => {
    if (filter === 'todas') return true
    return tarefa.status === filter
  })

  const stats = {
    total: mockTarefas.length,
    pendentes: mockTarefas.filter((t) => t.status === 'pendente').length,
    emAndamento: mockTarefas.filter((t) => t.status === 'em_andamento').length,
    concluidas: mockTarefas.filter((t) => t.status === 'concluida').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tarefas</h1>
          <p className="text-muted-foreground">
            Gerencie suas tarefas e acompanhe o progresso
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total', value: stats.total, color: 'bg-muted' },
          { label: 'Pendentes', value: stats.pendentes, color: 'bg-yellow-100' },
          { label: 'Em Andamento', value: stats.emAndamento, color: 'bg-blue-100' },
          { label: 'Concluídas', value: stats.concluidas, color: 'bg-green-100' },
        ].map((stat, index) => (
          <Card key={stat.label} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', stat.color)}>
                  <span className="text-lg font-semibold">{stat.value}</span>
                </div>
                <span className="text-sm text-muted-foreground">{stat.label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
        
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluida">Concluídas</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="todas">
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Média</SelectItem>
            <SelectItem value="baixa">Baixa</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Tasks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {filteredTarefas.map((tarefa, index) => {
                const StatusIcon = statusConfig[tarefa.status as keyof typeof statusConfig].icon
                const statusColor = statusConfig[tarefa.status as keyof typeof statusConfig].color
                const priorityStyle = priorityConfig[tarefa.prioridade as keyof typeof priorityConfig]
                const isOverdue = new Date(tarefa.prazo) < new Date() && tarefa.status !== 'concluida'

                return (
                  <motion.div
                    key={tarefa.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors group',
                      tarefa.status === 'concluida' && 'opacity-60'
                    )}
                  >
                    <Checkbox 
                      checked={tarefa.status === 'concluida'}
                      className="h-5 w-5"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p className={cn(
                          'font-medium',
                          tarefa.status === 'concluida' && 'line-through'
                        )}>
                          {tarefa.titulo}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={cn('shrink-0 text-xs', priorityStyle.color)}
                        >
                          {priorityStyle.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 truncate">
                        {tarefa.descricao}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {tarefa.responsavel}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(tarefa.prazo), "d 'de' MMM", { locale: ptBR })}
                        </div>
                        {tarefa.cliente && (
                          <div className="flex items-center gap-1">
                            <span>Cliente: {tarefa.cliente}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOverdue && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Atrasada
                        </Badge>
                      )}
                      
                      <div className={cn('flex items-center gap-1', statusColor)}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-xs font-medium">
                          {statusConfig[tarefa.status as keyof typeof statusConfig].label}
                        </span>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Marcar como concluída</DropdownMenuItem>
                          <DropdownMenuItem>Alterar prioridade</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
