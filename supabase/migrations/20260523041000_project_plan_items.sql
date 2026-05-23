create table if not exists public.project_plan_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null default 'workflow' check (category in ('templates', 'content', 'approval', 'workflow', 'adoption')),
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_plan_items_status_idx on public.project_plan_items(status);
create index if not exists project_plan_items_category_idx on public.project_plan_items(category);

drop trigger if exists set_project_plan_items_updated_at on public.project_plan_items;
create trigger set_project_plan_items_updated_at
before update on public.project_plan_items
for each row execute function public.set_updated_at();

alter table public.project_plan_items enable row level security;

drop policy if exists "Authenticated users can read project plan items" on public.project_plan_items;
create policy "Authenticated users can read project plan items"
on public.project_plan_items for select
to authenticated
using (true);

drop policy if exists "Authenticated users can create project plan items" on public.project_plan_items;
create policy "Authenticated users can create project plan items"
on public.project_plan_items for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update project plan items" on public.project_plan_items;
create policy "Authenticated users can update project plan items"
on public.project_plan_items for update
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can delete project plan items" on public.project_plan_items;
create policy "Authenticated users can delete project plan items"
on public.project_plan_items for delete
to authenticated
using (true);

insert into public.project_plan_items (title, description, category, status, priority)
values
  (
    'Template management',
    'Create an admin area for reusable operational templates, including SOW and At-a-glance templates.',
    'templates',
    'planned',
    'high'
  ),
  (
    'SOW template',
    'Define a structured SOW template with customer variables, scope sections, assumptions, risks, and approval placeholders.',
    'templates',
    'planned',
    'high'
  ),
  (
    'At-a-glance template',
    'Create a short deal/customer summary template for delivery, sales, governance, risks, and next actions.',
    'templates',
    'planned',
    'medium'
  ),
  (
    'Template phrasing and variable review',
    'Review wording, placeholders, customer variables, and required fields so generated templates are clear and reusable.',
    'content',
    'planned',
    'medium'
  ),
  (
    'Approval paths by deal size',
    'Model approval paths for deal sizes below 50k, above 50k, and above 100k with different approver groups.',
    'approval',
    'planned',
    'high'
  )
on conflict do nothing;
