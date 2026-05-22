alter table public.tickets
add column if not exists owner_name text,
add column if not exists requester_name text;

create index if not exists tickets_owner_name_idx on public.tickets(owner_name);
