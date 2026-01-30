-- Migration: Add text search optimization for souvenirs
-- Purpose: Support efficient ILIKE searches on company name and souvenir item

BEGIN;

-- 1. Enable pg_trgm extension for GIN indexes on text columns
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add GIN index on souvenirs.name (Company Name)
CREATE INDEX IF NOT EXISTS idx_souvenirs_name_trgm 
  ON public.souvenirs 
  USING GIN (name gin_trgm_ops);

-- 3. Add GIN index on souvenirs.souvenir_item (Gift Name)
CREATE INDEX IF NOT EXISTS idx_souvenirs_item_trgm 
  ON public.souvenirs 
  USING GIN (souvenir_item gin_trgm_ops);

-- 4. Add index on user_inventory status (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_stock 
  ON public.user_inventory (user_id, stock_code);

COMMIT;
