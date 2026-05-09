-- 1) Verify RLS enabled on sensitive tables
select schemaname, tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles','tenants','tenant_memberships','platform_admins',
    'directorates','teams','coordinations','tenant_admin_events','global_admin_events'
  )
order by tablename;

-- 2) Verify FORCE RLS where expected
select relname as table_name, relforcerowsecurity
from pg_class
where relnamespace = 'public'::regnamespace
  and relname in ('tenants','tenant_memberships','platform_admins')
order by relname;

-- 3) Verify role constraint integrity
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid = 'public.tenant_memberships'::regclass
  and contype = 'c';

-- 4) Verify storage bucket is private
select id, name, public
from storage.buckets
where id = 'tenant-private';

-- 5) Verify storage policies
select policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'storage' and tablename = 'objects'
order by policyname;

-- 6) Verify public does not have broad grants on sensitive tables
select table_schema, table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in (
    'profiles','tenants','tenant_memberships','platform_admins',
    'directorates','teams','coordinations','tenant_admin_events','global_admin_events'
  )
  and grantee in ('anon','authenticated')
order by table_name, grantee, privilege_type;

-- 7) Verify onboarding RPCs are present
select routine_name, security_type
from information_schema.routines
where specific_schema = 'public'
  and routine_name in (
    'rpc_request_tenant_access',
    'rpc_review_tenant_access_request',
    'rpc_list_tenant_memberships_secure',
    'rpc_list_tenant_structure_secure'
  )
order by routine_name;
