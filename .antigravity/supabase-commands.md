# Supabase 常用指令速查表

## 📦 安裝與設定

### 安裝 Supabase CLI
```bash
# macOS (Homebrew)
brew install supabase/tap/supabase

# npm (全域安裝)
npm install -g supabase

# 檢查版本
supabase --version
```

### 初始化專案
```bash
# 在專案根目錄執行
supabase init

# 連結到遠端專案
supabase link --project-ref your-project-ref
```

## 🚀 本地開發

### 啟動/停止服務
```bash
# 啟動所有服務（需要 Docker）
supabase start

# 停止所有服務
supabase stop

# 重啟服務
supabase stop && supabase start

# 查看服務狀態
supabase status
```

### 服務 URL（本地）
啟動後會顯示：
- API URL: `http://localhost:54321`
- DB URL: `postgresql://postgres:postgres@localhost:54322/postgres`
- Studio URL: `http://localhost:54323`
- Inbucket URL: `http://localhost:54324` (測試 email)

## 🗄️ 資料庫管理

### 遷移（Migrations）
```bash
# 建立新遷移
supabase migration new migration_name

# 套用所有遷移
supabase db push

# 重置資料庫（會刪除所有資料！）
supabase db reset

# 查看遷移狀態
supabase migration list

# 修復遷移歷史
supabase migration repair
```

### 執行 SQL
```bash
# 執行 SQL 檔案
supabase db execute -f supabase/schema.sql

# 執行 SQL 指令
supabase db execute --sql "SELECT * FROM souvenirs LIMIT 5;"
```

### 資料庫備份與還原
```bash
# 匯出資料庫結構
supabase db dump -f backup.sql

# 匯出資料（包含資料）
supabase db dump --data-only -f data.sql

# 還原
psql -h localhost -p 54322 -U postgres -d postgres -f backup.sql
```

## 🔐 認證管理

### 使用者管理
```bash
# 列出所有使用者（需要 service role key）
# 使用 Dashboard 或 API

# 建立測試使用者
node scripts/create-test-user.js test@example.com password123
```

## 📊 型別生成

### TypeScript 型別
```bash
# 從本地資料庫生成
supabase gen types typescript --local > src/types/supabase.ts

# 從遠端資料庫生成
supabase gen types typescript --linked > src/types/supabase.ts

# 指定 schema
supabase gen types typescript --schema public --local > src/types/supabase.ts
```

## 🧪 測試

### 資料庫測試
```bash
# 執行所有測試
supabase test db

# 執行特定測試檔案
supabase test db --file tests/database/test_rls.sql
```

## 🔍 除錯與日誌

### 查看日誌
```bash
# 查看所有日誌
supabase logs

# 查看特定服務日誌
supabase logs --service postgres
supabase logs --service auth
supabase logs --service storage
```

## 🌐 Edge Functions

### 建立與部署
```bash
# 建立新 function
supabase functions new function-name

# 本地測試
supabase functions serve function-name

# 部署到遠端
supabase functions deploy function-name

# 查看 function 日誌
supabase functions logs function-name
```

## 📦 專案管理

### 專案資訊
```bash
# 查看專案資訊
supabase projects list

# 查看當前連結的專案
supabase projects show

# 取消連結
supabase unlink
```

### Secrets 管理
```bash
# 設定 secret
supabase secrets set SECRET_NAME=value

# 列出 secrets
supabase secrets list

# 刪除 secret
supabase secrets unset SECRET_NAME
```

## 🔄 資料同步

### 本專案的同步指令
```bash
# 測試連線
node scripts/test-supabase-connection.js

# 同步 Google Sheets 到 Supabase
node scripts/sync-sheets-to-supabase.js

# 或使用 npm script
npm run sync:supabase
```

## 🛠️ 實用組合指令

### 完整重置開發環境
```bash
# 停止服務
supabase stop

# 刪除所有資料
rm -rf .supabase

# 重新啟動
supabase start

# 套用 schema
supabase db execute -f supabase/schema.sql

# 插入測試資料
supabase db execute -f supabase/seed.sql

# 生成型別
supabase gen types typescript --local > src/types/supabase.ts
```

### 快速開發流程
```bash
# 1. 啟動 Supabase
supabase start

# 2. 在另一個終端啟動前端
npm run dev

# 3. 測試連線
node scripts/test-supabase-connection.js

# 4. 建立測試使用者
node scripts/create-test-user.js test@example.com
```

## 📝 常見問題解決

### 連線錯誤
```bash
# 檢查 Docker 是否運行
docker ps

# 重啟 Supabase
supabase stop
supabase start

# 檢查 port 是否被佔用
lsof -i :54321
lsof -i :54322
```

### 遷移問題
```bash
# 查看遷移狀態
supabase migration list

# 修復遷移
supabase migration repair --status applied

# 強制重置（會刪除所有資料）
supabase db reset --force
```

### 權限問題
```bash
# 檢查 RLS 政策
supabase db execute --sql "
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
"

# 測試 RLS
# 在 Supabase Studio > SQL Editor 執行測試查詢
```

## 🔗 相關資源

- [Supabase CLI 文件](https://supabase.com/docs/guides/cli)
- [本地開發指南](https://supabase.com/docs/guides/cli/local-development)
- [遷移指南](https://supabase.com/docs/guides/cli/managing-environments)
- [Edge Functions](https://supabase.com/docs/guides/functions)

## 💡 小技巧

### 快速查詢資料
```bash
# 使用 psql 連線
psql postgresql://postgres:postgres@localhost:54322/postgres

# 常用 SQL
\dt                          # 列出所有 tables
\d souvenirs                 # 查看 table 結構
SELECT COUNT(*) FROM souvenirs;
```

### 環境變數快速切換
```bash
# 本地開發
export VITE_SUPABASE_URL=http://localhost:54321
export VITE_SUPABASE_ANON_KEY=your-local-anon-key

# 切換到 production
export VITE_SUPABASE_URL=https://your-project.supabase.co
export VITE_SUPABASE_ANON_KEY=your-prod-anon-key
```

### 自動化腳本
在 `package.json` 中新增：
```json
{
  "scripts": {
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:reset": "supabase db reset",
    "db:types": "supabase gen types typescript --local > src/types/supabase.ts",
    "db:test": "node scripts/test-supabase-connection.js"
  }
}
```
