-- Atrybuty zgodności dla rekomendacji. NULL oznacza „nieznane, do omówienia ze schroniskiem”.
-- Istniejące polityki RLS tabeli animals obejmują nowe kolumny: odczyt jak dla wiersza, zapis tylko staff.
alter table public.animals
  add column good_with_children boolean,
  add column good_with_dogs boolean,
  add column good_with_cats boolean,
  add column can_stay_alone boolean,
  add column suitable_for_apartment boolean,
  add column requires_experience boolean;
