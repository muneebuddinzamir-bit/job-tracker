-- Run this in Supabase Dashboard -> SQL Editor
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  status text not null default 'applied'
    check (status in ('wishlist','applied','interview','offer','rejected')),
  link text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

-- Each user can only see and change their own rows
create policy "own jobs select" on public.jobs for select using (auth.uid() = user_id);
create policy "own jobs insert" on public.jobs for insert with check (auth.uid() = user_id);
create policy "own jobs update" on public.jobs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own jobs delete" on public.jobs for delete using (auth.uid() = user_id);
