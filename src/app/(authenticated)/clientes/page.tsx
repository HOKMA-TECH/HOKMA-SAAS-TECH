'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { KanbanBoard } from '@/components/clientes/kanban-board'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  SlidersHorizontal,
} from 'lucide-react'

export default function ClientesPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [searchTerm, setSearchTerm] = useState('')

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie seus clientes e acompanhe o funil de vendas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Importar
            </Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-1 gap-3 w-full sm:w-auto">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar clientes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9"
              />
            </div>
            
            <Select defaultValue="todos">
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Corretor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ana">Ana Silva</SelectItem>
                <SelectItem value="carlos">Carlos Souza</SelectItem>
                <SelectItem value="maria">Maria Santos</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="todos">
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="gap-2 h-9">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            <Button
              variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 px-2"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          <Badge variant="secondary" className="gap-1 cursor-pointer hover:bg-secondary/80">
            Todos os corretores
            <span className="ml-1 text-muted-foreground">&times;</span>
          </Badge>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {viewMode === 'kanban' && <KanbanBoard />}
        {viewMode === 'list' && (
          <div className="text-center py-12 text-muted-foreground">
            Visualização em lista em desenvolvimento
          </div>
        )}
      </motion.div>
    </div>
  )
}
