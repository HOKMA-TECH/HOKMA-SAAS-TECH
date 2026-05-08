# HOKMA Etapa 1 - Fundacao (Desktop + Web) Design

## Contexto

O frontend do HOKMA esta em reconstrucao com Next.js/React e base de componentes estilo shadcn/ui.
O backend ainda nao existe. O produto final sera um software desktop via Tauri, com frontend moderno,
dados sensiveis de clientes, suporte multi-tenant no futuro e seguranca forte como principio estrutural.

Esta etapa nao implementa CRM, chat real, agenda real, banco, autenticacao real ou regras de negocio.
O objetivo e estabelecer a fundacao correta para crescimento seguro e escalavel.

## Objetivo da Etapa 1

Criar a fundacao do software com:

- Arquitetura frontend limpa e escalavel.
- Design system inicial premium, legivel e consistente.
- Shell principal do app com hierarquia de software desktop.
- Navegacao base dos modulos principais.
- Convencoes tecnicas para estado, servicos e erros.
- Preparacao segura para Tauri.
- Documentacao clara da fundacao e das decisoes de seguranca.

## Nao objetivos (fora de escopo)

- Backend real, banco real, autenticacao real.
- Integracoes nativas complexas em Tauri.
- IPC de regra de negocio.
- Exposicao de comandos nativos desnecessarios.
- Persistencia de dados sensiveis no frontend.

## Principios de arquitetura

1. Frontend/Tauri sao clientes nao-confiaveis.
2. Fonte de verdade de seguranca sera backend futuro.
3. Sem acoplamento prematuro com dominio.
4. Componentizacao forte e boundaries claros.
5. Convencoes agora para evitar retrabalho depois.

## Estrutura de pastas proposta

```text
src/
  app/
  features/
  components/
    ui/
    layout/
    shared/
  hooks/
  services/
    http/
    adapters/
  stores/
  types/
  lib/
    config/
    constants/
    utils/
    errors/
    security/
```

### Responsabilidades

- `app`: roteamento, layouts e composicao de pagina.
- `features`: blocos por dominio (apenas estrutura e UI placeholder nesta etapa).
- `components/ui`: primitives e wrappers visuais reutilizaveis.
- `components/layout`: shell e elementos estruturais globais.
- `components/shared`: blocos comuns transversais.
- `services`: camada de acesso para backend futuro (sem API real agora).
- `stores`: estado global de UI/sessao local nao sensivel.
- `types`: contratos tipados e DTOs de fronteira.
- `lib/errors`: padrao de erro tipado e mapeamento seguro para UI.
- `lib/security`: utilitarios de redacao de logs e protecoes de client.
- `lib/config`: leitura segura de env publica.

## Boundaries e import strategy

- Alias padrao `@/*` apontando para `src/*`.
- `app` pode importar `features`, `components`, `lib`, `services`, `stores`.
- `features` pode importar `components`, `lib`, `services`, `stores`, `types`.
- `components/ui` nao conhece `features`.
- `services` nao depende de `components`.
- Evitar imports relativos longos e ciclos de dependencia.

## Design system inicial

Direcao: premium, clean, corporativo moderno, branco/azul, alta legibilidade, sem exagero visual.

### Tokens

- Cores semanticas: fundo, superficie, texto, primaria, destaque, sucesso, alerta, erro, borda.
- Escala de spacing: base 4px (`4, 8, 12, 16, 24, 32, 40, 48`).
- Radius: `sm`, `md`, `lg`, `xl`.
- Sombra: `elevation-1`, `elevation-2`, `elevation-3`.
- Tipografia: titulos, subtitulos, corpo, legenda com hierarquia clara.

### Estados visuais

- `hover`: incremento sutil de contraste.
- `active`: reforco de profundidade e foco de interacao.
- `disabled`: opacidade + bloqueio sem ambiguidades.
- `focus-visible`: anel forte com contraste AA.

### Padroes base

- Button pattern (primary, secondary, ghost, danger).
- Input pattern (label, help text, erro, foco).
- Card pattern (header, body, actions).
- Modal/Drawer pattern (estrutura, a11y, fechamento seguro).
- Table/List pattern (cabecalho fixo opcional, empty/loading/error states).

## Shell principal do software

Componente raiz `AppShell` com orientacao desktop-first:

