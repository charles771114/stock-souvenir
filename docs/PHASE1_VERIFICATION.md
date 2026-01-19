# Phase 1 驗證文件

## 📋 Phase 1 完成項目

### ✅ 資料庫表格建立

1. **users** - 用戶基本資料
   - 欄位：id, email, is_admin, display_name, avatar_url, created_at, updated_at
   - 索引：email, is_admin
   - 特色：自動從 auth.users 同步

2. **admin_emails** - Admin 白名單
   - 欄位：email (PK), added_by, added_at
   - 用途：控制誰可以成為 admin

3. **gift_catalog** - 紀念品目錄
   - 欄位：id, company_code, company_name, gift_name, gift_year, gift_category, image_url, source_url, scraped_at, created_at, updated_at
   - 唯一約束：(company_code, gift_year, gift_name)
   - 索引：company_code, gift_year, created_at

4. **user_collections** - 用戶收藏記錄
   - 欄位：id, user_id, gift_id, collected_date, notes, created_at, updated_at
   - 唯一約束：(user_id, gift_id)
   - 索引：user_id, gift_id

5. **scraper_sources** - 爬蟲來源設定
   - 欄位：id, source_name, source_url, selector_config (jsonb), is_active, last_scraped_at, created_at, updated_at
   - 索引：is_active

6. **scraper_logs** - 爬蟲執行紀錄
   - 欄位：id, source_id, status, items_scraped, error_message, executed_at, completed_at
   - 狀態檢查：'success', 'failed', 'running'
   - 索引：source_id, executed_at, status

### ✅ 自動化功能

1. **handle_new_user()** - 自動設定 Admin 權限
   - 當用戶登入時自動觸發
   - 檢查 email 是否在 admin_emails 白名單
   - 自動設定 is_admin 欄位
   - 同步 display_name 和 avatar_url

2. **handle_updated_at()** - 自動更新時間戳記
   - 所有表格的 updated_at 欄位自動更新

### ✅ Row Level Security (RLS)

#### users 表
- ✅ 用戶可查看自己的資料
- ✅ Admin 可查看所有用戶資料
- ✅ 用戶可更新自己的資料

#### gift_catalog 表
- ✅ 所有已登入用戶可查看紀念品
- ✅ 只有 Admin 可新增/編輯/刪除紀念品

#### user_collections 表
- ✅ 用戶只能查看/管理自己的收藏
- ✅ Admin 可查看所有用戶的收藏

#### scraper_sources 表
- ✅ 只有 Admin 可管理爬蟲來源

#### scraper_logs 表
- ✅ 只有 Admin 可查看爬蟲日誌
- ✅ 只有 Admin 可新增日誌

#### admin_emails 表
- ✅ 只有 Admin 可管理白名單

### ✅ 實用功能

1. **Views**
   - `user_collection_stats` - 用戶收藏統計
   - `scraper_stats` - 爬蟲執行統計

2. **Functions**
   - `is_admin(user_id)` - 檢查用戶是否為 admin
   - `get_user_collection_count(user_id)` - 取得用戶收藏數量

### ✅ 初始資料

- Admin 白名單：charles771114@gmail.com
- 範例爬蟲來源：永豐金證券股東會紀念品

## 🧪 驗證步驟

### 1. 執行 Migration

在 Supabase Dashboard > SQL Editor 執行：

```sql
-- 執行 migration
\i supabase/migrations/001_initial_schema.sql
```

或直接複製 `001_initial_schema.sql` 的內容到 SQL Editor 執行。

### 2. 檢查表格是否建立成功

```sql
-- 查看所有表格
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 應該看到：
-- admin_emails
-- gift_catalog
-- scraper_logs
-- scraper_sources
-- user_collections
-- users
```

### 3. 檢查 RLS 是否啟用

```sql
-- 查看 RLS 狀態
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- 所有表格的 rls_enabled 都應該是 true
```

### 4. 檢查 Trigger 是否建立

```sql
-- 查看所有 triggers
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- 應該看到：
-- on_auth_user_created (auth.users)
-- set_updated_at_users (users)
-- set_updated_at_gift_catalog (gift_catalog)
-- set_updated_at_user_collections (user_collections)
-- set_updated_at_scraper_sources (scraper_sources)
```

### 5. 檢查 Admin 白名單

```sql
-- 查看 admin 白名單
SELECT * FROM public.admin_emails;

-- 應該看到 charles771114@gmail.com
```

### 6. 檢查範例爬蟲來源

```sql
-- 查看爬蟲來源
SELECT 
  source_name,
  source_url,
  is_active
FROM public.scraper_sources;

-- 應該看到永豐金證券的設定
```

### 7. 測試 Admin 自動設定

```sql
-- 模擬新用戶登入（需要實際登入測試）
-- 1. 使用 charles771114@gmail.com 登入
-- 2. 檢查 users 表

SELECT 
  email,
  is_admin,
  display_name
FROM public.users
WHERE email = 'charles771114@gmail.com';

-- is_admin 應該是 true
```

### 8. 測試 RLS 政策

```sql
-- 以一般用戶身份測試（需要實際登入）
-- 1. 使用非 admin email 登入
-- 2. 嘗試查詢 gift_catalog

SELECT COUNT(*) FROM public.gift_catalog;
-- 應該可以查詢（所有人可讀）

-- 3. 嘗試新增紀念品
INSERT INTO public.gift_catalog (company_code, company_name, gift_name, gift_year)
VALUES ('9999', '測試公司', '測試紀念品', 2025);
-- 應該失敗（只有 admin 可寫）
```

## ⚠️ 注意事項

### 1. Admin Email 設定

請確認在 `001_initial_schema.sql` 的最後部分，將 admin email 改成你的：

```sql
INSERT INTO public.admin_emails (email) 
VALUES ('your-email@gmail.com')  -- 改成你的 email
ON CONFLICT (email) DO NOTHING;
```

### 2. Google OAuth 設定

確保在 Supabase Dashboard 已設定 Google OAuth：
- Authentication > Providers > Google
- 填入 Client ID 和 Client Secret
- 設定 Callback URL

### 3. 爬蟲來源設定

範例的 `selector_config` 是針對永豐金證券網站的結構。如果網站結構改變，需要更新此設定。

## 📊 資料庫架構圖

```
auth.users (Supabase 內建)
    ↓ (trigger: on_auth_user_created)
users (is_admin 自動設定)
    ↓
    ├─→ user_collections → gift_catalog
    ├─→ admin_emails (管理)
    ├─→ scraper_sources (管理)
    └─→ scraper_logs (查看)

scraper_sources
    ↓
scraper_logs
    ↓
gift_catalog (爬蟲寫入)
```

## ✅ Phase 1 完成確認清單

請確認以下項目都完成：

- [ ] 所有 6 個表格都已建立
- [ ] 所有索引都已建立
- [ ] RLS 已在所有表格啟用
- [ ] 所有 RLS 政策都已建立
- [ ] Triggers 都已建立並正常運作
- [ ] Admin 白名單已設定
- [ ] 範例爬蟲來源已建立
- [ ] Views 已建立
- [ ] Helper functions 已建立
- [ ] 已測試 Google OAuth 登入
- [ ] 已測試 Admin 自動設定功能
- [ ] 已測試 RLS 政策

## 🚀 準備進入 Phase 2

確認以上所有項目都完成後，我們就可以進入 Phase 2：建立 Supabase Edge Function 實作爬蟲功能。

---

**Phase 1 完成日期**：待確認  
**驗證者**：待確認  
**狀態**：⏸️ 等待確認
