-- Migration: Remove obsolete user_collections constraint
-- This constraint conflicts with the portfolio-based uniqueness logic.

BEGIN;

-- Drop the obsolete constraint that enforces uniqueness on (user_id, souvenir_id, status)
-- We now rely on (portfolio_id, souvenir_id) unique constraint from 20260129140000_add_portfolios_support.sql
ALTER TABLE public.user_collections DROP CONSTRAINT IF EXISTS user_collections_user_id_souvenir_id_status_key;

COMMIT;
