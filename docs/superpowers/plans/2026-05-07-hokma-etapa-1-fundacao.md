# HOKMA Etapa 1 Fundacao Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir a fundacao frontend desktop-first segura do HOKMA, pronta para evolucao com backend futuro.

**Architecture:** Reorganizar o projeto para `src/` com boundaries claros (app/features/components/services/lib/stores/types), criar shell principal e navegacao base com placeholders premium, padronizar design system e convenções de erro/estado/servicos. Preparar Tauri com configuracao minima segura, sem comandos nativos desnecessarios.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Zustand, Tauri 2.

---

### Task 1: Baseline e limpeza estrutural

**Files:**
- Modify: `tsconfig.json`
- Modify: `.gitignore`
- Create: `src/` tree base files

- [ ] Step 1: Criar arvore base `src/` e mover entradas atuais (`app`, `components`, `hooks`, `lib`) para `src/` mantendo imports funcionais.
- [ ] Step 2: Ajustar `tsconfig.json` para aliases e include corretos em `src/*`.
- [ ] Step 3: Garantir que build artifacts (`.next`, `out`, `src-tauri/target`) estejam no `.gitignore`.
- [ ] Step 4: Rodar `pnpm build` para validar baseline.

### Task 2: Design system tokens e fundamentos visuais

**Files:**
- Modify: `src/app/globals.css`
- Create: `src/lib/constants/design-tokens.ts`
- Create: `src/components/shared/section-card.tsx`
- Create: `src/components/shared/status-badge.tsx`

- [ ] Step 1: Definir tokens semanticos (cor, spacing, radius, sombra, tipografia) no CSS global.
- [ ] Step 2: Criar mapa tipado de tokens em `design-tokens.ts` para uso consistente.
- [ ] Step 3: Implementar `SectionCard` e `StatusBadge` com variantes consistentes e acessiveis.
- [ ] Step 4: Validar contraste e estados `hover/active/disabled/focus-visible` nos componentes base.

### Task 3: Shell principal desktop-first

