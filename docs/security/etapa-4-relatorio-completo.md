# Etapa 4 - Relatorio Completo de Implementacao, Hardening e Estado Atual

## 1) Escopo real da etapa 4

Este documento consolida **o que foi implementado de fato** na etapa 4, incluindo:

- Governanca de tenant no painel admin (membros, aprovacao, troca de role e status).
- Fluxo de onboarding por join code com regras de seguranca revisadas.
- Persistencia de join code por tenant (sem expiracao automatica) com rotacao manual.
- Hardening do fluxo de captcha (Turnstile) nos pontos de autenticacao.
- Validacoes operacionais executadas (lint/build/audit), resultados e pendencias.

> Objetivo: registrar status tecnico com transparencia total (sucessos, problemas, correcoes e riscos residuais).

---

## 2) Problemas encontrados durante a etapa

### 2.1 Erro de RPC de rotacao no ambiente

**Sintoma**
- Mensagem no frontend: `Could not find the function public.rpc_rotate_join_code(p_tenant_id) in the schema cache`.

**Causa raiz**
- Frontend já chamava `rpc_rotate_join_code`, mas o ambiente alvo ainda nao tinha a funcao no cache/esquema (migracao nao aplicada ou cache nao recarregado).

**Correcao aplicada**
- Confirmada existencia da migration de rotacao persistente:
  - `supabase/migrations/20260509170000_join_code_persistent_until_rotation.sql`
- Apos aplicacao no ambiente, funcionalidade de rotacao passou a operar.

### 2.2 Erro no cadastro com join code

**Sintoma**
- Falha no cadastro exibindo `Falha na verificacao anti-bot (timeout-or-duplicate)`.

**Causa raiz**
- Token do Turnstile expirando/reutilizado entre tentativa e submit (nao relacionado ao join code em si).

**Correcao aplicada**
- Hardening do widget para reset/renovacao de token em caminhos de retry e token invalido.

### 2.3 Risco de elevacao de privilegio no join

**Sintoma/risco tecnico**
- Fluxo de `join_tenant` aceitava role enviada no payload e criava membership ativa automaticamente.

**Causa raiz**
- Lado servidor permitia conjunto amplo de roles no cadastro por join code e aprovava direto (`active`).

**Correcao aplicada**
- Role fixa de entrada por join code: **sempre `corretor`**.
- Novo usuario entra como **`pending`**, aguardando aprovacao do admin.
- `approved_by` removido do auto-onboarding (permanece `null` ate aprovacao).

---

## 3) Implementacoes realizadas (detalhadas)

## 3.1 Join code persistente por tenant + rotacao manual

### Banco/RPC

Arquivo:
- `supabase/migrations/20260509170000_join_code_persistent_until_rotation.sql`

Implementado:
- `rpc_generate_join_code(p_tenant_id)` idempotente: retorna codigo ativo existente ou cria novo quando inexistente.
- `rpc_rotate_join_code(p_tenant_id)`: revoga ativo anterior e cria novo ativo.
- `expires_at` com semantica de persistencia (validade por status de ciclo de vida, sem expirar por tempo).
- Logging de eventos de seguranca para criacao/rotacao.

### Frontend/Admin

Arquivos:
- `src/features/admin/tenant-admin-api.ts`
- `src/app/(authenticated)/admin/page.tsx`

Implementado:
- Acao de visualizar/obter join code atual.
- Acao separada de rotacao manual com confirmacao no UI.
- Mensagem explicita de regra operacional: codigo fixo por tenant, sem expiracao automatica.

## 3.2 Ajustes no signup/join_tenant

Arquivo:
- `src/app/api/auth/signup/route.ts`

Implementado:
- Remocao de bloqueio por expiracao temporal no join code (validacao por status ativo).
- Compatibilizacao de hash para lookup (sha256/md5, para convivencia com estados/migracoes anteriores).
- Registro de `used_at`/`used_by` sem invalidar automaticamente codigo ativo.

Hardening de governanca implementado depois:
- role no join forcada para `corretor`.
- membership criada como `pending`.
- `approved_by: null` no onboarding por join code.

Resultado:
- Entrada por join code vira solicitacao controlada e auditavel, com aprovacao administrativa posterior.

## 3.3 Hardening Turnstile (anti timeout-or-duplicate)

Arquivo principal:
- `src/features/auth/turnstile-widget.tsx`

Arquivos consumidores atualizados:
- `src/app/cadastro/page.tsx`
- `src/app/login/page.tsx`
- `src/app/auth/recuperar-senha/page.tsx`

