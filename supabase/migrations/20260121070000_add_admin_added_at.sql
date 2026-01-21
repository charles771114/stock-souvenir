-- Migration: Add Admin Added At Timestamp
-- Date: 2026-01-21
-- Description: Adds added_at column to profiles and RLS policy for admin updates

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
