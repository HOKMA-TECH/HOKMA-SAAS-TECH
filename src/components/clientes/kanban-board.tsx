'use client'

import { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { cn } from '@/lib/utils'
import { mockClients } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  MoreHorizontal, 
  Phone, 
  Mail, 
  Calendar,
  Tag,
  User,
  GripVertical,
  Plus,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const columns = [
  { id: 'novo', name: 'Novos', color: 'bg-blue-500' },
  { id: 'em_atendimento', name: 'Em Atendimento', color: 'bg-yellow-500' },
  { id: 'proposta', name: 'Proposta', color: 'bg-purple-500' },
  { id: 'negociacao', name: 'Negociação', color: 'bg-orange-500' },
  { id: 'fechado', name: 'Fechado', color: 'bg-green-500' },
  { id: 'perdido', name: 'Perdido', color: 'bg-gray-400' },
]

const priorityColors = {
  alta: 'border-l-red-500',
  media: 'border-l-yellow-500',
  baixa: 'border-l-blue-500',
}

interface ClientCardProps {
  client: (typeof mockClients)[0]
}

function ClientCard({ client }: ClientCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={cn(
        'bg-card border rounded-lg p-4 cursor-pointer group',
        'border-l-4',
        priorityColors[client.prioridade as keyof typeof priorityColors]
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {client.name.split(' ').map((n) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium leading-tight">{client.name}</p>
            <p className="text-xs text-muted-foreground">{client.interesse}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
            <DropdownMenuItem>Editar</DropdownMenuItem>
            <DropdownMenuItem>Mover para...</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <User className="h-3 w-3" />
          <span>{client.corretor}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3" />
          <span>
            {new Date(client.ultimoContato).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
            })}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-3">
        {client.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
            {tag}
          </Badge>
        ))}
      </div>
    </motion.div>
  )
}

interface KanbanColumnProps {
  column: (typeof columns)[0]
  clients: (typeof mockClients)
}

function KanbanColumn({ column, clients }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', column.color)} />
          <h3 className="text-sm font-medium">{column.name}</h3>
          <Badge variant="secondary" className="ml-1 text-xs">
            {clients.length}
          </Badge>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex-1 space-y-3 p-2 bg-muted/30 rounded-lg min-h-[500px]">
        <AnimatePresence>
          {clients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </AnimatePresence>
        
        {clients.length === 0 && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum cliente
            </p>
            <Button variant="ghost" size="sm" className="mt-2 gap-1">
              <Plus className="h-3 w-3" />
              Adicionar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function KanbanBoard() {
  const getClientsByStatus = (status: string) => {
    return mockClients.filter((client) => client.status === status)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <KanbanColumn 
          key={column.id} 
          column={column} 
          clients={getClientsByStatus(column.id)} 
        />
      ))}
    </div>
  )
}
