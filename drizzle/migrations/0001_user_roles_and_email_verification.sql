create type public.app_role as enum ('admin', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

create policy "Users can view own roles"
on public.user_roles
for select to authenticated
using (auth.uid() = user_id);

create policy "Admins can view all roles"
on public.user_roles
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert roles"
on public.user_roles
for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete roles"
on public.user_roles
for delete to authenticated
using (public.has_role(auth.uid(), 'admin'));

alter table public.profiles add column email_verified boolean not null default false;

update public.profiles p
set email_verified = true
from auth.users u
where p.id = u.id
  and u.email_confirmed_at is not null;

create or replace function public.handle_email_confirmed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles set email_verified = true where id = new.id;
  end if;
  return new;
end;
$$;

create trigger on_auth_email_confirmed
after update of email_confirmed_at on auth.users
for each row
execute function public.handle_email_confirmed();

create policy "Admins can view all profiles"
on public.profiles
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can view all transactions"
on public.escrow_transactions
for select to authenticated
using (public.has_role(auth.uid(), 'admin'));