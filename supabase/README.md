# Supabase 設定指南

本專案已從 Firebase 遷移至 Supabase。以下是設定步驟。

## 1. 建立 Supabase 專案

1. 前往 [Supabase Dashboard](https://app.supabase.com/)
2. 點擊 "New Project"
3. 填寫專案名稱、資料庫密碼、選擇區域（建議選擇 `Southeast Asia (Singapore)`）
4. 等待專案建立完成

## 2. 執行資料庫 Schema

1. 在 Supabase Dashboard 中，前往 `SQL Editor`
2. 點擊 "New Query"
3. 複製 `supabase/schema.sql` 的內容並貼上
4. 點擊 "Run" 執行 SQL

這會建立以下資料表：
- `souvenirs` - 紀念品主資料
- `profiles` - 使用者資料
- `user_collections` - 使用者收藏

## 3. 設定 Google OAuth

1. 在 Supabase Dashboard 中，前往 `Authentication` > `Providers`
2. 找到 `Google` 並點擊啟用
3. 填入你的 Google OAuth 憑證：
   - Client ID
   - Client Secret
4. 複製 Callback URL（格式：`https://your-project.supabase.co/auth/v1/callback`）
5. 前往 [Google Cloud Console](https://console.cloud.google.com/)
6. 在 OAuth 2.0 Client IDs 中新增此 Callback URL

## 4. 取得 API Keys

1. 在 Supabase Dashboard 中，前往 `Settings` > `API`
2. 複製以下資訊：
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (僅用於後端腳本)

## 5. 設定環境變數

在專案根目錄建立 `.env` 檔案：

```bash
cp .env.example .env
```

填入你的 Supabase 憑證：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 6. 安裝依賴

```bash
npm install @supabase/supabase-js
```

## 7. 執行 Google Sheets 同步腳本

確保已設定好 Google Sheets 相關環境變數，然後執行：

```bash
cd scripts
npm install
node sync-sheets-to-supabase.js
```

## 8. Row Level Security (RLS) 說明

專案已設定以下 RLS 政策：

### souvenirs (紀念品)
- ✅ 所有人可讀取
- ⚠️ 只能透過 Service Role Key 寫入（同步腳本）

### profiles (使用者資料)
- ✅ 使用者可讀取/更新自己的資料
- ✅ 新使用者註冊時自動建立 profile

### user_collections (收藏)
- ✅ 使用者可完全管理自己的收藏（CRUD）
- ❌ 無法存取其他使用者的收藏

## 9. 測試連線

啟動開發伺服器：

```bash
npm run dev
```

嘗試登入並確認：
- Google OAuth 登入正常
- 可以瀏覽紀念品列表
- 可以新增/刪除收藏

## 10. GitHub Actions 設定

如果要在 GitHub Actions 中執行同步腳本，需要設定以下 Secrets：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SHEET_ID`
- `GCP_SERVICE_ACCOUNT_JSON`

## 常見問題

### Q: 為什麼要用 Service Role Key？
A: Service Role Key 可以繞過 RLS，適合用於後端腳本批次寫入資料。前端只使用 Anon Key。

### Q: 如何限制特定 Email 登入？
A: 目前在前端 `stores/auth.js` 中有 `allowEmails` 白名單機制。你也可以在 Supabase 中設定 Email Domain Allowlist。

### Q: 資料庫索引夠用嗎？
A: Schema 已包含常用查詢的索引。如果有效能問題，可以在 Supabase Dashboard 的 Database > Indexes 中查看並新增。

## 相關文件

- [Supabase 官方文件](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
