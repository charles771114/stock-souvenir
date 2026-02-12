---
name: supabase-commander
description: Standardized workflow for Supabase development, migration, and deployment.
---

# Supabase Commander

此 Skill 提供標準化的 Supabase 開發流程，確保資料庫遷移、型別生成與 Edge Function 部署的一致性。

## Capabilities

### 1. Database Migration (`dev:migration`)
自動比較本地與遠端 (或目前開發環境) 的 Schema 差異，產生 Migration 檔案。
- **Usage**: 用於當你修改了 Table 結構 (SQL) 後，需要產生對應的 migration file。
- **Command**:
  ```bash
  npx supabase db diff -f <descriptive_name>
  ```

### 2. Type Synchronization (`dev:types`)
根據目前的資料庫 Schema 自動生成 TypeScript 型別定義，供前端使用。
- **Usage**: 每次 Schema 變更後必須執行。
- **Command**:
  ```bash
  npx supabase gen types typescript --local > src/types/supabase.ts
  ```

### 3. Function Deployment (`deploy:function`)
部署 Edge Functions 到專案。
- **Usage**: 當修改了 `supabase/functions` 下的程式碼時使用。
- **Command**:
  ```bash
  npx supabase functions deploy <function_name> --no-verify-jwt
  ```

### 4. Local Development (`dev:start` / `dev:stop`)
管理本地 Supabase 服務。
- **Start**: `npx supabase start`
- **Stop**: `npx supabase stop`

### 5. Project Utility Scripts
本專案包含數個客製化腳本，請優先使用：

- **Sync Data**: `npm run sync:supabase`
    - 將 Google Sheets 中的紀念品資料同步到 Supabase。
    - 當使用者說「更新資料」或「同步 Sheets」時使用。

- **Test Connection**: `npm run supabase:test`
    - 測試 Supabase 連線與資料完整性。
    - 當遇到連線問題或需要確認環境變數時使用。

- **Create Test User**: `npm run supabase:create-user <email> <password>`
    - 快速建立測試帳號（自動處理 Profile 與 Email 確認）。
    - 預設帳密: `test@example.com` / `test123456`

- **Database Reset**: `npm run db:reset`
    - 重置資料庫、套用 schema 並重新 seed。
    - **警告**: 這會清除所有資料！

## Best Practices
1.  **Always use Migrations**: 不要在 Dashboard 直接修改 Table，永遠使用 Migration 檔案。
2.  **Idempotent Migrations (重要)**: 為了避免部署衝突，Migration 檔案應具備等冪性：
    - 使用 `CREATE TABLE IF NOT EXISTS`。
    - 使用 `DO` 區塊檢查 RLS Policy 是否存在，避免 `db push` 失敗：
      ```sql
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'my_table' AND policyname = 'my_policy') THEN
          CREATE POLICY "my_policy" ON public.my_table ...;
        END IF;
      END $$;
      ```
3.  **Standard Timestamps**: 避免手動命名 Migration (如 `20260210_fix.sql`)，應使用 `npx supabase migration new <name>` 確保流水號格式正確。
4.  **Sync Types Immediately**: 產生 Migration 後，立即更新 Types。
5.  **Check RLS**: 新增 Table 後，務必檢查 RLS Policy 是否啟用。
