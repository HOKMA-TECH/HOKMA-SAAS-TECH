# Foundation Security Decisions - Etapa 1

## Decisoes aplicadas

1. Frontend e app Tauri tratados como cliente nao-confiavel.
2. Nenhum segredo armazenado no frontend.
3. `.env.example` separado entre publico e backend futuro.
4. Tauri com CSP explicita (sem `csp: null`).
5. Sem comandos nativos custom expostos nesta etapa.
6. Sem acesso amplo de filesystem ou IPC de negocio.

## O que foi deliberadamente adiado

- Autenticacao real
- Autorizacao real
- Gestao de sessao segura com backend
- Politicas finais de auditoria e trilhas de acesso

## Principio de continuidade

A proxima etapa deve manter backend como fonte de verdade para autenticacao, autorizacao e validacao de regras.
