-- Migration: Repair duplicate collection entries (Fix for 20260126233500 failure)
-- Purpose: Remove duplicate (user_id, souvenir_id, status) rows so unique constraint can be applied

BEGIN;

-- Strategy: Keep the row with the latest created_at, delete older duplicates
DELETE FROM public.user_collections a USING (
    SELECT MIN(ctid) as ctid, user_id, souvenir_id, status
    FROM public.user_collections 
    GROUP BY user_id, souvenir_id, status
    HAVING COUNT(*) > 1
) b
WHERE a.user_id = b.user_id 
AND a.souvenir_id = b.souvenir_id 
AND a.status = b.status 
AND a.ctid <> b.ctid;

COMMIT;
