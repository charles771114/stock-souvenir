# 專案規格書 (SPEC.md)

## 🎯 專案概述
**股東會紀念品管理系統 (Stock Souvenir)**
一個整合爬蟲、收藏與 LINE 通知的股東會紀念品管理平台。支援一般用戶瀏覽與收藏，並提供 Admin 管理介面。

## 🛠 技術棧
- **Frontend**: Vue 3 (Composition API), Vite, Tailwind CSS (Custom Tokens), Axios
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **Styling**: OKLCH-based Design Tokens, Glassmorphism, Premium UI Utility Classes
- **Monitoring**: Supabase Logs
- **Testing**: Vitest + Vue Test Utils

## 📂 核心架構 (Current State)

### 1. 資料庫 (Supabase)
- `users`: 用戶基本資料。
- `admin_emails`: Admin 權限白名單。
- `gift_catalog` (或 `souvenirs`): 紀念品主表。
- `user_collections`: 用戶收藏清單（追蹤/待買進標的）。
- `user_inventory`: 用戶持股庫存（已買進標的）。
- `scraper_sources`: 爬蟲來源設定。
- `scraper_logs`: 爬蟲執行日誌。

### 2. 前端路由
- `/`: 紀念品目錄 (`GiftCatalog.vue`)
- `/login`: 登入頁面
- `/collections`: 我的收藏 (`MyCollections.vue`)
- `/admin`: Admin 主控台 (`AdminPanel.vue`)
- `/admin/user`: 用戶管理 (`UserManagementView.vue`)
- `/admin/inventory`: 庫存維護 (`AdminInventoryManagementView.vue`)
- `/admin/staging`: 庫存掛鉤審核 (`InventoryStagingView.vue`)
- `/admin/scraper`: 爬蟲排程與日誌 (`ScraperManagementView.vue`)
- `/admin/categories`: 分類規則定義 (`CategoryManagerView.vue`)
- `/admin/classify`: 分類中心 (`ClassificationCenterView.vue`)
- `/admin/notifications`: 通知與 Bot 管理 (`NotificationManagementView.vue`)
- `/admin/settings`: 系統設定 (`AdminSettings.vue`)

### 3. Composables (邏輯抽離)
- `useAuth`: 處理 Google OAuth 與權限檢查。
- `useGifts`: 紀念品資料存取與目錄邏輯。
- `useCollection`: 用戶收藏與庫存管理的核心邏輯。
- `useScraper`: 爬蟲觸發與紀錄查看。
- `usePopupService`: 全域彈窗管理。

## 🚀 當前進度 (Current Status)
- ✅ 基礎架構 (Phase 1)
- ✅ 前端核心功能 (Phase 3)
- 🔵 LINE Bot 綁定驗證 (Current Focus)
- ⏳ 爬蟲 Edge Function 實作 (Phase 2)

## 🧠 核心業務邏輯 (Business Logic)

### 1. 追蹤 vs 庫存 (Tracking vs Inventory)
- **追蹤 (Track/Collected)**: 代表「待買進」標的。出現於首頁目錄的追蹤清單與「我的收藏」頁面。
- **庫存 (Inventory/Holding)**: 代表「已持有」標的。
- **排他性原則**: 當項目被加入「庫存」後，系統視為已完成購買，因此會自動在目錄中隱藏「追蹤」動作，並專注於庫存狀態管理。
- **移除確認 (Double-Click Confirmation)**: 移除庫存不採用 Modal 彈窗，而是使用「按鈕內確認」機制。第一次點擊按鈕進入確認狀態，第二次點擊才執行移除並同步。

### 2. 視覺身分與 UI 規範 (Visual Identity)
- **Golden Souvenir (黃金紀念品)**: 以 `brand-primary` (深藍靛青) 為主色，搭配 `brand-secondary` (遺產金/琥珀) 為強調色。
- **status-badge 系統**: 全域統一的狀態標籤，包含 `success`, `warning`, `error`, `primary`, `neutral` 五種語義化配置。
- **Glassmorphism (玻璃擬態)**: 使用 `.glass-card` 作為主要容器，具備 2.25rem 圓角與高質感毛玻璃效果。

## 📋 開發規範
1. **Superpowers**: 遵循 Brainstorming, Planning, TDD, Debugging 流程。
2. **Template Safety**: 修改 Vue template 後需執行 `npm run build` 驗證。
3. **Spec-Driven**: 任何功能變更後需同步更新本文件。
4. **語言**: 註解、文件與回應一律使用 **繁體中文 (zh-TW)**。
