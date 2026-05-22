alter table public.tickets
add column if not exists work_owner_id uuid references public.app_people(id),
add column if not exists work_owner_name text,
add column if not exists delivery_lead_name text;

alter table public.customer_actions
add column if not exists customer_id uuid references public.customers(id);

alter table public.customers
add column if not exists status text not null default 'active' check (status in ('active', 'paused', 'inactive')),
add column if not exists primary_contact text,
add column if not exists contact_email text,
add column if not exists notes text;

create index if not exists tickets_work_owner_id_idx on public.tickets(work_owner_id);
create index if not exists tickets_work_owner_name_idx on public.tickets(work_owner_name);
create index if not exists tickets_delivery_lead_name_idx on public.tickets(delivery_lead_name);
create index if not exists customer_actions_customer_id_idx on public.customer_actions(customer_id);
create index if not exists customers_status_idx on public.customers(status);

update public.tickets
set work_owner_name = coalesce(work_owner_name, owner_name),
    delivery_lead_name = coalesce(delivery_lead_name, owner_name)
where work_owner_name is null
   or delivery_lead_name is null;

update public.customers
set status = 'active'
where status is null;

drop policy if exists "Authenticated users can create customers" on public.customers;
create policy "Authenticated users can create customers"
on public.customers for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update customers" on public.customers;
create policy "Authenticated users can update customers"
on public.customers for update
to authenticated
using (true)
with check (true);

update public.workflow_template_tasks
set title = 'Commercial Input Check',
    description = 'Confirm the sales or commercial inputs delivery depends on, without making pricing a delivery-owned review.',
    default_blocked_reason = 'dependency_unresolved'
where title = 'Pricing Review';
