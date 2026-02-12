# GitHub Actions 自動排程設定說明

## 📋 必要的 GitHub Secrets

在使用自動排程功能前，您需要在 GitHub Repository 設定以下 Secrets：

### 1. SUPABASE_FUNCTION_URL
- **值**: `https://hpfggdkhoffhfawsgmtt.supabase.co/functions/v1`
- **說明**: Supabase Functions 的基礎 URL

### 2. SUPABASE_ANON_KEY
- **值**: 您的 Supabase Anon Key（可在 `.env` 檔案中的 `VITE_SUPABASE_ANON_KEY` 找到）
- **說明**: 用於呼叫 Supabase Functions 的認證金鑰

## 🔧 設定步驟

1. 前往 GitHub Repository
2. 點選 `Settings` > `Secrets and variables` > `Actions`
3. 點選 `New repository secret`
4. 分別新增上述兩個 Secrets

## ⏰ 排程時間

- **自動執行**: 每天早上 9:00 (UTC+8)
- **手動觸發**: 前往 `Actions` > `Daily Gooddie Scraper` > `Run workflow`

## ✅ 驗證

執行後可在 `Actions` 頁面查看執行結果：
- ✅ 綠色勾勾：執行成功
- ❌ 紅色叉叉：執行失敗（請查看 logs）
