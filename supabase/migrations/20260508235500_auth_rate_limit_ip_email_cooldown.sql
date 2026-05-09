create or replace function public.rpc_auth_rate_limit_check_v2(
  p_identifier text,
  p_ip text,
  p_action text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email_window interval := interval '10 minutes';
  v_ip_window interval := interval '5 minutes';
  v_email_limit int := 5;
  v_ip_limit int := 10;
  v_email_failures int := 0;
  v_ip_failures int := 0;
  v_cooldown_active bool := false;
  v_retry_after_seconds int := 0;
begin
  if p_identifier is null or length(trim(p_identifier)) < 3 then
    return jsonb_build_object('allowed', false, 'retry_after_seconds', 60);
  end if;

  if p_action not in ('sign_in', 'sign_up', 'password_recovery') then
    return jsonb_build_object('allowed', false, 'retry_after_seconds', 60);
  end if;

  select count(*)
    into v_email_failures
  from public.auth_attempts
  where identifier = lower(trim(p_identifier))
    and action = p_action
    and success = false
    and attempted_at >= now() - v_email_window;

  if p_ip is not null and length(trim(p_ip)) > 0 then
    select count(*)
      into v_ip_failures
    from public.auth_attempts
    where action = p_action
      and success = false
      and details->>'ip' = trim(p_ip)
      and attempted_at >= now() - v_ip_window;
  end if;

  select exists(
    select 1
    from public.auth_attempts
    where identifier = lower(trim(p_identifier))
      and action = p_action
      and success = false
      and coalesce((details->>'cooldown_until')::timestamptz, to_timestamp(0)) > now()
    order by attempted_at desc
    limit 1
  ) into v_cooldown_active;

  if v_cooldown_active or v_email_failures >= v_email_limit or v_ip_failures >= v_ip_limit then
    select coalesce(
      max(greatest(1, ceil(extract(epoch from (((details->>'cooldown_until')::timestamptz) - now())))::int)),
      30
    )
    into v_retry_after_seconds
    from public.auth_attempts
    where identifier = lower(trim(p_identifier))
      and action = p_action
      and success = false
      and details ? 'cooldown_until';

    return jsonb_build_object('allowed', false, 'retry_after_seconds', greatest(v_retry_after_seconds, 1));
  end if;

  return jsonb_build_object('allowed', true, 'retry_after_seconds', 0);
end;
$$;

create or replace function public.rpc_record_auth_attempt_v2(
  p_identifier text,
  p_ip text,
  p_action text,
  p_success boolean,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_failures_last_hour int := 0;
  v_cooldown_seconds int := 0;
  v_details jsonb := coalesce(p_details, '{}'::jsonb);
begin
  if p_identifier is null or length(trim(p_identifier)) < 3 then
    return;
  end if;

  if p_action not in ('sign_in', 'sign_up', 'password_recovery') then
    return;
  end if;

  if p_success then
    insert into public.auth_attempts(identifier, action, success, details)
    values (lower(trim(p_identifier)), p_action, true, jsonb_set(v_details, '{ip}', to_jsonb(coalesce(p_ip, 'unknown'))));
    return;
  end if;

  select count(*)
    into v_failures_last_hour
  from public.auth_attempts
  where identifier = lower(trim(p_identifier))
    and action = p_action
    and success = false
    and attempted_at >= now() - interval '1 hour';

  v_cooldown_seconds := case
    when v_failures_last_hour >= 6 then 120
    when v_failures_last_hour >= 3 then 60
    else 30
  end;

  v_details := jsonb_set(v_details, '{ip}', to_jsonb(coalesce(p_ip, 'unknown')));
  v_details := jsonb_set(v_details, '{cooldown_until}', to_jsonb((now() + make_interval(secs => v_cooldown_seconds))::text));

  insert into public.auth_attempts(identifier, action, success, details)
  values (lower(trim(p_identifier)), p_action, false, v_details);
end;
$$;

revoke all on function public.rpc_auth_rate_limit_check_v2(text, text, text) from public;
revoke all on function public.rpc_record_auth_attempt_v2(text, text, text, boolean, jsonb) from public;
grant execute on function public.rpc_auth_rate_limit_check_v2(text, text, text) to anon, authenticated;
grant execute on function public.rpc_record_auth_attempt_v2(text, text, text, boolean, jsonb) to anon, authenticated;