**Files:**
- Create: `src/components/layout/app-shell.tsx`
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/components/layout/topbar.tsx`
- Create: `src/components/layout/page-header.tsx`
- Modify: `src/app/layout.tsx`

- [ ] Step 1: Implementar `AppShell` com sidebar, topbar e content area com hierarquia clara.
- [ ] Step 2: Evoluir sidebar para navegacao principal colapsavel com itens por modulo.
- [ ] Step 3: Evoluir topbar para contexto de pagina e area de acoes futuras.
- [ ] Step 4: Criar `PageHeader` reutilizavel para todas as paginas base.
- [ ] Step 5: Conectar shell no layout raiz sem auth.

### Task 4: Navegacao base e paginas placeholder premium

**Files:**
- Create/Modify: `src/app/dashboard/page.tsx`
- Create/Modify: `src/app/clientes/page.tsx`
- Create/Modify: `src/app/agenda/page.tsx`
- Create/Modify: `src/app/tarefas/page.tsx`
- Create/Modify: `src/app/chat/page.tsx`
- Create/Modify: `src/app/empreendimentos/page.tsx`
- Create/Modify: `src/app/relatorios/page.tsx`
- Create/Modify: `src/app/admin/page.tsx`
- Create/Modify: `src/app/configuracoes/page.tsx`
- Create: `src/app/platform/page.tsx`
- Create: `src/components/shared/{stat-card.tsx,empty-state.tsx,loading-state.tsx,error-state.tsx,data-card.tsx,table-wrapper.tsx,filter-bar.tsx,search-input.tsx}`

- [ ] Step 1: Padronizar rotas principais e remover dependencia de grupos antigos `(authenticated)/(public)` para esta etapa.
- [ ] Step 2: Criar componentes de estado e blocos reutilizaveis para placeholders.
- [ ] Step 3: Implementar cada pagina com `PageHeader` + composicao premium de cards/listas placeholders.
- [ ] Step 4: Validar navegacao completa entre todas as rotas base.

### Task 5: Convencoes de estado, services e erros

**Files:**
- Create: `src/services/http/client.ts`
- Create: `src/services/http/types.ts`
- Create: `src/services/adapters/base-adapter.ts`
- Create: `src/lib/errors/app-error.ts`
- Create: `src/lib/errors/error-messages.ts`
- Create: `src/lib/security/safe-logger.ts`
- Create: `src/lib/config/public-env.ts`
- Create: `src/lib/constants/query-keys.ts`
- Create: `src/stores/ui-store.ts`
- Create: `src/types/app.ts`

- [ ] Step 1: Definir tipagens base sem `any` para erros, responses e estado UI.
- [ ] Step 2: Criar client HTTP neutro para backend futuro com timeout e tratamento de erro tipado.
- [ ] Step 3: Criar padrão de adapters para normalizar payloads futuros.
- [ ] Step 4: Implementar `AppError` e mensagens seguras para UI.
- [ ] Step 5: Implementar logger com redacao de campos sensiveis por default.
- [ ] Step 6: Criar query keys e store de UI para convencao futura.

### Task 6: Configuracao de ambiente e seguranca de envs

**Files:**
- Modify: `package.json`
- Modify: `next.config.mjs`
- Create/Modify: `.env.example`
- Create: `src/lib/config/README.md`

- [ ] Step 1: Confirmar scripts Next + Tauri e nome do pacote `hokma`.
- [ ] Step 2: Validar `next.config.mjs` para static export e compatibilidade Tauri.
- [ ] Step 3: Padronizar `.env.example` com separacao explicita entre `NEXT_PUBLIC_*` e variaveis privadas futuras (nao usadas no frontend).
- [ ] Step 4: Documentar regra de ouro: segredo nunca no client.

### Task 7: Hardening inicial do Tauri

**Files:**
- Modify: `src-tauri/tauri.conf.json`
- Read/Modify (se existir): `src-tauri/src/lib.rs`, `src-tauri/src/main.rs`
- Create: `docs/tauri-security.md`

- [ ] Step 1: Revisar `tauri.conf.json` para permissao minima (sem filesystem amplo, sem plugins desnecessarios).
- [ ] Step 2: Garantir ausencia de comandos `#[tauri::command]` desnecessarios nesta etapa.
- [ ] Step 3: Definir politica de links externos controlada e documentada.
- [ ] Step 4: Rodar `pnpm tauri:dev` para validar shell no desktop.

### Task 8: Documentacao da fundacao

**Files:**
- Create: `docs/architecture/frontend-foundation.md`
- Create: `docs/architecture/navigation-map.md`
- Create: `docs/security/foundation-security-decisions.md`
- Modify: `README.md`

- [ ] Step 1: Documentar arquitetura de pastas e boundaries.
- [ ] Step 2: Documentar design system base e componentes reutilizaveis.
- [ ] Step 3: Documentar shell, navegacao e objetivo de cada rota placeholder.
- [ ] Step 4: Documentar decisoes de seguranca (o que foi liberado e por que).
- [ ] Step 5: Registrar explicitamente o que nao existe ainda e fica para proxima etapa.

### Task 9: Verificacao final da etapa

**Files:**
- N/A (validacao)

- [ ] Step 1: Rodar `pnpm lint` e corrigir problemas.
- [ ] Step 2: Rodar `pnpm build` e validar `out/` para Tauri.
- [ ] Step 3: Rodar `pnpm tauri:build` (ou `tauri:dev` se build completo nao for viavel localmente) e validar integracao.
- [ ] Step 4: Executar checklist de seguranca:
  - sem segredos no frontend
  - sem config Tauri insegura
  - sem comandos nativos desnecessarios
  - frontend tratado como cliente
  - base pronta para backend como fonte de verdade
