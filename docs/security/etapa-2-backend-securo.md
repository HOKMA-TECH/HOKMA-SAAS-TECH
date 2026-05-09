# HOKMA Etapa 2 - Fundacao Segura de Backend

## Escopo implementado

Esta etapa implementa a fundacao backend segura com Supabase/PostgreSQL para multi-tenant, com RLS, RPCs iniciais, storage privado e postura de menor privilegio.

## Arquitetura de seguranca

- Frontend e Tauri tratados como clientes nao-confiaveis.
- Banco/Postgres como fonte de verdade de autorizacao.
- Isolamento por tenant em todos os objetos centrais.
- Isolamento por role com checks e helper functions.
- RLS habilitada em tabelas sensiveis.
- Force RLS aplicado em tabelas centrais.
- Storage privado com acesso por membership ativa.

## Auth e senha

- Senhas nao sao armazenadas em tabelas custom.
- Hash de senha e responsabilidade exclusiva do Supabase Auth.
- Politica de senha forte configurada no `supabase/config.toml`:
  - minimo 12 caracteres
  - letras maiusculas/minusculas
  - digitos
  - simbolos
- Preparacao para MFA/TOTP documentada: ativacao prevista via configuracao do Auth no projeto Supabase (sem segredo no frontend).

## Turnstile e anti-bot

- Frontend preparado com `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
- Segredo Turnstile permanece backend-only (`TURNSTILE_SECRET_KEY`).
- Aplicacao prevista para login, cadastro e recovery no provedor de Auth.
- Mitigacao de abuso depende de:
  - rate limits de Auth/Supabase
  - CAPTCHA no fluxo
  - respostas genericas contra enumeracao

## Modelagem core multi-tenant

Tabelas criadas:

- `public.profiles`
- `public.tenants`
- `public.tenant_memberships`
- `public.platform_admins`
- `public.directorates`
- `public.teams`
- `public.coordinations`
- `public.tenant_admin_events`
- `public.global_admin_events`

Roles de tenant (constraint estrita):

- `corretor`
- `coordenador`
- `gerente`
- `diretor`
- `administrador`

Papel global separado:

- `platform_admins` para `master_admin`

## Constraints e indices

- FKs completas entre tenant e estrutura organizacional.
- `check constraints` para status e roles.
- `unique constraints` para evitar duplicidade de membership e nomes por escopo.
- Indices por `tenant_id`, `user_id`, `role`, `directorate_id`, `team_id`, `coordination_id`.

## Funcoes auxiliares de authz

Funcoes criadas:

- `public.is_platform_master_admin()`
- `public.is_member_of_tenant(p_tenant_id uuid)`
- `public.get_my_tenant_role(p_tenant_id uuid)`
- `public.has_tenant_role(p_tenant_id uuid, p_roles text[])`

Hardening aplicado:

- `security definer`
- `set search_path = public`
- `revoke all from public`
- grants minimos para `authenticated`

## RLS e menor privilegio

RLS habilitada em todas as tabelas sensiveis.

Force RLS aplicada em:

- `tenants`
- `tenant_memberships`
- `platform_admins`

Politicas-chave:

- Profile: usuario so le/atualiza o proprio perfil.
- Tenant: usuario so le tenant com membership ativa (ou platform admin).
- Membership: leitura restrita; escrita sensivel limitada por role autorizada.
- Estrutura organizacional: visibilidade por tenant.
- Eventos de auditoria: leitura restrita por papel.

Revokes/grants:

- `revoke all` para `anon/authenticated` nas tabelas centrais.
- `grant` minimo por necessidade funcional.

## Trigger de profile automatico

- Trigger em `auth.users` criando/sincronizando `public.profiles`.
- Operacao idempotente via `on conflict`.
- Nao depende do frontend.

## RPCs seguras iniciais

Implementadas:

- `rpc_create_tenant(p_slug, p_legal_name)`
- `rpc_list_my_tenants()`
- `rpc_generate_join_code(p_tenant_id)`

## RPCs de onboarding seguro (fechamento da etapa)

Implementadas:

- `rpc_request_tenant_access(p_tenant_id, p_role, p_directorate_id, p_team_id, p_coordination_id)`
- `rpc_review_tenant_access_request(p_membership_id, p_approve, p_message)`
- `rpc_list_tenant_memberships_secure(p_tenant_id)`
- `rpc_list_tenant_structure_secure(p_tenant_id)`

Regras aplicadas:

- fluxo por status (`pending`, `active`, `rejected`, `revoked`)
- validacao estrita de role
- aprovacao/rejeicao apenas por admin/diretor do tenant ou platform admin
- log de eventos administrativos no fluxo de revisao

Padrao aplicado:

- `security definer`
- `search_path` fixo
- validacao de autenticacao/role
- sem confianca no frontend

## Storage privado

- Bucket privado criado: `tenant-private`.
- Sem acesso publico.
- Politicas em `storage.objects`:
  - insert: apenas membro ativo do tenant dono do path
  - select: apenas membro ativo do tenant dono do path
  - delete: somente diretor/administrador do tenant
- Estrategia de path: prefixo por `tenant_id` (`<tenant_id>/...`).

## Segredos e ambiente

Publicos permitidos em client:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Backend-only (nunca client):

- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SECRET_KEY`
- segredos SMTP/email

## Checklist de validacao de seguranca

- Sem chave sensivel no frontend: ok
- Sem service role no Tauri/frontend: ok
- Sem permissao publica no bucket sensivel: ok
- Isolamento entre tenants por RLS/policies: ok
- Role invalida bloqueada por constraint: ok
- Master admin separado do escopo tenant: ok
- Force RLS em tabelas centrais: ok
- Base pronta para MFA/CAPTCHA: ok

## Evidencias de validacao SQL

Checklist executavel salvo em:

- `docs/security/etapa-2-security-validation-checklist.sql`

Esse arquivo cobre verificacoes de:

- RLS e FORCE RLS
- constraints de role/status
- bucket privado e policies de storage
- grants minimos para `anon/authenticated`
- presenca e modo das RPCs de onboarding seguro

## Proximos passos recomendados

1. Aplicar migrations no projeto cloud via `supabase db push`.
2. Configurar CAPTCHA no dashboard Auth com segredo Turnstile.
3. Habilitar MFA/TOTP por politica progressiva (opt-in inicial).
4. Adicionar RPCs para solicitacao/aprovacao/rejeicao de acesso.
5. Integrar auditoria em toda acao administrativa sensivel.

## Status final da Etapa 2

Com a implementacao do schema core, RLS, hardening de auth, storage privado, RPCs de onboarding seguro e checklist probatorio, a fundacao segura de backend da Etapa 2 esta concluida.
