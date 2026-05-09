# HOKMA - Relatorio Completo da Etapa 2 (Fundacao Segura de Backend)

## 1. Objetivo desta etapa

A Etapa 2 teve como objetivo construir a fundacao segura do backend do HOKMA para suportar crescimento de modulos sensiveis (CRM, agenda, tarefas, chat, relatorios, auditoria), com foco em:

- Supabase + PostgreSQL como fonte de verdade.
- Multi-tenant com isolamento estrito por tenant e role.
- Auth segura com hardening inicial.
- Storage privado por tenant.
- RLS e politica de menor privilegio por padrao.
- RPCs seguras para operacoes sensiveis.
- Preparacao anti-bot com Cloudflare Turnstile.
- Auditoria inicial de eventos administrativos.

Esta etapa NAO teve como foco implementar modulos de negocio completos (CRM funcional, agenda funcional, tarefas funcionais, chat funcional).

---

## 2. Estado atual de publicacao e infraestrutura

### 2.1 GitHub

O projeto esta publicado no GitHub no repositorio:

- `https://github.com/HOKMA-TECH/HOKMA-SAAS-TECH`

Foi realizado:

- Push inicial do projeto.
- Fluxo de branch protection na `main`.
- CI obrigatorio para merge.
- Secret scanning obrigatorio para merge.
- Templates e governanca de contribuicao.

### 2.2 Vercel

O projeto esta publicado na Vercel.

Variaveis publicas de frontend configuradas:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Observacao de seguranca:

- Nao foi colocado `service_role` nem nenhum segredo administrativo no frontend da Vercel.

### 2.3 Supabase

Ja existe projeto Supabase ativo e conectado.

Foi realizado:

- `supabase link --project-ref dfhucvlhmhodjrwehcbg`
- `supabase db push` com migrations aplicadas.

Banco de dados ja provisionado e migrations de seguranca aplicadas com sucesso.

---

## 3. Estrutura criada no repositorio para backend seguro

Diretorios/arquivos principais adicionados para Etapa 2:

- `supabase/config.toml`
- `supabase/migrations/20260507214000_etapa2_secure_foundation.sql`
- `supabase/migrations/20260507214500_storage_private.sql`
- `supabase/migrations/20260507230000_onboarding_rpcs_and_security_checks.sql`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/types.ts`
- `docs/security/etapa-2-backend-securo.md`
- `docs/security/etapa-2-security-validation-checklist.sql`

---

## 4. Modelagem de dados core multi-tenant implementada

Tabelas criadas no schema `public`:

- `profiles`
- `tenants`
- `tenant_memberships`
- `platform_admins`
- `directorates`
- `teams`
- `coordinations`
- `tenant_admin_events`
- `global_admin_events`

### 4.1 Principios de modelagem aplicados

- Integridade referencial forte com FKs.
- Status controlado por `CHECK`.
- Roles controlados por `CHECK`.
- Relacao organizacional sempre vinculada a `tenant_id`.
- `created_at`/`updated_at` padronizados.
- Indices para consultas sensiveis e por escopo.

### 4.2 Roles de tenant com restricao estrita

Roles permitidos em `tenant_memberships`:

- `corretor`
- `coordenador`
- `gerente`
- `diretor`
- `administrador`

Nao existe campo de role livre.

### 4.3 Separacao de papel global

`master_admin` foi separado do escopo tenant via tabela:

- `platform_admins`

Essa separacao evita misturar privilegios globais com privilegios internos de tenant.

---

## 5. Constraints, indices e integridade

### 5.1 Constraints verificadas

Foi confirmado por consulta SQL:

- `tenant_memberships_role_check`
- `tenant_memberships_status_check`

### 5.2 FORCE RLS nas tabelas centrais

Confirmado em producao:

- `tenants` -> `relforcerowsecurity = true`
- `tenant_memberships` -> `relforcerowsecurity = true`
- `platform_admins` -> `relforcerowsecurity = true`

---

## 6. AuthZ helpers SQL seguras

Funcoes auxiliares implementadas:

- `public.is_platform_master_admin()`
- `public.is_member_of_tenant(p_tenant_id uuid)`
- `public.get_my_tenant_role(p_tenant_id uuid)`
- `public.has_tenant_role(p_tenant_id uuid, p_roles text[])`

Hardening aplicado nas funcoes:

- `security definer`
- `set search_path = public`
- `revoke all from public`
- `grant execute` minimo para `authenticated`

---

## 7. RLS e politica de menor privilegio

RLS habilitada e confirmada nas tabelas sensiveis:

- `profiles`
- `tenants`
- `tenant_memberships`
- `platform_admins`
- `directorates`
- `teams`
- `coordinations`
- `tenant_admin_events`
- `global_admin_events`

Politicas aplicadas para restringir:

- Leitura/atualizacao de profile ao proprio usuario.
- Visibilidade de tenant apenas para membro ativo ou platform admin.
- Leitura de memberships por escopo permitido.
- Atualizacao sensivel de membership por papeis autorizados.
- Estrutura organizacional por escopo de tenant.
- Eventos administrativos por papel adequado.

`revoke all` aplicado para `anon` e `authenticated` nas tabelas sensiveis e `grant` devolvido de forma minima e explicita.

---

## 8. Trigger de profile automatico

Implementado trigger em `auth.users`:

- Trigger identificado: `on_auth_user_created`
- Funcao: cria/sincroniza registro em `public.profiles`
- Comportamento idempotente via `on conflict`

Resultado:

- O frontend nao precisa criar profile manualmente.
- Evita inconsistencia de provisionamento de usuario.

---

## 9. RPCs seguras implementadas

### 9.1 RPCs iniciais

- `rpc_create_tenant(p_slug, p_legal_name)`
- `rpc_list_my_tenants()`
- `rpc_generate_join_code(p_tenant_id)`

### 9.2 RPCs de onboarding seguro (fechamento da etapa)

- `rpc_request_tenant_access(p_tenant_id, p_role, p_directorate_id, p_team_id, p_coordination_id)`
- `rpc_review_tenant_access_request(p_membership_id, p_approve, p_message)`
- `rpc_list_tenant_memberships_secure(p_tenant_id)`
- `rpc_list_tenant_structure_secure(p_tenant_id)`

Garantias de seguranca nessas RPCs:

- Validacao de autenticacao (`auth.uid()` nao nulo).
- Validacao de role contra conjunto permitido.
- Validacao de permissao por tenant/role no backend.
- Sem confianca em dados de autorizacao vindos do frontend.
- Registro de eventos administrativos de aprovacao/rejeicao.
- `security_type = DEFINER` confirmado por query.

---

## 10. Storage privado por tenant

### 10.1 Bucket privado

Bucket configurado:

- `tenant-private`
- `public = false` (confirmado por query)

### 10.2 Politicas em `storage.objects`

Policies ativas:

- `storage_objects_insert_tenant_member`
- `storage_objects_select_tenant_member`
- `storage_objects_delete_tenant_admin`

Regras:

- Insert/select apenas para membro ativo do tenant do path.
- Delete apenas para `administrador`/`diretor` do tenant.
- Estrategia de path com prefixo de `tenant_id`.

Nao foi usado bucket publico e nao foi adotado acesso irrestrito.

---

## 11. Autenticacao: hardening aplicado

### 11.1 Senha

Politica de senha forte preparada no `supabase/config.toml`:

- minimo 12 caracteres
- complexidade (maiusculas, minusculas, digitos, simbolos)

### 11.2 Hash de senha

Senha continua sob responsabilidade do Supabase Auth.

- Nao foi criada tabela custom para senha.
- Nao foi duplicado hash em schema de negocio.

### 11.3 MFA

Configuracao operacional confirmada no painel:

- TOTP habilitado
- Enhanced MFA Security habilitado (AAL1 limiting)

### 11.4 CAPTCHA / anti-bot

Configuracao operacional confirmada no painel:

- Turnstile habilitado em Attack Protection
- Captcha secret armazenado no provedor/Auth, nao no frontend
- Site key publica no frontend via `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

