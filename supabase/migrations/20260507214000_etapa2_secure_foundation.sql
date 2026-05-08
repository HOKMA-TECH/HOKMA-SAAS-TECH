create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_path text,
  status text not null default 'active' check (status in ('active','inactive','blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  legal_name text not null,
  status text not null default 'active' check (status in ('active','suspended','archived')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.directorates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  unique (tenant_id, name)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  directorate_id uuid not null references public.directorates(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  unique (tenant_id, directorate_id, name)
);

create table if not exists public.coordinations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  unique (tenant_id, team_id, name)
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('corretor','coordenador','gerente','diretor','administrador')),
  status text not null default 'pending' check (status in ('pending','active','rejected','revoked')),
  directorate_id uuid references public.directorates(id) on delete set null,
  team_id uuid references public.teams(id) on delete set null,
  coordination_id uuid references public.coordinations(id) on delete set null,
  join_code text,
  requested_by uuid references auth.users(id),
  approved_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create table if not exists public.tenant_admin_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid not null references auth.users(id),
  tenant_id uuid not null references public.tenants(id),
  event_type text not null,
  entity_type text not null,
  entity_id text,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.global_admin_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid not null references auth.users(id),
  event_type text not null,
  entity_type text not null,
  entity_id text,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  before_value jsonb,
  after_value jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_tenant_memberships_tenant_id on public.tenant_memberships(tenant_id);
create index if not exists idx_tenant_memberships_user_id on public.tenant_memberships(user_id);
create index if not exists idx_tenant_memberships_role on public.tenant_memberships(role);
create index if not exists idx_tenant_memberships_directorate on public.tenant_memberships(directorate_id);
create index if not exists idx_tenant_memberships_team on public.tenant_memberships(team_id);
create index if not exists idx_tenant_memberships_coordination on public.tenant_memberships(coordination_id);
create index if not exists idx_directorates_tenant on public.directorates(tenant_id);
create index if not exists idx_teams_tenant on public.teams(tenant_id);
create index if not exists idx_coordinations_tenant on public.coordinations(tenant_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger trg_tenants_updated_at before update on public.tenants
for each row execute function public.set_updated_at();
create trigger trg_tenant_memberships_updated_at before update on public.tenant_memberships
for each row execute function public.set_updated_at();

create or replace function public.is_platform_master_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.platform_admins pa
    where pa.user_id = auth.uid() and pa.is_active = true
  );
$$;

create or replace function public.is_member_of_tenant(p_tenant_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = p_tenant_id and tm.user_id = auth.uid() and tm.status = 'active'
  );
$$;

create or replace function public.get_my_tenant_role(p_tenant_id uuid)
returns text
language sql
security definer
set search_path = public
as $$
  select tm.role
  from public.tenant_memberships tm
  where tm.tenant_id = p_tenant_id and tm.user_id = auth.uid() and tm.status = 'active'
  limit 1;
$$;

create or replace function public.has_tenant_role(p_tenant_id uuid, p_roles text[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.tenant_memberships tm
    where tm.tenant_id = p_tenant_id and tm.user_id = auth.uid() and tm.status = 'active' and tm.role = any(p_roles)
  );
$$;

revoke all on function public.is_platform_master_admin() from public;
revoke all on function public.is_member_of_tenant(uuid) from public;
revoke all on function public.get_my_tenant_role(uuid) from public;
revoke all on function public.has_tenant_role(uuid, text[]) from public;
grant execute on function public.is_platform_master_admin() to authenticated;
grant execute on function public.is_member_of_tenant(uuid) to authenticated;
grant execute on function public.get_my_tenant_role(uuid) to authenticated;
grant execute on function public.has_tenant_role(uuid, text[]) to authenticated;

alter table public.profiles enable row level security;
alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.platform_admins enable row level security;
alter table public.directorates enable row level security;
alter table public.teams enable row level security;
alter table public.coordinations enable row level security;
alter table public.tenant_admin_events enable row level security;
alter table public.global_admin_events enable row level security;

alter table public.tenants force row level security;
alter table public.tenant_memberships force row level security;
alter table public.platform_admins force row level security;

create policy profiles_select_self on public.profiles for select to authenticated using (id = auth.uid());
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy tenants_select_member_or_platform on public.tenants for select to authenticated
using (public.is_member_of_tenant(id) or public.is_platform_master_admin());

create policy memberships_select_self_or_admin on public.tenant_memberships for select to authenticated
using (
  user_id = auth.uid() or public.is_platform_master_admin() or public.has_tenant_role(tenant_id, array['administrador','diretor'])
);

create policy memberships_insert_request on public.tenant_memberships for insert to authenticated
with check (user_id = auth.uid() and status = 'pending');

create policy memberships_update_admin on public.tenant_memberships for update to authenticated
using (public.is_platform_master_admin() or public.has_tenant_role(tenant_id, array['administrador','diretor']))
with check (public.is_platform_master_admin() or public.has_tenant_role(tenant_id, array['administrador','diretor']));

create policy platform_admins_select_self on public.platform_admins for select to authenticated using (user_id = auth.uid());

create policy directorates_select_by_tenant on public.directorates for select to authenticated
using (public.is_member_of_tenant(tenant_id) or public.is_platform_master_admin());
create policy teams_select_by_tenant on public.teams for select to authenticated
using (public.is_member_of_tenant(tenant_id) or public.is_platform_master_admin());
create policy coordinations_select_by_tenant on public.coordinations for select to authenticated
using (public.is_member_of_tenant(tenant_id) or public.is_platform_master_admin());

create policy tenant_admin_events_select_restricted on public.tenant_admin_events for select to authenticated
using (public.is_platform_master_admin() or public.has_tenant_role(tenant_id, array['administrador','diretor']));

create policy global_admin_events_select_platform on public.global_admin_events for select to authenticated
using (public.is_platform_master_admin());

revoke all on public.profiles from anon, authenticated;
revoke all on public.tenants from anon, authenticated;
revoke all on public.tenant_memberships from anon, authenticated;
revoke all on public.platform_admins from anon, authenticated;
revoke all on public.directorates from anon, authenticated;
revoke all on public.teams from anon, authenticated;
revoke all on public.coordinations from anon, authenticated;
revoke all on public.tenant_admin_events from anon, authenticated;
revoke all on public.global_admin_events from anon, authenticated;

grant select, update on public.profiles to authenticated;
grant select on public.tenants to authenticated;
grant select, insert, update on public.tenant_memberships to authenticated;
grant select on public.platform_admins to authenticated;
grant select on public.directorates to authenticated;
grant select on public.teams to authenticated;
grant select on public.coordinations to authenticated;
grant select on public.tenant_admin_events to authenticated;
grant select on public.global_admin_events to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (id) do update
    set display_name = excluded.display_name,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.rpc_create_tenant(p_slug text, p_legal_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_tenant_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  insert into public.tenants (slug, legal_name, created_by)
  values (lower(trim(p_slug)), trim(p_legal_name), auth.uid())
  returning id into v_tenant_id;

  insert into public.tenant_memberships (tenant_id, user_id, role, status, requested_by, approved_by)
  values (v_tenant_id, auth.uid(), 'administrador', 'active', auth.uid(), auth.uid());

  return v_tenant_id;
end;
$$;

create or replace function public.rpc_list_my_tenants()
returns table(tenant_id uuid, slug text, legal_name text, role text)
language sql
security definer
set search_path = public
as $$
  select t.id, t.slug, t.legal_name, tm.role
  from public.tenants t
  join public.tenant_memberships tm on tm.tenant_id = t.id
  where tm.user_id = auth.uid() and tm.status = 'active';
$$;

create or replace function public.rpc_generate_join_code(p_tenant_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare v_code text;
begin
  if not public.has_tenant_role(p_tenant_id, array['administrador','diretor']) then
    raise exception 'forbidden';
  end if;
  v_code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 10));
  return v_code;
end;
$$;

grant execute on function public.rpc_create_tenant(text, text) to authenticated;
grant execute on function public.rpc_list_my_tenants() to authenticated;
grant execute on function public.rpc_generate_join_code(uuid) to authenticated;
