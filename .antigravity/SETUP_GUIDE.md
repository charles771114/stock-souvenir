# 📖 完整設定指南

## 目錄
1. [環境準備](#環境準備)
2. [Supabase 設定](#supabase-設定)
3. [Google OAuth 設定](#google-oauth-設定)
4. [本地開發設定](#本地開發設定)
5. [測試與驗證](#測試與驗證)

---

## 環境準備

### 必要工具
- Node.js 18+
- npm 或 pnpm
- Git
- 現代瀏覽器

### 帳號需求
- Supabase 帳號
- Google Cloud 帳號

---

## Supabase 設定

### 1. 建立專案

1. 前往 https://app.supabase.com/
2. 點擊 "New Project"
3. 填寫：
   - Name: `stock-souvenir`
   - Database Password: 設定強密碼
   - Region: `Southeast Asia (Singapore)`
4. 等待建立完成

### 2. 執行資料庫 Migration

在 SQL Editor 執行 `supabase/migrations/001_initial_schema.sql`

這會建立：
- 6 個資料表
- RLS 政策
- Triggers
- Views 和 Functions

### 3. 驗證資料表

```sql
-- 查看所有表格
SELECT tablename FROM pg_tables 
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

### 4. 設定 Admin 白名單

```sql
INSERT INTO public.admin_emails (email) 
VALUES ('your-email@gmail.com');
```

### 5. 取得 API Keys

在 `Settings` > `API` 複製：
- `Project URL`
- `anon public` key
- `service_role` key（僅用於腳本）

---

## Google OAuth 設定

### 1. 在 Supabase 準備

1. 前往 `Authentication` > `Providers`
2. 找到 `Google` 並啟用
3. 複製 `Callback URL`（格式：`https://xxx.supabase.co/auth/v1/callback`）

### 2. 在 Google Cloud Console 設定

1. 前往 https://console.cloud.google.com/
2. 建立或選擇專案
3. 前往 `APIs & Services` > `Credentials`
4. 點擊 `Create Credentials` > `OAuth 2.0 Client ID`
5. 設定：
   - Application type: `Web application`
   - Name: `Stock Souvenir`
   - Authorized redirect URIs: 貼上 Supabase 的 Callback URL
6. 點擊 `Create`
7. 複製 `Client ID` 和 `Client Secret`

### 3. 完成 Supabase 設定

1. 回到 Supabase > Authentication > Providers > Google
2. 貼上 `Client ID` 和 `Client Secret`
3. 點擊 `Save`

---

## 本地開發設定

### 1. Clone 專案

```bash
git clone <your-repo-url>
cd stock-souvenir
```

### 2. 安裝依賴

```bash
npm install
```

### 3. 設定環境變數

```bash
cp .env.example .env
```

編輯 `.env`：

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# 後端腳本用（可選）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Sheets 同步（可選）
SHEET_ID=your-sheet-id
GCP_SERVICE_ACCOUNT_JSON=your-service-account-json
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

訪問 http://localhost:5173

---

## 測試與驗證

### 1. 測試 Supabase 連線

```bash
npm run supabase:test
```

應該看到：
- ✅ Connection successful
- ✅ Found X souvenirs
- ✅ Found X profiles

### 2. 測試登入

1. 點擊「使用 Google 帳號登入」
2. 選擇 Google 帳號
3. 確認登入成功
4. 檢查導航列顯示用戶資訊

### 3. 測試 Admin 功能

使用 Admin email 登入，應該：
- 看到 Admin 導航選項
- 自動導向 Admin 主控台
- 可以訪問爬蟲管理頁面

### 4. 測試一般功能

- 瀏覽紀念品目錄
- 使用篩選功能
- 加入收藏
- 查看我的收藏
- 編輯備註

---

## 常見問題

### Q: 登入後顯示「無法載入用戶資料」
**A**: 第一次登入時 trigger 需要時間。等待 1-2 秒後重新整理。

### Q: 沒有 Admin 權限
**A**: 
1. 確認 email 已加入 `admin_emails` 表
2. 登出後重新登入
3. 檢查 SQL 是否執行成功

### Q: Supabase 連線失敗
**A**:
1. 檢查 `.env` 中的 URL 和 Key
2. 確認 Supabase 專案正常運行
3. 檢查網路連線

### Q: Google OAuth 錯誤
**A**:
1. 確認 Callback URL 正確
2. 檢查 Client ID 和 Secret
3. 確認 Google Cloud 專案已啟用

---

## 進階設定

### 本地 Supabase（可選）

如果想在本地運行 Supabase：

```bash
# 安裝 Supabase CLI
brew install supabase/tap/supabase

# 啟動本地 Supabase
npm run supabase:start

# 查看狀態
npm run supabase:status
```

### Google Sheets 同步（可選）

如果要使用 Google Sheets 同步功能：

1. 建立 Google Sheets
2. 取得 Sheet ID
3. 建立 GCP Service Account
4. 設定環境變數
5. 執行同步：`npm run sync:supabase`

---

## 下一步

- 查看 [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) 了解開發流程
- 查看 [API_REFERENCE.md](API_REFERENCE.md) 了解 API 使用
- 開始開發新功能！

---

**需要更多幫助？** 查看其他文件或在 GitHub Issues 提問。
