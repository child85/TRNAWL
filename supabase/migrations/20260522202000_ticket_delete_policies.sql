drop policy if exists "Authenticated users can delete any tickets" on public.tickets;
create policy "Authenticated users can delete any tickets"
on public.tickets for delete
to authenticated
using (true);
