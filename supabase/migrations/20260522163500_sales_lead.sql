alter table public.tickets
add column if not exists sales_lead_id uuid references public.app_people(id),
add column if not exists sales_lead_name text;

create index if not exists tickets_sales_lead_id_idx on public.tickets(sales_lead_id);

insert into public.app_people (display_name, role_label, is_current_user)
values
  ('Harry Dumm', 'Sales Lead', false),
  ('Lloyd Duemmer', 'Account Executive', false)
on conflict (display_name) do update
set role_label = excluded.role_label,
    is_current_user = excluded.is_current_user;
