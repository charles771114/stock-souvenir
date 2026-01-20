-- Migration: Repair missing classification columns
-- Date: 2026-01-21
-- Description: Ensures category_id and classification_status exist, even if previous migration failed silently or partially.

do $$
begin
  -- 1. Add category_id if not exists
  if not exists (select 1 from information_schema.columns where table_name = 'souvenirs' and column_name = 'category_id') then
    alter table public.souvenirs add column category_id bigint references public.souvenir_categories(id);
    create index idx_souvenirs_category_id on public.souvenirs(category_id);
  end if;

  -- 2. Add classification_status if not exists
  if not exists (select 1 from information_schema.columns where table_name = 'souvenirs' and column_name = 'classification_status') then
    alter table public.souvenirs add column classification_status text default 'unclassified';
    alter table public.souvenirs add constraint check_classification_status check (classification_status in ('system_matched', 'verified', 'unclassified'));
    create index idx_souvenirs_classification_status on public.souvenirs(classification_status);
  end if;

  -- 3. Ensure Primary Admin Column (just to be safe)
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'is_primary_admin') then
    alter table public.profiles add column is_primary_admin boolean default false;
  end if;
end $$;
