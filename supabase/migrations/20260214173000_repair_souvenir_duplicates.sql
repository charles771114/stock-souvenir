-- Migration: Repair Souvenir Duplicates and Enforce doc_id Format
-- Description: Unifies existing doc_ids to {code}_{year} and deletes true duplicates.
-- Date: 2026-02-14

BEGIN;

-- 1. Identify and delete duplicates based on what the doc_id *would* be (code + year)
-- We keep the one with the latest updated_at.
-- This prevents Step 2 from failing due to unique constraint violations.
DELETE FROM public.souvenirs WHERE id IN (
    SELECT id FROM (
        SELECT id, 
               ROW_NUMBER() OVER (
                   PARTITION BY code, EXTRACT(YEAR FROM meeting_date) 
                   ORDER BY updated_at DESC, id DESC
               ) as rn
        FROM public.souvenirs
        WHERE meeting_date IS NOT NULL
    ) t WHERE rn > 1
);

-- 2. Now normalize doc_ids that are missing the year suffix
-- This is now safe because we've removed the records that would have conflicted.
UPDATE public.souvenirs
SET doc_id = code || '_' || EXTRACT(YEAR FROM meeting_date)
WHERE doc_id NOT LIKE '%\_%' AND meeting_date IS NOT NULL;

-- 3. Final cleanup for any doc_ids that are still plain codes (no meeting_date case)
-- This shouldn't really happen with our unified logic, but it's a good safety.
-- If they have no meeting_date, we can use the current year as a fallback or just leave them.
-- For now, we assume meeting_date is the source of truth for the year.

-- 4. Ensure doc_id is truly unique by re-applying the constraint if necessary
-- (Note: doc_id already has a UNIQUE constraint from the initial schema, but we ensure it's healthy)
-- ALTER TABLE public.souvenirs DROP CONSTRAINT IF EXISTS souvenirs_doc_id_key;
-- ALTER TABLE public.souvenirs ADD CONSTRAINT souvenirs_doc_id_key UNIQUE (doc_id);

COMMIT;
