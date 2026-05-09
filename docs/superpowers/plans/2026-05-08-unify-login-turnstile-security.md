# Unify Login Turnstile Security Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unificar o login de web e Tauri com Turnstile obrigatório no backend, mantendo hostnames corretos e adicionando proteção por IP/e-mail com cooldown progressivo.

**Architecture:** O frontend sempre renderiza/resolve token Turnstile e envia para um endpoint server-side de autenticação. O backend valida o token no Cloudflare antes de autenticar no Supabase e aplica rate limit composto (IP + e-mail) com janela e bloqueio progressivo. O mesmo fluxo roda em web e desktop para eliminar divergência.

**Tech Stack:** Next.js App Router, React, Supabase Auth, Cloudflare Turnstile, Tauri WebView.

---

### Task 1: Mapear fluxo atual e pontos de divergência

**Files:**
- Modify: `src/features/auth/captcha.ts`
- Modify: `src/features/auth/turnstile-widget.tsx`
- Modify: `src/features/auth/auth-context.tsx`
- Modify: `src/app/login/page.tsx`

- [ ] **Step 1: Confirmar e remover bypass desktop de captcha**

Em `src/features/auth/captcha.ts`, remover:

```ts
if (isDesktopRuntime()) return 'desktop-runtime-token'
```

e manter apenas token real do widget/DOM.

- [ ] **Step 2: Confirmar renderização do widget para desktop e web**

Em `src/features/auth/turnstile-widget.tsx`, remover o branch que troca por token fixo para desktop:

```ts
if (isDesktopRuntime()) {
  onTokenChange('desktop-runtime-token')
  return
}
```

e também remover condição que oculta o container em desktop.

- [ ] **Step 3: Ajustar mensagem de UI para fluxo único**

Trocar texto para indicar verificação anti-bot ativa em todos ambientes, sem mencionar bypass desktop.

- [ ] **Step 4: Verificar submit no login continua bloqueando sem token**

Em `src/app/login/page.tsx`, manter:

```ts
if (!resolvedCaptchaToken) {
  setError('Complete a verificacao anti-bot para continuar.')
  setIsLoading(false)
  return
}
```

e garantir que a chamada de autenticação passa o token para backend (Task 2).


### Task 2: Criar endpoint server-side de login com validação Turnstile

**Files:**
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/lib/security/turnstile.ts`
- Modify: `src/features/auth/auth-context.tsx`

- [ ] **Step 1: Escrever teste (ou contrato) do validador Turnstile**

Criar casos para:
- token ausente -> 400
- token inválido -> 400
- token válido -> segue autenticação

- [ ] **Step 2: Implementar cliente de verificação Turnstile**

Em `src/lib/security/turnstile.ts`, implementar função:

```ts
export async function verifyTurnstileToken(input: {
  token: string
  remoteIp?: string | null
}): Promise<{ ok: boolean; code?: string }>
```

Usar `TURNSTILE_SECRET_KEY` e `https://challenges.cloudflare.com/turnstile/v0/siteverify`.

- [ ] **Step 3: Implementar endpoint `/api/auth/login`**

Em `src/app/api/auth/login/route.ts`:
1. validar payload (`email`, `password`, `turnstileToken`)
2. validar Turnstile (falha => 400)
3. autenticar usuário via Supabase server client
4. responder erro genérico para credenciais inválidas

- [ ] **Step 4: Mudar frontend para usar endpoint interno**

Em `src/features/auth/auth-context.tsx`, alterar `signIn` para:

```ts
signIn: (email: string, password: string, turnstileToken: string) => Promise<{ error: string | null }>
```

e chamar `fetch('/api/auth/login', ...)` ao invés de `supabase.auth.signInWithPassword` direto no client.


### Task 3: Adicionar rate limit por IP + e-mail + cooldown progressivo

**Files:**
- Create: `src/lib/security/login-rate-limit.ts`
- Modify: `src/app/api/auth/login/route.ts`
- Optional Modify: `supabase/migrations/*` (se optar por persistência no banco)

- [ ] **Step 1: Definir estratégia e limites**

Política sugerida:
- por IP: 10 tentativas / 5 min
- por e-mail: 5 tentativas / 10 min
- cooldown progressivo: 30s, 60s, 120s após blocos sucessivos

- [ ] **Step 2: Implementar verificação pré-auth**

No endpoint, antes do Turnstile/Supabase, validar limite por IP e e-mail e responder `429` com `retryAfterSeconds`.

- [ ] **Step 3: Implementar registro de tentativa**

Após resposta de auth, registrar sucesso/falha e atualizar cooldown progressivo.

- [ ] **Step 4: Expor mensagem de cooldown no frontend**

No login UI, exibir mensagem amigável quando backend responder 429.


### Task 4: Garantir hostnames e ambiente

**Files:**
- Modify: `.env.example`
- Modify: docs operacionais (se existir, ex.: `README.md`)

- [ ] **Step 1: Padronizar variáveis obrigatórias**

Adicionar/confirmar:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

- [ ] **Step 2: Documentar hostnames necessários no Cloudflare**

Documentar:
- `localhost`
- `127.0.0.1`
- domínio de produção (`hokmatech.com`, `www.hokmatech.com`)


### Task 5: Testes de regressão e validação manual web + tauri

**Files:**
- Create/Modify: testes de integração auth existentes no projeto

- [ ] **Step 1: Testar ausência de token**

Run: fluxo login sem token
Expected: bloqueio no client e/ou 400 no backend

- [ ] **Step 2: Testar token inválido**

Expected: 400 com mensagem anti-bot

- [ ] **Step 3: Testar credencial inválida com token válido**

Expected: erro de credencial sem vazar detalhe sensível

- [ ] **Step 4: Testar rate limit + cooldown**

Expected: 429 após limite, retorno com `retryAfterSeconds` e desbloqueio após janela

- [ ] **Step 5: Validar Tauri e Web com mesmo comportamento**

Expected: ambos exigem token Turnstile e autenticam com as mesmas regras
