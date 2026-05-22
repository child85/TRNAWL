update public.app_people
set color = case display_name
  when 'Thomas' then '#0067b1'
  when 'Bugs Bunny' then '#0097d7'
  when 'Daffy Duck' then '#003a70'
  when 'Lola Bunny' then '#64748b'
  when 'Porky Pig' then '#007a9e'
  when 'Wile E. Coyote' then '#475569'
  when 'Harry Dumm' then '#0f5f8f'
  when 'Lloyd Duemmer' then '#4b6f93'
  else color
end;
