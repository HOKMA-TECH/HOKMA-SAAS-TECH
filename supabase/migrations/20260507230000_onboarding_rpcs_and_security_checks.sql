create or replace function public.rpc_request_tenant_access(
  p_tenant_id uuid,
  p_role text,
  p_directorate_id uuid default null,
  p_team_id uuid default null,
  p_coordination_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membership_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if p_role not in ('corretor','coordenador','gerente','diretor','administrador') then
    raise exception 'invalid role';
  end if;

  if not exists (select 1 from public.tenants t where t.id = p_tenant_id and t.status = 'active') then
    raise exception 'tenant not found';
  end if;

  insert into public.tenant_memberships (
    tenant_id,
    user_id,
    role,
    status,
    directorate_id,
    team_id,
    coordination_id,
    requested_by
  )
  values (
    p_tenant_id,
    auth.uid(),
    p_role,
    'pending',
    p_directorate_id,
    p_team_id,
    p_coordination_id,
    auth.uid()
  )
  on conflict (tenant_id, user_id) do update
    set role = excluded.role,
        status = 'pending',
        directorate_id = excluded.directorate_id,
        team_id = excluded.team_id,
        coordination_id = excluded.coordination_id,
        requested_by = excluded.requested_by,
        approved_by = null,
        updated_at = now()
  returning id into v_membership_id;

  insert into public.tenant_admin_events (
    actor_user_id, tenant_id, event_type, entity_type, entity_id, message, metadata
  )
  values (
    auth.uid(),
    p_tenant_id,
    'membership_request',
    'tenant_membership',
    v_membership_id::text,
    'Access request submitted',
    jsonb_build_object('requested_role', p_role)
  );

  return v_membership_id;
end;
$$;

create or replace function public.rpc_review_tenant_access_request(
  p_membership_id uuid,
  p_approve boolean,
  p_message text default null
)
returns public.tenant_memberships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membership public.tenant_memberships;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select * into v_membership
  from public.tenant_memberships tm
  where tm.id = p_membership_id;

  if v_membership.id is null then
    raise exception 'membership not found';
  end if;

  if not (
    public.is_platform_master_admin()
    or public.has_tenant_role(v_membership.tenant_id, array['administrador','diretor'])
  ) then
    raise exception 'forbidden';
  end if;

  if v_membership.status <> 'pending' then
    raise exception 'membership is not pending';
  end if;

  update public.tenant_memberships tm
  set status = case when p_approve then 'active' else 'rejected' end,
      approved_by = auth.uid(),
      updated_at = now()
  where tm.id = p_membership_id
  returning * into v_membership;

  insert into public.tenant_admin_events (
    actor_user_id, tenant_id, event_type, entity_type, entity_id, message, metadata, before_value, after_value
  )
  values (
    auth.uid(),
    v_membership.tenant_id,
    case when p_approve then 'membership_approved' else 'membership_rejected' end,
    'tenant_membership',
    v_membership.id::text,
    coalesce(p_message, case when p_approve then 'Access request approved' else 'Access request rejected' end),
    jsonb_build_object('reviewed_by', auth.uid(), 'approved', p_approve),
    jsonb_build_object('status', 'pending'),
    jsonb_build_object('status', v_membership.status)
  );

  return v_membership;
end;
$$;

create or replace function public.rpc_list_tenant_memberships_secure(p_tenant_id uuid)
returns table (
  id uuid,
  tenant_id uuid,
  user_id uuid,
  role text,
  status text,
  directorate_id uuid,
  team_id uuid,
  coordination_id uuid,
  requested_by uuid,
  approved_by uuid,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    tm.id,
    tm.tenant_id,
    tm.user_id,
    tm.role,
    tm.status,
    tm.directorate_id,
    tm.team_id,
    tm.coordination_id,
    tm.requested_by,
    tm.approved_by,
    tm.created_at,
    tm.updated_at
  from public.tenant_memberships tm
  where tm.tenant_id = p_tenant_id
    and (
      public.is_platform_master_admin()
      or public.has_tenant_role(p_tenant_id, array['administrador','diretor','gerente'])
    );
$$;

create or replace function public.rpc_list_tenant_structure_secure(p_tenant_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_directorates jsonb;
  v_teams jsonb;
  v_coordinations jsonb;
begin
  if not (
    public.is_platform_master_admin() or public.is_member_of_tenant(p_tenant_id)
  ) then
    raise exception 'forbidden';
  end if;

  select coalesce(jsonb_agg(to_jsonb(d)), '[]'::jsonb)
  into v_directorates
  from public.directorates d
  where d.tenant_id = p_tenant_id;

  select coalesce(jsonb_agg(to_jsonb(t)), '[]'::jsonb)
  into v_teams
  from public.teams t
  where t.tenant_id = p_tenant_id;

  select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb)
  into v_coordinations
  from public.coordinations c
  where c.tenant_id = p_tenant_id;

  return jsonb_build_object(
    'directorates', v_directorates,
    'teams', v_teams,
    'coordinations', v_coordinations
  );
end;
$$;

revoke all on function public.rpc_request_tenant_access(uuid, text, uuid, uuid, uuid) from public;
revoke all on function public.rpc_review_tenant_access_request(uuid, boolean, text) from public;
revoke all on function public.rpc_list_tenant_memberships_secure(uuid) from public;
revoke all on function public.rpc_list_tenant_structure_secure(uuid) from public;

grant execute on function public.rpc_request_tenant_access(uuid, text, uuid, uuid, uuid) to authenticated;
grant execute on function public.rpc_review_tenant_access_request(uuid, boolean, text) to authenticated;
grant execute on function public.rpc_list_tenant_memberships_secure(uuid) to authenticated;
grant execute on function public.rpc_list_tenant_structure_secure(uuid) to authenticated;
