create table public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  animal_id uuid not null references public.animals (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, animal_id)
);

create index favorites_animal_id_idx on public.favorites (animal_id);

alter table public.favorites enable row level security;

revoke all on table public.favorites from public, anon, authenticated;
grant select, insert, delete on table public.favorites to authenticated;

create policy "Users can read their own favorites"
on public.favorites
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Dodać można tylko opublikowane zwierzę; usuwanie własnych wpisów jest zawsze dozwolone.
create policy "Users can favorite published animals"
on public.favorites
for insert
to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1
    from public.animals
    where animals.id = favorites.animal_id
      and animals.publication_status = 'published'::public.animal_publication_status
  )
);

create policy "Users can remove their own favorites"
on public.favorites
for delete
to authenticated
using ((select auth.uid()) = user_id);
