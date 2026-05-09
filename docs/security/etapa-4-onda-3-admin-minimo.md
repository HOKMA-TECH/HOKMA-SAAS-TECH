# HOKMA Etapa 4 - Onda 3 (Admin Minimo do Tenant)

## Entrega

A Onda 3 implementa a base administrativa minima do tenant, com foco em governanca de usuarios e configuracoes basicas, sem avancar para modulos sensiveis completos.

## O que foi implementado

- Painel Admin do tenant com dados reais via RPC autorizada:
  - listagem de memberships por tenant (`rpc_list_tenant_memberships_secure`)
  - filtro por status
  - busca basica
  - visao de pendentes/ativos/revogados
- Acoes administrativas controladas por capability:
  - aprovar membro pendente (`usuarios.approve`)
  - rejeitar membro pendente (`usuarios.approve`)
  - trocar role (`usuarios.change_role`)
  - suspender e reativar membro (`usuarios.suspend`)
- Configuracoes basicas do tenant:
  - resumo do tenant ativo
  - estado basico de memberships
  - baseline operacional de join code/onboarding
  - lembretes de postura de seguranca

## Seguranca aplicada

- UI nao e fonte de verdade: operacoes continuam no Supabase com RLS/RPC.
- Acoes sensiveis nao aparecem como disponiveis sem capability correspondente.
- Protecao por guard/contexto da Onda 1 permanece ativa para `/admin` e `/configuracoes`.
- MFA critico permanece exigido para governanca sensivel (gate no fluxo do app).
- Sem mistura tenant/platform nesta onda.

## Fora de escopo (mantido)

- CRM completo
- documentos sensiveis completos
- chat completo
- relatorios avancados
- automacoes, IA e financeiro

## Proximo passo recomendado

Iniciar Etapa 5 com consolidacao de dados operacionais reais por modulo (clientes/agenda/tarefas) e evolucao do admin para trilha de auditoria detalhada e estrutura organizacional completa.
