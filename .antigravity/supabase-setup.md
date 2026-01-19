# Supabase 設定與使用指南

本文件說明如何在 Antigravity 環境中使用 Supabase。

## 快速開始

### 1. 安裝 Supabase CLI (可選)

```bash
brew install supabase/tap/supabase
```

或使用 npm:

```bash
npm install -g supabase
```

### 2. 初始化本地開發環境

如果你想在本地運行 Supabase（使用 Docker）：

```bash
supabase init
supabase start
```

這會啟動本地 Supabase 實例，包括：
- PostgreSQL 資料庫
- Auth 服務
- Storage 服務
- Realtime 服務

### 3. 連接到遠端 Supabase

如果你已經有 Supabase 專案，可以直接使用：

```bash
supabase link --project-ref your-project-ref
```

## 資料庫遷移

### 執行 Schema

```bash
# 方法 1: 使用 Supabase CLI
supabase db push

# 方法 2: 在 Supabase Dashboard 執行
# 複製 supabase/schema.sql 內容到 SQL Editor 執行
```

### 建立新的遷移

```bash
supabase migration new your_migration_name
```

### 查看遷移狀態

```bash
supabase migration list
```

## 開發工作流程

### 1. 本地開發

```bash
# 啟動本地 Supabase
supabase start

# 取得本地連線資訊
supabase status

# 更新 .env 使用本地連線
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
```

### 2. 資料庫變更

```bash
# 建立新遷移
supabase migration new add_new_column

# 編輯遷移檔案
# supabase/migrations/YYYYMMDDHHMMSS_add_new_column.sql

# 套用遷移
supabase db reset
```

### 3. 同步到遠端

```bash
# 推送遷移到遠端
supabase db push
```

## 常用指令

### 資料庫

```bash
# 重置本地資料庫
supabase db reset

# 產生 TypeScript 型別
supabase gen types typescript --local > src/types/supabase.ts

# 執行 SQL 檔案
supabase db execute -f supabase/schema.sql
```

### 測試

```bash
# 執行資料庫測試
supabase test db

# 執行特定測試
supabase test db --file tests/database/test_rls.sql
```

### 部署

```bash
# 部署到 production
supabase db push --linked

# 查看遠端資料庫狀態
supabase db remote status
```

## 在 Antigravity 中使用

### 環境變數設定

在 `.antigravity/.env` 中設定：

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 使用 Composables

```javascript
// 在任何 Vue 元件中
import { useSupabaseSouvenirs } from '@/composables/useSupabaseSouvenirs'
import { useSupabaseGifts } from '@/composables/useSupabaseGifts'

// 查詢紀念品
const { souvenirs, fetchSouvenirs } = useSupabaseSouvenirs()
await fetchSouvenirs({ search: '台積電' })

// 管理收藏
const { gifts, addGift, removeGift } = useSupabaseGifts()
await addGift(souvenirId, 'collected')
```

### 直接使用 Supabase Client

```javascript
import { supabase } from '@/supabase'

// 查詢
const { data, error } = await supabase
  .from('souvenirs')
  .select('*')
  .eq('code', '2330')

// 新增
const { data, error } = await supabase
  .from('user_collections')
  .insert({ user_id: userId, souvenir_id: souvenirId })

// 更新
const { data, error } = await supabase
  .from('user_collections')
  .update({ status: 'collected' })
  .eq('id', collectionId)

// 刪除
const { data, error } = await supabase
  .from('user_collections')
  .delete()
  .eq('id', collectionId)
```

## 進階功能

### Realtime 訂閱

```javascript
// 監聽資料變更
const channel = supabase
  .channel('souvenirs-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'souvenirs' },
    (payload) => {
      console.log('Change received!', payload)
    }
  )
  .subscribe()

// 取消訂閱
channel.unsubscribe()
```

### Storage 使用

```javascript
// 上傳檔案
const { data, error } = await supabase.storage
  .from('stock-data')
  .upload('stock-20250114.json', file)

// 下載檔案
const { data, error } = await supabase.storage
  .from('stock-data')
  .download('stock-20250114.json')

// 取得公開 URL
const { data } = supabase.storage
  .from('stock-data')
  .getPublicUrl('stock-20250114.json')
```

### Edge Functions

如果需要建立 Supabase Edge Functions：

```bash
# 建立新 function
supabase functions new my-function

# 本地測試
supabase functions serve my-function

# 部署
supabase functions deploy my-function
```

## 疑難排解

### 連線問題

```bash
# 檢查 Supabase 狀態
supabase status

# 重啟服務
supabase stop
supabase start
```

### RLS 問題

如果遇到權限錯誤，檢查：
1. 是否已登入（`supabase.auth.getUser()`）
2. RLS 政策是否正確設定
3. 使用正確的 key（anon key vs service role key）

### 效能優化

1. 使用適當的索引
2. 限制查詢結果數量（`.limit(100)`）
3. 使用 `.select()` 只取需要的欄位
4. 考慮使用 Materialized Views

## 相關資源

- [Supabase 官方文件](https://supabase.com/docs)
- [Supabase CLI 文件](https://supabase.com/docs/guides/cli)
- [PostgreSQL 文件](https://www.postgresql.org/docs/)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
