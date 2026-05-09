# HOKMA Etapa 3.5 - Checklist Formal Pre-Producao

## Evidencias de execucao

- [x] Testes automatizados de RLS (arquivo: `supabase/tests/etapa_3_5_security.sql`)
- [x] Testes automatizados de RPC (arquivo: `supabase/tests/etapa_3_5_security.sql`)
- [x] Testes automatizados de storage policy baseline (arquivo: `supabase/tests/etapa_3_5_security.sql`)
- [x] Testes de sessao/tenant no frontend (arquivo: `tests/e2e/security-etapa-3-5.spec.ts`)
- [x] Matriz formal de permissions por capability (arquivo: `docs/security/etapa-3-5-capability-matrix.md`)
- [x] Camada de autorizacao visual (`useCan`, `<Can />`) implementada
- [x] Pagina 403 implementada
- [x] MFA obrigatoria para perfis/capabilities criticas aplicada na auth layer
- [x] Join code endurecido (expiracao/revogacao/reuso controlado) em migracao SQL
- [x] Auditoria ampliada com helper central (`log_tenant_security_event`)
- [x] Threat model inicial + LGPD baseline documentados
- [x] Cache segregado por tenant + limpeza em troca/logout/perda de membership

## Comandos executados

```bash
pnpm lint
```

Resultado esperado: sem erros.

## Evidencia SQL (artefatos)

- Suite hardening: `supabase/tests/etapa_3_5_security.sql`
- Suite fixtures/cenarios: `supabase/tests/etapa_3_5_fixtures.sql`
- Suite authz scenarios: `supabase/tests/etapa_3_5_authz_scenarios.sql`
- CI workflow: `.github/workflows/security-sql-tests.yml`

### Output esperado (trecho)

```text
1..N
ok - ...
ok - ...
```

Falha de qualquer caso deve bloquear merge ate correcao.

## Matriz requisito -> prova

- Pending nao acessa tenant: `supabase/tests/etapa_3_5_authz_scenarios.sql`
- Revoked/sem auth nao executa RPC sensivel: `supabase/tests/etapa_3_5_authz_scenarios.sql`
- Multi-tenant/cross-tenant bloqueado por contrato RLS+RPC: `supabase/tests/etapa_3_5_security.sql`, `supabase/tests/etapa_3_5_authz_scenarios.sql`
- Master admin separado de tenant admin: `supabase/tests/etapa_3_5_security.sql`, `supabase/tests/etapa_3_5_authz_scenarios.sql`
- Join code endurecido (expira/revoga/uso unico): `supabase/migrations/20260508110000_etapa35_hardening_security.sql`, `supabase/tests/etapa_3_5_fixtures.sql`

## Pendencias operacionais antes de dados sensiveis reais

- [ ] Executar pgTAP no pipeline CI conectado ao ambiente de banco alvo
- [ ] Anexar logs da execucao SQL (output do runner) como evidencia de auditoria
- [ ] Capturar prints das rotas bloqueadas com redirecionamento para `/403`
- [x] Configurar alertas minimos para eventos de seguranca (auditoria)
- [x] Executar simulacao de incidente (vazamento cross-tenant e revogacao de acesso)

### Evidencias operacionais da conclusao

- Baseline de alertas: `docs/security/etapa-3-5-alerting-baseline.md`
- Simulacao de incidente: `docs/security/etapa-3-5-incident-simulation.md`
- Log da simulacao: `test-results/security/etapa-3-5-incident-simulation.log`
- Print da rota bloqueada `/403`: `test-results/security-403.png`
