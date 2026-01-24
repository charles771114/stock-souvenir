-- ============================================================
-- P0 Optimization Migration
-- 
-- 1. Add critical indexes for query performance
-- 2. Fix RLS vulnerability (remove anonymous insert)
-- 
-- Generated: 2026-01-25
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PART 1: Add Database Indexes
-- ────────────────────────────────────────────────────────────

-- Index on souvenirs.code - critical for code lookups
CREATE INDEX IF NOT EXISTS idx_souvenirs_code 
  ON public.souvenirs (code);

-- Index on souvenirs.meeting_date - critical for date sorting/filtering
CREATE INDEX IF NOT EXISTS idx_souvenirs_meeting_date 
  ON public.souvenirs (meeting_date);

-- Index on user_collections.user_id - critical for user queries
CREATE INDEX IF NOT EXISTS idx_user_collections_user_id 
  ON public.user_collections (user_id);

-- Index on user_collections.souvenir_id - critical for joins
CREATE INDEX IF NOT EXISTS idx_user_collections_souvenir_id 
  ON public.user_collections (souvenir_id);

-- ────────────────────────────────────────────────────────────
-- PART 2: Fix RLS Anonymous Insert Vulnerability
-- 
-- The policy "Allow anon insert for seeding" is a security risk.
-- Anonymous users should NOT be able to insert into souvenirs.
-- Only authenticated admins should have write access.
-- ────────────────────────────────────────────────────────────

-- Drop the vulnerable anonymous insert policy
DROP POLICY IF EXISTS "Allow anon insert for seeding" ON public.souvenirs;

-- Note: The following policies should already exist from earlier migrations:
-- - "Admins can insert souvenirs" (from 20260119144000_add_admin_souvenir_policy.sql)
-- - "Admins can update souvenirs"
-- - "Admins can delete souvenirs"
-- Public read access for select remains intact.

-- ============================================================
-- Verification queries (run manually to confirm):
-- 
-- Check indexes:
--   SELECT indexname, indexdef FROM pg_indexes WHERE tablename IN ('souvenirs', 'user_collections');
-- 
-- Check RLS policies:
--   SELECT * FROM pg_policies WHERE tablename = 'souvenirs';
-- ============================================================
