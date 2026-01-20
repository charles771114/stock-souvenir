-- Migration: Add Primary Admin Column
-- Date: 2026-01-21
-- Description: Adds is_primary_admin column to profiles to distinguish main admins.

alter table public.profiles
add column if not exists is_primary_admin boolean default false;

-- Create policy to allow primary admins to update other profiles' roles (if needed separately, 
-- currently "Admins can update profiles" might be broader, but we'll enforce logic in app or via function later).
-- For now, relying on existing "Admins can update profiles" RLS if it exists, or adding specific one.

-- Ensure the first admin (or specific email) is primary? 
-- This script just adds the column. We can manually set the first primary admin via SQL or dashboard if we allow self-promotion initially.
