create type public.adopter_housing_type as enum ('apartment', 'house', 'house_with_garden');
create type public.adopter_hours_alone as enum ('under_4', '4_to_8', 'over_8');
create type public.adopter_children_at_home as enum ('none', 'under_6', '6_plus');
create type public.adopter_experience_level as enum ('first_time', 'some', 'experienced');

-- Jedna ankieta na użytkownika. Wynik dopasowania nie jest przechowywany, liczy go serwer.
create table public.adopter_preferences (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  preferred_species public.animal_species[] not null
    check (cardinality(preferred_species) between 1 and 3),
  preferred_sizes public.animal_size[] not null default '{}'
    check (cardinality(preferred_sizes) <= 3),
  housing public.adopter_housing_type not null,
  hours_alone public.adopter_hours_alone not null,
  activity_level smallint not null check (activity_level between 1 and 5),
  children_at_home public.adopter_children_at_home not null,
  has_dogs boolean not null,
  has_cats boolean not null,
  experience public.adopter_experience_level not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.adopter_preferences enable row level security;

revoke all on table public.adopter_preferences from public, anon, authenticated;
grant select, insert, update, delete on table public.adopter_preferences to authenticated;

-- Staff czyta ankiety na potrzeby obsługi zgłoszeń, ale ich nie zmienia.
create policy "Users can read their own preferences and staff can read all"
on public.adopter_preferences
for select
to authenticated
using ((select auth.uid()) = user_id or (select public.is_staff()));

create policy "Users can create their own preferences"
on public.adopter_preferences
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own preferences"
on public.adopter_preferences
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own preferences"
on public.adopter_preferences
for delete
to authenticated
using ((select auth.uid()) = user_id);
