alter table public.profiles
  add column if not exists subscription_updated_at timestamp with time zone not null default now();

create index if not exists profiles_created_at_idx on public.profiles (created_at desc);
create index if not exists generations_created_at_idx on public.generations (created_at desc);
