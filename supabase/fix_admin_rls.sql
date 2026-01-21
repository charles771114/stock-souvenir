-- FIX INFINITE RECURSION IN RLS POLICIES

-- 1. Create a secure function to check admin status without triggering RLS recursion
-- SECURITY DEFINER means this function runs with the privileges of the creator (postgres/superuser),
-- bypassing RLS on the profiles table itself.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix SELECT Policy (View permissions)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "View profiles" ON public.profiles; -- cleanup potential duplicates

CREATE POLICY "View profiles"
ON public.profiles
FOR SELECT
USING (
  -- Option 1: Users can see their own profile
  auth.uid() = id
  OR
  -- Option 2: Admins can see everyone (using recursion-safe function)
  public.is_admin()
);

-- 3. Fix UPDATE Policy (Edit permissions)
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (
  public.is_admin()
);

-- 4. Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
