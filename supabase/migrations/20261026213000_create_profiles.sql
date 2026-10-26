create type public.app_role as enum ('adopter', 'staff');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.app_role not null default 'adopter',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;

create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'staff'::public.app_role
  );
$$;

revoke all on function public.is_staff() from public, anon, authenticated;
grant execute on function public.is_staff() to authenticated;

create policy "Users can read their own profile and staff can read all profiles"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id or (select public.is_staff()));

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id)
select id
from auth.users
on conflict (id) do nothing;
