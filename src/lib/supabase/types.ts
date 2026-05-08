export type TenantRole = 'corretor' | 'coordenador' | 'gerente' | 'diretor' | 'administrador'
export type MembershipStatus = 'pending' | 'active' | 'rejected' | 'revoked'

export type TenantMembership = {
  id: string
  tenant_id: string
  user_id: string
  role: TenantRole
  status: MembershipStatus
  directorate_id: string | null
  team_id: string | null
  coordination_id: string | null
  created_at: string
  updated_at: string
}
