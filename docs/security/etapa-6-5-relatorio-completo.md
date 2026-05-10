# Etapa 6.5 - Hardening Completo do CRM Core

## Resumo

Esta etapa endurece o CRM Core antes da expansao para modulos mais sensiveis. O foco foi reforcar autorizacao, escopo organizacional, dados sensiveis, rastreabilidade e regras de pipeline.

## Hardening aplicado

### 1) Regras de pipeline robustas
- `lost_reason` adicionado em `crm_leads` e `crm_clients`.
- `rpc_crm_move_stage` agora exige motivo quando `to_stage = 'perdido'`.
- motivo e gravado no registro e refletido no historico.

### 2) Conversao segura
- `rpc_crm_convert_lead_to_client` bloqueia conversao duplicada.
- tentativa duplicada gera `access_denied` auditavel.
- frontend adicionou confirmacao explicita antes da conversao.

### 3) Auditoria explicita de negacoes
- Nova tabela `crm_access_audit`.
- Nova funcao `crm_audit_access_denied(...)`.
- Negacoes relevantes registradas com:
  - actor
  - tenant
  - entidade
  - motivo
  - metadados

### 4) Politica de dados sensiveis
- Mascara no backend (nao apenas cosmetica de UI) para listagens sem capability elevada.
- Funcoes de mascara:
  - `mask_email`
  - `mask_phone`
  - `mask_document`
- `rpc_crm_list_leads` aplica mascara por perfil.

### 5) Escopo organizacional e RLS
- `crm_notes` e `crm_stage_history` sairam de policy ampla por membership tenant para policy por escopo fino:
  - `crm_can_manage_lead`
  - `crm_can_manage_client`

### 6) Capabilities refinadas
- Inclusao de capabilities finas:
  - `clients.read/create/update/assign/export/view_sensitive`
  - `leads.view_sensitive`
- Matriz de roles atualizada mantendo compatibilidade com `clientes.*` legado.

## Frontend CRM endurecido

Arquivo principal:
- `src/app/(authenticated)/clientes/page.tsx`

Entregue:
- filtro por stage ligado ao backend;
- conversao com confirmacao;
- acao de marcar perdido com motivo;
- reassign owner mantido por capability;
- ficha de lead com notas/historico e operacoes seguras;
- bloco de clientes convertidos.

## Testes

### SQL
- Baseline de seguranca CRM em `supabase/tests/etapa_6_crm_security.sql`.

### E2E
- Novo teste `tests/e2e/crm-hardening-role-access.spec.ts` cobrindo:
  - redirecionamento de nao autenticado em `/clientes`
  - seguranca de mensagem em `/403`
  - bloqueio de acesso anonimo em `/platform`

> Observacao: E2E por role autenticada (corretor/coordenador/gerente/diretor/admin/master_admin) requer fixture de login por role e seeds de dados por escopo, que ainda nao estavam padronizados no harness atual. Este hardening adiciona a base e os checks de acesso anonimo/guards sem quebrar o pipeline existente.

## Validacao tecnica

- `npm run lint` (1 warning legado de `<img>` em MFA page)
- `npm run build` (sucesso)

## Arquivos criados/alterados

- `supabase/migrations/20260510133000_etapa65_crm_hardening.sql`
- `src/features/auth/capabilities.ts`
- `src/features/auth/auth-guards.tsx`
- `src/features/crm/crm-api.ts`
- `src/app/(authenticated)/clientes/page.tsx`
- `tests/e2e/crm-hardening-role-access.spec.ts`
- `docs/security/etapa-6-5-relatorio-completo.md`

## Pendencias para proxima etapa

1. Ficha de cliente com paridade visual completa em componente dedicado (mesmo nivel da de lead).
2. Substituir definitivamente input livre de owner por seletor elegivel orientado por escopo.
3. Expandir E2E por role com fixtures autenticadas para fluxos completos (create/note/stage/convert/reassign).
4. Expandir testes SQL negativos com cenarios cross-scope concretos com dados de fixture.
