create table if not exists public.brand_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  business_description text,
  target_audience text,
  offer text,
  tone_of_voice text,
  cta_style text,
  platform_focus text[] not null default '{}',
  brand_keywords text[] not null default '{}',
  forbidden_phrases text[] not null default '{}',
  writing_style text,
  posting_goals text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists brand_profiles_user_id_idx
  on public.brand_profiles (user_id);

create index if not exists brand_profiles_updated_at_idx
  on public.brand_profiles (updated_at desc);

alter table public.brand_profiles enable row level security;

create policy "Brand profiles are viewable by owner" on public.brand_profiles
  for select using (auth.uid() = user_id);

create policy "Brand profiles are insertable by owner" on public.brand_profiles
  for insert with check (auth.uid() = user_id);

create policy "Brand profiles are updatable by owner" on public.brand_profiles
  for update using (auth.uid() = user_id);

create policy "Brand profiles are deletable by owner" on public.brand_profiles
  for delete using (auth.uid() = user_id);

create or replace function public.set_brand_profile_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_brand_profile_updated_at on public.brand_profiles;
create trigger set_brand_profile_updated_at
  before update on public.brand_profiles
  for each row execute procedure public.set_brand_profile_updated_at();
