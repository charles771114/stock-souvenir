# 股東會紀念品管理系統 - 專案總結

## 🎯 專案概述

一個完整的股東會紀念品管理系統，支援一般用戶瀏覽和收藏紀念品，以及 Admin 管理爬蟲和系統設定。

### 技術棧
- **前端**: Vue 3 + Vite + Tailwind CSS
- **後端**: Supabase (PostgreSQL + Auth + Edge Functions)
- **認證**: Google OAuth
- **爬蟲**: Supabase Edge Functions + Cheerio

---

## 📦 專案結構

```
stock-souvenir/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql      # 資料庫 schema
│   ├── schema.sql                       # 舊的 schema（可刪除）
│   ├── seed.sql                         # 測試資料
│   ├── config.toml                      # 本地開發設定
│   └── README.md                        # Supabase 設定指南
│
├── src/
│   ├── lib/
│   │   └── supabase.js                  # Supabase client
│   │
│   ├── composables/
│   │   ├── useAuth.js                   # 認證功能
│   │   ├── useGifts.js                  # 紀念品管理
│   │   ├── useScraper.js                # 爬蟲管理
│   │   └── useAdmin.js                  # Admin 功能
│   │
│   ├── router/
│   │   └── index.js                     # 路由設定
│   │
│   ├── views/
│   │   ├── Login.vue                    # 登入頁
│   │   ├── AuthCallback.vue             # OAuth 回調
│   │   ├── GiftCatalog.vue              # 紀念品目錄
│   │   ├── MyCollections.vue            # 我的收藏
│   │   ├── AdminPanel.vue               # Admin 主控台
│   │   ├── ScraperManager.vue           # 爬蟲管理
│   │   └── AdminSettings.vue            # Admin 設定
│   │
│   ├── components/
│   │   ├── Navbar.vue                   # 導航列
│   │   ├── GiftCard.vue                 # 紀念品卡片
│   │   ├── LoadingSpinner.vue           # Loading 元件
│   │   ├── ScraperSourceForm.vue        # 爬蟲來源表單
│   │   └── ScraperLogTable.vue          # 爬蟲日誌表格
│   │
│   ├── style/
│   │   └── main.css                     # 全域樣式
│   │
│   ├── App.vue                          # 主應用程式
│   └── main.js                          # 應用程式入口
│
├── scripts/
│   ├── sync-sheets-to-supabase.js       # Google Sheets 同步
│   ├── test-supabase-connection.js      # 連線測試
│   └── create-test-user.js              # 建立測試使用者
│
├── .env.example                         # 環境變數範例
├── package.json                         # 專案依賴
├── vite.config.js                       # Vite 設定
├── tailwind.config.js                   # Tailwind 設定
│
└── 文件/
    ├── PHASE1_VERIFICATION.md           # Phase 1 驗證文件
    ├── FRONTEND_COMPLETE.md             # 前端完成總結
    ├── PROJECT_SUMMARY.md               # 本文件
    └── QUICK_START.md                   # 快速開始指南
```

---

## ✅ 已完成的功能

### Phase 1: 資料庫設計與認證 ✅

#### 資料表
- ✅ `users` - 用戶基本資料
- ✅ `admin_emails` - Admin 白名單
- ✅ `gift_catalog` - 紀念品目錄
- ✅ `user_collections` - 用戶收藏記錄
- ✅ `scraper_sources` - 爬蟲來源設定
- ✅ `scraper_logs` - 爬蟲執行紀錄

#### 自動化功能
- ✅ 自動設定 Admin 權限（基於 email 白名單）
- ✅ 自動更新 `updated_at` 時間戳記
- ✅ 完整的 Row Level Security (RLS) 政策

#### 實用功能
- ✅ Views: `user_collection_stats`, `scraper_stats`
- ✅ Functions: `is_admin()`, `get_user_collection_count()`

### Phase 3: 前端專案 ✅

#### 核心功能
- ✅ Google OAuth 登入/登出
- ✅ 自動判定 Admin 權限
- ✅ 路由守衛（認證 + Admin 檢查）

#### 一般用戶功能
- ✅ 瀏覽紀念品目錄（卡片式呈現）
- ✅ 多條件篩選（年份、分類、搜尋）
- ✅ 加入/移除收藏
- ✅ 查看我的收藏
- ✅ 編輯收藏備註和日期
- ✅ 收藏統計

#### Admin 功能
- ✅ 系統主控台（統計資料）
- ✅ 爬蟲來源管理（新增/編輯/刪除）
- ✅ 手動觸發爬蟲
- ✅ 查看爬蟲執行記錄
- ✅ 管理 Admin 白名單
- ✅ 查看所有用戶
- ✅ 編輯/刪除紀念品

---

## ⏳ 待完成的功能

### Phase 2: Supabase Edge Function（爬蟲）

需要建立 `supabase/functions/scrape-gifts/index.ts`：

#### 功能需求
- 接收參數：`source_id`
- 從 `scraper_sources` 讀取設定
- 使用 Cheerio 解析 HTML
- 根據 `selector_config` 抓取資料
- 寫入 `gift_catalog` 表（UPSERT）
- 記錄執行結果到 `scraper_logs`

