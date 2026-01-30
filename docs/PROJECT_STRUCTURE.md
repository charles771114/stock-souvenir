# 專案結構說明

## 📁 完整目錄結構

```
stock-souvenir/
│
├── 📂 .antigravity/                    # Antigravity 文件系統
│   ├── README.md                      # ⭐ 文件導航中心
│   ├── QUICK_START_GUIDE.md           # ⭐ 5 分鐘快速開始
│   ├── SETUP_GUIDE.md                 # ⭐ 完整設定指南
│   ├── API_REFERENCE.md               # ⭐ API 和 Composables 參考
│   ├── DEVELOPMENT_GUIDE.md           # ⭐ 開發指南和最佳實踐
│   ├── CHANGELOG.md                   # ⭐ 變更記錄
│   ├── PROJECT_STRUCTURE.md           # 本文件
│   ├── supabase-setup.md              # Supabase 設定指南
│   └── supabase-commands.md           # 指令速查表
│
├── 📂 supabase/                        # ⭐ Supabase 設定
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # ⭐ 資料庫 schema
│   └── .gitignore
│
├── 📂 src/
│   ├── 📂 lib/
│   │   └── supabase.js                # ⭐ Supabase client
│   │
│   ├── 📂 composables/
│   │   ├── useAuth.js                 # ⭐ 認證功能
│   │   ├── useGifts.js                # ⭐ 紀念品和收藏管理
│   │   ├── useScraper.js              # ⭐ 爬蟲管理
│   │   ├── useAdmin.js                # ⭐ Admin 功能
│   │   ├── usePortfolio.js            # ⭐ 帳戶歸戶管理 (New)
│   │   ├── usePDFScraper.js           # ⭐ PDF 解析功能 (New)
│   │   └── useInventoryImport.js      # ⭐ 庫存匯入邏輯 (New)
│   │
│   ├── 📂 components/
│   │   ├── Navbar.vue                 # ⭐ 導航列
│   │   ├── GiftCard.vue               # ⭐ 紀念品卡片
│   │   ├── LoadingSpinner.vue         # ⭐ Loading 元件
│   │   ├── ScraperSourceForm.vue      # ⭐ 爬蟲來源表單
│   │   └── ScraperLogTable.vue        # ⭐ 爬蟲日誌表格
│   │
│   ├── 📂 router/
│   │   └── index.js                   # ⭐ 路由設定（含守衛）
│   │
│   ├── 📂 views/
│   │   ├── Login.vue                  # ⭐ 登入頁
│   │   ├── AuthCallback.vue           # ⭐ OAuth 回調處理
│   │   ├── GiftCatalog.vue            # ⭐ 紀念品目錄
│   │   ├── MyCollections.vue          # ⭐ 我的收藏 (支援多帳戶)
│   │   ├── AdminPanel.vue             # ⭐ Admin 主控台
│   │   ├── ScraperManager.vue         # ⭐ 爬蟲管理
│   │   ├── AdminSettings.vue          # ⭐ Admin 設定
│   │   ├── AdminUserFavorites.vue     # ⭐ 入袋持股統計 (New)
│   │   └── 📂 admin/                  # ⭐ Admin 子頁面 (New)
│   │       ├── InventoryStagingView.vue    # ⭐ 庫存歸戶 (PDF/Excel)
│   │       ├── ClassificationCenterView.vue # ⭐ 分類中心
│   │       ├── UserManagementView.vue      # ⭐ 用戶管理
│   │       ├── SouvenirManagementView.vue  # ⭐ 紀念品管理
│   │       └── ReviewQueueView.vue         # ⭐ 審核隊列
│   │
│   ├── 📂 style/
│   │   └── main.css                   # ⭐ 全域樣式
│   │
│   ├── App.vue                        # ⭐ 主應用程式
│   └── main.js                        # ⭐ 應用程式入口
│
├── 📂 scripts/                         # 後端腳本
│   ├── sync-sheets-to-supabase.js    # Google Sheets 同步
│   ├── test-supabase-connection.js   # 連線測試
│   └── package.json                   # 腳本依賴
│
├── 📂 public/                          # 公開資源
├── 📂 dist/                            # 建置輸出
│
├── 📄 .env                             # 環境變數（不提交）
├── 📄 .env.example                     # ⭐ 環境變數範例
├── 📄 .gitignore
├── 📄 package.json                     # ⭐ 專案依賴和指令
├── 📄 vite.config.js                   # Vite 設定
├── 📄 tailwind.config.js               # Tailwind CSS 設定
├── 📄 index.html                       # HTML 入口
│
└── 📄 README.md                        # ⭐ 專案主要說明
```

⭐ = Supabase 遷移新增或更新的檔案

## 🎯 核心檔案說明

### 資料庫相關

#### `supabase/migrations/001_initial_schema.sql`
完整的 PostgreSQL schema，包含：
- 6 個主要資料表（users, admin_emails, gift_catalog, user_collections, scraper_sources, scraper_logs）
- Row Level Security (RLS) 政策
- 自動觸發器（Admin 權限設定、timestamps）
- Views 和 Functions（統計、權限檢查）
- 索引優化

