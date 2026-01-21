-- Quick SQL Script to Apply Admin Settings Fix
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hpfggdkhoffhfawsgmtt/sql

-- 1. Add added_at column to profiles table
alter table public.profiles
add column if not exists added_at timestamptz default now();

-- 2. Backfill added_at for existing admin accounts (set to created_at)
update public.profiles
set added_at = created_at
where role = 'admin' and added_at is null;

-- 3. Add RLS policy to allow admins to update other profiles
drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Verify the changes
select email, role, is_primary_admin, added_at, created_at
from public.profiles
where role = 'admin'
order by added_at desc;
