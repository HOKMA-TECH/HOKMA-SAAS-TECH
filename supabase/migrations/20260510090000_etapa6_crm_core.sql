create table if not exists public.crm_leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  directorate_id uuid null references public.directorates(id) on delete set null,
  team_id uuid null references public.teams(id) on delete set null,
  coordination_id uuid null references public.coordinations(id) on delete set null,
  created_by_user_id uuid not null references auth.users(id) on delete restrict,
  full_name text not null,
  email text null,
  phone text null,
  document_number text null,
  source text null,
  stage text not null check (stage in ('novo','em_contato','qualificado','proposta','negociacao','ganho','perdido')),
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_clients (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  directorate_id uuid null references public.directorates(id) on delete set null,
  team_id uuid null references public.teams(id) on delete set null,
  coordination_id uuid null references public.coordinations(id) on delete set null,
  created_by_user_id uuid not null references auth.users(id) on delete restrict,
  lead_id uuid null references public.crm_leads(id) on delete set null,
  full_name text not null,
  email text null,
  phone text null,
  document_number text null,
  source text null,
  stage text not null check (stage in ('novo','em_contato','qualificado','proposta','negociacao','ganho','perdido')),
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.crm_notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid null references public.crm_leads(id) on delete cascade,
  client_id uuid null references public.crm_clients(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete restrict,
  note text not null,
  created_at timestamptz not null default now(),
  constraint crm_notes_target_check check ((lead_id is not null and client_id is null) or (lead_id is null and client_id is not null))
);

create table if not exists public.crm_stage_history (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  lead_id uuid null references public.crm_leads(id) on delete cascade,
  client_id uuid null references public.crm_clients(id) on delete cascade,
  changed_by_user_id uuid not null references auth.users(id) on delete restrict,
  from_stage text null,
  to_stage text not null check (to_stage in ('novo','em_contato','qualificado','proposta','negociacao','ganho','perdido')),
  event_type text not null check (event_type in ('lead_created','client_created','stage_changed','lead_converted','owner_changed','note_added','access_denied')),
  event_note text null,
  created_at timestamptz not null default now(),
  constraint crm_stage_history_target_check check ((lead_id is not null and client_id is null) or (lead_id is null and client_id is not null))
);

create index if not exists idx_crm_leads_tenant on public.crm_leads(tenant_id);
create index if not exists idx_crm_clients_tenant on public.crm_clients(tenant_id);
create index if not exists idx_crm_notes_tenant on public.crm_notes(tenant_id);
create index if not exists idx_crm_stage_hist_tenant on public.crm_stage_history(tenant_id);

create or replace function public.crm_can_access_scope(
  p_tenant_id uuid,
  p_owner_user_id uuid,
  p_directorate_id uuid,
  p_team_id uuid,
  p_coordination_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_user_id uuid;
  v_dir uuid;
  v_team uuid;
  v_coord uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then return false; end if;
  if public.is_platform_master_admin() then return false; end if;
  select role, directorate_id, team_id, coordination_id into v_role, v_dir, v_team, v_coord
  from public.tenant_memberships
  where tenant_id = p_tenant_id and user_id = v_user_id and status = 'active'
  limit 1;
  if v_role is null then return false; end if;
  if v_role in ('administrador','diretor') then return true; end if;
  if v_role = 'gerente' then return p_team_id is not distinct from v_team or p_owner_user_id = v_user_id; end if;
  if v_role = 'coordenador' then return p_coordination_id is not distinct from v_coord or p_owner_user_id = v_user_id; end if;
  return p_owner_user_id = v_user_id;
end;
$$;

create or replace function public.crm_log_event(
  p_tenant_id uuid,
  p_event text,
  p_lead_id uuid,
  p_client_id uuid,
  p_from_stage text,
  p_to_stage text,
  p_note text
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.crm_stage_history (tenant_id, lead_id, client_id, changed_by_user_id, from_stage, to_stage, event_type, event_note)
  values (p_tenant_id, p_lead_id, p_client_id, auth.uid(), p_from_stage, coalesce(p_to_stage, 'novo'), p_event, p_note);
$$;

create or replace function public.rpc_crm_create_lead(
  p_tenant_id uuid, p_full_name text, p_email text, p_phone text, p_document_number text, p_source text, p_owner_user_id uuid, p_directorate_id uuid, p_team_id uuid, p_coordination_id uuid
) returns uuid
language plpgsql security definer set search_path=public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  if not public.has_tenant_role(p_tenant_id, array['corretor','coordenador','gerente','diretor','administrador']) then raise exception 'forbidden'; end if;
  if not public.crm_can_access_scope(p_tenant_id, p_owner_user_id, p_directorate_id, p_team_id, p_coordination_id) then raise exception 'forbidden scope'; end if;
  insert into public.crm_leads (tenant_id, owner_user_id, directorate_id, team_id, coordination_id, created_by_user_id, full_name, email, phone, document_number, source, stage)
  values (p_tenant_id, p_owner_user_id, p_directorate_id, p_team_id, p_coordination_id, auth.uid(), p_full_name, p_email, p_phone, p_document_number, p_source, 'novo')
  returning id into v_id;
  perform public.crm_log_event(p_tenant_id, 'lead_created', v_id, null, null, 'novo', 'Lead created');
  return v_id;
end; $$;

create or replace function public.rpc_crm_list_leads(p_tenant_id uuid)
returns setof public.crm_leads
language sql security definer set search_path=public as $$
  select l.* from public.crm_leads l
  where l.tenant_id = p_tenant_id and public.crm_can_access_scope(l.tenant_id, l.owner_user_id, l.directorate_id, l.team_id, l.coordination_id)
  order by l.updated_at desc;
$$;

create or replace function public.rpc_crm_convert_lead_to_client(p_lead_id uuid)
returns uuid
language plpgsql security definer set search_path=public as $$
declare v_lead public.crm_leads; v_client_id uuid;
begin
  select * into v_lead from public.crm_leads where id = p_lead_id;
  if v_lead.id is null then raise exception 'lead not found'; end if;
  if not public.crm_can_access_scope(v_lead.tenant_id, v_lead.owner_user_id, v_lead.directorate_id, v_lead.team_id, v_lead.coordination_id) then raise exception 'forbidden scope'; end if;
  insert into public.crm_clients (tenant_id, owner_user_id, directorate_id, team_id, coordination_id, created_by_user_id, lead_id, full_name, email, phone, document_number, source, stage)
  values (v_lead.tenant_id, v_lead.owner_user_id, v_lead.directorate_id, v_lead.team_id, v_lead.coordination_id, auth.uid(), v_lead.id, v_lead.full_name, v_lead.email, v_lead.phone, v_lead.document_number, v_lead.source, v_lead.stage)
  returning id into v_client_id;
  perform public.crm_log_event(v_lead.tenant_id, 'lead_converted', v_lead.id, v_client_id, v_lead.stage, v_lead.stage, 'Lead converted to client');
  return v_client_id;
end; $$;

alter table public.crm_leads enable row level security;
alter table public.crm_clients enable row level security;
alter table public.crm_notes enable row level security;
alter table public.crm_stage_history enable row level security;

create policy crm_leads_select on public.crm_leads for select to authenticated using (public.crm_can_access_scope(tenant_id, owner_user_id, directorate_id, team_id, coordination_id));
create policy crm_clients_select on public.crm_clients for select to authenticated using (public.crm_can_access_scope(tenant_id, owner_user_id, directorate_id, team_id, coordination_id));
create policy crm_notes_select on public.crm_notes for select to authenticated using (public.is_member_of_tenant(tenant_id));
create policy crm_stage_history_select on public.crm_stage_history for select to authenticated using (public.is_member_of_tenant(tenant_id));

grant execute on function public.crm_can_access_scope(uuid, uuid, uuid, uuid, uuid) to authenticated;
grant execute on function public.rpc_crm_create_lead(uuid, text, text, text, text, text, uuid, uuid, uuid, uuid) to authenticated;
grant execute on function public.rpc_crm_list_leads(uuid) to authenticated;
grant execute on function public.rpc_crm_convert_lead_to_client(uuid) to authenticated;
