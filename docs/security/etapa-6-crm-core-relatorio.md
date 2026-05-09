# Etapa 6 - CRM Core (Primeira Entrega)

## O que foi entregue nesta rodada

Esta entrega inicia o CRM Core com base segura multi-tenant e foco em lead-first.

### Backend / Supabase

Migration criada:
- `supabase/migrations/20260510090000_etapa6_crm_core.sql`

Inclui:
- Tabelas:
  - `crm_leads`
  - `crm_clients`
  - `crm_notes`
  - `crm_stage_history`
- Stage controlado por check:
  - `novo`, `em_contato`, `qualificado`, `proposta`, `negociacao`, `ganho`, `perdido`
- Helper de escopo:
  - `crm_can_access_scope(...)`
- Logging operacional:
  - `crm_log_event(...)`
- RPCs iniciais seguras:
  - `rpc_crm_create_lead(...)`
  - `rpc_crm_list_leads(...)`
  - `rpc_crm_convert_lead_to_client(...)`
- RLS habilitado para tabelas CRM com politica tenant/scope-aware.

### Capabilities CRM

Arquivo alterado:
- `src/features/auth/capabilities.ts`

Adicionado:
- Leads:
  - `leads.read`, `leads.create`, `leads.update`, `leads.assign`, `leads.convert`
- CRM:
  - `crm.notes.create`, `crm.notes.read`, `crm.stage.move`

Mapeamento role -> capabilities atualizado para incluir escopo CRM em corretor/coordenador/gerente/diretor/administrador.

### Frontend CRM (base operacional)

Arquivos criados:
- `src/features/crm/types.ts`
- `src/features/crm/crm-api.ts`

Arquivo evoluido:
- `src/app/(authenticated)/clientes/page.tsx`

Evolucoes:
- Listagem tenant-aware de leads via `rpc_crm_list_leads`.
- Busca por nome/email/telefone.
- Criacao de lead (lead-first) capability-driven.
- Feedback de loading/erro/sucesso.
- Query keys tenant-aware via `tenantQueryKey(...)`.

### Extensao entregue (hardening e operacao)

- Reatribuicao de owner de lead por RPC segura (`rpc_crm_reassign_lead_owner`).
- Listagem de clientes convertidos via `rpc_crm_list_clients`.
- Filtros server-side preparados nas RPCs de listagem (`search/stage/owner/status/source`).
- RLS de notas/historico endurecida por escopo real (`crm_can_manage_lead/client`).
- Teste SQL baseline de seguranca CRM adicionado:
  - `supabase/tests/etapa_6_crm_security.sql`

### Guards/capability map

Arquivo alterado:
- `src/features/auth/auth-guards.tsx`

Atualizado para contemplar as novas capabilities de leads e CRM no mapa de permissao.

## Seguranca aplicada

- Backend continua autoridade final (RLS + RPC + validacoes de escopo).
- Tenant e escopo organizacional validados no helper `crm_can_access_scope`.
- Master admin nao ganha acesso operacional tenant por acidente (helper retorna false para contexto platform).
- Frontend apenas reflete capability; nao substitui controle de backend.

## Validacao executada

- `npm run lint` (sem erro; 1 warning legado em MFA page)
- `npm run build` (sucesso)

## O que ainda fica para proxima iteracao da Etapa 6

- Ficha detalhada de cliente com drawer/modal completo.
- Notas e historico visiveis em UI dedicada.
- Fluxo de mover stage em UI com historico em tempo real.
- Reatribuicao de owner via RPC dedicada.
- RPC de listagem detalhada de cliente (`rpc_crm_get_client_detail`) e filtros server-side mais completos.
- Polices RLS mais granulares para notas/historico por escopo fino (owner/coord/team/dir) em vez de apenas membership tenant.

## Observacao importante

Para producao, e necessario aplicar a migration no ambiente Supabase antes de usar o frontend novo. Sem isso, as RPCs de CRM nao existirao no schema cache.
