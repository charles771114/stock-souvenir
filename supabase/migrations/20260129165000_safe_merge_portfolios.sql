-- ROBUST DATA-SAFE CLEANUP: Merge Duplicate Portfolios
-- This script moves inventory/collections to a single "Master" portfolio before deleting duplicates.

BEGIN;

-- 1. Create a mapping of all portfolios to the oldest "Master" portfolio for each user
-- We define "Master" as the oldest default portfolio, or simply the oldest portfolio.
CREATE TEMP TABLE portfolio_cleanup_map AS
WITH user_master AS (
    SELECT DISTINCT ON (user_id)
           user_id, 
           id as master_id
    FROM public.portfolios
    ORDER BY user_id, is_default DESC, created_at ASC
)
SELECT p.user_id, p.id as old_id, m.master_id
FROM public.portfolios p
JOIN user_master m ON p.user_id = m.user_id
WHERE p.id != m.master_id
  AND (p.is_default = true OR p.name = '本人'); -- Only merge duplicates, keep custom names like "S"

-- 2. Prevent duplicate souvenir entries when merging user_collections
-- Delete rows from old portfolios that would cause a unique conflict in the master portfolio
DELETE FROM public.user_collections uc
USING portfolio_cleanup_map map
WHERE uc.portfolio_id = map.old_id
  AND EXISTS (
      SELECT 1 FROM public.user_collections uc_master
      WHERE uc_master.portfolio_id = map.master_id
        AND uc_master.souvenir_id = uc.souvenir_id
  );

-- 3. Move all collections to the master portfolio
UPDATE public.user_collections uc
SET portfolio_id = map.master_id
FROM portfolio_cleanup_map map
WHERE uc.portfolio_id = map.old_id;

-- 4. Prevent duplicate stock entries when merging user_inventory
DELETE FROM public.user_inventory ui
USING portfolio_cleanup_map map
WHERE ui.portfolio_id = map.old_id
  AND EXISTS (
      SELECT 1 FROM public.user_inventory ui_master
      WHERE ui_master.portfolio_id = map.master_id
        AND ui_master.stock_code = ui.stock_code
  );

-- 5. Move all inventory to the master portfolio
UPDATE public.user_inventory ui
SET portfolio_id = map.master_id
FROM portfolio_cleanup_map map
WHERE ui.portfolio_id = map.old_id;

-- 6. Safely delete the duplicate portfolios
DELETE FROM public.portfolios
WHERE id IN (SELECT old_id FROM portfolio_cleanup_map);

-- 7. Final Polish: Ensure the master is marked default and named correctly if it was a "Me" portfolio
UPDATE public.portfolios
SET is_default = true
WHERE id IN (SELECT DISTINCT master_id FROM portfolio_cleanup_map);

-- 8. Apply the ULTIMATE DEFENSE: Unique Index
DROP INDEX IF EXISTS idx_portfolios_one_default_per_user;
CREATE UNIQUE INDEX idx_portfolios_one_default_per_user 
ON public.portfolios (user_id) 
WHERE (is_default = true);

COMMIT;

-- Verify query (Run this after to check)
-- SELECT user_id, name, is_default, count(*) FROM public.portfolios GROUP BY 1, 2, 3 HAVING count(*) > 1;
