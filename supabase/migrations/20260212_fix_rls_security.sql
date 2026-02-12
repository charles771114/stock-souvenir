-- 修復安全漏洞：啟用所有資料表的 Row Level Security (RLS)
-- 根據完整的資料庫 schema 更新

-- ============================================
-- Step 1: 啟用所有資料表的 RLS
-- ============================================

-- 核心資料表
ALTER TABLE souvenirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

-- 管理與爬蟲相關
ALTER TABLE scraper_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE souvenir_categories ENABLE ROW LEVEL SECURITY;

-- LINE 與通知相關
ALTER TABLE user_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 其他功能表
ALTER TABLE gift_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE pdf_scraper_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Step 2: 設定 RLS 政策
-- ============================================

-- ========== souvenirs ==========
-- 公開讀取，Service role 可寫入
DROP POLICY IF EXISTS "Anyone can read souvenirs" ON souvenirs;
CREATE POLICY "Anyone can read souvenirs" ON souvenirs
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Service role can write souvenirs" ON souvenirs;
CREATE POLICY "Service role can write souvenirs" ON souvenirs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ========== profiles ==========
-- 使用者只能存取自己的 profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access" ON profiles;
CREATE POLICY "Service role full access" ON profiles
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ========== user_collections ==========
-- 使用者只能管理自己的收藏
DROP POLICY IF EXISTS "Users can manage own collections" ON user_collections;
CREATE POLICY "Users can manage own collections" ON user_collections
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ========== user_inventory ==========
-- 使用者只能管理自己的庫存
DROP POLICY IF EXISTS "Users can manage own inventory" ON user_inventory;
CREATE POLICY "Users can manage own inventory" ON user_inventory
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ========== portfolios ==========
-- 使用者只能管理自己的投資組合
DROP POLICY IF EXISTS "Users can manage own portfolios" ON portfolios;
CREATE POLICY "Users can manage own portfolios" ON portfolios
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ========== scraper_logs ==========
-- Service role 完全存取，已認證使用者可讀取
DROP POLICY IF EXISTS "Service role has full access" ON scraper_logs;
CREATE POLICY "Service role has full access" ON scraper_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can read" ON scraper_logs;
CREATE POLICY "Authenticated users can read" ON scraper_logs
    FOR SELECT TO authenticated USING (true);

-- ========== scraper_sources ==========
-- Service role 完全存取，已認證使用者可讀取
DROP POLICY IF EXISTS "Service role full access sources" ON scraper_sources;
CREATE POLICY "Service role full access sources" ON scraper_sources
    FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated can read sources" ON scraper_sources;
CREATE POLICY "Authenticated can read sources" ON scraper_sources
    FOR SELECT TO authenticated USING (true);

-- ========== souvenir_categories ==========
-- 所有人可讀取，Service role 可寫入
DROP POLICY IF EXISTS "Anyone can read categories" ON souvenir_categories;
CREATE POLICY "Anyone can read categories" ON souvenir_categories
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Service role can write categories" ON souvenir_categories;
CREATE POLICY "Service role can write categories" ON souvenir_categories
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ========== admin_emails ==========
-- 僅 Service role 可存取
DROP POLICY IF EXISTS "Service role only admin emails" ON admin_emails;
CREATE POLICY "Service role only admin emails" ON admin_emails
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ========== user_bindings ==========
-- 使用者只能存取自己的綁定
DROP POLICY IF EXISTS "Users can manage own bindings" ON user_bindings;
CREATE POLICY "Users can manage own bindings" ON user_bindings
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access bindings" ON user_bindings;
CREATE POLICY "Service role full access bindings" ON user_bindings
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ========== line_groups ==========
-- Service role 完全存取
DROP POLICY IF EXISTS "Service role full access line groups" ON line_groups;
CREATE POLICY "Service role full access line groups" ON line_groups
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ========== notifications ==========
-- 使用者只能看到自己的通知
DROP POLICY IF EXISTS "Users can read own notifications" ON notifications;
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access notifications" ON notifications;
CREATE POLICY "Service role full access notifications" ON notifications
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ========== gift_catalog ==========
-- 所有人可讀取，Service role 可寫入
DROP POLICY IF EXISTS "Anyone can read gift catalog" ON gift_catalog;
CREATE POLICY "Anyone can read gift catalog" ON gift_catalog
    FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Service role can write gift catalog" ON gift_catalog;
CREATE POLICY "Service role can write gift catalog" ON gift_catalog
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ========== inventory_staging ==========
-- 使用者只能看到自己的暫存資料
DROP POLICY IF EXISTS "Users can read own staging" ON inventory_staging;
CREATE POLICY "Users can read own staging" ON inventory_staging
    FOR SELECT TO authenticated USING (auth.uid() = matched_user_id);

DROP POLICY IF EXISTS "Service role full access staging" ON inventory_staging;
CREATE POLICY "Service role full access staging" ON inventory_staging
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ========== pdf_scraper_logs ==========
-- 使用者只能看到自己的 PDF 爬蟲記錄
DROP POLICY IF EXISTS "Users can read own pdf logs" ON pdf_scraper_logs;
CREATE POLICY "Users can read own pdf logs" ON pdf_scraper_logs
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role full access pdf logs" ON pdf_scraper_logs;
CREATE POLICY "Service role full access pdf logs" ON pdf_scraper_logs
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ========== users ==========
-- 使用者只能讀取自己的資料
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users
    FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access users" ON users;
CREATE POLICY "Service role full access users" ON users
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- Step 3: 驗證 RLS 設定
-- ============================================

DO $$
DECLARE
    r RECORD;
    enabled_count INTEGER := 0;
    disabled_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== RLS Status for All Public Tables ===';
    RAISE NOTICE '';
    
    FOR r IN 
        SELECT 
            tablename,
            CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
    LOOP
        IF r.rls_status = 'ENABLED' THEN
            enabled_count := enabled_count + 1;
            RAISE NOTICE '✅ % - RLS: %', r.tablename, r.rls_status;
        ELSE
            disabled_count := disabled_count + 1;
            RAISE NOTICE '❌ % - RLS: %', r.tablename, r.rls_status;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== Summary ===';
    RAISE NOTICE 'Enabled: %', enabled_count;
    RAISE NOTICE 'Disabled: %', disabled_count;
    RAISE NOTICE '';
    
    IF disabled_count = 0 THEN
        RAISE NOTICE '🎉 All tables have RLS enabled!';
    ELSE
        RAISE WARNING '⚠️  Some tables still have RLS disabled!';
    END IF;
END $$;
