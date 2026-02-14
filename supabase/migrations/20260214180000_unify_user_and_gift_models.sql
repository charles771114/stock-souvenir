-- Migration: Master Schema Unification
-- Description: Merges public.users into public.profiles and public.gift_catalog into public.souvenirs.
-- Date: 2026-02-14

BEGIN;

-- =========================================================
-- Part 1: Users & Profiles Unification
-- =========================================================

-- 1. Add missing specific columns to profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.profiles ADD COLUMN avatar_url text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'legacy_names') THEN
        ALTER TABLE public.profiles ADD COLUMN legacy_names text[] DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- 2. Migrate data from users to profiles
-- Merge display_name and handle role update
UPDATE public.profiles p
SET 
  avatar_url = u.avatar_url,
  full_name = COALESCE(p.full_name, u.display_name),
  role = CASE WHEN u.is_admin THEN 'admin'::text ELSE p.role END
FROM public.users u
WHERE p.id = u.id;

-- 3. Insert profiles for users that only exist in the 'users' table
INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
SELECT id, email, display_name, avatar_url, 
       CASE WHEN is_admin THEN 'admin'::text ELSE 'user'::text END
FROM public.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- 4. Fix Foreign Key in admin_emails
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'admin_emails_added_by_fkey') THEN
        ALTER TABLE public.admin_emails DROP CONSTRAINT admin_emails_added_by_fkey;
    END IF;
    ALTER TABLE public.admin_emails ADD CONSTRAINT admin_emails_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.profiles(id);
END $$;

-- 5. Drop the legacy users table
DROP TABLE IF EXISTS public.users;

-- =========================================================
-- Part 2: Gifts & Catalog Unification
-- =========================================================

-- 1. Ensure souvenirs has an image_url column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'souvenirs' AND column_name = 'image_url') THEN
        ALTER TABLE public.souvenirs ADD COLUMN image_url text;
    END IF;
END $$;

-- 2. Migrate catalog image URLs to souvenirs
-- Extract year from souvenir meeting_date for matching
UPDATE public.souvenirs s
SET image_url = g.image_url
FROM public.gift_catalog g
WHERE s.code = g.company_code 
  AND EXTRACT(YEAR FROM s.meeting_date) = g.gift_year;

-- 3. Drop the legacy gift_catalog table
DROP TABLE IF EXISTS public.gift_catalog;

COMMIT;
