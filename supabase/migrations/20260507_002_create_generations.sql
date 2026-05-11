create table if not exists public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  niche text not null,
  audience text,
  topic text not null,
  tone text,
  result_json jsonb not null,
  created_at timestamp with time zone not null default now()
);

create index if not exists generations_user_id_created_at_idx
  on public.generations (user_id, created_at desc);

alter table public.generations enable row level security;

create policy "Generations are viewable by owner" on public.generations
  for select
  using (auth.uid() = user_id);

create policy "Generations are insertable by owner" on public.generations
  for insert
  with check (auth.uid() = user_id);

create policy "Generations are updatable by owner" on public.generations
  for update
  using (auth.uid() = user_id);

create policy "Generations are deletable by owner" on public.generations
  for delete
  using (auth.uid() = user_id);
