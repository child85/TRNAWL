drop policy if exists "Authenticated users can create people" on public.app_people;

create policy "Authenticated users can create people"
on public.app_people for insert
to authenticated
with check (true);
