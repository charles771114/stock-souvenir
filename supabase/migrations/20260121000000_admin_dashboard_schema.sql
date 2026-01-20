-- Migration: Admin Dashboard Schema
-- Date: 2026-01-21
-- Description: Adds admin_user_favorites view and admin RLS policies for profiles and user_collections.

-- 1. Profiles: Allow Admins to select all
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 2. User Collections: Allow Admins to select all
drop policy if exists "Admins can view all collections" on public.user_collections;
create policy "Admins can view all collections"
  on public.user_collections for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- 3. Create View: admin_user_favorites
-- Utilizes security_invoker=true to respect RLS policies (which we just added for admins)
create or replace view public.admin_user_favorites with (security_invoker=true) as
select
  uc.id as collection_id,
  uc.user_id,
  p.email,
  s.id as souvenir_id,
  s.code as stock_code,
  s.name as company_name,
  s.souvenir_item,
  uc.created_at as collected_at,
  s.last_buy_date,
  s.meeting_date
from public.user_collections uc
join public.profiles p on uc.user_id = p.id
join public.souvenirs s on uc.souvenir_id = s.id;

-- Grant access to authenticated users (admin check is handled by RLS on underlying tables)
grant select on public.admin_user_favorites to authenticated;
