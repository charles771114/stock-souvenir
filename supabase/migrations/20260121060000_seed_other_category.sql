-- Migration: Seed "Other" Category
-- Date: 2026-01-21
-- Description: Inserts '其他' category for unclassifiable items.

insert into public.souvenir_categories (name, keywords, color, sort_order)
values ('其他', ARRAY['其他', '雜項', '不詳', 'unknown', 'Other'], 'gray', 999)
on conflict (name) do update 
set sort_order = 999, color = 'gray';
