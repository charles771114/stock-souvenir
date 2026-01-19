# Stock Souvenir - 股東會紀念品管理系統

一個現代化的股東會紀念品管理系統，從 Firebase 全面遷移至 **Supabase** 架構。支援一般用戶瀏覽和收藏紀念品，以及 Admin 管理員進行爬蟲數據更新與用戶管理。

---

## ✨ 主要功能

### 👤 一般用戶
- **Google 登入**：快速安全的身份驗證。
- **紀念品瀏覽**：查看數千筆上市櫃公司紀念品資料 (圖片、價格、發放地點)。
- **我的收藏**：標記感興趣的股票，並記錄「最後買進日」與「開會日期」。
- **搜尋與篩選**：依照年份、分類或關鍵字快速查找。

### 🛡️ Admin 管理員 (後台)
- **歷史資料匯入**：支援 CSV / Excel 批次上傳，並可指定年份 (解決舊資料年份判定問題)。
- **用戶管理**：查看所有註冊會員列表與權限。
- **爬蟲管理**：(開發中) 手動觸發 Edge Function 進行資料更新。
- **後台路徑**：`/admin` (需具備 Admin 權限，否則會自動導回首頁)。

---

## 🚀 技術架構

本專案採用前後端分離架構，並完全依賴 Supabase 提供的 Serverless 服務。

- **Frontend**: Vue 3, Vite, TailwindCSS (Hosted on GitHub Pages)
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google OAuth)
- **API/Functions**: Supabase Edge Functions (Deno)

---

## 📦 快速開始 (Local Development)

### 1. 環境準備
- Node.js (v18+)
- Docker Desktop (用於本地運行 Supabase)
- Supabase CLI (`npm install -g supabase`)

### 2. 安裝依賴
```bash
npm install
```

### 3. 啟動後端 (Supabase)
```bash
# 啟動本地資料庫與服務
supabase start

# 這會顯示 API URL 和 Anon Key，請記下來
```

### 4. 設定環境變數
將 `.env.example` 複製為 `.env`，並填入 `supabase start` 顯示的資訊：

```ini
# .env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=sb_publishable_...

# Google Login (本地開發需於 config.toml 設定，或直接使用 Supabase Dashboard 的設定)
# 注意：前端不需要 GOOGLE_CLIENT_SECRET，這些是在 Supabase 平台設定的。
```

### 5. 啟動前端
```bash
npm run dev
```
前往 http://localhost:5173

---

## 🚢 部署 (Deployment)

本專案使用 **GitHub Actions** 自動部署至 **GitHub Pages**。

### 1. 設定 GitHub Secrets
為了安全起見，API Key 不應直接提交到 Git。請在 GitHub Repo 的 **Settings > Secrets and variables > Actions** 新增以下變數：

| Secret Name | 說明 |
|-------------|------|
| `VITE_SUPABASE_URL` | 您的 Supabase 專案 URL (例如 https://xyz.supabase.co) |
| `VITE_SUPABASE_ANON_KEY` | 您的 Supabase Anon Public Key |

> **注意**：`GOOGLE_CLIENT_ID` 與 `GOOGLE_CLIENT_SECRET` **不需要** 設定在這裡。它們是在 Supabase Dashboard 的 Authentication > Providers > Google 中設定的。前端只需要 Supabase URL/Key 就能與 Auth 服務溝通。

### 2. 推送程式碼
推送到 `main` 或 `master` 分支即會自動觸發部署流程。

---

## 🛠️ 管理員指南

### 如何成為 Admin？
預設註冊用戶皆為 `user` 角色。要將某人設為 `admin`，需直接修改資料庫：

1. 進入 Supabase Dashboard > SQL Editor。
2. 執行以下 SQL (替換為目標 Email)：
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'target_user@gmail.com';
   ```

### 匯入歷史資料
1. 登入具有 Admin 權限的帳號。
2. 進入 **Admin Panel** (`/admin`)。
3. 選擇 **歷史資料匯入**。
4. 選取年份 (若檔案中日期缺少年份，如 "06/20")，並上傳 CSV/Excel 檔案。

---

## 📂 專案結構

```
stock-souvenir/
├── src/
│   ├── components/  # Vue 元件 (AdminImportPanel, Navbar...)
│   ├── views/       # 頁面 (Home, MyCollections, AdminPanel...)
│   ├── composables/ # 邏輯複用 (useAuth, useGifts...)
│   ├── lib/         # 第三方庫設定 (supabase.js)
│   ├── utils/       # 工具函式 (fileParser.ts)
│   └── style/       # Tailwind CSS
├── supabase/        # 資料庫與後端定義
│   ├── migrations/  # 資料庫變更記錄
│   ├── functions/   # Edge Functions (爬蟲)
│   └── seed.sql     # 測試資料
├── scripts/         # 開發輔助腳本
└── public/          # 靜態資源
```

---

**最後更新**: 2026-01-19
**版本**: v2.0.0 (Supabase Migration Complete)
