# HOKMA Etapa 3.5 - Capability Matrix

## Capability Catalog

- clientes.read, clientes.create, clientes.update, clientes.delete, clientes.assign, clientes.export
- documentos.read, documentos.upload, documentos.delete, documentos.generate_signed_url
- agenda.read, agenda.create, agenda.update, agenda.manage_team
- tarefas.read, tarefas.create, tarefas.assign, tarefas.complete, tarefas.report.read, tarefas.report.export
- relatorios.read, relatorios.export
- usuarios.invite, usuarios.approve, usuarios.suspend, usuarios.change_role
- tenant.settings.manage, tenant.audit.read
- platform.tenants.manage, platform.audit.read

## Critical Capabilities (MFA required)

- clientes.export
- tarefas.report.export
- relatorios.export
- usuarios.approve
- usuarios.change_role
- documentos.generate_signed_url
- documentos.delete

## Role -> Capabilities

- master_admin: platform.tenants.manage, platform.audit.read
- administrador: full tenant capabilities including user governance and sensitive document actions
- diretor: tenant governance + sensitive actions (without platform powers)
- gerente: operational and report capabilities, includes exports
- coordenador: operational team management without export/governance critical actions
- corretor: base read/create operational capabilities

## Platform vs Tenant

- Platform-only capabilities are isolated to master_admin.
- Tenant roles do not inherit platform capabilities.
- Tenant capabilities require active membership in selected tenant context.

## UI Mapping

- Menu rendering must use useCan() for all capability-sensitive links.
- Route guards should redirect to /403 when capability check fails.
- Action components should use <Can capability="..."/> wrapper for visible controls.

## Backend Mapping

- RLS policies remain source of truth for tenant isolation.
- RPC functions enforce role/capability semantics via membership and helper predicates.
- Storage policy relies on tenant membership and private bucket controls.
