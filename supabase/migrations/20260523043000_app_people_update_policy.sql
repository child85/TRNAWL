drop policy if exists "Authenticated users can update people" on public.app_people;

create policy "Authenticated users can update people"
on public.app_people for update
to authenticated
using (true)
with check (true);
