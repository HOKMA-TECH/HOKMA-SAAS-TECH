'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/auth-context'
import { useCan } from '@/features/auth/authorization'
import { tenantQueryKey } from '@/lib/query/tenant-query-key'
import { addCrmNote, convertLeadToClient, createCrmLead, getCrmLeadDetail, listCrmClients, listCrmLeads, moveCrmStage, reassignLeadOwner } from '@/features/crm/crm-api'
import type { CrmStage } from '@/features/crm/types'
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
  Loader2,
} from 'lucide-react'

export default function ClientesPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState('all')
  const [isCreating, setIsCreating] = useState(false)
  const [newLeadName, setNewLeadName] = useState('')
  const [newLeadEmail, setNewLeadEmail] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')
  const [newOwnerUserId, setNewOwnerUserId] = useState('')
  const { activeTenant, user, activeMembership } = useAuth()
  const queryClient = useQueryClient()
  const canReadLeads = useCan('leads.read')
  const canCreateLeads = useCan('leads.create')
  const canAssignLeads = useCan('leads.assign')

  const leadsQuery = useQuery({
    queryKey: tenantQueryKey(activeTenant, 'crm-leads', searchTerm),
    queryFn: async () => {
      if (!activeTenant) return []
      const result = await listCrmLeads(activeTenant, { search: searchTerm || undefined, stage: stageFilter === 'all' ? undefined : stageFilter })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!activeTenant && canReadLeads,
  })

  const clientsQuery = useQuery({
    queryKey: tenantQueryKey(activeTenant, 'crm-clients', searchTerm),
    queryFn: async () => {
      if (!activeTenant) return []
      const result = await listCrmClients(activeTenant, { search: searchTerm || undefined, stage: stageFilter === 'all' ? undefined : stageFilter })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!activeTenant && canReadLeads,
  })

  const leads = leadsQuery.data ?? []

  const leadDetailQuery = useQuery({
    queryKey: tenantQueryKey(activeTenant, 'crm-lead-detail', selectedLeadId),
    queryFn: async () => {
      if (!selectedLeadId) return null
      const result = await getCrmLeadDetail(selectedLeadId)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!selectedLeadId && !!activeTenant && canReadLeads,
  })

  const onCreateLead = async () => {
    if (!activeTenant || !user || !canCreateLeads || !newLeadName.trim()) return
    setIsCreating(true)
    const result = await createCrmLead({
      tenantId: activeTenant,
      fullName: newLeadName.trim(),
      email: newLeadEmail.trim() || undefined,
      ownerUserId: user.id,
      directorateId: activeMembership?.directorate_id ?? null,
      teamId: activeMembership?.team_id ?? null,
      coordinationId: activeMembership?.coordination_id ?? null,
    })
    setIsCreating(false)
    if (result.error) {
      setFeedback(result.error)
      return
    }
    setNewLeadName('')
    setNewLeadEmail('')
    setFeedback('Lead criado com sucesso.')
    await queryClient.invalidateQueries({ queryKey: tenantQueryKey(activeTenant, 'crm-leads') })
  }

  const onMoveStage = async (leadId: string, stage: CrmStage) => {
    const result = await moveCrmStage({ leadId, toStage: stage })
    if (result.error) {
      setFeedback(result.error)
      return
    }
    setFeedback('Stage atualizado com sucesso.')
    await queryClient.invalidateQueries({ queryKey: tenantQueryKey(activeTenant, 'crm-leads') })
    await queryClient.invalidateQueries({ queryKey: tenantQueryKey(activeTenant, 'crm-lead-detail', leadId) })
  }

  const onAddNote = async () => {
    if (!selectedLeadId || !noteText.trim()) return
    const result = await addCrmNote({ leadId: selectedLeadId, note: noteText.trim() })
    if (result.error) {
      setFeedback(result.error)
      return
    }
    setNoteText('')
    setFeedback('Observacao adicionada.')
    await queryClient.invalidateQueries({ queryKey: tenantQueryKey(activeTenant, 'crm-lead-detail', selectedLeadId) })
  }

  const onConvertLead = async (leadId: string) => {
    const result = await convertLeadToClient(leadId)
    if (result.error) return setFeedback(result.error)
    setFeedback('Lead convertido em cliente com sucesso.')
    await queryClient.invalidateQueries({ queryKey: tenantQueryKey(activeTenant, 'crm-leads') })
    await queryClient.invalidateQueries({ queryKey: tenantQueryKey(activeTenant, 'crm-clients') })
  }

  const onReassignOwner = async () => {
    if (!selectedLeadId || !newOwnerUserId.trim() || !canAssignLeads) return
    const result = await reassignLeadOwner(selectedLeadId, newOwnerUserId.trim())
    if (result.error) {
      setFeedback(result.error)
      return
    }
    setFeedback('Owner reatribuido com sucesso.')
    setNewOwnerUserId('')
    await queryClient.invalidateQueries({ queryKey: tenantQueryKey(activeTenant, 'crm-leads') })
    await queryClient.invalidateQueries({ queryKey: tenantQueryKey(activeTenant, 'crm-lead-detail', selectedLeadId) })
  }

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
             <Button size="sm" className="gap-2" disabled={!canCreateLeads} onClick={() => void onCreateLead()}>
               <Plus className="h-4 w-4" />
               Novo Lead
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
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" onSelect={() => setStageFilter('all')}>Todos stages</SelectItem>
                <SelectItem value="novo" onSelect={() => setStageFilter('novo')}>novo</SelectItem>
                <SelectItem value="em_contato" onSelect={() => setStageFilter('em_contato')}>em_contato</SelectItem>
                <SelectItem value="qualificado" onSelect={() => setStageFilter('qualificado')}>qualificado</SelectItem>
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

      <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-3">
        <Input placeholder="Nome do lead" value={newLeadName} onChange={(e) => setNewLeadName(e.target.value)} />
        <Input placeholder="Email do lead" value={newLeadEmail} onChange={(e) => setNewLeadEmail(e.target.value)} />
        <Button onClick={() => void onCreateLead()} disabled={!canCreateLeads || isCreating || !newLeadName.trim()}>
          {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar lead'}
        </Button>
      </div>

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {viewMode === 'kanban' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
            {leadsQuery.isLoading ? <p className="text-sm text-muted-foreground">Carregando leads...</p> : null}
            {leads.map((lead) => (
              <div key={lead.id} className="rounded-lg border p-3">
                <p className="font-medium">{lead.full_name}</p>
                <p className="text-xs text-muted-foreground">{lead.email ?? 'sem email'} | {lead.phone ?? 'sem telefone'}</p>
                <div className="mt-2 flex gap-2"><Badge variant="outline">stage: {lead.stage}</Badge><Badge variant="secondary">owner: {lead.owner_user_id.slice(0, 8)}</Badge></div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedLeadId(lead.id)}>Ficha</Button>
                  <Button size="sm" variant="outline" onClick={() => void onMoveStage(lead.id, 'em_contato')}>Mover para contato</Button>
                  <Button size="sm" variant="outline" onClick={() => void onMoveStage(lead.id, 'qualificado')}>Qualificar</Button>
                  <Button size="sm" variant="outline" onClick={() => void onConvertLead(lead.id)}>Converter cliente</Button>
                </div>
              </div>
            ))}
            {!leadsQuery.isLoading && leads.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum lead no seu escopo.</p> : null}
            <div className="rounded-lg border p-3">
              <p className="mb-2 text-sm font-semibold">Clientes convertidos</p>
              {clientsQuery.isLoading ? <p className="text-xs text-muted-foreground">Carregando clientes...</p> : null}
              {(clientsQuery.data ?? []).slice(0, 5).map((client) => (
                <div key={client.id} className="py-1 text-xs">
                  {client.full_name} <span className="text-muted-foreground">({client.stage})</span>
                </div>
              ))}
            </div>
            </div>

            <div className="rounded-lg border p-4">
              {!selectedLeadId ? <p className="text-sm text-muted-foreground">Selecione um lead para abrir a ficha.</p> : null}
              {leadDetailQuery.isLoading ? <p className="text-sm text-muted-foreground">Carregando ficha...</p> : null}
              {leadDetailQuery.data?.lead ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Ficha do lead</h3>
                  <p className="text-sm">{leadDetailQuery.data.lead.full_name}</p>
                  <p className="text-xs text-muted-foreground">{leadDetailQuery.data.lead.email ?? 'sem email'} | {leadDetailQuery.data.lead.phone ?? 'sem telefone'}</p>
                  <Badge variant="outline">Stage atual: {leadDetailQuery.data.lead.stage}</Badge>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Observacoes</p>
                    {leadDetailQuery.data.notes.map((note) => (
                      <div key={note.id} className="rounded border p-2 text-xs">
                        <p>{note.note}</p>
                        <p className="text-muted-foreground">autor: {note.author_user_id.slice(0, 8)} • {new Date(note.created_at).toLocaleString('pt-BR')}</p>
                      </div>
                    ))}
                    <Input placeholder="Nova observacao" value={noteText} onChange={(e) => setNoteText(e.target.value)} />
                    <Button size="sm" onClick={() => void onAddNote()}>Adicionar observacao</Button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Historico</p>
                    {leadDetailQuery.data.history.map((event) => (
                      <div key={event.id} className="rounded border p-2 text-xs">
                        <p>{event.event_type}</p>
                        <p className="text-muted-foreground">{event.from_stage ?? '-'} → {event.to_stage} • {new Date(event.created_at).toLocaleString('pt-BR')}</p>
                      </div>
                    ))}
                  </div>

                  {canAssignLeads ? (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Reatribuir owner</p>
                      <Input placeholder="Novo owner user id" value={newOwnerUserId} onChange={(e) => setNewOwnerUserId(e.target.value)} />
                      <Button size="sm" variant="outline" onClick={() => void onReassignOwner()}>Reatribuir</Button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        )}
        {viewMode === 'list' && (
          <div className="text-center py-12 text-muted-foreground">
            Visualização em lista em desenvolvimento
          </div>
        )}
      </motion.div>
    </div>
  )
}
