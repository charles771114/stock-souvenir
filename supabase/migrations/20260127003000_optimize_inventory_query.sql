-- Add index for status filtering in user_collections
-- This optimizes queries like 'WHERE user_id = ? AND status = ?'
-- and reduces the risk of "stuck" (slow) queries on large datasets.

CREATE INDEX IF NOT EXISTS idx_user_collections_user_status 
  ON public.user_collections (user_id, status);
