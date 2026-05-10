alter table public.crm_leads add column if not exists lost_reason text null;
alter table public.crm_clients add column if not exists lost_reason text null;

create table if not exists public.crm_access_audit (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null,
  actor_user_id uuid null,
  event_type text not null,
  entity_type text not null,
  entity_id uuid null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.crm_audit_access_denied(
  p_tenant_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_reason text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.crm_access_audit (tenant_id, actor_user_id, event_type, entity_type, entity_id, metadata)
  values (p_tenant_id, auth.uid(), 'access_denied', p_entity_type, p_entity_id, jsonb_build_object('reason', p_reason) || coalesce(p_metadata, '{}'::jsonb));
$$;

create or replace function public.mask_email(p_email text)
returns text
language sql
immutable
as $$
  select case
    when p_email is null or position('@' in p_email) = 0 then p_email
    else left(split_part(p_email, '@', 1), 2) || '***@' || split_part(p_email, '@', 2)
  end;
$$;

create or replace function public.mask_phone(p_phone text)
returns text
language sql
immutable
as $$
  select case when p_phone is null then null else '**' || right(regexp_replace(p_phone, '\\D', '', 'g'), 4) end;
$$;

create or replace function public.mask_document(p_doc text)
returns text
language sql
immutable
as $$
  select case when p_doc is null then null else '***' || right(regexp_replace(p_doc, '\\D', '', 'g'), 2) end;
$$;

create or replace function public.rpc_crm_list_leads(
  p_tenant_id uuid,
  p_search text default null,
  p_stage text default null,
  p_owner_user_id uuid default null,
  p_status text default null,
  p_source text default null
)
returns table (
  id uuid, tenant_id uuid, owner_user_id uuid, directorate_id uuid, team_id uuid, coordination_id uuid, created_by_user_id uuid,
  full_name text, email text, phone text, document_number text, source text, stage text, status text, lost_reason text, created_at timestamptz, updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare v_sensitive boolean;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not public.is_member_of_tenant(p_tenant_id) then
    perform public.crm_audit_access_denied(p_tenant_id, 'lead', null, 'not_member', '{}'::jsonb);
    raise exception 'forbidden';
  end if;
  v_sensitive := public.has_tenant_role(p_tenant_id, array['coordenador','gerente','diretor','administrador']);

  return query
  select l.id, l.tenant_id, l.owner_user_id, l.directorate_id, l.team_id, l.coordination_id, l.created_by_user_id,
    l.full_name,
    case when v_sensitive then l.email else public.mask_email(l.email) end,
    case when v_sensitive then l.phone else public.mask_phone(l.phone) end,
    case when v_sensitive then l.document_number else public.mask_document(l.document_number) end,
    l.source, l.stage, l.status, l.lost_reason, l.created_at, l.updated_at
  from public.crm_leads l
  where l.tenant_id = p_tenant_id
    and public.crm_can_access_scope(l.tenant_id, l.owner_user_id, l.directorate_id, l.team_id, l.coordination_id)
    and (p_search is null or l.full_name ilike '%' || p_search || '%' or coalesce(l.email, '') ilike '%' || p_search || '%' or coalesce(l.phone, '') ilike '%' || p_search || '%')
    and (p_stage is null or l.stage = p_stage)
    and (p_owner_user_id is null or l.owner_user_id = p_owner_user_id)
    and (p_status is null or l.status = p_status)
    and (p_source is null or coalesce(l.source, '') = p_source)
  order by l.updated_at desc;
end;
$$;

create or replace function public.rpc_crm_convert_lead_to_client(p_lead_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_lead public.crm_leads; v_client_id uuid;
begin
  select * into v_lead from public.crm_leads where id = p_lead_id;
  if v_lead.id is null then raise exception 'lead not found'; end if;
  if exists(select 1 from public.crm_clients c where c.lead_id = p_lead_id) then
    perform public.crm_audit_access_denied(v_lead.tenant_id, 'lead', p_lead_id, 'duplicate_conversion', '{}'::jsonb);
    raise exception 'lead already converted';
  end if;
  if not public.crm_can_manage_lead(p_lead_id) then
    perform public.crm_audit_access_denied(v_lead.tenant_id, 'lead', p_lead_id, 'convert_forbidden', '{}'::jsonb);
    raise exception 'forbidden scope';
  end if;
  insert into public.crm_clients (tenant_id, owner_user_id, directorate_id, team_id, coordination_id, created_by_user_id, lead_id, full_name, email, phone, document_number, source, stage)
  values (v_lead.tenant_id, v_lead.owner_user_id, v_lead.directorate_id, v_lead.team_id, v_lead.coordination_id, auth.uid(), v_lead.id, v_lead.full_name, v_lead.email, v_lead.phone, v_lead.document_number, v_lead.source, v_lead.stage)
  returning id into v_client_id;
  perform public.crm_log_event(v_lead.tenant_id, 'lead_converted', v_lead.id, v_client_id, v_lead.stage, v_lead.stage, 'Lead converted to client');
  return v_client_id;
end;
$$;

create or replace function public.rpc_crm_move_stage(p_lead_id uuid, p_client_id uuid, p_to_stage text, p_reason text default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_from_stage text; v_tenant_id uuid;
begin
  if p_to_stage = 'perdido' and (p_reason is null or length(trim(p_reason)) < 3) then
    raise exception 'lost_reason_required';
  end if;
  if p_lead_id is not null then
    select stage, tenant_id into v_from_stage, v_tenant_id from public.crm_leads where id = p_lead_id;
    if v_from_stage is null or not public.crm_can_manage_lead(p_lead_id) then
      perform public.crm_audit_access_denied(v_tenant_id, 'lead', p_lead_id, 'move_stage_forbidden', '{}'::jsonb);
      raise exception 'forbidden';
    end if;
    update public.crm_leads set stage = p_to_stage, lost_reason = case when p_to_stage='perdido' then p_reason else null end, updated_at = now() where id = p_lead_id;
    perform public.crm_log_event(v_tenant_id, 'stage_changed', p_lead_id, null, v_from_stage, p_to_stage, coalesce(p_reason,'Lead stage changed'));
    return true;
  end if;
  select stage, tenant_id into v_from_stage, v_tenant_id from public.crm_clients where id = p_client_id;
  if v_from_stage is null or not public.crm_can_manage_client(p_client_id) then
    perform public.crm_audit_access_denied(v_tenant_id, 'client', p_client_id, 'move_stage_forbidden', '{}'::jsonb);
    raise exception 'forbidden';
  end if;
  update public.crm_clients set stage = p_to_stage, lost_reason = case when p_to_stage='perdido' then p_reason else null end, updated_at = now() where id = p_client_id;
  perform public.crm_log_event(v_tenant_id, 'stage_changed', null, p_client_id, v_from_stage, p_to_stage, coalesce(p_reason,'Client stage changed'));
  return true;
end;
$$;

grant execute on function public.rpc_crm_move_stage(uuid, uuid, text, text) to authenticated;
grant execute on function public.rpc_crm_list_leads(uuid, text, text, uuid, text, text) to authenticated;
