# HOKMA Etapa 4 - Onda 1 (Authorization UI + Guards + Cache)

## Entregas da Onda 1

- Consolidacao da Authorization UI Layer com suporte a capability unica e multipla.
- Suporte a contexto de autorizacao `tenant` e `platform` no `useCan` e `<Can />`.
- Politica central de capacidades por rota para evitar divergencia entre menu e guard.
- Protecao de rotas base com fallback padrao para `/403`.
- Refino da pagina `/403` com UX consistente e acoes seguras.
- Reforco da invalidacao/limpeza de cache tenant-aware em troca de tenant e perda de membership.

## Como a capability matrix e usada na UI

- A role ativa continua sendo mapeada para capabilities formais em `src/features/auth/capabilities.ts`.
- A camada visual usa `useCan(capability | capability[], { mode, context })` para renderizacao de menus, links, cards e controles.
- `context: 'platform'` exige contexto de plataforma (master_admin) e nao herda tenant.
- `context: 'tenant'` bloqueia acesso de contexto plataforma puro sem tenant operacional ativo.

## Guards e rotas protegidas

- As regras de capacidade por rota foram centralizadas em `src/features/auth/route-capabilities.ts`.
- Rotas da Onda 1 protegidas por contexto/capability:
  - `/dashboard`
  - `/clientes`
  - `/agenda`
  - `/tarefas`
  - `/chat`
  - `/empreendimentos`
  - `/relatorios`
  - `/admin`
  - `/configuracoes`
  - `/platform`
- Tentativa de acesso direto sem permissao resulta em redirecionamento para `/403`.

## Contexto tenant vs platform

- Tenant e platform foram separados explicitamente por regra de contexto.
- Menu de platform so aparece para capability `platform.tenants.manage` em contexto platform.
- Pagine tenant continuam exigindo contexto tenant e capabilities correspondentes.

## Cache por tenant

- Chaves de consulta tenant-aware continuam no padrao `['tenant', tenantId, ...]`.
- Em troca de tenant, queries do tenant anterior sao removidas e chaves tenant sao invalidadas.
- Em perda de membership ativa, queries do tenant afetado sao removidas e invalidadas.
- Em troca de usuario/autenticacao, cache completo do query client e limpo.

## 403 e integracao com fluxo de auth

- Pagina `/403` foi ajustada para UX premium e linguagem segura.
- Inclui CTA para voltar e CTA para painel apropriado por contexto (`/dashboard` ou `/platform`).
- Sem exposicao de detalhes tecnicos de policy/infra.

## O que fica para a Onda 2

- Dashboards operacionais por role com componentes reutilizaveis.
- Variacao rica de conteudo por capability/role mantendo base visual comum.

## O que fica para a Onda 3

- Admin minimo do tenant (gestao de usuarios, aprovacoes, troca de role, suspensao e configuracoes basicas).
