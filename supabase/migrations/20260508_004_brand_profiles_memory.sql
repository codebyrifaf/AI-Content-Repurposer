alter table public.brand_profiles
  add column if not exists profile_version integer not null default 1,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists brand_profiles_user_updated_at_idx
  on public.brand_profiles (user_id, updated_at desc);

create index if not exists brand_profiles_user_name_idx
  on public.brand_profiles (user_id, lower(name));
