-- Migration: Fix infinite recursion in RLS policies
-- Description: Introduces a SECURITY DEFINER function to check admin status without triggering RLS recursion.

-- 1. Create a helper function to check if the current user is an admin
-- SECURITY DEFINER means this function runs with the privileges of the creator (postgres/admin), bypassing RLS.
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 
    from public.profiles 
    where id = auth.uid() 
    and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- 2. Update Profiles Policy
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    public.is_admin() -- Uses the function to avoid recursion
  );

-- 3. Update User Collections Policy (Good practice to use the function here too)
drop policy if exists "Admins can view all collections" on public.user_collections;
create policy "Admins can view all collections"
  on public.user_collections for select
  using (
    public.is_admin()
  );

-- 4. Update Souvenir Categories Policy
drop policy if exists "Admins can manage categories" on public.souvenir_categories;
create policy "Admins can manage categories"
  on public.souvenir_categories for all
  using (
    public.is_admin()
  );

-- 5. Update Souvenirs Policy
drop policy if exists "Admins can insert souvenirs" on public.souvenirs;
create policy "Admins can insert souvenirs"
  on public.souvenirs for insert
  with check ( public.is_admin() );

drop policy if exists "Admins can update souvenirs" on public.souvenirs;
create policy "Admins can update souvenirs"
  on public.souvenirs for update
  using ( public.is_admin() );

drop policy if exists "Admins can delete souvenirs" on public.souvenirs;
create policy "Admins can delete souvenirs"
  on public.souvenirs for delete
  using ( public.is_admin() );
