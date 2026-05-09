create extension if not exists pgcrypto;

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

grant execute on function public.rpc_generate_join_code(uuid) to authenticated;
