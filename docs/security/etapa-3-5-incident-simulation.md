# HOKMA Etapa 3.5 - Simulacao de Incidente

## Cenario

Simulacao de tentativa de acesso cross-tenant e validacao de revogacao de acesso com contratos de autorizacao.

## Execucao

- Suite executada: `supabase/tests/etapa_3_5_authz_scenarios.sql`
- Evidencia de log: `test-results/security/etapa-3-5-incident-simulation.log`
- Evidencia de rota bloqueada: `test-results/security-403.png`

## Resultados esperados e validados

- Tentativa de acesso sem membership valida bloqueada (`throws_ok`).
- Sessao revogada/nao autenticada bloqueada para RPC sensivel (`throws_ok`).
- Contratos de separacao multi-tenant e isolamento por papel preservados (`pass`).
- Fluxo de rota bloqueada para pagina `/403` validado por teste e captura.

## Observacoes operacionais

- A simulacao confirma comportamento de bloqueio no backend (RLS/RPC).
- Eventos devem alimentar pipeline de auditoria/alerta definido no baseline operacional.
