# 🚀 5 分鐘快速開始

## 步驟 1: Supabase 專案設定

### 1.1 建立專案
1. 前往 https://app.supabase.com/
2. 點擊 "New Project"
3. 填寫資訊並選擇 `Southeast Asia (Singapore)` 區域
4. 等待建立完成（約 2 分鐘）

### 1.2 執行資料庫 Schema
1. 前往 `SQL Editor`
2. 複製 `supabase/migrations/001_initial_schema.sql` 的完整內容
3. 貼上並執行
4. 確認無錯誤

### 1.3 設定 Google OAuth
1. 在 Supabase: `Authentication` > `Providers` > `Google`
2. 複製 Callback URL
3. 前往 Google Cloud Console 建立 OAuth Client
4. 將 Callback URL 加入 Authorized redirect URIs
5. 複製 Client ID 和 Secret 回到 Supabase

### 1.4 設定 Admin
```sql
INSERT INTO public.admin_emails (email) 
VALUES ('your-email@gmail.com');
```

### 1.5 取得 API Keys
在 `Settings` > `API` 複製：
- Project URL → `VITE_SUPABASE_URL`
- anon public key → `VITE_SUPABASE_ANON_KEY`

## 步驟 2: 本地開發

```bash
# 1. 安裝依賴
npm install

# 2. 設定環境變數
cp .env.example .env
# 編輯 .env 填入上面的資訊

# 3. 啟動
npm run dev
```

## 步驟 3: 測試

1. 訪問 http://localhost:5173
2. 使用 Google 登入
3. 確認功能正常

## ✅ 完成！

現在你可以：
- 瀏覽紀念品
- 管理收藏
- （Admin）管理爬蟲

## 🐛 遇到問題？

### 登入失敗
- 檢查 Google OAuth 設定
- 確認 Callback URL 正確

### 無 Admin 權限
- 確認 email 已加入 `admin_emails`
- 登出後重新登入

### 連線錯誤
- 檢查 `.env` 中的 URL 和 Key
- 確認 Supabase 專案正常運行

---

**下一步**: 查看 [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) 了解開發細節
