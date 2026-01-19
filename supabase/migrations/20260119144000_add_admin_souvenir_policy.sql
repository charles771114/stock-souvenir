-- Add RLS policies to allow Admins to manage souvenirs (Insert/Update)

-- 1. Policy for INSERT
drop policy if exists "Admins can insert souvenirs" on public.souvenirs;
create policy "Admins can insert souvenirs"
  on public.souvenirs for insert
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 2. Policy for UPDATE
drop policy if exists "Admins can update souvenirs" on public.souvenirs;
create policy "Admins can update souvenirs"
  on public.souvenirs for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 3. Policy for DELETE (Optional but good for full management)
drop policy if exists "Admins can delete souvenirs" on public.souvenirs;
create policy "Admins can delete souvenirs"
  on public.souvenirs for delete
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
