revoke delete on table public.animals from public, anon, authenticated;

drop policy if exists "Staff can delete animals" on public.animals;
