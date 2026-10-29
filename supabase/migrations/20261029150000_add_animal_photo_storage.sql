insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'animal-photos',
  'animal-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Staff can list animal photo objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'animal-photos'
  and (select public.is_staff())
  and exists (
    select 1
    from public.animals
    where animals.id::text = (storage.foldername(name))[1]
  )
);

create policy "Staff can upload animal photo objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'animal-photos'
  and (select public.is_staff())
  and exists (
    select 1
    from public.animals
    where animals.id::text = (storage.foldername(name))[1]
  )
);

create policy "Staff can update animal photo objects"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'animal-photos'
  and (select public.is_staff())
  and exists (
    select 1
    from public.animals
    where animals.id::text = (storage.foldername(name))[1]
  )
)
with check (
  bucket_id = 'animal-photos'
  and (select public.is_staff())
  and exists (
    select 1
    from public.animals
    where animals.id::text = (storage.foldername(name))[1]
  )
);

create policy "Staff can delete animal photo objects"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'animal-photos'
  and (select public.is_staff())
  and exists (
    select 1
    from public.animals
    where animals.id::text = (storage.foldername(name))[1]
  )
);

alter table public.animal_photos
  drop constraint animal_photos_animal_id_display_order_key;

alter table public.animal_photos
  add constraint animal_photos_animal_id_display_order_key
  unique (animal_id, display_order)
  deferrable initially deferred;

create function public.enforce_animal_photo_limit()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  existing_photo_count integer;
begin
  perform 1
  from public.animals
  where id = new.animal_id
  for update;

  select count(*)::integer
  into existing_photo_count
  from public.animal_photos
  where animal_id = new.animal_id
    and id is distinct from new.id;

  if existing_photo_count >= 10 then
    raise exception 'An animal can have at most 10 photos.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_animal_photo_limit() from public, anon, authenticated;

create trigger enforce_animal_photo_limit
before insert or update of animal_id on public.animal_photos
for each row execute function public.enforce_animal_photo_limit();

create function public.reorder_animal_photos(
  p_animal_id uuid,
  p_photo_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  current_photo_count integer;
  requested_photo_count integer;
  distinct_photo_count integer;
begin
  if not (select public.is_staff()) then
    raise exception 'Staff role required.'
      using errcode = '42501';
  end if;

  if p_photo_ids is null or cardinality(p_photo_ids) > 10 then
    raise exception 'Invalid photo order.'
      using errcode = '22023';
  end if;

  select count(*)::integer
  into current_photo_count
  from public.animal_photos
  where animal_id = p_animal_id;

  select count(*)::integer, count(distinct requested.photo_id)::integer
  into requested_photo_count, distinct_photo_count
  from unnest(p_photo_ids) as requested(photo_id);

  if current_photo_count <> requested_photo_count
    or requested_photo_count <> distinct_photo_count
    or (
      select count(*)::integer
      from public.animal_photos
      where animal_id = p_animal_id
        and id = any(p_photo_ids)
    ) <> current_photo_count
  then
    raise exception 'Photo order must include each animal photo exactly once.'
      using errcode = '22023';
  end if;

  update public.animal_photos as photo
  set display_order = (requested.ordinality - 1)::integer
  from unnest(p_photo_ids) with ordinality as requested(photo_id, ordinality)
  where photo.id = requested.photo_id
    and photo.animal_id = p_animal_id;
end;
$$;

revoke all on function public.reorder_animal_photos(uuid, uuid[]) from public, anon, authenticated;
grant execute on function public.reorder_animal_photos(uuid, uuid[]) to authenticated;
