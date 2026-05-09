import type { Session, User } from '@supabase/supabase-js'

export type TenantRole = 'corretor' | 'coordenador' | 'gerente' | 'diretor' | 'administrador' | 'master_admin'
export type MembershipStatus = 'pending' | 'active' | 'rejected' | 'revoked'

export type Membership = {
  id: string
  tenant_id: string
  user_id: string
  role: TenantRole
  status: MembershipStatus
  directorate_id: string | null
  team_id: string | null
  coordination_id: string | null
}

export type Profile = {
  id: string
  display_name: string
  avatar_path: string | null
  status: 'active' | 'inactive' | 'blocked'
}

export type AuthState = {
  user: User | null
  session: Session | null
  profile: Profile | null
  memberships: Membership[]
  activeTenant: string | null
  activeMembership: Membership | null
  isAuthenticated: boolean
  isLoading: boolean
  isMfaRequired: boolean
  needsTenantSelection: boolean
  hasPendingAccessRequest: boolean
  isMfaEnabled: boolean
}
