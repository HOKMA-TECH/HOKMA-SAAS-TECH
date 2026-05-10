# Etapa 6 - Relatorio Completo do CRM Core

## 1) Objetivo da etapa

Construir o primeiro modulo central de negocio do HOKMA (CRM Core) com seguranca forte desde a primeira versao, mantendo os principios ja estabelecidos:

- backend como autoridade final;
- frontend capability-driven, sem ser fonte de verdade;
- segregacao tenant-aware;
- escopo organizacional aplicado (owner/coordenacao/equipe/diretoria/tenant);
- trilha operacional minima auditavel.

---

## 2) Escopo implementado

Entregue nesta etapa:

- modelagem de CRM (leads, clients, notes, stage history);
- stages controlados;
- RLS nas tabelas CRM;
- helpers SQL de escopo;
- RPCs seguras para operacoes criticas;
- capabilities formais de CRM;
- integracao frontend em `/clientes` com fluxo lead-first;
- ficha de lead com notas e historico;
- alteracao de stage;
- conversao lead->cliente;
- reatribuicao de owner;
- listagens tenant-aware com filtros server-side;
- documentacao e baseline de teste SQL de seguranca.

---

## 3) Modelagem do CRM Core

### 3.1 Tabelas criadas

Migration base:
- `supabase/migrations/20260510090000_etapa6_crm_core.sql`

Tabelas:

1. `public.crm_leads`
2. `public.crm_clients`
3. `public.crm_notes`
4. `public.crm_stage_history`

### 3.2 Campos principais aplicados

As entidades principais foram modeladas com os campos de seguranca e operacao necessarios:

- `id`
- `tenant_id`
- `owner_user_id`
- `directorate_id`
- `team_id`
- `coordination_id`
- `created_by_user_id`
- dados do contato (`full_name`, `email`, `phone`, `document_number`)
- `source`
- `stage`
- `status`
- `created_at`
- `updated_at`

`crm_notes` usa alvo exclusivo por item (lead ou client) via constraint.
`crm_stage_history` registra mudancas/eventos operacionais por lead/client.

---

## 4) Stages adotados

Pipeline inicial controlado por check (sem texto livre):

- `novo`
- `em_contato`
- `qualificado`
- `proposta`
- `negociacao`
- `ganho`
- `perdido`

Aplicado em `crm_leads`, `crm_clients` e validacoes de RPC de movimento.

---

## 5) Escopo organizacional aplicado

Helper central criado:
- `public.crm_can_access_scope(p_tenant_id, p_owner_user_id, p_directorate_id, p_team_id, p_coordination_id)`

Regra implementada:

- `administrador` e `diretor`: acesso amplo no tenant;
- `gerente`: escopo de equipe (ou proprio owner);
- `coordenador`: escopo de coordenacao (ou proprio owner);
- `corretor`: proprio owner;
- `master_admin`: sem acesso operacional tenant por acidente (retorna falso nesse helper).

---

## 6) RLS aplicada no CRM

RLS habilitada para:

- `crm_leads`
- `crm_clients`
- `crm_notes`
- `crm_stage_history`

Evolucao de hardening:

- Inicialmente policies garantiram recorte por tenant/escopo para leads e clients.
- Em extensao posterior, policies de `notes` e `stage_history` foram endurecidas para escopo fino com:
  - `crm_can_manage_lead(...)`
  - `crm_can_manage_client(...)`

Migration de extensao:
- `supabase/migrations/20260510103000_etapa6_crm_core_extensions.sql`

---

## 7) Helpers e RPCs seguras criadas

## 7.1 Helpers

- `crm_can_access_scope(...)`
- `crm_can_manage_lead(p_lead_id)`
- `crm_can_manage_client(p_client_id)`
- `crm_log_event(...)`

## 7.2 RPCs de operacao

Criadas/atualizadas:

- `rpc_crm_create_lead(...)`
- `rpc_crm_list_leads(...)` (com filtros server-side)
- `rpc_crm_list_clients(...)` (com filtros server-side)
- `rpc_crm_convert_lead_to_client(p_lead_id)`
- `rpc_crm_add_note(p_lead_id, p_client_id, p_note)`
- `rpc_crm_move_stage(p_lead_id, p_client_id, p_to_stage)`
- `rpc_crm_get_lead_detail(p_lead_id)`
- `rpc_crm_get_client_detail(p_client_id)`
- `rpc_crm_reassign_lead_owner(p_lead_id, p_new_owner_user_id)`

Migration de hardening final:
- `supabase/migrations/20260510114000_etapa6_crm_core_hardening.sql`

---

## 8) Eventos auditaveis operacionais

Eventos registrados em `crm_stage_history` via `crm_log_event`:

- `lead_created`
- `client_created` (estrutura prevista)
- `stage_changed`
- `lead_converted`
- `owner_changed`
- `note_added`
- `access_denied` (estrutura prevista no enum de evento)

