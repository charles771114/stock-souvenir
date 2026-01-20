-- Migration: Add missing columns for data import
-- Date: 2026-01-21
-- Description: Adds market_type and proxy_deadline to souvenirs table.

alter table public.souvenirs
add column if not exists market_type text, -- 上市/上櫃
add column if not exists proxy_deadline text; -- 代領截止時間 (keeping as text for flexibility, or date/timestamp if strictly formatted)

-- Update the view to include these columns if needed (optional, assuming 'select *' handles it or view needs explicit update)
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
  s.meeting_date,
  s.market_type,    -- Added
  s.proxy_deadline  -- Added
from public.user_collections uc
join public.profiles p on uc.user_id = p.id
join public.souvenirs s on uc.souvenir_id = s.id;
