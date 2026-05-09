# HOKMA Etapa 3.5 - Alerting Baseline

## Objetivo

Definir alertas minimos de seguranca para auditoria de eventos criticos de autorizacao, separacao de tenant e acoes sensiveis.

## Alertas Minimos

### 1) authz_denied_spike

- Fonte: eventos de negacao de autorizacao (RLS/RPC denied) no log de seguranca.
- Regra: mais de 10 negacoes em 5 minutos para o mesmo `tenant_id` ou `user_id`.
- Severidade: medium.
- Acao: notificar canal de engenharia; abrir investigacao em ate 30 minutos.

### 2) cross_tenant_attempt

- Fonte: tentativa bloqueada de acesso a recurso de tenant diferente do contexto ativo.
- Regra: qualquer ocorrencia (`>= 1`) em janela de 5 minutos.
- Severidade: high.
- Acao: notificar engenharia + responsavel de seguranca; revisar IP/session e confirmar revogacao/isolamento.

### 3) privilege_change_sensitive

- Fonte: eventos de aprovacao de membership, troca de role e acoes de governanca sensivel.
- Regra: mais de 3 alteracoes sensiveis por 10 minutos no mesmo tenant, ou alteracao fora de horario operacional definido.
- Severidade: high.
- Acao: exigir revisao manual de trilha de auditoria e confirmacao do aprovador.

### 4) signed_url_abuse_pattern

- Fonte: eventos de geracao/uso de signed URL para documentos privados.
- Regra: mais de 20 geracoes em 10 minutos por usuario, ou padrao de downloads em massa fora do baseline.
- Severidade: medium/high (depende do volume).
- Acao: reduzir privilegio da sessao (quando aplicavel), abrir incidente e auditar usuario/tenant.

## Campos Minimos de Evento

- `occurred_at`
- `actor_user_id`
- `tenant_id`
- `action`
- `resource_type`
- `resource_id`
- `details` (JSON para contexto)

## Operacao Inicial

- Destino de notificacao: canal interno de engenharia de seguranca.
- SLA inicial:
  - High: acknowledge em ate 15 minutos.
  - Medium: acknowledge em ate 60 minutos.
- Retencao inicial de eventos de auditoria: 90 dias (baseline).

## Validacao da Etapa 3.5

- Alertas definidos e documentados.
- Simulacao de incidente executada com evidencia anexada.
