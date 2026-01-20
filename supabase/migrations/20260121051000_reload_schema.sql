-- Migration: Force PostgREST Layout Reload
-- Date: 2026-01-21
-- Description: Sends a notification to PostgREST to reload the schema cache. 
-- This fixes issues where new columns return 400 Bad Request because the API isn't aware of them.

NOTIFY pgrst, 'reload schema';
