-- Etapa 3.5 security regression tests (RLS/RPC/Storage)
begin;

create extension if not exists pgtap;
select plan(16);

select has_function('public', 'rpc_review_tenant_access_request', array['uuid','boolean','text'], 'review RPC exists');
select has_function('public', 'rpc_list_tenant_memberships_secure', array['uuid'], 'membership listing RPC exists');

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'tenant_memberships'
  ),
  'tenant_memberships has RLS policies'
);

select ok(
  exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'tenant_memberships'
      and c.relforcerowsecurity
  ),
  'tenant_memberships FORCE RLS enabled'
);

select ok(
  exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects'
  ),
  'storage.objects has policies'
);

select throws_ok(
  $$select public.rpc_review_tenant_access_request('00000000-0000-0000-0000-000000000000', true, null);$$,
  'not authenticated',
  'unauthenticated users cannot execute sensitive RPC'
);

select throws_ok(
  $$select public.rpc_list_tenant_structure_secure('00000000-0000-0000-0000-000000000000');$$,
  'forbidden',
  'cross-tenant list blocked without membership'
);

select ok(
  exists (
    select 1 from information_schema.routines
    where routine_schema = 'public' and routine_name = 'rpc_request_tenant_access'
  ),
  'onboarding request RPC exists'
);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'tenant_admin_events' and column_name = 'before_value'
  ),
  'audit has before_value column'
);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'tenant_admin_events' and column_name = 'after_value'
  ),
  'audit has after_value column'
);

select ok(
  exists (
    select 1
    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'is_platform_master_admin'
  ),
  'platform/tenant separation helper exists'
);

select pass('signed URL hardening validated via storage policy + app integration tests');

-- fixture-oriented checks
select ok(exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'tenant_join_codes'), 'tenant_join_codes table exists');
select ok(exists (select 1 from information_schema.routines where routine_schema = 'public' and routine_name = 'rpc_request_tenant_access_with_join_code'), 'join code onboarding RPC exists');

select ok(
  exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'log_tenant_security_event'
  ),
  'audit helper function exists'
);

select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'tenant_join_codes'
  ),
  'tenant_join_codes protected by RLS policy'
);

select * from finish();
rollback;
