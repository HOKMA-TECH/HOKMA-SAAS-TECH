# Etapa 5 - Onda 1: Authorization UI Layer, Guards e Contexto Seguro

## Objetivo

Consolidar a camada visual de autorizacao com foco em consistencia de capability, separacao tenant/platform e fallback seguro, mantendo backend como autoridade final.

## Implementacoes desta onda

### 1) `useCan` consolidado

Arquivo: `src/features/auth/authorization.tsx`

- Mantido `useCan(capability | capability[])` como ponto unico.
- Adicionados helpers:
  - `useCanAll(capabilities, context)`
  - `useCanAny(capabilities, context)`
- Contexto `tenant` e `platform` respeitado para nao misturar escopos.

### 2) `<Can />` aplicado em pontos centrais

Arquivos:
- `src/components/layout/sidebar.tsx`
- `src/app/(authenticated)/dashboard/page.tsx`
- `src/components/layout/topbar.tsx`

Aplicacao:
- Navegacao principal renderiza itens por capability com `<Can />`.
- Atalhos do dashboard renderizam por capability com `<Can />`.
- Topbar oculta acao de configuracoes sem capability.

### 3) Guards por capability com matriz real

Arquivo: `src/features/auth/auth-guards.tsx`

- Guard agora usa matriz completa de capabilities por role (`getCapabilitiesForRole`).
- Removeu dependencia de capacidades hardcoded como `false`.
- Mantem fallback `/403` para acesso sem capability.

### 4) MFA obrigatorio por capability critica

Arquivo: `src/features/auth/auth-context.tsx`

- `isMfaRequired` agora considera capabilities criticas do papel ativo (`CRITICAL_MFA_CAPABILITIES`) alem da preferencia de MFA habilitada.
- Mantem bloqueio para rotas protegidas quando nao ha fator TOTP verificado.

### 5) Pagina 403 refinada

Arquivo: `src/app/403/page.tsx`

- CTA principal contextual:
  - `master_admin` -> `/platform`
  - demais -> `/dashboard`
- Mensagem sem exposicao de detalhes tecnicos sensiveis.

## Cache tenant-aware

Arquivo validado: `src/components/providers.tsx`

Estado atual consolidado:
- `queryClient.clear()` em troca de usuario.
- Remocao de queries do tenant anterior na troca de tenant.
- Invalidacao quando membership ativa deixa de ser valida.

## Validacao executada

- `npm run lint` (sem erros; 1 warning legado de performance em MFA page)
- `npm run build` (sucesso)

## Garantias de seguranca preservadas

- Frontend nao e fonte de verdade.
- Backend/Supabase continuam autoridade final de permissao.
- Ocultar acao visual nao substitui protecao de RPC/RLS.
- Contexto tenant/platform permanece segregado na UI.

## Pendencias para Onda 2

- Expandir dashboards por role com componentes base reutilizaveis e variacoes de contexto.
- Consolidar navegacao guiada por capability em todos os acessos secundarios do produto.
