import { supabase } from '@/lib/supabase/client'
import type { CrmHistoryEvent, CrmLead, CrmNote, CrmStage } from '@/features/crm/types'

export async function listCrmLeads(tenantId: string, filters?: { search?: string; stage?: string; ownerUserId?: string; status?: string; source?: string }): Promise<{ data: CrmLead[]; error: string | null }> {
  const { data, error } = await supabase.rpc('rpc_crm_list_leads', { p_tenant_id: tenantId, p_search: filters?.search ?? null, p_stage: filters?.stage ?? null, p_owner_user_id: filters?.ownerUserId ?? null, p_status: filters?.status ?? null, p_source: filters?.source ?? null })
  if (error) return { data: [], error: 'Nao foi possivel listar leads do CRM.' }
  return { data: (data ?? []) as CrmLead[], error: null }
}

export async function listCrmClients(tenantId: string, filters?: { search?: string; stage?: string; ownerUserId?: string; status?: string; source?: string }): Promise<{ data: CrmLead[]; error: string | null }> {
  const { data, error } = await supabase.rpc('rpc_crm_list_clients', { p_tenant_id: tenantId, p_search: filters?.search ?? null, p_stage: filters?.stage ?? null, p_owner_user_id: filters?.ownerUserId ?? null, p_status: filters?.status ?? null, p_source: filters?.source ?? null })
  if (error) return { data: [], error: 'Nao foi possivel listar clientes do CRM.' }
  return { data: (data ?? []) as CrmLead[], error: null }
}

export async function createCrmLead(input: { tenantId: string; fullName: string; email?: string; phone?: string; source?: string; ownerUserId: string; directorateId?: string | null; teamId?: string | null; coordinationId?: string | null }) {
  const { error } = await supabase.rpc('rpc_crm_create_lead', {
    p_tenant_id: input.tenantId,
    p_full_name: input.fullName,
    p_email: input.email ?? null,
    p_phone: input.phone ?? null,
    p_document_number: null,
    p_source: input.source ?? null,
    p_owner_user_id: input.ownerUserId,
    p_directorate_id: input.directorateId ?? null,
    p_team_id: input.teamId ?? null,
    p_coordination_id: input.coordinationId ?? null,
  })
  return { error: error ? 'Nao foi possivel criar lead.' : null }
}

export async function getCrmLeadDetail(leadId: string): Promise<{ data: { lead: CrmLead; notes: CrmNote[]; history: CrmHistoryEvent[] } | null; error: string | null }> {
  const { data, error } = await supabase.rpc('rpc_crm_get_lead_detail', { p_lead_id: leadId })
  if (error) return { data: null, error: 'Nao foi possivel carregar a ficha do lead.' }
  return { data: data as { lead: CrmLead; notes: CrmNote[]; history: CrmHistoryEvent[] }, error: null }
}

export async function addCrmNote(input: { leadId?: string; clientId?: string; note: string }): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('rpc_crm_add_note', {
    p_lead_id: input.leadId ?? null,
    p_client_id: input.clientId ?? null,
    p_note: input.note,
  })
  return { error: error ? 'Nao foi possivel adicionar observacao.' : null }
}

export async function moveCrmStage(input: { leadId?: string; clientId?: string; toStage: CrmStage }): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('rpc_crm_move_stage', {
    p_lead_id: input.leadId ?? null,
    p_client_id: input.clientId ?? null,
    p_to_stage: input.toStage,
  })
  return { error: error ? 'Nao foi possivel alterar stage.' : null }
}

export async function reassignLeadOwner(leadId: string, newOwnerUserId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('rpc_crm_reassign_lead_owner', { p_lead_id: leadId, p_new_owner_user_id: newOwnerUserId })
  return { error: error ? 'Nao foi possivel reatribuir owner.' : null }
}

export async function convertLeadToClient(leadId: string): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('rpc_crm_convert_lead_to_client', { p_lead_id: leadId })
  return { error: error ? 'Nao foi possivel converter lead em cliente.' : null }
}
