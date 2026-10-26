create type public.animal_species as enum ('dog', 'cat', 'rabbit');
create type public.animal_sex as enum ('male', 'female', 'unknown');
create type public.animal_size as enum ('small', 'medium', 'large');
create type public.animal_publication_status as enum ('draft', 'published', 'archived');
create type public.animal_adoption_status as enum ('available', 'meeting', 'adopted');

create table public.animals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  species public.animal_species not null,
  breed text not null,
  age_months integer check (age_months >= 0),
  sex public.animal_sex not null,
  size public.animal_size not null,
  energy_level smallint not null check (energy_level between 1 and 5),
  description text not null,
  traits text[] not null default '{}',
  publication_status public.animal_publication_status not null default 'draft',
  adoption_status public.animal_adoption_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.animal_photos (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals (id) on delete cascade,
  storage_path text not null unique,
  alt_text text not null,
  display_order integer not null default 0 check (display_order >= 0),
  created_at timestamptz not null default now(),
  unique (animal_id, display_order)
);

alter table public.animals enable row level security;
alter table public.animal_photos enable row level security;

revoke all on table public.animals from public, anon, authenticated;
grant select on table public.animals to anon, authenticated;
grant insert, update, delete on table public.animals to authenticated;

revoke all on table public.animal_photos from public, anon, authenticated;
grant select on table public.animal_photos to anon, authenticated;
grant insert, update, delete on table public.animal_photos to authenticated;

create policy "Anyone can read published animals"
on public.animals
for select
to anon
using (publication_status = 'published'::public.animal_publication_status);

create policy "Authenticated users can read published animals and staff can read all"
on public.animals
for select
to authenticated
using (
  publication_status = 'published'::public.animal_publication_status
  or (select public.is_staff())
);

create policy "Staff can insert animals"
on public.animals
for insert
to authenticated
with check ((select public.is_staff()));

create policy "Staff can update animals"
on public.animals
for update
to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "Staff can delete animals"
on public.animals
for delete
to authenticated
using ((select public.is_staff()));

create policy "Anyone can read photos of published animals"
on public.animal_photos
for select
to anon
using (
  exists (
    select 1
    from public.animals
    where animals.id = animal_photos.animal_id
      and animals.publication_status = 'published'::public.animal_publication_status
  )
);

create policy "Authenticated users can read public photos and staff can read all"
on public.animal_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.animals
    where animals.id = animal_photos.animal_id
      and (
        animals.publication_status = 'published'::public.animal_publication_status
        or (select public.is_staff())
      )
  )
);

create policy "Staff can insert animal photos"
on public.animal_photos
for insert
to authenticated
with check ((select public.is_staff()));

create policy "Staff can update animal photos"
on public.animal_photos
for update
to authenticated
using ((select public.is_staff()))
with check ((select public.is_staff()));

create policy "Staff can delete animal photos"
on public.animal_photos
for delete
to authenticated
using ((select public.is_staff()));
