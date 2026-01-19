# 系統架構: 後台歷史資料匯入功能

## 技術決策 (Technical Decisions)
-   **匯入方式**: Client-side Parsing + Client-side Direct Insert (RLS)。
    -   *考量*: 為了支援 CSV/Excel，在前端解析可以即時預覽並減少傳輸流量。
-   **解析套件**:
    -   CSV: `papaparse` (輕量、強大)。
    -   Excel: `xlsx` (SheetJS) (業界標準)。

## 資料庫變更 (Database Changes)

### 1. 新增 RLS Policy (必要)
同前版，確保 Admin 具有 `souvenirs` 表格的寫入權限。

```sql
-- migration file: add_admin_policy_souvenirs.sql
-- (內容同前，確保 Admin 可 Insert/Update)
create policy "Admins can insert souvenirs" on public.souvenirs for insert ...
create policy "Admins can update souvenirs" on public.souvenirs for update ...

-- User Management Policies
-- Admin can view all profiles
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
```

## 前端變更 (Frontend Changes)

### 1. 新增依賴 (Dependencies)
```bash
npm install papaparse xlsx
```

### 2. 更新工具函式 `src/utils/fileParser.ts`
-   修改 `parseFile(file, year?): Promise<any[]>`。
-   **年份處理**:
    -   若提供 `year` 參數，且解析出的日期缺少年份，則強制使用該年份。
    -   若解析出的日期年份與 `year` 不符，標記為 Warning (或以 UI 提示)。

### 3. 新增元件 `AdminImportPanel.vue`
-   **UI**:
    -   年份選擇器 (Select): [2024, 2025, ...]。
    -   檔案上傳區 (File Input / Dropzone)。
    -   預覽表格 (Preview Table): 顯示解析後的資料 (前幾筆)。
    -   上傳按鈕: 觸發 `supabase.upsert`。
-   **邏輯**:
    -   `handleFileUpload`: 呼叫 `parseFile(file, selectedYear)`。
    -   `uploadData`: 批次寫入。

### 4. 新增元件 `AdminUserList.vue`
-   **UI**:
    -   表格列出所有使用者 (Email, Role, Created At)。
    -   (Optional) 搜尋/篩選功能。
-   **邏輯**:
    -   Fetch `supabase.from('profiles').select('*')`。
    -   依賴新的 RLS policy 確保只有 Admin 讀取得到。

## API / Edge Function
-   維持不需變更，使用 Supabase Client。
