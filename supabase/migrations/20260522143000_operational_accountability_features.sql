alter table public.tickets
add column if not exists customer_name text,
add column if not exists blocked_reason text check (
  blocked_reason is null or blocked_reason in (
    'waiting_for_delivery',
    'waiting_for_pricing',
    'waiting_for_legal',
    'waiting_for_customer',
    'scope_unclear',
    'owner_missing',
    'dependency_unresolved',
    'approval_pending',
    'other'
  )
),
add column if not exists blocked_since timestamptz,
add column if not exists readiness_checks jsonb not null default '{}'::jsonb,
add column if not exists readiness_score integer not null default 0 check (readiness_score between 0 and 100);

create table if not exists public.workflow_templates (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_template_tasks (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.workflow_templates(id) on delete cascade,
  title text not null,
  description text,
  default_ticket_type text not null default 'task' check (default_ticket_type in ('task', 'sow', 'delivery_review', 'customer_action', 'internal_action')),
  default_priority text not null default 'medium' check (default_priority in ('low', 'medium', 'high', 'urgent')),
  default_blocked_reason text check (
    default_blocked_reason is null or default_blocked_reason in (
      'waiting_for_delivery',
      'waiting_for_pricing',
      'waiting_for_legal',
      'waiting_for_customer',
      'scope_unclear',
      'owner_missing',
      'dependency_unresolved',
      'approval_pending',
      'other'
    )
  ),
  position integer not null,
  suggested_due_offset_days integer,
  created_at timestamptz not null default now(),
  unique (template_id, position)
);

create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.workflow_templates(id),
  name text not null,
  customer_name text,
  opportunity_reference text,
  started_by uuid references public.profiles(id),
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_run_tickets (
  workflow_run_id uuid not null references public.workflow_runs(id) on delete cascade,
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  template_task_id uuid references public.workflow_template_tasks(id),
  created_at timestamptz not null default now(),
  primary key (workflow_run_id, ticket_id)
);

create table if not exists public.customer_actions (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  action text not null,
  customer_owner text,
  internal_owner_id uuid references public.profiles(id),
  ticket_id uuid references public.tickets(id) on delete set null,
  due_date date,
  status text not null default 'open' check (status in ('open', 'waiting', 'done', 'cancelled')),
  last_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.operational_briefs (
  id uuid primary key default gen_random_uuid(),
  period_start date not null,
  period_end date not null,
  summary text not null,
  metrics jsonb not null default '{}'::jsonb,
  ai_generated boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists tickets_customer_name_idx on public.tickets(customer_name);
create index if not exists tickets_blocked_reason_idx on public.tickets(blocked_reason);
create index if not exists workflow_template_tasks_template_id_idx on public.workflow_template_tasks(template_id);
create index if not exists workflow_runs_template_id_idx on public.workflow_runs(template_id);
create index if not exists workflow_runs_status_idx on public.workflow_runs(status);
create index if not exists customer_actions_customer_name_idx on public.customer_actions(customer_name);
create index if not exists customer_actions_due_date_idx on public.customer_actions(due_date);
create index if not exists customer_actions_status_idx on public.customer_actions(status);
create index if not exists operational_briefs_period_idx on public.operational_briefs(period_start, period_end);

drop trigger if exists set_workflow_templates_updated_at on public.workflow_templates;
create trigger set_workflow_templates_updated_at
before update on public.workflow_templates
for each row execute function public.set_updated_at();

drop trigger if exists set_workflow_runs_updated_at on public.workflow_runs;
create trigger set_workflow_runs_updated_at
before update on public.workflow_runs
for each row execute function public.set_updated_at();

drop trigger if exists set_customer_actions_updated_at on public.customer_actions;
create trigger set_customer_actions_updated_at
before update on public.customer_actions
for each row execute function public.set_updated_at();

alter table public.workflow_templates enable row level security;
alter table public.workflow_template_tasks enable row level security;
alter table public.workflow_runs enable row level security;
alter table public.workflow_run_tickets enable row level security;
alter table public.customer_actions enable row level security;
alter table public.operational_briefs enable row level security;

create policy "Authenticated users can read workflow templates"
on public.workflow_templates for select
to authenticated
using (true);

create policy "Authenticated users can read workflow template tasks"
on public.workflow_template_tasks for select
to authenticated
using (true);

create policy "Authenticated users can read workflow runs"
on public.workflow_runs for select
to authenticated
using (true);

create policy "Authenticated users can create workflow runs"
on public.workflow_runs for insert
to authenticated
with check (started_by = auth.uid() or started_by is null);

create policy "Authenticated users can update workflow runs"
on public.workflow_runs for update
to authenticated
using (true)
with check (true);

create policy "Authenticated users can read workflow run tickets"
on public.workflow_run_tickets for select
to authenticated
using (true);

create policy "Authenticated users can create workflow run tickets"
on public.workflow_run_tickets for insert
to authenticated
with check (true);

create policy "Authenticated users can read customer actions"
on public.customer_actions for select
to authenticated
using (true);

create policy "Authenticated users can create customer actions"
on public.customer_actions for insert
to authenticated
with check (internal_owner_id = auth.uid() or internal_owner_id is null);

create policy "Internal owners can update customer actions"
on public.customer_actions for update
to authenticated
using (internal_owner_id = auth.uid() or internal_owner_id is null)
with check (internal_owner_id = auth.uid() or internal_owner_id is null);

create policy "Authenticated users can read operational briefs"
on public.operational_briefs for select
to authenticated
using (true);

create policy "Authenticated users can create operational briefs"
on public.operational_briefs for insert
to authenticated
with check (created_by = auth.uid() or created_by is null);

insert into public.workflow_templates (slug, name, description)
values
  ('new-sow', 'New SOW Workflow', 'Creates the minimum operational review path for a new SOW.'),
  ('delivery-review', 'Delivery Review Workflow', 'Coordinates delivery feasibility, assumptions, scope, and handoff review.'),
  ('customer-actions', 'Customer Action Follow-Up', 'Tracks customer-owned actions with internal accountability.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    updated_at = now();

with template as (
  select id from public.workflow_templates where slug = 'new-sow'
)
insert into public.workflow_template_tasks (
  template_id,
  title,
  description,
  default_ticket_type,
  default_priority,
  default_blocked_reason,
  position,
  suggested_due_offset_days
)
select template.id, task.title, task.description, task.default_ticket_type, task.default_priority, task.default_blocked_reason, task.position, task.suggested_due_offset_days
from template
cross join (
  values
    ('Create SOW Intake Ticket', 'Capture customer, opportunity, due date, scope summary, and proposal owner.', 'sow', 'medium', null, 1, 0),
    ('Delivery Review', 'Validate whether delivery can operate the proposed scope, staffing, SLAs, and transition plan.', 'delivery_review', 'high', 'waiting_for_delivery', 2, 2),
    ('Pricing Review', 'Confirm pricing inputs, assumptions, delivery model, effort, and margin-sensitive gaps.', 'task', 'high', 'waiting_for_pricing', 3, 3),
    ('Scope Boundary Review', 'Check baseline vs optional scope, exclusions, dependencies, customer responsibilities, and change-control triggers.', 'task', 'high', 'scope_unclear', 4, 3),
    ('Legal Review', 'Confirm legal review is complete when terms, risk, or customer language require it.', 'task', 'medium', 'waiting_for_legal', 5, 5),
    ('Customer Deck / Final Review', 'Prepare the customer-facing summary and make risks, assumptions, and targets clear.', 'task', 'medium', 'approval_pending', 6, 6)
) as task(title, description, default_ticket_type, default_priority, default_blocked_reason, position, suggested_due_offset_days)
on conflict (template_id, position) do update
set title = excluded.title,
    description = excluded.description,
    default_ticket_type = excluded.default_ticket_type,
    default_priority = excluded.default_priority,
    default_blocked_reason = excluded.default_blocked_reason,
    suggested_due_offset_days = excluded.suggested_due_offset_days;
