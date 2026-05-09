create or replace function public.crm_can_manage_lead(p_lead_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.crm_leads l
    where l.id = p_lead_id
      and public.crm_can_access_scope(l.tenant_id, l.owner_user_id, l.directorate_id, l.team_id, l.coordination_id)
  );
$$;

create or replace function public.crm_can_manage_client(p_client_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.crm_clients c
    where c.id = p_client_id
      and public.crm_can_access_scope(c.tenant_id, c.owner_user_id, c.directorate_id, c.team_id, c.coordination_id)
  );
$$;

create or replace function public.rpc_crm_add_note(p_lead_id uuid, p_client_id uuid, p_note text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_note_id uuid; v_tenant_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_note is null or length(trim(p_note)) < 2 then raise exception 'invalid note'; end if;
  if (p_lead_id is null and p_client_id is null) or (p_lead_id is not null and p_client_id is not null) then
    raise exception 'invalid target';
  end if;

  if p_lead_id is not null then
    select tenant_id into v_tenant_id from public.crm_leads where id = p_lead_id;
    if v_tenant_id is null or not public.crm_can_manage_lead(p_lead_id) then raise exception 'forbidden'; end if;
    insert into public.crm_notes (tenant_id, lead_id, client_id, author_user_id, note)
    values (v_tenant_id, p_lead_id, null, auth.uid(), trim(p_note)) returning id into v_note_id;
    perform public.crm_log_event(v_tenant_id, 'note_added', p_lead_id, null, null, 'novo', 'Note added to lead');
    return v_note_id;
  end if;

  select tenant_id into v_tenant_id from public.crm_clients where id = p_client_id;
  if v_tenant_id is null or not public.crm_can_manage_client(p_client_id) then raise exception 'forbidden'; end if;
  insert into public.crm_notes (tenant_id, lead_id, client_id, author_user_id, note)
  values (v_tenant_id, null, p_client_id, auth.uid(), trim(p_note)) returning id into v_note_id;
  perform public.crm_log_event(v_tenant_id, 'note_added', null, p_client_id, null, 'novo', 'Note added to client');
  return v_note_id;
end;
$$;

create or replace function public.rpc_crm_move_stage(p_lead_id uuid, p_client_id uuid, p_to_stage text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare v_from_stage text; v_tenant_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if p_to_stage not in ('novo','em_contato','qualificado','proposta','negociacao','ganho','perdido') then raise exception 'invalid stage'; end if;

  if p_lead_id is not null then
    select stage, tenant_id into v_from_stage, v_tenant_id from public.crm_leads where id = p_lead_id;
    if v_from_stage is null or not public.crm_can_manage_lead(p_lead_id) then raise exception 'forbidden'; end if;
    update public.crm_leads set stage = p_to_stage, updated_at = now() where id = p_lead_id;
    perform public.crm_log_event(v_tenant_id, 'stage_changed', p_lead_id, null, v_from_stage, p_to_stage, 'Lead stage changed');
    return true;
  end if;

  select stage, tenant_id into v_from_stage, v_tenant_id from public.crm_clients where id = p_client_id;
  if v_from_stage is null or not public.crm_can_manage_client(p_client_id) then raise exception 'forbidden'; end if;
  update public.crm_clients set stage = p_to_stage, updated_at = now() where id = p_client_id;
  perform public.crm_log_event(v_tenant_id, 'stage_changed', null, p_client_id, v_from_stage, p_to_stage, 'Client stage changed');
  return true;
end;
$$;

create or replace function public.rpc_crm_get_lead_detail(p_lead_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare v_lead public.crm_leads; v_notes jsonb; v_history jsonb;
begin
  select * into v_lead from public.crm_leads where id = p_lead_id;
  if v_lead.id is null or not public.crm_can_manage_lead(p_lead_id) then raise exception 'forbidden'; end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', n.id, 'note', n.note, 'author_user_id', n.author_user_id, 'created_at', n.created_at) order by n.created_at desc), '[]'::jsonb) into v_notes
  from public.crm_notes n where n.lead_id = p_lead_id;
  select coalesce(jsonb_agg(jsonb_build_object('id', h.id, 'event_type', h.event_type, 'from_stage', h.from_stage, 'to_stage', h.to_stage, 'changed_by_user_id', h.changed_by_user_id, 'created_at', h.created_at) order by h.created_at desc), '[]'::jsonb) into v_history
  from public.crm_stage_history h where h.lead_id = p_lead_id;
  return jsonb_build_object('lead', to_jsonb(v_lead), 'notes', v_notes, 'history', v_history);
end;
$$;

drop policy if exists crm_notes_select on public.crm_notes;
create policy crm_notes_select on public.crm_notes for select to authenticated
using (
  (lead_id is not null and public.crm_can_manage_lead(lead_id))
  or
  (client_id is not null and public.crm_can_manage_client(client_id))
);

drop policy if exists crm_stage_history_select on public.crm_stage_history;
create policy crm_stage_history_select on public.crm_stage_history for select to authenticated
using (
  (lead_id is not null and public.crm_can_manage_lead(lead_id))
  or
  (client_id is not null and public.crm_can_manage_client(client_id))
);

grant execute on function public.crm_can_manage_lead(uuid) to authenticated;
grant execute on function public.crm_can_manage_client(uuid) to authenticated;
grant execute on function public.rpc_crm_add_note(uuid, uuid, text) to authenticated;
grant execute on function public.rpc_crm_move_stage(uuid, uuid, text) to authenticated;
grant execute on function public.rpc_crm_get_lead_detail(uuid) to authenticated;
