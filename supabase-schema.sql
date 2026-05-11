-- ============================================================
-- ASHAS DASHBOARD — Supabase Schema
-- Jalankan seluruh SQL ini di Supabase: SQL Editor → New Query → Paste → Run
-- ============================================================

-- ─── CLIENTS ─────────────────────────────────────────────────
create table if not exists public.clients (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  company      text,
  email        text,
  phone        text,
  status       text not null default 'active',
  deadline     date,
  notes        text,
  created_at   timestamptz not null default now()
);

alter table public.clients enable row level security;

create policy "Users can manage their own clients"
  on public.clients for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── PROJECTS ────────────────────────────────────────────────
create table if not exists public.projects (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  client_id    text references public.clients(id) on delete set null,
  name         text not null,
  description  text,
  status       text not null default 'planning',
  budget       numeric,
  progress     integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.projects enable row level security;

create policy "Users can manage their own projects"
  on public.projects for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── TASKS ───────────────────────────────────────────────────
create table if not exists public.tasks (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  project_id   text references public.projects(id) on delete set null,
  title        text not null,
  status       text not null default 'todo',
  priority     text not null default 'medium',
  due_date     date,
  notes        text,
  created_at   timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Users can manage their own tasks"
  on public.tasks for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── TRANSACTIONS ────────────────────────────────────────────
create table if not exists public.transactions (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  client_id    text references public.clients(id) on delete set null,
  project_id   text references public.projects(id) on delete set null,
  type         text not null default 'income',
  description  text not null,
  amount       numeric not null,
  status       text not null default 'pending',
  date         date not null,
  created_at   timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can manage their own transactions"
  on public.transactions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── MEETING NOTES ───────────────────────────────────────────
create table if not exists public.meeting_notes (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  client_id    text references public.clients(id) on delete cascade not null,
  project_id   text references public.projects(id) on delete set null,
  title        text not null,
  content      text not null default '',
  date         date not null,
  created_at   timestamptz not null default now()
);

alter table public.meeting_notes enable row level security;

create policy "Users can manage their own meeting notes"
  on public.meeting_notes for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── REVISIONS ───────────────────────────────────────────────
create table if not exists public.revisions (
  id               text primary key,
  user_id          uuid references auth.users(id) on delete cascade not null,
  client_id        text references public.clients(id) on delete cascade not null,
  project_id       text references public.projects(id) on delete set null,
  title            text not null,
  description      text,
  status           text not null default 'requested',
  requested_date   date not null,
  completed_date   date,
  notes            text,
  created_at       timestamptz not null default now()
);

alter table public.revisions enable row level security;

create policy "Users can manage their own revisions"
  on public.revisions for all
  using  (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── INDEXES (untuk performa) ────────────────────────────────
create index if not exists idx_projects_client_id    on public.projects(client_id);
create index if not exists idx_tasks_project_id      on public.tasks(project_id);
create index if not exists idx_transactions_client   on public.transactions(client_id);
create index if not exists idx_transactions_project  on public.transactions(project_id);
create index if not exists idx_meeting_notes_client  on public.meeting_notes(client_id);
create index if not exists idx_revisions_client      on public.revisions(client_id);
