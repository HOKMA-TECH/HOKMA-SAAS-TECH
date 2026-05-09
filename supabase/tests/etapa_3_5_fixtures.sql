begin;

create extension if not exists pgtap;
select plan(10);

select ok(exists (select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid where n.nspname = 'public' and p.proname = 'rpc_request_tenant_access_with_join_code'), 'join-code RPC exists');
select ok(exists (select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid where n.nspname = 'public' and p.proname = 'rpc_generate_join_code'), 'join-code generator RPC exists');

select ok(exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relname = 'tenant_join_codes'), 'tenant_join_codes table exists');
select ok(exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tenant_join_codes'), 'tenant_join_codes has RLS policies');

select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'tenant_join_codes' and column_name = 'expires_at'), 'join code has expiration');
select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'tenant_join_codes' and column_name = 'status'), 'join code has status lifecycle');
select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'tenant_join_codes' and column_name = 'used_by'), 'join code tracks usage actor');

select ok(exists (select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid where n.nspname = 'public' and p.proname = 'is_platform_master_admin'), 'platform helper exists');
select ok(exists (select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid where n.nspname = 'public' and p.proname = 'has_tenant_role'), 'tenant role helper exists');

select pass('fixture-ready baseline for pending/revoked/multi-tenant/master-admin scenarios');

select * from finish();
rollback;
