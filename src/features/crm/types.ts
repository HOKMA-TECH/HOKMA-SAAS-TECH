export type CrmStage = 'novo' | 'em_contato' | 'qualificado' | 'proposta' | 'negociacao' | 'ganho' | 'perdido'

export type CrmLead = {
  id: string
  tenant_id: string
  owner_user_id: string
  full_name: string
  email: string | null
  phone: string | null
  source: string | null
  stage: CrmStage
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
}

export type CrmNote = {
  id: string
  note: string
  author_user_id: string
  created_at: string
}

export type CrmHistoryEvent = {
  id: string
  event_type: string
  from_stage: CrmStage | null
  to_stage: CrmStage
  changed_by_user_id: string
  created_at: string
}
