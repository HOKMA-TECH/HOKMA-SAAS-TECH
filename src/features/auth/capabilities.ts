export const CAPABILITIES = {
  leads: ['leads.read', 'leads.create', 'leads.update', 'leads.assign', 'leads.convert'],
  clientes: ['clientes.read', 'clientes.create', 'clientes.update', 'clientes.delete', 'clientes.assign', 'clientes.export'],
  crm: ['crm.notes.create', 'crm.notes.read', 'crm.stage.move'],
  documentos: ['documentos.read', 'documentos.upload', 'documentos.delete', 'documentos.generate_signed_url'],
  agenda: ['agenda.read', 'agenda.create', 'agenda.update', 'agenda.manage_team'],
  tarefas: ['tarefas.read', 'tarefas.create', 'tarefas.assign', 'tarefas.complete', 'tarefas.report.read', 'tarefas.report.export'],
  relatorios: ['relatorios.read', 'relatorios.export'],
  usuarios: ['usuarios.invite', 'usuarios.approve', 'usuarios.suspend', 'usuarios.change_role'],
  tenant: ['tenant.settings.manage', 'tenant.audit.read'],
  platform: ['platform.tenants.manage', 'platform.audit.read'],
} as const

export type Capability = (typeof CAPABILITIES)[keyof typeof CAPABILITIES][number]

export const CRITICAL_MFA_CAPABILITIES: ReadonlySet<Capability> = new Set([
  'clientes.export',
  'tarefas.report.export',
  'relatorios.export',
  'usuarios.approve',
  'usuarios.change_role',
  'documentos.generate_signed_url',
  'documentos.delete',
])

type TenantRole = 'corretor' | 'coordenador' | 'gerente' | 'diretor' | 'administrador' | 'master_admin'

const roleCapabilities: Record<TenantRole, Capability[]> = {
  corretor: ['leads.read', 'leads.create', 'crm.notes.create', 'crm.notes.read', 'crm.stage.move', 'clientes.read', 'clientes.create', 'agenda.read', 'tarefas.read', 'tarefas.create', 'documentos.read'],
  coordenador: ['leads.read', 'leads.create', 'leads.update', 'leads.assign', 'leads.convert', 'crm.notes.create', 'crm.notes.read', 'crm.stage.move', 'clientes.read', 'clientes.create', 'clientes.update', 'clientes.assign', 'agenda.read', 'agenda.create', 'agenda.update', 'agenda.manage_team', 'tarefas.read', 'tarefas.create', 'tarefas.assign', 'tarefas.complete', 'documentos.read', 'documentos.upload'],
  gerente: ['leads.read', 'leads.create', 'leads.update', 'leads.assign', 'leads.convert', 'crm.notes.create', 'crm.notes.read', 'crm.stage.move', 'clientes.read', 'clientes.create', 'clientes.update', 'clientes.assign', 'clientes.export', 'agenda.read', 'agenda.create', 'agenda.update', 'agenda.manage_team', 'tarefas.read', 'tarefas.create', 'tarefas.assign', 'tarefas.complete', 'tarefas.report.read', 'tarefas.report.export', 'relatorios.read', 'relatorios.export', 'usuarios.invite', 'documentos.read', 'documentos.upload', 'documentos.generate_signed_url'],
  diretor: ['leads.read', 'leads.create', 'leads.update', 'leads.assign', 'leads.convert', 'crm.notes.create', 'crm.notes.read', 'crm.stage.move', 'clientes.read', 'clientes.create', 'clientes.update', 'clientes.delete', 'clientes.assign', 'clientes.export', 'agenda.read', 'agenda.create', 'agenda.update', 'agenda.manage_team', 'tarefas.read', 'tarefas.create', 'tarefas.assign', 'tarefas.complete', 'tarefas.report.read', 'tarefas.report.export', 'relatorios.read', 'relatorios.export', 'usuarios.invite', 'usuarios.approve', 'usuarios.change_role', 'tenant.settings.manage', 'tenant.audit.read', 'documentos.read', 'documentos.upload', 'documentos.delete', 'documentos.generate_signed_url'],
  administrador: ['leads.read', 'leads.create', 'leads.update', 'leads.assign', 'leads.convert', 'crm.notes.create', 'crm.notes.read', 'crm.stage.move', 'clientes.read', 'clientes.create', 'clientes.update', 'clientes.delete', 'clientes.assign', 'clientes.export', 'agenda.read', 'agenda.create', 'agenda.update', 'agenda.manage_team', 'tarefas.read', 'tarefas.create', 'tarefas.assign', 'tarefas.complete', 'tarefas.report.read', 'tarefas.report.export', 'relatorios.read', 'relatorios.export', 'usuarios.invite', 'usuarios.approve', 'usuarios.suspend', 'usuarios.change_role', 'tenant.settings.manage', 'tenant.audit.read', 'documentos.read', 'documentos.upload', 'documentos.delete', 'documentos.generate_signed_url'],
  master_admin: ['platform.tenants.manage', 'platform.audit.read'],
}

export function getCapabilitiesForRole(role: string | null | undefined): Capability[] {
  if (!role) return []
  return roleCapabilities[role as TenantRole] ?? []
}