Implementado:
- Nova prop `refreshSignal` no widget.
- Quando `refreshSignal` muda, widget executa `turnstile.reset(...)` e zera token local.
- Nos forms: incrementa sinal quando token faltante/invalido e quando submit falha, forçando token fresco na proxima tentativa.

Resultado:
- Reducao pratica de erros por token expirado/reutilizado em fluxos de retry.

---

## 4) Testes executados e resultados

## 4.1 Verificacoes de qualidade/compilacao

Comandos executados durante a etapa:
- `npm run lint`
- `npm run build`

Status:
- **Build: OK** apos ajustes finais.
- **Lint: OK com 1 warning nao bloqueante**:
  - `src/app/auth/mfa/page.tsx` uso de `<img>` (recomendacao de performance Next/Image).

## 4.2 Auditoria de dependencias

Comando executado:
- `pnpm audit --audit-level moderate`

Historico observado:
- Inicialmente havia vulnerabilidades em cadeia transiente envolvendo `lodash` via `recharts` e `postcss`.
- Foi testada atualizacao de `recharts`, mas causou quebras de tipagem/compatibilidade em componentes de graficos do projeto; revertido para manter estabilidade de build.
- `postcss` direto do projeto foi atualizado.

Status final atual:
- Permanece **1 vulnerabilidade moderada transitiva** (`next > postcss`) apontada pelo audit.
- Dependencia residual nao era eliminada apenas com bump local sem alterar a cadeia do framework.

## 4.3 Testes operacionais funcionais (manual + fluxo)

Validado durante execucao:
- Rotacao de join code funcional no painel admin apos aplicacao correta de migration/schema.
- Cadastro com join code funcionando, com regras de captcha estabilizadas pelos resets.
- Fluxo de aprovacao e gestao de membros disponivel no painel admin.

---

## 5) Commits relevantes da etapa 4 (nesta rodada)

- `bde678b` - persistencia de join code ate rotacao manual.
- `07d9927` - endurecimento do join onboarding (`corretor` + `pending`) e ajustes de dependencia/hardening.
- `4af5dbc` - refresh/reset de token Turnstile em caminhos de retry.

PR de consolidacao:
- `https://github.com/HOKMA-TECH/HOKMA-SAAS-TECH/pull/35`

---

## 6) Estado atual do app (foto tecnica)

### 6.1 O que esta pronto e funcional

- Join code fixo por tenant com rotacao manual administrativa.
- Entrada por join code com onboarding controlado (sem auto-elevacao de role).
- Painel admin com capacidade de aprovar membros e ajustar roles conforme governanca.
- Build de producao passando.

### 6.2 O que ainda requer refinamento

- UX fina de mensagens e feedbacks (algumas mensagens ainda tecnicas em cenarios de erro).
- Resolucao de warning de performance (`<img>` em MFA page).
- Mitigacao definitiva de vulnerabilidade transitiva restante quando cadeia do framework/dependencias permitir upgrade seguro.

---

## 7) Riscos residuais e recomendacoes

## 7.1 Riscos residuais

- Vulnerabilidade moderada transitiva em arvore de dependencias (`next > postcss`) ainda apontada pelo audit.
- Dependencia de disciplina operacional para aplicar migrations antes de liberar frontend que chama novas RPCs.

## 7.2 Recomendacoes praticas imediatas

1. Instituir gate no deploy: frontend que introduz nova RPC so sobe apos migration aplicada e cache recarregado.
2. Criar checklist de release com smoke tests de auth (`/login`, `/cadastro`, `/admin` join code).
3. Monitorar advisories de Next/PostCSS e planejar janela de upgrade para eliminar vulnerabilidade residual.
4. Incluir teste E2E automatizado para caminho `join_tenant` + aprovacao admin + troca de role.

---

## 8) Conclusao executiva

A etapa 4, no escopo operacional de authz/admin/onboarding por join code, esta **funcionalmente consolidada** e com **hardening relevante aplicado**.

Os principais problemas encontrados (RPC ausente no ambiente, erro Turnstile por token stale e risco de role no join) foram identificados por causa raiz e corrigidos com alteracoes concretas de codigo e fluxo.

No momento, o principal ponto em aberto nao e de logica de negocio, e sim de **higiene de cadeia de dependencias** (1 vulnerabilidade moderada transitiva) e refinamentos de UX/observabilidade para fechamento final de maturidade da etapa.
