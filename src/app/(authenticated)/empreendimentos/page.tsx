'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { mockEmpreendimentos } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
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
  Plus,
  MapPin,
  Building2,
  Home,
  DollarSign,
  User,
  MoreHorizontal,
  ExternalLink,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const statusColors = {
  em_lancamento: 'bg-blue-100 text-blue-700',
  em_construcao: 'bg-yellow-100 text-yellow-700',
  pronto: 'bg-green-100 text-green-700',
}

const statusLabels = {
  em_lancamento: 'Em Lançamento',
  em_construcao: 'Em Construção',
  pronto: 'Pronto',
}

export default function EmpreendimentosPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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
          <h1 className="text-2xl font-semibold tracking-tight">Empreendimentos</h1>
          <p className="text-muted-foreground">
            Gerencie seus empreendimentos e unidades
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Empreendimento
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
      >
        <div className="flex flex-1 gap-3 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar empreendimentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>
          
          <Select defaultValue="todos">
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="em_lancamento">Em Lançamento</SelectItem>
              <SelectItem value="em_construcao">Em Construção</SelectItem>
              <SelectItem value="pronto">Pronto</SelectItem>
            </SelectContent>
          </Select>

          <Select defaultValue="todos">
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue placeholder="Localização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="sp">São Paulo</SelectItem>
              <SelectItem value="alphaville">Alphaville</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode('grid')}
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
      </motion.div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockEmpreendimentos.map((emp, index) => {
            const ocupacao = ((emp.unidades - emp.unidadesDisponiveis) / emp.unidades) * 100

            return (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                  {/* Image */}
                  <div className="relative h-40 bg-muted overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-primary/30" />
                    </div>
                    <Badge 
                      className={cn(
                        'absolute top-3 left-3',
                        statusColors[emp.status as keyof typeof statusColors]
                      )}
                    >
                      {statusLabels[emp.status as keyof typeof statusLabels]}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="icon" 
                          className="absolute top-3 right-3 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver unidades</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Arquivar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <CardContent className="p-4 space-y-4">
                    <div>
                      <h3 className="font-semibold text-base group-hover:text-primary transition-colors">
                        {emp.nome}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3" />
                        {emp.localizacao}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        <span>{emp.unidades} unidades</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {(emp.precoInicial / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Ocupação</span>
                        <span className="font-medium">{ocupacao.toFixed(0)}%</span>
                      </div>
                      <Progress value={ocupacao} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {emp.unidadesDisponiveis} unidades disponíveis
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3 w-3" />
                        {emp.responsavel}
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1 h-8">
                        Ver
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Empreendimento</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Unidades</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Preço Inicial</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Responsável</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Ocupação</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockEmpreendimentos.map((emp, index) => {
                  const ocupacao = ((emp.unidades - emp.unidadesDisponiveis) / emp.unidades) * 100
                  
                  return (
                    <motion.tr
                      key={emp.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{emp.nome}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {emp.localizacao}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={statusColors[emp.status as keyof typeof statusColors]}>
                          {statusLabels[emp.status as keyof typeof statusLabels]}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <span>{emp.unidadesDisponiveis}/{emp.unidades}</span>
                      </td>
                      <td className="p-4">
                        R$ {emp.precoInicial.toLocaleString('pt-BR')}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {emp.responsavel}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Progress value={ocupacao} className="h-2 w-20" />
                          <span className="text-sm">{ocupacao.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm">
                          Ver detalhes
                        </Button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
