create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamp with time zone not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by owner" on public.profiles
  for select
  using (auth.uid() = id);

create policy "Profiles are insertable by owner" on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Profiles are updatable by owner" on public.profiles
  for update
  using (auth.uid() = id);
