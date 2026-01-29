-- Migration: Add foreign key relationship between user_inventory and souvenirs
-- This enables Supabase to perform joins via the PostgREST API

BEGIN;

-- Add foreign key constraint from user_inventory.stock_code to souvenirs.code
-- Note: We use ON DELETE SET NULL to preserve inventory records even if souvenir is deleted
ALTER TABLE public.user_inventory
  ADD CONSTRAINT user_inventory_stock_code_fkey 
  FOREIGN KEY (stock_code) 
  REFERENCES public.souvenirs(code) 
  ON DELETE SET NULL;

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS idx_user_inventory_stock_code 
  ON public.user_inventory(stock_code);

COMMIT;
