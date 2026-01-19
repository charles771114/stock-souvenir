# 任務計畫: 後台歷史資料匯入功能

## 任務清單

- [ ] **Task 1: 資料庫權限設定 (Backend)**
    - [ ] 建立 migration `supabase/migrations/[timestamp]_add_admin_souvenir_policy.sql`。
    - [ ] 加入 `public.souvenirs` 的 Admin RLS Policies (Insert/Update)。
    - [ ] 加入 `public.profiles` 的 Admin RLS Policies (Select all)。
    - [ ] 執行 `supabase db reset` (或適當的 migration 指令)。

- [ ] **Task 2: 前端基礎建設 (Frontend Infra)**
    - [ ] 安裝套件: `npm install papaparse xlsx`。
    - [ ] 建立/更新 `src/utils/fileParser.ts`。
        - [ ] 實作 CSV 解析 (PapaParse)。
        - [ ] 實作 Excel 解析 (SheetJS)。
        - [ ] **實作年份注入邏輯**: 支援外部傳入 `targetYear`，補足缺失年份的日期。
        - [ ] 實作欄位正規化邏輯 (Mapping Strategy)。
    - [ ] *Verification*: 測試 parser 能正確處理「無年份日期」與「已有年份日期」。

- [ ] **Task 3: 實作匯入 UI 元件 (Frontend UI)**
    - [ ] 建立 `src/components/AdminImportPanel.vue`。
    - [ ] 實作 **年份選擇器** (Select Year)。
    - [ ] 實作檔案拖曳/選擇介面。
    - [ ] 整合 `fileParser`，傳入使用者選擇的年份。
    - [ ] 實作資料預覽功能。
    - [ ] 整合 Supabase 寫入邏輯。
    - [ ] *Verification*: 上傳無年份的檔案，確認預覽中顯示正確的年份。

- [ ] **Task 4: 實作使用者管理清單 (User Management)**
    - [ ] 建立 `src/components/AdminUserList.vue`。
    - [ ] Fetch `profiles` 資料 (需確認 RLS 生效)。
    - [ ] 顯示 Email, Role, Created At。
    - [ ] (Optional) 實作簡單的搜尋功能。

- [ ] **Task 5: 整合至 Admin Panel**
    - [ ] 修改 `src/views/AdminPanel.vue`。
    - [ ] 加入 `AdminImportPanel`。
    - [ ] 加入 `AdminUserList`。
    - [ ] 設定 Tab 切換或區塊分隔。

- [ ] **Task 6: 端對端測試 (E2E Test)**
    - [ ] 準備測試資料: 包含中文欄位、無年份日期的 Excel/CSV。
    - [ ] Admin 登入 -> 選擇年份 -> 上傳 -> 驗證資料庫。
    - [ ] Admin 登入 -> 查看使用者列表 -> 驗證能看到所有使用者。
    - [ ] User 登入 -> 嘗試存取 Admin 頁面 -> 驗證被拒絕。
