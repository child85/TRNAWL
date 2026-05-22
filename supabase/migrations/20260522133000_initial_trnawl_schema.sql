create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text,
  role text not null default 'member' check (role in ('admin', 'manager', 'member', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_stages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  position integer not null,
  stage_type text not null default 'ticket' check (stage_type in ('ticket', 'delivery_review')),
  is_done boolean not null default false,
  created_at timestamptz not null default now(),
  unique (stage_type, position),
  unique (stage_type, name)
);

create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  ticket_type text not null default 'task' check (ticket_type in ('task', 'sow', 'delivery_review', 'customer_action', 'internal_action')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  status_stage_id uuid references public.workflow_stages(id),
  owner_id uuid references public.profiles(id),
  requester_id uuid references public.profiles(id),
  due_date date,
  reminder_at timestamptz,
  ai_original_text text,
  ai_improved_text text,
  ai_suggestions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ticket_comments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_id uuid references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ticket_activity (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists tickets_owner_id_idx on public.tickets(owner_id);
create index if not exists tickets_due_date_idx on public.tickets(due_date);
create index if not exists tickets_priority_idx on public.tickets(priority);
create index if not exists tickets_status_stage_id_idx on public.tickets(status_stage_id);
create index if not exists ticket_comments_ticket_id_idx on public.ticket_comments(ticket_id);
create index if not exists ticket_activity_ticket_id_idx on public.ticket_activity(ticket_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_tickets_updated_at on public.tickets;
create trigger set_tickets_updated_at
before update on public.tickets
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.workflow_stages enable row level security;
alter table public.tickets enable row level security;
alter table public.ticket_comments enable row level security;
alter table public.ticket_activity enable row level security;

create policy "Authenticated users can read profiles"
on public.profiles for select
to authenticated
using (true);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Authenticated users can read workflow stages"
on public.workflow_stages for select
to authenticated
using (true);

create policy "Authenticated users can read tickets"
on public.tickets for select
to authenticated
using (true);

create policy "Authenticated users can create tickets"
on public.tickets for insert
to authenticated
with check (requester_id = auth.uid() or requester_id is null);

create policy "Owners and requesters can update tickets"
on public.tickets for update
to authenticated
using (owner_id = auth.uid() or requester_id = auth.uid())
with check (owner_id = auth.uid() or requester_id = auth.uid());

create policy "Authenticated users can read comments"
on public.ticket_comments for select
to authenticated
using (true);

create policy "Authenticated users can create comments"
on public.ticket_comments for insert
to authenticated
with check (author_id = auth.uid() or author_id is null);

create policy "Authenticated users can read activity"
on public.ticket_activity for select
to authenticated
using (true);

create policy "Authenticated users can create activity"
on public.ticket_activity for insert
to authenticated
with check (actor_id = auth.uid() or actor_id is null);

insert into public.workflow_stages (name, position, stage_type, is_done)
values
  ('New', 1, 'ticket', false),
  ('In Progress', 2, 'ticket', false),
  ('Waiting', 3, 'ticket', false),
  ('Review', 4, 'ticket', false),
  ('Done', 5, 'ticket', true),
  ('Draft', 1, 'delivery_review', false),
  ('Ready for Review', 2, 'delivery_review', false),
  ('In Review', 3, 'delivery_review', false),
  ('Changes Requested', 4, 'delivery_review', false),
  ('Approved', 5, 'delivery_review', false),
  ('Delivered', 6, 'delivery_review', true)
on conflict (stage_type, position) do nothing;
