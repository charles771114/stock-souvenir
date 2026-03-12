-- Migration: Fix user_collections_status_check to include 'holding'
-- Description: Ensures the 'holding' status is allowed for manual inventory entries.
-- Date: 2026-03-11

BEGIN;

-- 1. Drop the old constraint to avoid conflicts
ALTER TABLE public.user_collections DROP CONSTRAINT IF EXISTS user_collections_status_check;

-- 2. Add the updated constraint including 'holding'
ALTER TABLE public.user_collections ADD CONSTRAINT user_collections_status_check 
  CHECK (status IN ('pending', 'collected', 'missed', 'holding'));

COMMIT;
