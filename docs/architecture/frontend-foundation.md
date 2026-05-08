# Frontend Foundation - HOKMA Etapa 1

## Estrutura

O projeto foi reorganizado para `src/` com boundaries claros:

- `src/app`: rotas e layouts
- `src/components`: UI, layout e shared
- `src/features`: espaco reservado para modulos de dominio
- `src/services`: acesso ao backend futuro
- `src/lib`: utilitarios, seguranca, erros e constantes
- `src/stores`: estado global de UI
- `src/types`: tipagens de dominio

## Shell

- `AppShell` encapsula estrutura desktop-first.
- `Sidebar` concentra navegacao principal.
- `Topbar` centraliza busca e contexto visual.
- `PageHeader` padroniza introducao de cada modulo.

## Padrao de paginas

Cada rota base usa placeholders premium sem regra de negocio real.
Isso garante consistencia visual enquanto backend e autenticacao ainda nao existem.
