-- Migration: Force Schema Refresh via Comment
-- Date: 2026-01-21
-- Description: Modifying table comment forces PostgREST to rebuild its schema cache.

COMMENT ON TABLE public.souvenirs IS 'Souvenir data (Schema Refreshed)';
COMMENT ON COLUMN public.souvenirs.classification_status IS 'Status: unclassified, system_matched, verified';
