# Etapa 3 - Auth e Onboarding Frontend Seguro

## Arquitetura

- AuthProvider central em `src/features/auth/auth-context.tsx`.
- Estado derivado exclusivamente de Supabase Auth + RPCs backend.
- Guards de navegacao em `src/features/auth/auth-guards.tsx`.

## Fluxo de sessao

- Boot com `getSession()` e sincronizacao por `onAuthStateChange`.
- Sem renderizacao de area privada antes de resolver contexto.
- Logout limpa sessao e tenant ativo no client.

## MFA

- Rota dedicada `auth/mfa`.
- Integracao com `supabase.auth.mfa.enroll/challenge/verify`.
- Roles altas exigem MFA via estado `isMfaRequired`.

## Turnstile

- Script oficial carregado no layout.
- Componente reutilizavel `TurnstileWidget` com callbacks de sucesso/erro/expiracao.
- Uso nos fluxos de login, cadastro e recovery.

## Tenant selection e onboarding

- Selecao obrigatoria a cada login quando houver mais de um tenant ativo.
- Tela bloqueada para membership pendente.
- Tela dedicada para usuario autenticado sem tenant ativo.

## Fronteira de seguranca

- Frontend nao autoriza acesso: backend/RLS/RPC mantem fonte de verdade.
- Nenhum segredo no frontend ou Tauri.
- Erros exibidos ao usuario em formato neutro.
