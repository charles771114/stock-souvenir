-- ============================================
-- 修正：解決 Infinite Recursion (無限遞迴) 問題
-- ============================================

-- 1. 確保 is_admin 函數存在且為 SECURITY DEFINER
-- SECURITY DEFINER 讓此函數以建立者(postgres)的權限執行，從而繞過 users 表的 RLS
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public -- 安全性最佳實踐
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = user_id AND is_admin = true
  );
END;
$$;

-- 2. 重建所有使用到 admin 檢查的 Policies

-- Users Table
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.users;
CREATE POLICY "Admins can view all profiles" ON public.users 
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Gift Catalog
DROP POLICY IF EXISTS "Admins can manage gifts" ON public.gift_catalog;
CREATE POLICY "Admins can manage gifts" ON public.gift_catalog 
  FOR ALL USING (public.is_admin(auth.uid()));

-- User Collections
DROP POLICY IF EXISTS "Admins can view all collections" ON public.user_collections;
CREATE POLICY "Admins can view all collections" ON public.user_collections 
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Scraper Sources
DROP POLICY IF EXISTS "Admins can manage scraper sources" ON public.scraper_sources;
CREATE POLICY "Admins can manage scraper sources" ON public.scraper_sources 
  FOR ALL USING (public.is_admin(auth.uid()));

-- Scraper Logs
DROP POLICY IF EXISTS "Admins can view scraper logs" ON public.scraper_logs;
CREATE POLICY "Admins can view scraper logs" ON public.scraper_logs 
  FOR SELECT USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can insert scraper logs" ON public.scraper_logs;
CREATE POLICY "Admins can insert scraper logs" ON public.scraper_logs 
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- Admin Emails
DROP POLICY IF EXISTS "Admins can manage admin list" ON public.admin_emails;
CREATE POLICY "Admins can manage admin list" ON public.admin_emails 
  FOR ALL USING (public.is_admin(auth.uid()));
