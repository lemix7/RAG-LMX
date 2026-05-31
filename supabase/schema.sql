-- RAG-LMX Supabase schema
-- Run this in the Supabase SQL editor (or via the MCP/CLI) on a fresh project.
-- auth.users is managed by Supabase; everything below lives in the public schema.

-- ─── Tables ──────────────────────────────────────────────────────────────────

-- Profiles (1:1 with auth.users), holds role for admin gating.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

-- Conversations (a "chat").
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists conversations_user_updated_idx
  on public.conversations (user_id, updated_at desc);

-- Messages within a conversation.
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  sources jsonb,                -- Source[] from the RAG response (assistant turns)
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at);

-- ─── Row Level Security ──────────────────────────────────────────────────────
-- This is what enforces per-user isolation. Without it every user could read
-- every row.

alter table public.profiles      enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own conversations" on public.conversations;
create policy "own conversations" on public.conversations
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own messages" on public.messages;
create policy "own messages" on public.messages
  for all using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

-- ─── Auto-create a profile on signup ─────────────────────────────────────────
-- Defaults role to 'user'. full_name is pulled from signup metadata when present
-- (set via supabase.auth.signUp({ options: { data: { full_name } } })).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── First admin ─────────────────────────────────────────────────────────────
-- After signing up, promote your account by running (with your user id):
--   update public.profiles set role = 'admin' where id = '<your-user-uuid>';
