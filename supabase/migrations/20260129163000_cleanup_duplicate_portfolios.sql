-- Migration: Cleanup Duplicate Portfolios and Add Unique Constraint
-- 1. Identify and remove duplicate "is_default" portfolios for the same user
-- 2. Add a UNIQUE constraint to prevent this in the future

BEGIN;

-- 1. Remove duplicates, keeping the oldest one for each user
DELETE FROM public.portfolios
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (
            PARTITION BY user_id, is_default 
            ORDER BY created_at ASC
        ) as row_num
        FROM public.portfolios
        WHERE is_default = true
    ) t
    WHERE t.row_num > 1
);

-- 2. Add a UNIQUE constraint to ensure one default portfolio per user
-- We filter by is_default = true to allow multiple non-default portfolios
-- Use a unique index for conditional uniqueness
DROP INDEX IF EXISTS idx_portfolios_one_default_per_user;
CREATE UNIQUE INDEX idx_portfolios_one_default_per_user 
ON public.portfolios (user_id) 
WHERE (is_default = true);

COMMIT;
