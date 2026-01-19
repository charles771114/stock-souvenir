# 變更記錄

所有重要的專案變更都會記錄在此文件中。

格式基於 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.0.0/)，
版本號遵循 [Semantic Versioning](https://semver.org/lang/zh-TW/)。

## [1.0.0] - 2025-01-14

### 新增
- **Phase 1: 資料庫設計與認證機制**
  - 建立完整的 PostgreSQL schema (`supabase/migrations/001_initial_schema.sql`)
  - 6 個資料表：`users`, `admin_emails`, `gift_catalog`, `user_collections`, `scraper_sources`, `scraper_logs`
  - 完整的 Row Level Security (RLS) 政策
  - 自動化 Triggers（Admin 權限設定、時間戳記更新）
  - Views 和 Functions（統計、權限檢查）
  - 初始 Admin email 設定為 `charles771114@gmail.com`

- **Phase 3: 前端專案建置**
  - 4 個 Composables：`useAuth.js`, `useGifts.js`, `useScraper.js`, `useAdmin.js`
  - 7 個 Views：Login, AuthCallback, GiftCatalog, MyCollections, AdminPanel, ScraperManager, AdminSettings
  - 5 個 Components：Navbar, GiftCard, LoadingSpinner, ScraperSourceForm, ScraperLogTable
  - 路由系統與守衛（認證 + Admin 檢查）
  - Google OAuth 整合
  - 響應式 Tailwind CSS 設計

- **文件系統**
  - Antigravity 文件結構（`.antigravity/` 目錄）
  - 快速開始指南、設定指南、API 參考
  - 開發指南和最佳實踐
  - Supabase 設定和指令速查表

### 變更
- 從 Firebase 遷移到 Supabase
  - 資料庫：Firestore → PostgreSQL
  - 認證：Firebase Auth → Supabase Auth
  - 權限控制：Security Rules → Row Level Security

### 移除
- 刪除所有 Firebase 相關檔案
  - `firebase.json`, `.firebaserc`, `firestore.rules`
  - `functions/` 目錄（Firebase Functions）
  - `src/firebase.js` 和相關工具
  - `scripts/sync-sheets-to-firestore.js`
- 清理舊的前端檔案
  - `src/composables/useSupabaseSouvenirs.js`（已整合到 useGifts.js）
  - `src/composables/useSupabaseGifts.js`（已整合到 useGifts.js）
  - `src/views/MyCollection.vue`（重命名為 MyCollections.vue）
  - `src/components/AddToCollectionButton.vue`（功能整合到 GiftCard.vue）
- 刪除舊的 Antigravity 文件
  - `.antigravity/context.md`
  - `.antigravity/QUICK_START.md`
  - `.antigravity/FILE_INDEX.md`
- 刪除重複的資料庫檔案
  - `supabase/schema.sql`（已整合到 migrations）

### 待完成
- **Phase 2: Supabase Edge Function（爬蟲）**
  - 建立 `supabase/functions/scrape-gifts/index.ts`
  - 實作 Cheerio HTML 解析
  - 錯誤處理和重試機制
  - 執行記錄和狀態追蹤

## [0.1.0] - 2024-12-XX

### 新增
- 初始專案建立
- Firebase 整合
- 基本前端架構
- Google Sheets 同步功能

---

## 版本說明

### [1.0.0] - 主要版本
- 完整的 Supabase 遷移
- 前端專案完整建置
- 生產環境就緒（除 Phase 2 外）

### [0.1.0] - 初始版本
- Firebase 原型
- 基本功能實作

---

## 未來計畫

### v1.1.0（短期）
- [ ] 完成 Phase 2：Edge Function 爬蟲
- [ ] 實作通知功能
- [ ] 新增資料匯出功能（CSV/Excel）
- [ ] 優化行動裝置體驗

### v1.2.0（中期）
- [ ] Realtime 即時更新
- [ ] 紀念品評論功能
- [ ] 社群分享功能
- [ ] 進階搜尋和篩選

### v2.0.0（長期）
- [ ] 行動 App 開發
- [ ] 多語言支援
- [ ] 個人化推薦系統
- [ ] 資料分析儀表板

---

**最後更新**：2025-01-14
