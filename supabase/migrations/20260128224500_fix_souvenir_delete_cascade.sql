-- Fix souvenir deletion conflict by adding ON DELETE CASCADE
-- This allows souvenirs to be deleted even if they are referenced in user_collections

-- 1. Identify and drop the existing constraint
ALTER TABLE public.user_collections
DROP CONSTRAINT IF EXISTS user_collections_souvenir_id_fkey;

-- 2. Re-add the constraint with ON DELETE CASCADE
ALTER TABLE public.user_collections
ADD CONSTRAINT user_collections_souvenir_id_fkey
FOREIGN KEY (souvenir_id)
REFERENCES public.souvenirs(id)
ON DELETE CASCADE;

-- 3. Also check inventory_staging (if it has a FK, though it seemed to use stock_code)
-- Based on 20260121170000_track_inventory_staging.sql, it doesn't reference souvenirs(id) directly yet.
-- But if there are other tables, we should handle them here.
