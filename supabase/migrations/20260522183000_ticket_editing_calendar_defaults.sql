alter table public.app_people
add column if not exists manager_id uuid references public.app_people(id),
add column if not exists manager_name text,
add column if not exists color text not null default '#235c51';

alter table public.customers
add column if not exists sales_lead_id uuid references public.app_people(id),
add column if not exists sales_lead_name text;

create index if not exists app_people_manager_id_idx on public.app_people(manager_id);
create index if not exists customers_sales_lead_id_idx on public.customers(sales_lead_id);

with managers as (
  select
    (select id from public.app_people where display_name = 'Daffy Duck') as delivery_manager_id,
    (select id from public.app_people where display_name = 'Harry Dumm') as sales_manager_id,
    (select id from public.app_people where display_name = 'Lloyd Duemmer') as account_exec_id
)
update public.app_people person
set manager_id = case
      when person.display_name in ('Thomas', 'Bugs Bunny', 'Porky Pig', 'Wile E. Coyote') then managers.delivery_manager_id
      when person.display_name = 'Lloyd Duemmer' then managers.sales_manager_id
      else person.manager_id
    end,
    manager_name = case
      when person.display_name in ('Thomas', 'Bugs Bunny', 'Porky Pig', 'Wile E. Coyote') then 'Daffy Duck'
      when person.display_name = 'Lloyd Duemmer' then 'Harry Dumm'
      else person.manager_name
    end,
    color = case person.display_name
      when 'Thomas' then '#235c51'
      when 'Bugs Bunny' then '#0b6fb3'
      when 'Daffy Duck' then '#f2c94c'
      when 'Lola Bunny' then '#b85c9e'
      when 'Porky Pig' then '#8a7a64'
      when 'Wile E. Coyote' then '#6b7280'
      when 'Harry Dumm' then '#d66a2c'
      when 'Lloyd Duemmer' then '#7c3aed'
      else person.color
    end
from managers;

with sales as (
  select
    (select id from public.app_people where display_name = 'Harry Dumm') as harry_id,
    (select id from public.app_people where display_name = 'Lloyd Duemmer') as lloyd_id
)
update public.customers customer
set sales_lead_id = case
      when customer.name in ('Acme Anvils Ltd.', 'Duck Dodgers Advisory') then sales.harry_id
      else sales.lloyd_id
    end,
    sales_lead_name = case
      when customer.name in ('Acme Anvils Ltd.', 'Duck Dodgers Advisory') then 'Harry Dumm'
      else 'Lloyd Duemmer'
    end
from sales
where customer.sales_lead_id is null;

drop policy if exists "Authenticated users can update any tickets" on public.tickets;
create policy "Authenticated users can update any tickets"
on public.tickets for update
to authenticated
using (true)
with check (true);
