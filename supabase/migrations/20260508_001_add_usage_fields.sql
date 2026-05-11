alter table public.profiles
  add column if not exists monthly_generations integer not null default 0,
  add column if not exists monthly_reset_date timestamp with time zone not null default date_trunc('month', now()),
  add column if not exists subscription_status text not null default 'free';

update public.profiles
  set monthly_generations = 0,
      monthly_reset_date = date_trunc('month', now()),
      subscription_status = 'free'
  where monthly_reset_date is null or subscription_status is null;

create index if not exists profiles_subscription_status_idx
  on public.profiles (subscription_status);

create or replace function public.get_usage_status(p_limit integer default 5)
returns table(
  monthly_generations integer,
  remaining integer,
  subscription_status text,
  monthly_reset_date timestamp with time zone
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_reset_start timestamp with time zone := date_trunc('month', now());
  v_profile public.profiles%rowtype;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_profile
    from public.profiles
    where id = v_user_id
    for update;

  if not found then
    insert into public.profiles (id, monthly_generations, monthly_reset_date, subscription_status)
    values (v_user_id, 0, v_reset_start, 'free')
    returning * into v_profile;
  end if;

  if v_profile.monthly_reset_date < v_reset_start then
    update public.profiles
      set monthly_generations = 0,
          monthly_reset_date = v_reset_start
      where id = v_user_id
      returning * into v_profile;
  end if;

  if v_profile.subscription_status <> 'free' then
    return query
      select v_profile.monthly_generations, null::integer, v_profile.subscription_status, v_profile.monthly_reset_date;
    return;
  end if;

  return query
    select v_profile.monthly_generations,
           greatest(p_limit - v_profile.monthly_generations, 0),
           v_profile.subscription_status,
           v_profile.monthly_reset_date;
end;
$$;

grant execute on function public.get_usage_status(integer) to authenticated;

create or replace function public.consume_generation(p_limit integer default 5)
returns table(
  allowed boolean,
  remaining integer,
  monthly_generations integer,
  subscription_status text,
  monthly_reset_date timestamp with time zone
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_reset_start timestamp with time zone := date_trunc('month', now());
  v_profile public.profiles%rowtype;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_profile
    from public.profiles
    where id = v_user_id
    for update;

  if not found then
    insert into public.profiles (id, monthly_generations, monthly_reset_date, subscription_status)
    values (v_user_id, 0, v_reset_start, 'free')
    returning * into v_profile;
  end if;

  if v_profile.monthly_reset_date < v_reset_start then
    update public.profiles
      set monthly_generations = 0,
          monthly_reset_date = v_reset_start
      where id = v_user_id
      returning * into v_profile;
  end if;

  if v_profile.subscription_status <> 'free' then
    update public.profiles
      set monthly_generations = monthly_generations + 1
      where id = v_user_id
      returning * into v_profile;

    return query
      select true, null::integer, v_profile.monthly_generations, v_profile.subscription_status, v_profile.monthly_reset_date;
    return;
  end if;

  if v_profile.monthly_generations >= p_limit then
    return query
      select false, 0, v_profile.monthly_generations, v_profile.subscription_status, v_profile.monthly_reset_date;
    return;
  end if;

  update public.profiles
    set monthly_generations = monthly_generations + 1
    where id = v_user_id
    returning * into v_profile;

  return query
    select true,
           greatest(p_limit - v_profile.monthly_generations, 0),
           v_profile.monthly_generations,
           v_profile.subscription_status,
           v_profile.monthly_reset_date;
end;
$$;

grant execute on function public.consume_generation(integer) to authenticated;

create or replace function public.refund_generation()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  update public.profiles
    set monthly_generations = greatest(monthly_generations - 1, 0)
    where id = v_user_id
      and subscription_status = 'free';

  return 1;
end;
$$;

grant execute on function public.refund_generation() to authenticated;
