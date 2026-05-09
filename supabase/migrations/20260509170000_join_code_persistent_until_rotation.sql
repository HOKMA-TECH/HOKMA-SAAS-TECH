alter table public.tenant_join_codes
add column if not exists plain_code text;

create unique index if not exists uq_tenant_join_codes_plain_code_active
on public.tenant_join_codes (tenant_id, plain_code)
where status = 'active' and plain_code is not null;

create or replace function public.rpc_generate_join_code(p_tenant_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_raw text;
  v_hash text;
  v_existing public.tenant_join_codes;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if not public.has_tenant_role(p_tenant_id, array['administrador','diretor']) then
    raise exception 'forbidden';
  end if;

  select * into v_existing
  from public.tenant_join_codes
  where tenant_id = p_tenant_id and status = 'active'
  order by created_at desc
  limit 1;

  if v_existing.id is not null and v_existing.plain_code is not null then
    return v_existing.plain_code;
  end if;

  v_raw := upper(substr(md5(random()::text || clock_timestamp()::text || auth.uid()::text), 1, 12));
  v_hash := md5(v_raw);

  insert into public.tenant_join_codes (tenant_id, code_hash, plain_code, expires_at, created_by)
  values (p_tenant_id, v_hash, v_raw, 'infinity'::timestamptz, auth.uid());

  perform public.log_tenant_security_event(
    p_tenant_id,
    'join_code_created',
    'tenant_join_code',
    null,
    'Persistent join code created (valid until explicit rotation)',
    jsonb_build_object('mode', 'persistent')
  );

  return v_raw;
end;
$$;

create or replace function public.rpc_rotate_join_code(p_tenant_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_raw text;
  v_hash text;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if not public.has_tenant_role(p_tenant_id, array['administrador','diretor']) then
    raise exception 'forbidden';
  end if;

  update public.tenant_join_codes
  set status = 'revoked', revoked_by = auth.uid(), revoked_at = now()
  where tenant_id = p_tenant_id and status = 'active';

  v_raw := upper(substr(md5(random()::text || clock_timestamp()::text || auth.uid()::text), 1, 12));
  v_hash := md5(v_raw);

  insert into public.tenant_join_codes (tenant_id, code_hash, plain_code, expires_at, created_by)
  values (p_tenant_id, v_hash, v_raw, 'infinity'::timestamptz, auth.uid());

  perform public.log_tenant_security_event(
    p_tenant_id,
    'join_code_rotated',
    'tenant_join_code',
    null,
    'Join code rotated by tenant admin',
    jsonb_build_object('mode', 'persistent')
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

  v_hash := md5(upper(trim(p_join_code)));

  select * into v_code
  from public.tenant_join_codes
  where tenant_id = p_tenant_id and code_hash = v_hash and status = 'active'
  order by created_at desc limit 1;

  if v_code.id is null then raise exception 'invalid join code'; end if;

  insert into public.tenant_memberships (tenant_id, user_id, role, status, requested_by)
  values (p_tenant_id, auth.uid(), p_role, 'pending', auth.uid())
  on conflict (tenant_id, user_id) do update
  set role = excluded.role, status = 'pending', requested_by = excluded.requested_by, approved_by = null, updated_at = now()
  returning id into v_membership_id;

  perform public.log_tenant_security_event(p_tenant_id, 'membership_request', 'tenant_membership', v_membership_id::text, 'Membership requested with valid join code', jsonb_build_object('role', p_role));
  return v_membership_id;
end;
$$;

grant execute on function public.rpc_generate_join_code(uuid) to authenticated;
grant execute on function public.rpc_rotate_join_code(uuid) to authenticated;
grant execute on function public.rpc_request_tenant_access_with_join_code(uuid, text, text) to authenticated;
