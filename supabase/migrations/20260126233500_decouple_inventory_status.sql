-- Migration: Decouple Inventory Status
-- Updates user_collections to allow separate tracking of 'holding' (inventory) and 'collected' (yearly receipt).

BEGIN;

-- 1. Update the status check constraint to include 'holding'
ALTER TABLE public.user_collections DROP CONSTRAINT IF EXISTS user_collections_status_check;
ALTER TABLE public.user_collections ADD CONSTRAINT user_collections_status_check 
  CHECK (status IN ('pending', 'collected', 'missed', 'holding'));

-- 2. Update the unique constraint to include status
-- First drop the old one (if it exists under standard naming)
ALTER TABLE public.user_collections DROP CONSTRAINT IF EXISTS user_collections_user_id_souvenir_id_key;
-- Also handle potential ad-hoc naming
ALTER TABLE public.user_collections DROP CONSTRAINT IF EXISTS user_collections_pkey_unique;

-- Add the new composite unique key
ALTER TABLE public.user_collections ADD CONSTRAINT user_collections_user_id_souvenir_id_status_key 
  UNIQUE (user_id, souvenir_id, status);

COMMIT;
