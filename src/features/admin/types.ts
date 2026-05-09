export type AdminMembershipRow = {
  id: string
  tenant_id: string
  user_id: string
  role: 'corretor' | 'coordenador' | 'gerente' | 'diretor' | 'administrador' | 'master_admin'
  status: 'pending' | 'active' | 'rejected' | 'revoked'
  requested_by: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}

export type MembershipStatusFilter = 'all' | 'pending' | 'active' | 'rejected' | 'revoked'
