import { supabase } from '@/lib/supabase/client'
import type { AdminMembershipRow } from '@/features/admin/types'

type ReviewResult = { error: string | null }

export async function listTenantMemberships(tenantId: string): Promise<{ data: AdminMembershipRow[]; error: string | null }> {
  const { data, error } = await supabase.rpc('rpc_list_tenant_memberships_secure', { p_tenant_id: tenantId })
  if (error) return { data: [], error: 'Nao foi possivel listar membros do tenant.' }
  return { data: (data ?? []) as AdminMembershipRow[], error: null }
}

export async function reviewMembership(membershipId: string, approve: boolean, message?: string): Promise<ReviewResult> {
  const { error } = await supabase.rpc('rpc_review_tenant_membership', {
    p_membership_id: membershipId,
    p_approve: approve,
    p_message: message ?? null,
  })
  return { error: error ? 'Falha ao revisar solicitacao de acesso.' : null }
}

export async function updateMembershipRole(membershipId: string, role: AdminMembershipRow['role']): Promise<ReviewResult> {
  const { error } = await supabase.from('tenant_memberships').update({ role }).eq('id', membershipId)
  return { error: error ? 'Nao foi possivel alterar a role do membro.' : null }
}

export async function updateMembershipStatus(membershipId: string, status: Extract<AdminMembershipRow['status'], 'active' | 'revoked'>): Promise<ReviewResult> {
  const { error } = await supabase.from('tenant_memberships').update({ status }).eq('id', membershipId)
  return { error: error ? 'Nao foi possivel atualizar o status do membro.' : null }
}

export async function generateTenantJoinCode(tenantId: string): Promise<{ code: string | null; error: string | null }> {
  const { data, error } = await supabase.rpc('rpc_generate_join_code', { p_tenant_id: tenantId })
  if (error) return { code: null, error: 'Nao foi possivel gerar join code.' }
  return { code: typeof data === 'string' ? data : null, error: null }
}
