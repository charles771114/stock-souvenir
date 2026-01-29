-- Migration: Grant Admins Permission to Manage All Inventory
-- Fixes 403 Forbidden error on user_inventory table for admins

BEGIN;

-- 1. Create a policy that allows admins to perform all operations on all rows in user_inventory
DROP POLICY IF EXISTS "Admins can manage all inventory" ON public.user_inventory;
CREATE POLICY "Admins can manage all inventory"
  ON public.user_inventory
  FOR ALL
  TO authenticated
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

COMMIT;