### 11.5 Mitigacao de brute force/abuso

Rate limits configurados no Supabase Auth (prints e validacao visual):

- sign-up/sign-in limit
- token verification limit
- token refresh limit
- limites adicionais de trafego de auth

Sessoes:

- revogacao de refresh token comprometido habilitada
- intervalo de reuse configurado

---

## 12. Segredos e variaveis de ambiente

### 12.1 Variaveis publicas permitidas no frontend

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

### 12.2 Segredos proibidos no frontend/Tauri

- `SUPABASE_SERVICE_ROLE_KEY`
- `TURNSTILE_SECRET_KEY`
- `DATABASE_URL`
- segredos de SMTP/email
- qualquer chave administrativa

### 12.3 Evidencia

Foi revisada higiene do repositorio e nao houve vazamento de segredo real commitado.

---

## 13. Seguranca de repositorio (GitHub)

Implementacoes realizadas:

- Workflows:
  - `.github/workflows/ci.yml`
  - `.github/workflows/secret-scan.yml`
- Governanca:
  - `.github/CODEOWNERS`
  - `.github/pull_request_template.md`
  - `.github/dependabot.yml`
  - `SECURITY.md`

Branch protection em `main` confirmada via API/CLI:

- PR obrigatorio para merge
- 1 aprovacao obrigatoria
- code owner review obrigatoria
- stale review dismissal habilitado
- checks obrigatorios:
  - `lint-and-build`
  - `gitleaks`
- conversation resolution obrigatoria
- bypass de admin bloqueado
- force push desabilitado
- deletion desabilitada

Secret scanning e push protection habilitados no GitHub.

---

## 14. Validacoes tecnicas executadas

### 14.1 Frontend

- `pnpm lint` -> aprovado
- `pnpm build` -> aprovado

### 14.2 Banco / seguranca

Checklist executado com evidencias fornecidas:

- RLS `true` em todas as tabelas sensiveis
- FORCE RLS `true` nas tabelas centrais
- constraints de role/status ativas
- bucket privado confirmado
- policies de storage presentes
- grants minimos confirmados
- RPCs de onboarding com `DEFINER`
- trigger de profile ativo

---

## 15. Riscos residuais e proximos cuidados

Mesmo com a fundacao concluida, seguem cuidados continuos:

1. Reforcar continuamente rate limits conforme padrao de trafego real.
2. Ativar protecao contra leaked passwords quando provider de email estiver completo (se ainda nao finalizado no ambiente).
3. Criar testes automatizados de regressao de RLS/RPC/policies para CI de banco.
4. Expandir auditoria para eventos de leitura sensivel e fluxo de signed URL.
5. Manter revisao obrigatoria de CODEOWNERS para mudancas em `supabase/`, `src-tauri/` e `.github/workflows/`.

---

## 16. Status formal da Etapa 2

Com base nas implementacoes, configuracoes operacionais e evidencias de validacao:

**A Etapa 2 esta concluida tecnica e operacionalmente.**

Escopo entregue:

- Fundacao segura de backend no Supabase/PostgreSQL
- Multi-tenant com isolamento por RLS
- Auth hardening com MFA e CAPTCHA
- Storage privado com policies por tenant/role
- RPCs seguras para onboarding e acesso
- Auditoria inicial
- Governanca de seguranca no GitHub
- Projeto publicado e operando com frontend na Vercel
