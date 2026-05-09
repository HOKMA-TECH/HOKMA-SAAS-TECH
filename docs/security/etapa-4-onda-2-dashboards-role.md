# HOKMA Etapa 4 - Onda 2 (Dashboards por Role/Capability)

## Objetivo

Consolidar a home operacional com variacao por role/capability sem criar sistemas paralelos, mantendo base visual compartilhada e postura de seguranca coerente com tenant/platform.

## Entregas

- Componentizacao de dashboard para evolucao rapida e reutilizacao:
  - `DashboardHero`
  - `DashboardSection`
  - `DashboardShortcutCard`
  - `DashboardStatCard`
  - `DashboardEmptyState`
- Dashboard principal com conteudo orientado por capability real (`useCan`) e role ativa.
- Atalhos clicaveis de navegacao rapida respeitando capabilities.
- Blocos de resumo por role com placeholders estruturados prontos para troca por dados reais autorizados.
- Distincao visual e funcional do contexto de plataforma no dashboard.

## Como os dashboards variam por role/capability

- A role ativa (`activeMembership.role`) define o conjunto base de cards de resumo.
- Capacidades definem o que aparece como acao disponivel no painel (clientes, agenda, tarefas, chat, relatorios, admin, configuracoes, platform).
- Perfis de gestao (`coordenador`, `gerente`, `diretor`, `administrador`, `master_admin`) recebem secao agregada adicional.
- `master_admin` recebe bloco de contexto platform sem heranca indevida de tenant.

## Dados e estrategia desta onda

- Onde ainda nao existem datasets consolidados/seguros para consumo, foram usados placeholders estruturados por role.
- A arquitetura dos componentes e das secoes ja esta preparada para substituir por queries tenant-aware e RPCs autorizadas.
- Nao foi simulada regra de negocio inexistente no backend.

## Seguranca e coerencia arquitetural

- UI continua sendo camada visual de autorizacao; backend permanece autoridade final.
- Onda 1 de guards/capability/contexto segue valendo para acesso de rota.
- Separacao tenant vs platform preservada na navegacao e no conteudo.
- Nenhuma capability critica foi relaxada por esta onda.

## O que fica para Onda 3

- Admin minimo do tenant:
  - gestao de usuarios
  - aprovacoes pendentes
  - troca de role
  - suspensao/reativacao
  - configuracoes basicas
