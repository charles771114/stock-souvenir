-- FINAL CLEANUP: Duplicate Portfolios & Strict Uniqueness
-- This script is more aggressive to ensure only ONE "本人" and ONE default exists.

BEGIN;

-- 1. Force is_default=false for all except the oldest one per user
-- This ensures we can then safely apply the UNIQUE index.
WITH ranked_portfolios AS (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY user_id, is_default ORDER BY created_at ASC) as default_rank
    FROM public.portfolios
    WHERE is_default = true
)
UPDATE public.portfolios
SET is_default = false
WHERE id IN (SELECT id FROM ranked_portfolios WHERE default_rank > 1);

-- 2. Delete any portfolio named "本人" that is NOT the default one
-- (Sometimes we have many named "本人" but only some are default)
-- Keep only the one that is currently default.
DELETE FROM public.portfolios p
WHERE name = '本人'
AND is_default = false
AND EXISTS (
    SELECT 1 FROM public.portfolios p2 
    WHERE p2.user_id = p.user_id 
    AND p2.name = '本人' 
    AND p2.is_default = true
);

-- 3. Delete duplicates where name and user_id are the same (General cleanup)
DELETE FROM public.portfolios
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (
            PARTITION BY user_id, name 
            ORDER BY created_at ASC
        ) as name_rank
        FROM public.portfolios
    ) t
    WHERE t.name_rank > 1
);

-- 4. Apply the UNIQUE INDEX (Conditional for is_default)
DROP INDEX IF EXISTS idx_portfolios_one_default_per_user;
CREATE UNIQUE INDEX idx_portfolios_one_default_per_user 
ON public.portfolios (user_id) 
WHERE (is_default = true);

-- 5. Extra: Apply UNIQUE INDEX for name per user (Optional but good)
-- Un-comment if you want to prevent same-name portfolios
-- DROP INDEX IF EXISTS idx_portfolios_name_per_user;
-- CREATE UNIQUE INDEX idx_portfolios_name_per_user ON public.portfolios (user_id, name);

COMMIT;
