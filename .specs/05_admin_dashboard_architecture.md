# 系統架構: Admin Dashboard

## 1. 資料庫變更 (Database Changes)

### 1.1 RLS Policies Update
為了讓管理員能查看所有用戶與收藏，需新增以下 Policies：

```sql
-- Profiles: Allow Admins to select all
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- User Collections: Allow Admins to select all
create policy "Admins can view all collections"
  on public.user_collections for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );
```

### 1.2 New View: `admin_user_favorites`
建立一個專門的 View 供後台查詢，簡化前端 Join 邏輯。

```sql
create or replace view public.admin_user_favorites with (security_invoker=true) as
select
  uc.id as collection_id,
  uc.user_id,
  p.email,
  s.id as souvenir_id,
  s.code as stock_code,
  s.name as company_name,
  s.souvenir_item,
  s.last_buy_date,
  uc.created_at as collected_at
from public.user_collections uc
join public.profiles p on uc.user_id = p.id
join public.souvenirs s on uc.souvenir_id = s.id;
```
*   **Security Invoker**: `true` (會沿用當前用戶的 RLS 權限，因此上述的 Admin RLS 至關重要)。

## 2. API / Edge Functions
本次不需要新增 Edge Function，直接使用 **Supabase JS Client** 進行查詢。

*   **Query User Favorites**:
    ```javascript
    supabase
      .from('admin_user_favorites')
      .select('*', { count: 'exact' })
      .range(0, 49) // Pagination
      .order('collected_at', { ascending: false })
    ```
*   **Bulk Import**:
    *   使用既有的 `supabase.from('souvenirs').upsert()`。

## 3. 前端架構 (Frontend Architecture)

### 3.1 路由 (Routes)
*   `/admin` (Existing): Admin Dashboard 首頁。
*   新增 `AdminDashboard.vue` 作為容器，內含 Tabs 切換不同功能模組。

### 3.2 元件與階層 (Component Hierarchy)

```
src/views/AdminDashboard.vue (New Layout with Tabs)
├── Tab 1: 收藏數據總覽
│   └── UserFavoritesTable.vue (New)
│       ├── FilterBar (搜尋 Email/股票代碼, 日期)
│       ├── StatCards (統計卡片)
│       └── Pagination (分頁器)
├── Tab 2: 歷史資料匯入
│   └── AdminImportPanel.vue (Refactor)
│       └── FileUploader.vue (UI Refactor)
└── Tab 3: 用戶管理 (Existing)
    └── AdminUserList.vue
```

### 3.3 狀態管理 (State Management)
*   使用 Vue `ref` / `reactive` 在各頁面管理自身狀態 (Local State)。
*   不需要全域 Store，除非多個 Tab 需要共享數據 (目前看起來是獨立的)。

### 3.4 工具函式 (Utils)
*   `src/utils/fileParser.ts`:
    *   增強錯誤處理 (回傳 `Result<ParsedData, ErrorReport[]>`)。
    *   確保支援 `.xlsx` (透過 `xlsx` 套件)。

## 4. 錯誤處理策略 (Error Handling)
*   **Import Errors**:
    *   前端解析階段：即時顯示錯誤行號 (e.g. "第 5 行：缺少股票代碼")。
    *   後端寫入階段：捕獲 `upsert` 回傳的錯誤，顯示於 Toast 或錯誤清單。
*   **Data Loading**:
    *   使用 Skeleton Loading 或 Spinner 處理載入狀態。

## 5. UI/UX 規範 (Glassmorphism)
*   **Background**: `bg-gray-900`
*   **Card**: `bg-white/10 backdrop-blur-md border border-white/20`
*   **Text**: `text-white` (Primary), `text-gray-300` (Secondary)
