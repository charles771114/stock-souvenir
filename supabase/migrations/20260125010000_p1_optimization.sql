-- ============================================================
-- P1 Optimization Migration
-- 
-- 1. Add secondary indexes for additional performance
-- 2. Clean up deprecated columns (quantity, note)
-- 
-- Generated: 2026-01-25
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PART 1: Add Secondary Indexes
-- ────────────────────────────────────────────────────────────

-- Index on souvenirs.last_buy_date - for date filtering
CREATE INDEX IF NOT EXISTS idx_souvenirs_last_buy_date 
  ON public.souvenirs (last_buy_date);

-- Index on profiles.role - for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role 
  ON public.profiles (role);

-- ────────────────────────────────────────────────────────────
-- PART 2: Clean Up Deprecated Columns
-- 
-- The 'quantity' and 'note' columns in user_collections are no
-- longer used after the UI/UX refactor (1:1 share-to-gift ratio
-- assumption and notes feature removal).
-- ────────────────────────────────────────────────────────────

-- Drop deprecated 'quantity' column if exists
ALTER TABLE public.user_collections 
  DROP COLUMN IF EXISTS quantity;

-- Drop deprecated 'note' column if exists  
ALTER TABLE public.user_collections 
  DROP COLUMN IF EXISTS note;

-- ============================================================
-- Verification queries:
-- 
-- Check indexes:
--   SELECT indexname FROM pg_indexes WHERE tablename IN ('souvenirs', 'profiles');
--
-- Check columns removed:
--   SELECT column_name FROM information_schema.columns 
--   WHERE table_name = 'user_collections' ORDER BY ordinal_position;
-- ============================================================
