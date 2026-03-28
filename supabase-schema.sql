-- ================================================================
-- SIX DEGREES — Supabase Schema
-- Run this in Supabase > SQL Editor
-- ================================================================

-- Users (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  city text,
  bio text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Chains
create table public.chains (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  target_name text not null,
  target_avatar text,
  target_city text,
  degrees int,
  status text default 'active' check (status in ('active', 'completed', 'broken')),
  chain_code text unique default 'CD-' || upper(substr(md5(random()::text), 1, 6)),
  created_at timestamp with time zone default now()
);

-- Chain links (each step in the chain)
create table public.chain_links (
  id uuid default gen_random_uuid() primary key,
  chain_id uuid references public.chains(id) on delete cascade not null,
  user_id uuid references public.profiles(id),
  name text not null,
  city text,
  position int not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  created_at timestamp with time zone default now()
);

-- Verification requests
create table public.verifications (
  id uuid default gen_random_uuid() primary key,
  chain_id uuid references public.chains(id) on delete cascade not null,
  link_id uuid references public.chain_links(id) on delete cascade not null,
  requested_by uuid references public.profiles(id) not null,
  requested_email text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'declined')),
  expires_at timestamp with time zone default (now() + interval '48 hours'),
  created_at timestamp with time zone default now()
);

-- ── Row Level Security ────────────────────────────────────────────

alter table public.profiles enable row level security;
alter table public.chains enable row level security;
alter table public.chain_links enable row level security;
alter table public.verifications enable row level security;

-- Profiles: visible to all, editable by owner
create policy "Profiles are public" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Chains: visible to all, editable by owner
create policy "Chains are public" on public.chains for select using (true);
create policy "Users can create chains" on public.chains for insert with check (auth.uid() = owner_id);
create policy "Owners can update chains" on public.chains for update using (auth.uid() = owner_id);

-- Links: visible to all, insertable by chain owner
create policy "Links are public" on public.chain_links for select using (true);
create policy "Chain owners can add links" on public.chain_links for insert
  with check (exists (select 1 from public.chains where id = chain_id and owner_id = auth.uid()));
create policy "Link owners can update" on public.chain_links for update
  using (auth.uid() = user_id);

-- Verifications
create policy "Verifications visible to participants" on public.verifications for select
  using (auth.uid() = requested_by or auth.uid() = (
    select user_id from public.chain_links where id = link_id
  ));
create policy "Users can create verifications" on public.verifications for insert
  with check (auth.uid() = requested_by);
create policy "Recipients can update" on public.verifications for update
  using (auth.uid() = (select user_id from public.chain_links where id = link_id));

-- ── Function: auto-create profile on signup ───────────────────────

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Anonymous'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
