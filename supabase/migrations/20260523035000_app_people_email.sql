alter table public.app_people
add column if not exists email text;

update public.app_people
set email = 'thomasfecke263@gmail.com'
where display_name = 'Thomas';

update public.app_people
set email = null
where display_name <> 'Thomas'
  and email is null;