#### 錯誤處理
- 網路請求失敗：重試 3 次
- HTML 解析失敗：記錄錯誤並繼續
- 資料庫寫入失敗：rollback 並記錄

---

## 🚀 快速開始

### 1. 環境準備

#### 必要工具
- Node.js 18+
- npm 或 pnpm
- Supabase 帳號
- Google Cloud 帳號（OAuth）

### 2. Supabase 設定

#### 2.1 建立專案
1. 前往 https://app.supabase.com/
2. 建立新專案
3. 選擇區域：Southeast Asia (Singapore)

#### 2.2 執行資料庫 Migration
在 Supabase Dashboard > SQL Editor 執行：
```sql
-- 複製 supabase/migrations/001_initial_schema.sql 的內容並執行
```

#### 2.3 設定 Google OAuth
1. 前往 Authentication > Providers > Google
2. 啟用 Google 登入
3. 填入 Client ID 和 Client Secret
4. 複製 Callback URL 到 Google Cloud Console

#### 2.4 設定 Admin 白名單
在 SQL Editor 執行：
```sql
INSERT INTO public.admin_emails (email) 
VALUES ('your-email@gmail.com');
```

### 3. 本地開發設定

#### 3.1 安裝依賴
```bash
npm install
```

#### 3.2 設定環境變數
```bash
cp .env.example .env
```

編輯 `.env`：
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 3.3 啟動開發伺服器
```bash
npm run dev
```

訪問 http://localhost:5173

### 4. 測試

#### 4.1 測試 Supabase 連線
```bash
npm run supabase:test
```

#### 4.2 測試登入
1. 點擊「使用 Google 帳號登入」
2. 選擇 Google 帳號
3. 確認登入成功

#### 4.3 測試 Admin 功能
使用 Admin email 登入，應該會看到：
- 導航列有 Admin 選項
- 自動導向 Admin 主控台

---

## 📊 資料庫架構

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

---

## 🔐 權限設計

### RLS 政策

#### users 表
- 用戶可查看自己的資料
- Admin 可查看所有用戶資料

#### gift_catalog 表
- 所有已登入用戶可查看
- 只有 Admin 可新增/編輯/刪除

#### user_collections 表
- 用戶只能管理自己的收藏
- Admin 可查看所有收藏

#### scraper_sources 表
- 只有 Admin 可管理

#### scraper_logs 表
- 只有 Admin 可查看

#### admin_emails 表
- 只有 Admin 可管理

---

## 🎨 UI/UX 設計

### 配色方案
- 主色：Indigo (#6366f1)
- 成功：Green (#10b981)
- 警告：Yellow (#f59e0b)
- 錯誤：Red (#ef4444)
- Admin：Purple (#8b5cf6)

### 響應式設計
- 手機：< 640px
- 平板：640px - 1024px
- 桌面：> 1024px

### 動畫效果
- Hover 效果
- 過渡動畫（150ms）
- Loading 旋轉動畫
- 平滑滾動

---

## 📝 開發指南

### 新增頁面
1. 在 `src/views/` 建立 Vue 元件
2. 在 `src/router/index.js` 新增路由
3. 設定 `meta` 屬性（requiresAuth, requiresAdmin）

### 新增 API 功能
1. 在對應的 composable 新增函數
2. 使用 `supabase.from()` 或 `supabase.functions.invoke()`
3. 處理 loading 和 error 狀態

### 新增元件
1. 在 `src/components/` 建立 Vue 元件
2. 使用 props 和 emits 定義介面
3. 保持元件可重用性

---

## 🐛 疑難排解

### 登入失敗
- 檢查 Google OAuth 設定
- 確認 Callback URL 正確
- 檢查環境變數

### 權限錯誤
- 確認 RLS 政策已啟用
- 檢查 admin_emails 白名單
- 重新登入以更新權限

### 爬蟲無法執行
- 確認 Edge Function 已部署
- 檢查 selector_config 設定
- 查看 scraper_logs 錯誤訊息

---

## 📚 相關文件

### 專案文件
- [Phase 1 驗證文件](PHASE1_VERIFICATION.md)
- [前端完成總結](FRONTEND_COMPLETE.md)
- [Supabase 設定指南](supabase/README.md)

### 官方文件
- [Supabase 文件](https://supabase.com/docs)
- [Vue 3 文件](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 🎯 下一步計畫

### 短期目標
1. ⏳ 完成 Phase 2：建立 Edge Function
2. ⏳ 測試爬蟲功能
3. ⏳ 部署到 production

### 中期目標
- 新增更多爬蟲來源
- 實作通知功能
- 新增資料匯出功能
- 優化行動裝置體驗

### 長期目標
- 實作 Realtime 即時更新
- 新增紀念品評論功能
- 建立社群分享功能
- 開發行動 App

---

## 👥 團隊

- **Senior Full-Stack Developer**: 負責整體架構和開發

---

## 📄 授權

本專案為私有專案。

---

**最後更新**：2025-01-14  
**版本**：v1.0.0  
**狀態**：Phase 1 & 3 完成，Phase 2 待開發