- Sidebar principal colapsavel.
- Topbar principal com contexto da tela.
- Area de conteudo com `PageHeader` e secao principal.
- Hierarquia visual para acomodar modulos futuros sem refatoracao estrutural.

### Componentes estruturais

- `AppShell`
- `Sidebar`
- `Topbar`
- `PageHeader`
- `SectionCard`
- `StatCard`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `SearchInput`
- `FilterBar`
- `DataCard`
- `ModalBase`
- `DrawerBase`
- `TableWrapper`
- `StatusBadge`

## Navegacao base (sem logica de negocio)

Rotas principais:

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

Cada rota tera pagina placeholder premium com:

- Header contextual com titulo e descricao.
- Estrutura coerente de cards/tabelas placeholder.
- Estados vazios/carregamento/erro com linguagem de produto.

## Convencoes de estado e integracao futura

### React Query (futuro)

- Criar padrao `queryKeys` por feature.
- Sem chamadas reais nesta etapa.
- Estrutura pronta para cache e invalidacao consistente.

### Zustand

- Stores pequenas para estado de interface (ex.: navegacao, preferencias locais).
- Sem dados sensiveis e sem tentativa de persistir segredos.

### Services e adapters

- `services/http/client.ts` como facade para backend futuro.
- `services/adapters/*` para transformar payload externo em modelos internos.
- Erros mapeados em camada propria para nao vazar detalhe tecnico.

### Erros e observabilidade de frontend

- `AppError` tipado com categorias (`validation`, `network`, `unexpected`).
- Mensagens de UI seguras (sem stack trace e sem detalhes internos).
- Logger com redacao de campos sensiveis por default.

## Preparacao de ambiente e configuracao

- Nome do projeto padronizado como HOKMA.
- Scripts de dev/build alinhados com Next + Tauri.
- `next.config.mjs` preparado para static export e Tauri dev host.
- `.env.example` separado por blocos:
  - publicas permitidas (`NEXT_PUBLIC_*` nao sensiveis)
  - futuras privadas backend (apenas documentadas, nao usadas no client)

## Tauri: preparacao minima e segura

### Objetivo desta etapa

- Garantir base funcional para desktop sem super-expor superficie nativa.

### Regras aplicadas

- Nenhum comando nativo custom exposto sem necessidade.
- Sem liberacao ampla de filesystem.
- Sem IPC para regra de negocio.
- Links externos tratados de forma controlada.
- Configuracao de janela principal enxuta e previsivel.

### Resultado esperado

- App roda em Tauri com shell e navegacao funcionando.
- Politica de permissao minima documentada para evolucao futura.

## Ciberseguranca: controles explicitos da etapa

1. Nenhum segredo no frontend.
2. Nenhuma service key no app desktop.
3. Nenhuma env sensivel no client.
4. Frontend nao decide autorizacao.
5. Tauri sem acesso nativo aberto por conveniencia.
6. Estrutura pronta para backend ser fonte de verdade.
7. Base de erro/log para reduzir vazamento de informacao.

## Entregaveis esperados

- Arquitetura frontend reorganizada em `src/`.
- Design system base aplicado em tokens e componentes.
- Shell principal e navegacao base implementados.
- Componentes reutilizaveis estruturais prontos.
- Configuracao Next/Tauri revisada para desktop.
- Documentacao da fundacao e seguranca da etapa.

## Riscos e mitigacoes

- Risco: criar acoplamento com dominio cedo demais.
  - Mitigacao: placeholders e contratos, sem regra de negocio.
- Risco: relaxar seguranca por falta de backend.
  - Mitigacao: cliente tratado como nao-confiavel desde o inicio.
- Risco: proliferacao de padroes diferentes entre modulos.
  - Mitigacao: design system e convencoes centralizadas.

## Criterios de aceite da Etapa 1

- Estrutura de pastas segue arquitetura proposta.
- Shell desktop-first consistente em todas as rotas base.
- Design system aplicado com tokens semanticos e estados visuais.
- Tauri configurado com permissoes minimas e sem comandos nativos desnecessarios.
- Nenhuma informacao sensivel no frontend/env publico.
- Documentacao da fundacao atualizada e clara para proxima etapa.

## Proximas etapas (fora desta entrega)

- Definicao de backend seguro e modelo de autenticacao/autorizacao.
- Contratos API reais com validacao de entrada/saida.
- Persistencia de dados e segregacao multi-tenant.
- Hardening adicional (CSP, headers, trilhas de auditoria) com backend ativo.
