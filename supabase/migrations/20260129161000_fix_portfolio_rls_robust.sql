-- Migration: Fix Portfolio RLS (Resolving 403 Forbidden for Admins)
-- 1. Ensure Admins have explicit access without recursion
-- 2. Add explicit WITH CHECK for INSERT operations

BEGIN;

-- First, drop the problematic policy
DROP POLICY IF EXISTS "Admins can manage all portfolios" ON public.portfolios;

-- 1. Explicit SELECT policy for Admins
CREATE POLICY "Admins can select all portfolios" 
  ON public.portfolios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 2. Explicit INSERT policy for Admins (Critical for automatic creation)
CREATE POLICY "Admins can insert portfolios for anyone" 
  ON public.portfolios FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 3. Explicit UPDATE/DELETE policies for Admins
CREATE POLICY "Admins can update all portfolios" 
  ON public.portfolios FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete all portfolios" 
  ON public.portfolios FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Ensure handle_new_profile_portfolio function is SECURITY DEFINER 
-- to bypass RLS during automatic creation via trigger
CREATE OR REPLACE FUNCTION public.handle_new_profile_portfolio()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.portfolios WHERE user_id = NEW.id AND is_default = true) THEN
    INSERT INTO public.portfolios (user_id, name, is_default)
    VALUES (NEW.id, '本人', true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
