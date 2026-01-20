# 開發任務詳解: Admin Dashboard

## Phase 4.1: Database (Supabase)
- [ ] **Migration**: 建立 `admin_user_favorites` View 與 Admin RLS Policies <!-- id: db-1 -->
    - 檔案: `supabase/migrations/20260121000000_admin_dashboard_schema.sql`
    - 內容: Create View, Add Policies.
- [ ] **Type Gen**: 更新 TypeScript 定義 <!-- id: db-2 -->
    - 指令: `npm run supabase:types`

## Phase 4.2: Frontend Utility
- [ ] **Refactor fileParser.ts** <!-- id: util-1 -->
    - 功能: 增強 `parseFile` 函式，回傳更詳細的錯誤報告 (Row Number, Column Name)。
    - 測試: 撰寫單元測試驗證錯誤捕捉。

## Phase 4.3: Frontend Components (UI/UX)
- [ ] **AdminDashboard.vue** <!-- id: fe-1 -->
    - 建立基本佈局 (Tabs, Title)。
    - 應用 Glassmorphism 樣式。
- [ ] **UserFavoritesTable.vue** <!-- id: fe-2 -->
    - 實作資料表格與分頁。
    - 實作過濾器 (FilterBar)。
    - 整合 Supabase `admin_user_favorites` 查詢。
- [ ] **AdminImportPanel.vue Refactor** <!-- id: fe-3 -->
    - 更新 UI 風格以符合 Pro Max 標準。
    - 整合新的 `fileParser` 錯誤回報機制。
    - 顯示詳細的錯誤清單 UI。

## Phase 4.4: Verification
- [ ] **Manual Test**: 使用 Admin 帳號登入，驗證是否能看到所有數據。
- [ ] **Manual Test**: 使用一般 User 帳號登入，驗證是否被拒絕存取。
- [ ] **Import Test**: 上傳範例 CSV/XLSX，驗證 Upsert 邏輯。
