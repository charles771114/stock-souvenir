# 🚀 快速開始指南

## 5 分鐘快速啟動

### 步驟 1: 建立 Supabase 專案

1. 前往 https://app.supabase.com/
2. 點擊 "New Project"
3. 填寫資訊：
   - Name: `stock-souvenir`
   - Database Password: 設定一個強密碼
   - Region: `Southeast Asia (Singapore)`
4. 等待專案建立完成（約 2 分鐘）

### 步驟 2: 執行資料庫設定

1. 在 Supabase Dashboard，前往 `SQL Editor`
2. 點擊 "New Query"
3. 複製 `supabase/migrations/001_initial_schema.sql` 的**完整內容**
4. 貼上並點擊 "Run"
5. 確認沒有錯誤訊息

### 步驟 3: 設定 Google OAuth

#### 3.1 在 Supabase 設定
1. 前往 `Authentication` > `Providers`
2. 找到 `Google` 並點擊啟用
3. **先不要填寫**，複製 `Callback URL`（格式：`https://xxx.supabase.co/auth/v1/callback`）

#### 3.2 在 Google Cloud Console 設定
1. 前往 https://console.cloud.google.com/
2. 建立新專案或選擇現有專案
3. 前往 `APIs & Services` > `Credentials`
4. 點擊 `Create Credentials` > `OAuth 2.0 Client ID`
5. Application type: `Web application`
6. Authorized redirect URIs: 貼上剛才複製的 Callback URL
7. 點擊 `Create`
8. 複製 `Client ID` 和 `Client Secret`

#### 3.3 回到 Supabase 完成設定
1. 回到 Supabase > Authentication > Providers > Google
2. 貼上 `Client ID` 和 `Client Secret`
3. 點擊 `Save`

### 步驟 4: 設定 Admin 白名單

1. 在 Supabase Dashboard，前往 `SQL Editor`
2. 執行以下 SQL（**改成你的 email**）：

```sql
INSERT INTO public.admin_emails (email) 
VALUES ('your-email@gmail.com');
```

### 步驟 5: 取得 API Keys

1. 在 Supabase Dashboard，前往 `Settings` > `API`
2. 複製以下資訊：
   - `Project URL` → 這是你的 `VITE_SUPABASE_URL`
   - `anon public` key → 這是你的 `VITE_SUPABASE_ANON_KEY`

### 步驟 6: 本地專案設定

```bash
# 1. 安裝依賴
npm install

# 2. 建立環境變數檔案
cp .env.example .env

# 3. 編輯 .env 檔案，填入剛才複製的資訊
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 4. 啟動開發伺服器
npm run dev
```

### 步驟 7: 測試

1. 開啟瀏覽器訪問 http://localhost:5173
2. 點擊「使用 Google 帳號登入」
3. 選擇你的 Google 帳號
4. 登入成功後：
   - 如果是 Admin email：會導向 Admin 主控台
   - 如果是一般用戶：會導向紀念品目錄

---

## ✅ 完成檢查清單

- [ ] Supabase 專案已建立
- [ ] 資料庫 schema 已執行
- [ ] Google OAuth 已設定
- [ ] Admin email 已新增
- [ ] 環境變數已設定
- [ ] 依賴已安裝
- [ ] 開發伺服器已啟動
- [ ] 可以成功登入

---

## 🐛 常見問題

### Q: 登入後顯示「無法載入用戶資料」
**A**: 等待 1-2 秒後重新整理頁面。第一次登入時 trigger 需要時間建立 profile。

### Q: 登入後沒有 Admin 權限
**A**: 確認：
1. 你的 email 已加入 `admin_emails` 表
2. 登出後重新登入
3. 檢查 SQL 是否執行成功

### Q: 無法連線到 Supabase
**A**: 檢查：
1. `.env` 檔案中的 URL 和 Key 是否正確
2. Supabase 專案是否正常運行
3. 網路連線是否正常

### Q: Google OAuth 錯誤
**A**: 確認：
1. Callback URL 是否正確設定
2. Client ID 和 Secret 是否正確
3. Google Cloud 專案是否啟用

---

## 📝 下一步

### 新增測試資料
```bash
# 在 Supabase SQL Editor 執行
\i supabase/seed.sql
```

### 測試爬蟲功能
1. 前往 Admin > 爬蟲管理
2. 查看預設的爬蟲來源
3. 點擊「立即執行」（需要先完成 Phase 2 Edge Function）

### 新增更多 Admin
1. 前往 Admin > 設定
2. 輸入 email 並點擊「新增」
3. 該用戶下次登入時會自動成為 Admin

---

## 🎉 恭喜！

你已經成功啟動股東會紀念品管理系統！

現在你可以：
- 瀏覽紀念品目錄
- 收藏感興趣的紀念品
- （Admin）管理爬蟲來源
- （Admin）查看系統統計

---

**需要幫助？** 查看 [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) 了解更多資訊。
