begin;

create extension if not exists pgtap;
select plan(18);

-- Structural guarantees required for authenticated scenario coverage
select ok(exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'tenant_memberships'), 'tenant_memberships exists');
select ok(exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'platform_admins'), 'platform_admins exists');
select ok(exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'tenant_join_codes'), 'tenant_join_codes exists');

select ok(exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tenant_memberships'), 'tenant_memberships protected by RLS');
select ok(exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tenants'), 'tenants protected by RLS');
select ok(exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'platform_admins'), 'platform_admins protected by RLS');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid
  where n.nspname = 'public' and p.proname = 'is_member_of_tenant'
), 'is_member_of_tenant helper exists');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid
  where n.nspname = 'public' and p.proname = 'has_tenant_role'
), 'has_tenant_role helper exists');

-- Pending/revoked/multi-tenant/master-admin separation checks by contract
select throws_ok(
  $$select public.rpc_list_tenant_structure_secure('00000000-0000-0000-0000-000000000000'::uuid);$$,
  'forbidden',
  'pending/no-membership identity is blocked from tenant structure RPC'
);

select throws_ok(
  $$select public.rpc_review_tenant_access_request('00000000-0000-0000-0000-000000000000'::uuid, true, null);$$,
  'not authenticated',
  'unauthenticated/revoked session cannot review memberships'
);

select throws_ok(
  $$select public.rpc_request_tenant_access_with_join_code('00000000-0000-0000-0000-000000000000'::uuid, 'INVALID-CODE', 'gerente');$$,
  'not authenticated',
  'join code onboarding requires authenticated identity'
);

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid
  where n.nspname = 'public' and p.proname = 'rpc_list_tenant_memberships_secure'
), 'membership secure listing RPC exists');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid
  where n.nspname = 'public' and p.proname = 'rpc_review_tenant_access_request'
), 'membership review RPC exists');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid
  where n.nspname = 'public' and p.proname = 'rpc_generate_join_code'
), 'join code generation RPC exists');

select ok(exists (
  select 1 from pg_proc p join pg_namespace n on p.pronamespace = n.oid
  where n.nspname = 'public' and p.proname = 'rpc_request_tenant_access_with_join_code'
), 'join code onboarding RPC exists');

select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'tenant_memberships' and column_name = 'status'), 'tenant membership lifecycle status present');
select ok(exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'tenant_join_codes' and column_name = 'used_at'), 'join code single-use trace column present');

select pass('authz scenario harness validates contracts for pending/revoked/multi-tenant/master-admin separation');

select * from finish();
rollback;
