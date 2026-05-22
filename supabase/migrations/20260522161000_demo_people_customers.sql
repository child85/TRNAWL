create table if not exists public.app_people (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  role_label text not null,
  is_current_user boolean not null default false,
  created_at timestamptz not null default now(),
  unique (display_name)
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  segment text,
  created_at timestamptz not null default now(),
  unique (name)
);

alter table public.tickets
add column if not exists delivery_lead_id uuid references public.app_people(id),
add column if not exists opportunity_lead_id uuid references public.app_people(id),
add column if not exists customer_id uuid references public.customers(id);

create index if not exists tickets_delivery_lead_id_idx on public.tickets(delivery_lead_id);
create index if not exists tickets_opportunity_lead_id_idx on public.tickets(opportunity_lead_id);
create index if not exists tickets_customer_id_idx on public.tickets(customer_id);

alter table public.app_people enable row level security;
alter table public.customers enable row level security;

create policy "Authenticated users can read people"
on public.app_people for select
to authenticated
using (true);

create policy "Authenticated users can read customers"
on public.customers for select
to authenticated
using (true);

insert into public.app_people (display_name, role_label, is_current_user)
values
  ('Thomas', 'Delivery Lead', true),
  ('Bugs Bunny', 'Delivery Architect', false),
  ('Daffy Duck', 'Delivery Manager', false),
  ('Lola Bunny', 'Customer Success', false),
  ('Porky Pig', 'Project Coordinator', false),
  ('Wile E. Coyote', 'Solution Architect', false)
on conflict (display_name) do update
set role_label = excluded.role_label,
    is_current_user = excluded.is_current_user;

insert into public.customers (name, segment)
values
  ('Acme Anvils Ltd.', 'Enterprise'),
  ('ToonTown Telecom', 'Strategic'),
  ('Roadrunner Logistics', 'Commercial')
on conflict (name) do update
set segment = excluded.segment;
