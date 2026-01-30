-- Migration: Add Portfolios support (Multi-Account)
-- Enables one user to have multiple portfolios (本人, 配偶, 小孩 etc.)

BEGIN;

-- 1. Create portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Enable RLS on portfolios
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can CRUD own portfolios" ON public.portfolios;
CREATE POLICY "Users can CRUD own portfolios" 
  ON public.portfolios FOR ALL 
  USING (auth.uid() = user_id);

-- 3. Add portfolio_id to user_inventory
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_inventory' AND column_name='portfolio_id') THEN
        ALTER TABLE public.user_inventory ADD COLUMN portfolio_id uuid REFERENCES public.portfolios(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Add portfolio_id to user_collections
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_collections' AND column_name='portfolio_id') THEN
        ALTER TABLE public.user_collections ADD COLUMN portfolio_id uuid REFERENCES public.portfolios(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 5. Create default portfolios for existing users and migrate data
DO $$
DECLARE
    user_record RECORD;
    new_portfolio_id uuid;
BEGIN
    FOR user_record IN SELECT id FROM public.profiles LOOP
        -- Check if default portfolio already exists
        SELECT id INTO new_portfolio_id FROM public.portfolios WHERE user_id = user_record.id AND is_default = true LIMIT 1;

        -- If not exists, create it
        IF new_portfolio_id IS NULL THEN
            INSERT INTO public.portfolios (user_id, name, is_default)
            VALUES (user_record.id, '本人', true)
            RETURNING id INTO new_portfolio_id;
        END IF;

        -- Update user_inventory to point to this new portfolio
        UPDATE public.user_inventory 
        SET portfolio_id = new_portfolio_id 
        WHERE user_id = user_record.id AND portfolio_id IS NULL;

        -- Update user_collections to point to this new portfolio
        UPDATE public.user_collections 
        SET portfolio_id = new_portfolio_id 
        WHERE user_id = user_record.id AND portfolio_id IS NULL;
    END LOOP;
END $$;

-- 6. Clean up duplicates before adding UNIQUE constraints
-- For user_collections: Keep holding status over collected, then newest first
DELETE FROM public.user_collections
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (
            PARTITION BY portfolio_id, souvenir_id 
            ORDER BY (CASE WHEN status = 'holding' THEN 1 ELSE 2 END), created_at DESC
        ) as row_num
        FROM public.user_collections
    ) t
    WHERE t.row_num > 1
);

-- For user_inventory: Keep newest first
DELETE FROM public.user_inventory
WHERE id IN (
    SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (
            PARTITION BY portfolio_id, stock_code 
            ORDER BY created_at DESC
        ) as row_num
        FROM public.user_inventory
    ) t
    WHERE t.row_num > 1
);

-- 7. Now make portfolio_id NOT NULL and update constraints
-- For user_inventory
ALTER TABLE public.user_inventory ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE public.user_inventory DROP CONSTRAINT IF EXISTS user_inventory_user_id_stock_code_key;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_inventory_portfolio_stock_unique') THEN
        ALTER TABLE public.user_inventory ADD CONSTRAINT user_inventory_portfolio_stock_unique UNIQUE(portfolio_id, stock_code);
    END IF;
END $$;

-- For user_collections
ALTER TABLE public.user_collections ALTER COLUMN portfolio_id SET NOT NULL;
ALTER TABLE public.user_collections DROP CONSTRAINT IF EXISTS user_collections_user_id_souvenir_id_key;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_collections_portfolio_souvenir_unique') THEN
        ALTER TABLE public.user_collections ADD CONSTRAINT user_collections_portfolio_souvenir_unique UNIQUE(portfolio_id, souvenir_id);
    END IF;
END $$;

-- 8. Update triggers
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_portfolios_updated_at ON public.portfolios;
CREATE TRIGGER set_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

COMMIT;
