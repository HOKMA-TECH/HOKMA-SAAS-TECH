create table if not exists public.auth_attempts (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  action text not null check (action in ('sign_in', 'sign_up', 'password_recovery')),
  success boolean not null default false,
  details jsonb not null default '{}'::jsonb,
  attempted_at timestamptz not null default now()
);

create index if not exists idx_auth_attempts_identifier_action_time
  on public.auth_attempts(identifier, action, attempted_at desc);

alter table public.auth_attempts enable row level security;
alter table public.auth_attempts force row level security;

create or replace function public.rpc_auth_rate_limit_check(
  p_identifier text,
  p_action text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window interval := interval '15 minutes';
  v_max_failures int := 5;
  v_failure_count int := 0;
  v_last_failure timestamptz;
  v_retry_after_seconds int := 0;
begin
  if p_identifier is null or length(trim(p_identifier)) < 3 then
    return jsonb_build_object('allowed', false, 'retry_after_seconds', 60);
  end if;

  if p_action not in ('sign_in', 'sign_up', 'password_recovery') then
    return jsonb_build_object('allowed', false, 'retry_after_seconds', 60);
  end if;

  select count(*), max(attempted_at)
    into v_failure_count, v_last_failure
  from public.auth_attempts
  where identifier = lower(trim(p_identifier))
    and action = p_action
    and success = false
    and attempted_at >= now() - v_window;

  if v_failure_count >= v_max_failures and v_last_failure is not null then
    v_retry_after_seconds := greatest(1, ceil(extract(epoch from ((v_last_failure + v_window) - now())))::int);
    return jsonb_build_object('allowed', false, 'retry_after_seconds', v_retry_after_seconds);
  end if;

  return jsonb_build_object('allowed', true, 'retry_after_seconds', 0);
end;
$$;

create or replace function public.rpc_record_auth_attempt(
  p_identifier text,
  p_action text,
  p_success boolean,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_identifier is null or length(trim(p_identifier)) < 3 then
    return;
  end if;

  if p_action not in ('sign_in', 'sign_up', 'password_recovery') then
    return;
  end if;

  insert into public.auth_attempts(identifier, action, success, details)
  values (lower(trim(p_identifier)), p_action, p_success, coalesce(p_details, '{}'::jsonb));
end;
$$;

revoke all on public.auth_attempts from anon, authenticated;
revoke all on function public.rpc_auth_rate_limit_check(text, text) from public;
revoke all on function public.rpc_record_auth_attempt(text, text, boolean, jsonb) from public;

grant execute on function public.rpc_auth_rate_limit_check(text, text) to anon, authenticated;
grant execute on function public.rpc_record_auth_attempt(text, text, boolean, jsonb) to anon, authenticated;