Observacao: parte dos eventos de negacao foi preparada no modelo e pode ser ampliada com logging explicito adicional em todos os ramos de erro de RPC.

---

## 9) Capabilities do CRM

Arquivo atualizado:
- `src/features/auth/capabilities.ts`

Novas capabilities:

- Leads:
  - `leads.read`
  - `leads.create`
  - `leads.update`
  - `leads.assign`
  - `leads.convert`

- CRM:
  - `crm.notes.create`
  - `crm.notes.read`
  - `crm.stage.move`

Mapeamento de roles foi atualizado para incluir as novas capabilities conforme escopo operacional esperado.

---

## 10) Frontend CRM entregue

Arquivos criados:

- `src/features/crm/types.ts`
- `src/features/crm/crm-api.ts`

Arquivo principal evoluido:

- `src/app/(authenticated)/clientes/page.tsx`

Funcionalidades entregues:

- listagem de leads tenant-aware por RPC;
- busca por nome/email/telefone;
- filtro por stage integrado ao backend;
- criacao de lead (lead-first);
- ficha de lead com dados principais;
- listagem e criacao de observacoes;
- historico basico de eventos/stage;
- acoes de mover stage;
- conversao lead->cliente;
- reatribuicao de owner (UI inicial por user_id);
- bloco de clientes convertidos.

---

## 11) Tenant-aware cache e consumo

Foi mantido padrao tenant-aware com `tenantQueryKey(...)` no consumo React Query do CRM.

Resultados:

- queries segregadas por tenant;
- invalidações apos mutacoes criticas (create/move/note/convert/reassign);
- sem reaproveitamento visual indevido entre tenants no fluxo CRM.

---

## 12) Testes e validacoes executadas

## 12.1 Frontend/build

Comandos executados:

- `npm run lint`
- `npm run build`

Status final:

- build: **ok**
- lint: **ok sem erro**, com 1 warning legado (`src/app/auth/mfa/page.tsx` com `<img>`)

## 12.2 SQL baseline

Arquivo de teste adicionado:

- `supabase/tests/etapa_6_crm_security.sql`

Cobertura atual:

- existencia de tabela CRM;
- existencia de policy RLS;
- existencia de RPCs criticas.

---

## 13) Problemas encontrados e correcoes

1. **Quebra de tipagem no guard apos incluir novas capabilities**
   - causa: mapa `Record<Capability, boolean>` incompleto
   - acao: inclusao explicita de `leads.*` e `crm.*` no map

2. **Erro de sintaxe em `clientes/page.tsx` durante evolucao de filtros**
   - causa: duplicacao de bloco `enabled` no `useQuery`
   - acao: correcao do objeto de configuracao

3. **Necessidade de hardening adicional em RLS de notes/history**
   - causa: policy inicial ampla por membership tenant
   - acao: troca para policies com escopo fino (`crm_can_manage_*`)

---

## 14) Arquivos criados/alterados (Etapa 6)

### Migrations / testes SQL
- `supabase/migrations/20260510090000_etapa6_crm_core.sql`
- `supabase/migrations/20260510103000_etapa6_crm_core_extensions.sql`
- `supabase/migrations/20260510114000_etapa6_crm_core_hardening.sql`
- `supabase/tests/etapa_6_crm_security.sql`

### Frontend/TypeScript
- `src/features/crm/types.ts`
- `src/features/crm/crm-api.ts`
- `src/app/(authenticated)/clientes/page.tsx`
- `src/features/auth/capabilities.ts`
- `src/features/auth/auth-guards.tsx`

### Documentacao
- `docs/security/etapa-6-crm-core-relatorio.md`
- `docs/security/etapa-6-relatorio-completo.md` (este documento)

---

## 15) O que fica para a proxima etapa

Para evoluir para um CRM mais completo sem comprometer seguranca:

1. UI dedicada de ficha de cliente usando `rpc_crm_get_client_detail` (paridade total com lead detail).
2. Fluxo de reatribuicao de owner com seletor seguro por membros elegiveis (evitar input manual de id).
3. Expansao do teste SQL para cenarios negativos reais (cross-tenant, cross-scope, role insufficiency).
4. Polimento UX premium adicional (skeletons mais ricos, filtros compostos, drawer/modal dedicado).
5. Integracao de historico/notas em componentes reutilizaveis para crescimento futuro.

---

## 16) Conclusao

A Etapa 6 foi implementada com foco em CRM Core seguro e funcional, alinhada aos principios multi-tenant e de ciberseguranca do HOKMA.

O sistema agora possui:

- nucleo de dados CRM separado e controlado;
- operacoes criticas via RPC com validacao de escopo;
- camada visual capability-driven;
- trilha operacional inicial auditavel;
- base pronta para evolucao de documentos, agenda, tarefas e relatorios sem quebrar os fundamentos de seguranca.
