create table if not exists public.tenant_join_codes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  code_hash text not null,
  status text not null default 'active' check (status in ('active','revoked','used','expired')),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references auth.users(id),
  created_by uuid not null references auth.users(id),
  revoked_by uuid references auth.users(id),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (tenant_id, code_hash)
);

alter table public.tenant_join_codes enable row level security;
alter table public.tenant_join_codes force row level security;

create policy tenant_join_codes_admin_select on public.tenant_join_codes for select to authenticated
using (public.is_platform_master_admin() or public.has_tenant_role(tenant_id, array['administrador','diretor']));

create or replace function public.log_tenant_security_event(
  p_tenant_id uuid,
  p_event_type text,
  p_entity_type text,
  p_entity_id text,
  p_message text,
  p_metadata jsonb default '{}'::jsonb,
  p_before jsonb default null,
  p_after jsonb default null
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.tenant_admin_events (
    actor_user_id, tenant_id, event_type, entity_type, entity_id, message, metadata, before_value, after_value
  ) values (
    auth.uid(), p_tenant_id, p_event_type, p_entity_type, p_entity_id, p_message, p_metadata, p_before, p_after
  );
$$;

create or replace function public.rpc_generate_join_code(p_tenant_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_raw text;
  v_hash text;
  v_now timestamptz := now();
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if not public.has_tenant_role(p_tenant_id, array['administrador','diretor']) then
    raise exception 'forbidden';
  end if;

  update public.tenant_join_codes
  set status = 'revoked', revoked_by = auth.uid(), revoked_at = v_now
  where tenant_id = p_tenant_id and status = 'active';

  v_raw := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 12));
  v_hash := encode(digest(v_raw, 'sha256'), 'hex');

  insert into public.tenant_join_codes (tenant_id, code_hash, expires_at, created_by)
  values (p_tenant_id, v_hash, v_now + interval '24 hours', auth.uid());

  perform public.log_tenant_security_event(
    p_tenant_id,
    'join_code_regenerated',
    'tenant_join_code',
    null,
    'Join code regenerated with forced revocation of prior active code',
    jsonb_build_object('expires_in_hours', 24)
  );

  return v_raw;
end;
$$;

create or replace function public.rpc_request_tenant_access_with_join_code(p_tenant_id uuid, p_join_code text, p_role text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_hash text;
  v_code public.tenant_join_codes;
  v_membership_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_role not in ('corretor','coordenador','gerente','diretor','administrador') then raise exception 'invalid role'; end if;

  v_hash := encode(digest(upper(trim(p_join_code)), 'sha256'), 'hex');

  select * into v_code
  from public.tenant_join_codes
  where tenant_id = p_tenant_id and code_hash = v_hash and status = 'active'
  order by created_at desc limit 1;

  if v_code.id is null then raise exception 'invalid join code'; end if;
  if v_code.expires_at < now() then
    update public.tenant_join_codes set status = 'expired' where id = v_code.id;
    raise exception 'join code expired';
  end if;

  insert into public.tenant_memberships (tenant_id, user_id, role, status, requested_by)
  values (p_tenant_id, auth.uid(), p_role, 'pending', auth.uid())
  on conflict (tenant_id, user_id) do update
  set role = excluded.role, status = 'pending', requested_by = excluded.requested_by, approved_by = null, updated_at = now()
  returning id into v_membership_id;

  update public.tenant_join_codes set status = 'used', used_at = now(), used_by = auth.uid() where id = v_code.id;

  perform public.log_tenant_security_event(p_tenant_id, 'membership_request', 'tenant_membership', v_membership_id::text, 'Membership requested with valid join code', jsonb_build_object('role', p_role));
  return v_membership_id;
end;
$$;

grant select on public.tenant_join_codes to authenticated;
grant execute on function public.rpc_request_tenant_access_with_join_code(uuid, text, text) to authenticated;
