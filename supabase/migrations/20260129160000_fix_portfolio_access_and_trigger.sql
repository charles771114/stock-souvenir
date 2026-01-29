-- Migration: Fix Portfolio Access and Automatic Creation
-- 1. Grant Admins access to all portfolios
-- 2. Automatically create "本人" portfolio for new users

BEGIN;

-- 1. Add Admin RLS Policies for portfolios
DROP POLICY IF EXISTS "Admins can manage all portfolios" ON public.portfolios;
CREATE POLICY "Admins can manage all portfolios" 
  ON public.portfolios FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 2. Create trigger function for automatic portfolio creation
CREATE OR REPLACE FUNCTION public.handle_new_profile_portfolio()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create if it doesn't already exist (safety check)
  IF NOT EXISTS (SELECT 1 FROM public.portfolios WHERE user_id = NEW.id AND is_default = true) THEN
    INSERT INTO public.portfolios (user_id, name, is_default)
    VALUES (NEW.id, '本人', true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Add trigger to profiles table
DROP TRIGGER IF EXISTS on_profile_created_create_portfolio ON public.profiles;
CREATE TRIGGER on_profile_created_create_portfolio
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_profile_portfolio();

-- 4. Backfill: Ensure all existing users have at least one portfolio
-- (Based on 20260129140000_add_portfolios_support.sql but more defensive)
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM public.profiles LOOP
        IF NOT EXISTS (SELECT 1 FROM public.portfolios WHERE user_id = user_record.id) THEN
            INSERT INTO public.portfolios (user_id, name, is_default)
            VALUES (user_record.id, '本人', true);
        END IF;
    END LOOP;
END $$;

COMMIT;
