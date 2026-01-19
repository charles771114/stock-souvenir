# 任務計畫: 後台歷史資料匯入與權限管理

## Phase 3.1: 資料庫與基礎建設 (Database & Infra)
- [ ] **DB-01**: 建立 Migration `migrations/20260120000000_admin_policies.sql`。
    - [ ] 新增 Policy: `Admins can insert souvenirs`。
    - [ ] 新增 Policy: `Admins can update souvenirs`。
    - [ ] 新增 Policy: `Admins can view all profiles`。
- [ ] **DEP-01**: 安裝前端依賴。
    - [ ] 執行 `npm install papaparse xlsx`。
    - [ ] 安裝型別 (若有需要) `npm install -D @types/papaparse`。

## Phase 3.2: 核心邏輯 (Core Logic)
- [ ] **UTIL-01**: 實作 `src/utils/fileParser.ts`。
    - [ ] 實作 `parseFile(file, targetYear)` 函式。
    - [ ] 實作 `KEY_MAPPING` 可以辨識中英文欄位。
    - [ ] 實作 `doc_id` 生成邏輯: `${code}_${formatted_date}`。
    - [ ] 實作年份強制邏輯: 若 `targetYear` 存在，強制替換/補全日期年份。

## Phase 3.3: 前端元件開發 (Frontend Components)
- [ ] **COMP-01**: 建立 `src/components/AdminImportPanel.vue`。
    - [ ] UI: 年份選擇器 (`<select>`).
    - [ ] UI: 檔案上傳區域 (Drag & Drop).
    - [ ] UI: 預覽表格 (前 5 筆).
    - [ ] Logic: 呼叫 `parseFile` 並顯示結果。
    - [ ] Logic: 執行 Supabase `upsert`。
- [ ] **COMP-02**: 建立 `src/components/AdminUserList.vue`。
    - [ ] Logic: 使用 `useAdmin` composable 獲取資料。
    - [ ] UI: 表格顯示 Email, Role, Created At。
    - [ ] UI: 簡單的 Loading / Empty 狀態。

## Phase 3.4: 整合與頁面 (Integration)
- [ ] **VIEW-01**: 更新 `src/views/AdminPanel.vue`。
    - [ ] 引入 `AdminImportPanel`。
    - [ ] 引入 `AdminUserList`。
    - [ ] 調整版面配置。
- [ ] **COMPOSABLE-01**: 更新 `src/composables/useAdmin.js`。
    - [ ] 新增 `fetchAllUsers()` 函式 (對應 RLS)。

## Phase 3.5: 驗證 (Verification)
- [ ] **TEST-01**: 使用 Admin 帳號登入，上傳一份測試 Excel (含缺年份資料)，指定年份 2024。
    - [ ] 驗證資料庫是否成功寫入，且日期為 2024 年。
- [ ] **TEST-02**: 使用一般 User 帳號登入，確認無法看見 Admin Panel，也無法呼叫相關 API。
