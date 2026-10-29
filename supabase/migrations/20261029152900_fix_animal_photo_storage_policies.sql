drop policy if exists "Staff can list animal photo objects" on storage.objects;
drop policy if exists "Staff can upload animal photo objects" on storage.objects;
drop policy if exists "Staff can update animal photo objects" on storage.objects;
drop policy if exists "Staff can delete animal photo objects" on storage.objects;

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
    where animals.id::text = (storage.foldername(storage.objects.name))[1]
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
    where animals.id::text = (storage.foldername(storage.objects.name))[1]
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
    where animals.id::text = (storage.foldername(storage.objects.name))[1]
  )
)
with check (
  bucket_id = 'animal-photos'
  and (select public.is_staff())
  and exists (
    select 1
    from public.animals
    where animals.id::text = (storage.foldername(storage.objects.name))[1]
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
    where animals.id::text = (storage.foldername(storage.objects.name))[1]
  )
);
