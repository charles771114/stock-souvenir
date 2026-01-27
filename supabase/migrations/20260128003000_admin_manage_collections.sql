-- Migration: Grant Admins Permission to Manage All Collections
-- This fix addresses the 403 Forbidden error when admins try to link inventory items to other users.

BEGIN;

-- 1. Drop the existing select-only policy (if it exists)
DROP POLICY IF EXISTS "Admins can view all collections" ON public.user_collections;

-- 2. Create a new policy that allows admins to perform all operations on all rows
-- We use the pre-defined public.is_admin() function to check for admin role
CREATE POLICY "Admins can manage all collections"
  ON public.user_collections
  FOR ALL
  TO authenticated
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- Note: The existing "Users can manage own collections" policy still allows 
-- regular users to manage their own rows.

COMMIT;