### 前端整合

#### `src/lib/supabase.js`
```javascript
// Supabase client 初始化
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(url, key)
```

#### `src/composables/useAuth.js`
認證功能 composable：
- Google OAuth 登入/登出
- 使用者狀態管理
- Admin 權限檢查
- 自動導向處理

#### `src/composables/useGifts.js`
紀念品和收藏管理 composable：
- `fetchGifts()` - 取得所有紀念品
- `fetchMyCollections()` - 取得我的收藏
- `addToCollection()` - 新增收藏
- `updateCollection()` - 更新收藏
- `removeFromCollection()` - 刪除收藏
- 支援進階篩選（年份、分類、搜尋）

#### `src/composables/useScraper.js`
爬蟲管理 composable：
- `fetchScraperSources()` - 取得爬蟲來源
- `createScraperSource()` - 新增爬蟲來源
- `updateScraperSource()` - 更新爬蟲來源
- `deleteScraperSource()` - 刪除爬蟲來源
- `triggerScraper()` - 手動觸發爬蟲
- `fetchScraperLogs()` - 取得執行記錄

#### `src/composables/useAdmin.js`
Admin 功能 composable：
- `fetchUsers()` - 取得所有用戶
- `fetchAdminEmails()` - 取得 Admin 白名單
- `addAdminEmail()` - 新增 Admin
- `removeAdminEmail()` - 移除 Admin
- `fetchStats()` - 取得系統統計

#### `src/components/Navbar.vue`
導航列元件：
- 響應式設計
- 用戶資訊顯示
- Admin 專屬導航
- 登入/登出功能

#### `src/components/GiftCard.vue`
紀念品卡片元件：
- 卡片式呈現
- 收藏功能整合
- 圖片錯誤處理
- Hover 效果

#### `src/components/ScraperSourceForm.vue`
爬蟲來源表單元件：
- 新增/編輯模式
- 表單驗證
- JSON 設定編輯
- 錯誤提示

#### `src/components/ScraperLogTable.vue`
爬蟲日誌表格元件：
- 執行記錄顯示
- 狀態標籤
- 時間格式化
- 錯誤訊息顯示

#### `src/views/GiftCatalog.vue`
紀念品目錄頁面：
- 卡片式佈局
- 多條件篩選
- 搜尋功能
- 響應式設計

#### `src/views/MyCollections.vue`
我的收藏頁面：
- 收藏列表顯示
- 編輯備註和日期
- 刪除收藏
- 收藏統計

#### `src/views/AdminPanel.vue`
Admin 主控台：
- 系統統計資料
- 圖表顯示
- 最近新增紀念品
- 快速操作連結

#### `src/views/ScraperManager.vue`
爬蟲管理頁面：
- 爬蟲來源列表
- 新增/編輯/刪除
- 手動觸發執行
- 執行記錄查看

#### `src/views/AdminSettings.vue`
Admin 設定頁面：
- Admin 白名單管理
- 用戶列表查看
- 紀念品管理
- 系統設定

### 後端腳本

#### `scripts/sync-sheets-to-supabase.js`
Google Sheets 同步腳本：
- 讀取 Google Sheets 資料
- 計算資料 hash
- 只更新有變更的資料
- 使用 Service Role Key

#### `scripts/test-supabase-connection.js`
連線測試腳本：
- 測試 Supabase 連線
- 檢查所有資料表
- 顯示資料統計
- 提供除錯資訊

### 文件

#### `.antigravity/README.md`
文件導航中心：
- 專案概述
- 文件索引
- 快速開始
- 常用指令

#### `.antigravity/QUICK_START_GUIDE.md`
5 分鐘快速開始指南：
- 最精簡的設定步驟
- 環境準備
- 快速測試
- 疑難排解

#### `.antigravity/SETUP_GUIDE.md`
完整設定指南：
- 詳細的設定步驟
- Supabase 專案設定
- Google OAuth 設定
- 本地開發設定

#### `.antigravity/API_REFERENCE.md`
API 和 Composables 參考：
- 所有 Composables 的 API 文件
- 參數說明
- 回傳值說明
- 使用範例

#### `.antigravity/DEVELOPMENT_GUIDE.md`
開發指南和最佳實踐：
- 開發工作流程
- 程式碼規範
- 測試指南
- 部署流程

#### `.antigravity/supabase-commands.md`
指令速查表：
- 所有常用指令
- npm scripts
- 除錯技巧
- 實用小技巧

## 🔄 資料流程

### 1. Google Sheets → Supabase
```
Google Sheets
    ↓ (每日自動同步)
GitHub Actions
    ↓ (執行腳本)
scripts/sync-sheets-to-supabase.js
    ↓ (使用 Service Role Key)
Supabase PostgreSQL
    ↓ (souvenirs table)
前端查詢
```

