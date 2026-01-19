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

## Best Practices
1.  **Always use Migrations**: 不要在 Dashboard 直接修改 Table，永遠使用 Migration 檔案。
2.  **Sync Types Immediately**: 產生 Migration 後，立即更新 Types。
3.  **Check RLS**: 新增 Table 後，務必檢查 RLS Policy 是否啟用。
