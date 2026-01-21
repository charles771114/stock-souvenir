-- Add nickname column and enable user self-updates

-- 1. Add nickname column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nickname text;

-- 2. Ensure RLS Policy allows users to update their own profile
-- Check if policy exists first to avoid errors (or drop and recreate)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id
);

-- 3. Ensure SELECT policy covers this field (Already covered by "View profiles" policy)