### 2. 使用者認證流程
```
使用者點擊登入
    ↓
Google OAuth
    ↓
Supabase Auth
    ↓ (自動觸發)
建立 Profile (trigger)
    ↓
stores/auth.js 更新狀態
    ↓
前端顯示使用者資訊
```

### 3. 收藏功能流程
```
使用者瀏覽紀念品
    ↓
點擊「加入收藏」
    ↓
useSupabaseGifts.addGift()
    ↓ (檢查 RLS)
寫入 user_collections
    ↓
重新取得收藏列表
    ↓
UI 更新
```

## 🔐 安全架構

### 前端（使用 Anon Key）
```
src/supabase.js
    ↓ (使用 VITE_SUPABASE_ANON_KEY)
Supabase Client
    ↓ (受 RLS 保護)
只能存取允許的資料
```

### 後端（使用 Service Role Key）
```
scripts/*.js
    ↓ (使用 SUPABASE_SERVICE_ROLE_KEY)
Supabase Client (Admin)
    ↓ (繞過 RLS)
可以讀寫所有資料
```

### RLS 政策
```
souvenirs
├── SELECT: 所有人可讀取
└── INSERT/UPDATE/DELETE: 只能透過 Service Role Key

profiles
├── SELECT: 使用者只能讀取自己的
└── UPDATE: 使用者只能更新自己的

user_collections
├── SELECT: 使用者只能讀取自己的
├── INSERT: 使用者只能新增自己的
├── UPDATE: 使用者只能更新自己的
└── DELETE: 使用者只能刪除自己的
```

## 📊 資料庫關係圖

```
┌─────────────────┐
│   auth.users    │ (Supabase 內建)
│  (id, email)    │
└────────┬────────┘
         │ 1
         │
         │ 1
┌────────▼────────┐
│    profiles     │
│  (id, email,    │
│   role)         │
└────────┬────────┘
         │ 1
         │
         │ *
┌────────▼────────────┐      ┌─────────────────┐
│  user_collections   │  *   │   souvenirs     │
│  (id, user_id,      ├──────┤  (id, code,     │
│   souvenir_id,      │   1  │   name, ...)    │
│   status, ...)      │      │                 │
└─────────────────────┘      └─────────────────┘
```

## 🎨 元件層級

```
App.vue
├── Router
│   ├── Home (GiftList.vue)
│   │   ├── SouvenirCard
│   │   │   └── AddToCollectionButton ⭐
│   │   └── SearchBar
│   │
│   ├── MyCollection ⭐
│   │   ├── StatusFilter
│   │   └── CollectionCard
│   │       └── StatusButtons
│   │
│   └── DataUpdater
│
└── AuthButton (使用 stores/auth.js)
```

## 🛠️ 開發工作流程

### 本地開發（使用遠端 Supabase）
```bash
1. npm run dev              # 啟動前端
2. 開發功能
3. npm run supabase:test    # 測試連線
4. git commit & push
```

### 本地開發（使用本地 Supabase）
```bash
1. npm run supabase:start   # 啟動本地 Supabase
2. npm run db:seed          # 插入測試資料
3. npm run dev              # 啟動前端
4. 開發功能
5. npm run supabase:types   # 生成型別
6. git commit & push
```

### 資料同步
```bash
1. 更新 Google Sheets
2. npm run sync:supabase    # 手動同步
   或等待 GitHub Actions 自動執行
3. 檢查 Supabase Dashboard
```

## 📝 命名規範

### 檔案命名
- Vue 元件：PascalCase (e.g., `AddToCollectionButton.vue`)
- Composables：camelCase with `use` prefix (e.g., `useSupabaseGifts.js`)
- 工具函數：camelCase (e.g., `formatDate.js`)
- 設定檔：kebab-case (e.g., `vite.config.js`)

### 資料庫命名
- 資料表：snake_case, 複數 (e.g., `user_collections`)
- 欄位：snake_case (e.g., `souvenir_item`)
- 索引：`idx_` prefix (e.g., `idx_souvenirs_code`)
- 政策：描述性名稱 (e.g., `"Users can view own profile"`)

### 變數命名
- JavaScript：camelCase (e.g., `souvenirId`)
- 常數：UPPER_SNAKE_CASE (e.g., `SUPABASE_URL`)
- 元件 props：camelCase (e.g., `defaultStatus`)

## 🔍 快速查找

### 我想要...

**設定 Supabase**
→ 查看 `SETUP_CHECKLIST.md`

**快速開始**
→ 查看 `.antigravity/QUICK_START_SUPABASE.md`

**查詢紀念品**
→ 使用 `src/composables/useSupabaseSouvenirs.js`

**管理收藏**
→ 使用 `src/composables/useSupabaseGifts.js`

**同步資料**
→ 執行 `npm run sync:supabase`

**測試連線**
→ 執行 `npm run supabase:test`

**查看指令**
→ 查看 `.antigravity/supabase-commands.md`

**了解遷移**
→ 查看 `MIGRATION_SUMMARY.md`

---

**文件版本**：v1.0.0  
**最後更新**：2025-01-14
