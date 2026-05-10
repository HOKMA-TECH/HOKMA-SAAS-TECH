begin;
select plan(14);

select ok(exists (select 1 from information_schema.tables where table_schema='public' and table_name='crm_leads'), 'crm_leads exists');
select ok(exists (select 1 from pg_policies where schemaname='public' and tablename='crm_leads'), 'crm_leads has rls policy');
select ok(exists (select 1 from information_schema.routines where routine_schema='public' and routine_name='rpc_crm_create_lead'), 'rpc_crm_create_lead exists');
select ok(exists (select 1 from information_schema.routines where routine_schema='public' and routine_name='rpc_crm_reassign_lead_owner'), 'rpc_crm_reassign_lead_owner exists');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname='public' and p.proname='crm_can_access_scope'
), 'crm_can_access_scope exists');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname='public' and p.proname='crm_audit_access_denied'
), 'crm_audit_access_denied exists');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname='public' and p.proname='rpc_crm_get_client_detail'
), 'rpc_crm_get_client_detail exists');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname='public' and p.proname='rpc_crm_move_stage'
), 'rpc_crm_move_stage exists');

select like(
  (select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='rpc_crm_move_stage' limit 1),
  '%lost_reason_required%',
  'rpc_crm_move_stage enforces lost reason'
);

select like(
  (select pg_get_functiondef(p.oid) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname='rpc_crm_convert_lead_to_client' limit 1),
  '%lead already converted%',
  'rpc_crm_convert_lead_to_client blocks duplicate conversion'
);

select ok(exists (select 1 from information_schema.columns where table_schema='public' and table_name='crm_leads' and column_name='lost_reason'), 'crm_leads has lost_reason');
select ok(exists (select 1 from information_schema.columns where table_schema='public' and table_name='crm_clients' and column_name='lost_reason'), 'crm_clients has lost_reason');

select ok(exists (select 1 from information_schema.tables where table_schema='public' and table_name='crm_access_audit'), 'crm_access_audit exists');

select ok(exists (
  select 1 from pg_policies where schemaname='public' and tablename='crm_notes' and policyname='crm_notes_select'
), 'crm_notes_select policy exists');

select ok(exists (
  select 1 from pg_policies where schemaname='public' and tablename='crm_stage_history' and policyname='crm_stage_history_select'
), 'crm_stage_history_select policy exists');

select * from finish();
rollback;
