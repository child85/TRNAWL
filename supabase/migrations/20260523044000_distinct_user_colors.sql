update public.app_people
set color = case display_name
  when 'Thomas' then '#0067b1'
  when 'Bugs Bunny' then '#2f855a'
  when 'Daffy Duck' then '#7c3aed'
  when 'Lola Bunny' then '#c026d3'
  when 'Porky Pig' then '#d97706'
  when 'Wile E. Coyote' then '#6b7280'
  when 'Harry Dumm' then '#dc2626'
  when 'Lloyd Duemmer' then '#0891b2'
  else color
end;
