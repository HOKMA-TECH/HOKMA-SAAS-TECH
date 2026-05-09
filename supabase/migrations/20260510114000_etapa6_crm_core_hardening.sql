create or replace function public.rpc_crm_reassign_lead_owner(p_lead_id uuid, p_new_owner_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_lead public.crm_leads;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  select * into v_lead from public.crm_leads where id = p_lead_id;
  if v_lead.id is null then raise exception 'lead not found'; end if;
  if not public.has_tenant_role(v_lead.tenant_id, array['coordenador','gerente','diretor','administrador']) then raise exception 'forbidden'; end if;
  if not public.crm_can_access_scope(v_lead.tenant_id, v_lead.owner_user_id, v_lead.directorate_id, v_lead.team_id, v_lead.coordination_id) then raise exception 'forbidden scope'; end if;
  update public.crm_leads set owner_user_id = p_new_owner_user_id, updated_at = now() where id = p_lead_id;
  perform public.crm_log_event(v_lead.tenant_id, 'owner_changed', p_lead_id, null, v_lead.stage, v_lead.stage, 'Lead owner reassigned');
  return true;
end;
$$;

create or replace function public.rpc_crm_get_client_detail(p_client_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_client public.crm_clients; v_notes jsonb; v_history jsonb;
begin
  select * into v_client from public.crm_clients where id = p_client_id;
  if v_client.id is null or not public.crm_can_manage_client(p_client_id) then raise exception 'forbidden'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', n.id, 'note', n.note, 'author_user_id', n.author_user_id, 'created_at', n.created_at) order by n.created_at desc), '[]'::jsonb) into v_notes
  from public.crm_notes n where n.client_id = p_client_id;
  select coalesce(jsonb_agg(jsonb_build_object('id', h.id, 'event_type', h.event_type, 'from_stage', h.from_stage, 'to_stage', h.to_stage, 'changed_by_user_id', h.changed_by_user_id, 'created_at', h.created_at) order by h.created_at desc), '[]'::jsonb) into v_history
  from public.crm_stage_history h where h.client_id = p_client_id;
  return jsonb_build_object('client', to_jsonb(v_client), 'notes', v_notes, 'history', v_history);
end;
$$;

create or replace function public.rpc_crm_list_leads(
  p_tenant_id uuid,
  p_search text default null,
  p_stage text default null,
  p_owner_user_id uuid default null,
  p_status text default null,
  p_source text default null
)
returns setof public.crm_leads
language sql security definer set search_path=public as $$
  select l.* from public.crm_leads l
  where l.tenant_id = p_tenant_id
    and public.crm_can_access_scope(l.tenant_id, l.owner_user_id, l.directorate_id, l.team_id, l.coordination_id)
    and (p_search is null or l.full_name ilike '%' || p_search || '%' or coalesce(l.email, '') ilike '%' || p_search || '%' or coalesce(l.phone, '') ilike '%' || p_search || '%')
    and (p_stage is null or l.stage = p_stage)
    and (p_owner_user_id is null or l.owner_user_id = p_owner_user_id)
    and (p_status is null or l.status = p_status)
    and (p_source is null or coalesce(l.source, '') = p_source)
  order by l.updated_at desc;
$$;

create or replace function public.rpc_crm_list_clients(
  p_tenant_id uuid,
  p_search text default null,
  p_stage text default null,
  p_owner_user_id uuid default null,
  p_status text default null,
  p_source text default null
)
returns setof public.crm_clients
language sql security definer set search_path=public as $$
  select c.* from public.crm_clients c
  where c.tenant_id = p_tenant_id
    and public.crm_can_access_scope(c.tenant_id, c.owner_user_id, c.directorate_id, c.team_id, c.coordination_id)
    and (p_search is null or c.full_name ilike '%' || p_search || '%' or coalesce(c.email, '') ilike '%' || p_search || '%' or coalesce(c.phone, '') ilike '%' || p_search || '%')
    and (p_stage is null or c.stage = p_stage)
    and (p_owner_user_id is null or c.owner_user_id = p_owner_user_id)
    and (p_status is null or c.status = p_status)
    and (p_source is null or coalesce(c.source, '') = p_source)
  order by c.updated_at desc;
$$;

grant execute on function public.rpc_crm_reassign_lead_owner(uuid, uuid) to authenticated;
grant execute on function public.rpc_crm_get_client_detail(uuid) to authenticated;
grant execute on function public.rpc_crm_list_leads(uuid, text, text, uuid, text, text) to authenticated;
grant execute on function public.rpc_crm_list_clients(uuid, text, text, uuid, text, text) to authenticated;
