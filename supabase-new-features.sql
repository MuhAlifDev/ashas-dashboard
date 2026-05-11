-- ─── TIME LOGS ──────────────────────────────────────────────
create table if not exists public.time_logs (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  project_id   text references public.projects(id) on delete cascade not null,
  task_id      text references public.tasks(id) on delete set null,
  description  text not null default '',
  hours        numeric(5,2) not null,
  date         date not null,
  created_at   timestamptz not null default now()
);
alter table public.time_logs enable row level security;
create policy "Users can manage their own time logs"
  on public.time_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_time_logs_project on public.time_logs(project_id, date);

-- ─── PROJECT PHASES ──────────────────────────────────────────
create table if not exists public.project_phases (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  project_id   text references public.projects(id) on delete cascade not null,
  name         text not null,
  status       text not null default 'pending',
  order_index  integer not null default 0,
  created_at   timestamptz not null default now()
);
alter table public.project_phases enable row level security;
create policy "Users can manage their own project phases"
  on public.project_phases for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_project_phases_project on public.project_phases(project_id);

-- ─── PROJECT LINKS ───────────────────────────────────────────
create table if not exists public.project_links (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  project_id   text references public.projects(id) on delete cascade not null,
  title        text not null,
  url          text not null,
  type         text not null default 'other',
  created_at   timestamptz not null default now()
);
alter table public.project_links enable row level security;
create policy "Users can manage their own project links"
  on public.project_links for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_project_links_project on public.project_links(project_id);

-- ─── PAYMENT MILESTONES ──────────────────────────────────────
create table if not exists public.payment_milestones (
  id           text primary key,
  user_id      uuid references auth.users(id) on delete cascade not null,
  project_id   text references public.projects(id) on delete cascade not null,
  client_id    text references public.clients(id) on delete set null,
  title        text not null,
  amount       numeric not null,
  due_date     date,
  status       text not null default 'pending',
  created_at   timestamptz not null default now()
);
alter table public.payment_milestones enable row level security;
create policy "Users can manage their own payment milestones"
  on public.payment_milestones for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists idx_milestones_project on public.payment_milestones(project_id);
