begin;
select plan(4);

select ok(exists (select 1 from information_schema.tables where table_schema='public' and table_name='crm_leads'), 'crm_leads exists');
select ok(exists (select 1 from pg_policies where schemaname='public' and tablename='crm_leads'), 'crm_leads has rls policy');
select ok(exists (select 1 from information_schema.routines where routine_schema='public' and routine_name='rpc_crm_create_lead'), 'rpc_crm_create_lead exists');
select ok(exists (select 1 from information_schema.routines where routine_schema='public' and routine_name='rpc_crm_reassign_lead_owner'), 'rpc_crm_reassign_lead_owner exists');

select * from finish();
rollback;
