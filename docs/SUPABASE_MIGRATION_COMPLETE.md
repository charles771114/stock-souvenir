# Supabase 遷移完成清單

本文件列出從 Firebase 遷移到 Supabase 所建立的所有檔案和需要執行的步驟。

## ✅ 已建立的檔案

### 資料庫相關
- ✅ `supabase/schema.sql` - 完整的資料庫 schema（包含 tables, indexes, RLS policies, triggers）
- ✅ `supabase/seed.sql` - 測試用的種子資料
- ✅ `supabase/config.toml` - 本地開發設定檔
- ✅ `supabase/README.md` - Supabase 設定指南

### 前端相關
- ✅ `src/supabase.js` - Supabase client 初始化（已存在）
- ✅ `src/stores/auth.js` - 已更新為使用 Supabase Auth（已存在）
- ✅ `src/composables/useSupabaseSouvenirs.js` - 紀念品查詢 composable
- ✅ `src/composables/useSupabaseGifts.js` - 使用者收藏管理 composable

### 後端腳本
- ✅ `scripts/sync-sheets-to-supabase.js` - Google Sheets 同步到 Supabase 的腳本
- ✅ `scripts/package.json` - 已更新依賴（新增 @supabase/supabase-js）

### CI/CD
- ✅ `.github/workflows/sync-sheets-supabase.yml` - GitHub Actions 自動同步工作流程

### 文件
- ✅ `.env.example` - 已更新環境變數範例
- ✅ `.antigravity/supabase-setup.md` - Antigravity 環境使用指南
- ✅ `SUPABASE_MIGRATION_COMPLETE.md` - 本文件

### 專案設定
- ✅ `package.json` - 已更新，新增 Supabase 相關 scripts

---

## 📋 遷移步驟檢查清單

### 1. Supabase 專案設定

- [ ] 在 [Supabase Dashboard](https://app.supabase.com/) 建立新專案
- [ ] 選擇區域（建議：Southeast Asia - Singapore）
- [ ] 記錄專案的 URL 和 API Keys

### 2. 執行資料庫 Schema

- [ ] 前往 Supabase Dashboard > SQL Editor
- [ ] 複製 `supabase/schema.sql` 內容並執行
- [ ] 確認所有 tables 建立成功
- [ ] （可選）執行 `supabase/seed.sql` 插入測試資料

### 3. 設定 Google OAuth

- [ ] 在 Supabase Dashboard > Authentication > Providers 啟用 Google
- [ ] 填入 Google OAuth Client ID 和 Secret
- [ ] 複製 Callback URL
- [ ] 在 Google Cloud Console 新增此 Callback URL

### 4. 更新環境變數

- [ ] 複製 `.env.example` 為 `.env`
- [ ] 填入 Supabase URL 和 Keys：
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
  ```
- [ ] 確認 Google Sheets 相關變數已設定

### 5. 安裝依賴

```bash
# 根目錄
npm install

# scripts 目錄
cd scripts
npm install
```

### 6. 測試同步腳本

```bash
npm run sync:supabase
```

或

```bash
cd scripts
node sync-sheets-to-supabase.js
```

### 7. 測試前端

```bash
npm run dev
```

測試項目：
- [ ] Google 登入功能正常
- [ ] 可以瀏覽紀念品列表
- [ ] 可以新增收藏
- [ ] 可以刪除收藏

### 8. 設定 GitHub Actions

在 GitHub Repository Settings > Secrets and variables > Actions 新增：

- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SHEET_ID`
- [ ] `GCP_SERVICE_ACCOUNT_JSON`

### 9. 測試 GitHub Actions

- [ ] 手動觸發 workflow 測試
- [ ] 確認資料同步成功

---

## 🔄 與 Firebase 的對應關係

| Firebase | Supabase | 說明 |
|----------|----------|------|
| Firestore | PostgreSQL | 資料庫 |
| `souvenirs` collection | `souvenirs` table | 紀念品資料 |
| Firebase Auth | Supabase Auth | 使用者認證 |
| Security Rules | Row Level Security (RLS) | 資料存取控制 |
| Cloud Functions | Edge Functions | 後端邏輯（本專案未使用） |
| `firebase-admin` | `@supabase/supabase-js` (service role) | 後端 SDK |
| `firebase/auth` | `@supabase/supabase-js` | 前端 SDK |

---

## 🚀 新功能

Supabase 提供了一些 Firebase 沒有的功能：

### 1. 直接 SQL 查詢
```javascript
const { data } = await supabase.rpc('my_custom_function', { param: value })
```

### 2. Realtime 訂閱
```javascript
supabase
  .channel('souvenirs')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'souvenirs' }, 
    payload => console.log(payload)
  )
  .subscribe()
```

### 3. 全文搜尋
```javascript
const { data } = await supabase
  .from('souvenirs')
  .select()
  .textSearch('souvenir_item', 'bluetooth')
```

### 4. Storage
```javascript
await supabase.storage
  .from('stock-data')
  .upload('file.json', fileData)
```

---

## 📚 相關文件

- [Supabase 官方文件](https://supabase.com/docs)
- [從 Firebase 遷移到 Supabase](https://supabase.com/docs/guides/migrations/firebase)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

---

## ⚠️ 注意事項

1. **Service Role Key 安全性**
   - 絕對不要將 Service Role Key 暴露到前端
   - 只在後端腳本和 GitHub Actions 中使用
   - 前端只使用 Anon Key

2. **RLS 政策**
   - 確保所有 table 都啟用 RLS
   - 測試各種情境確保權限正確

3. **索引優化**
   - 根據實際查詢需求調整索引
   - 使用 `EXPLAIN ANALYZE` 分析查詢效能

4. **備份**
   - Supabase 提供自動備份（付費方案）
   - 可以使用 `pg_dump` 手動備份

---

## 🐛 疑難排解

### 問題：無法連線到 Supabase
**解決方案**：
- 檢查環境變數是否正確
- 確認 Supabase 專案狀態
- 檢查網路連線

### 問題：RLS 權限錯誤
**解決方案**：
- 確認使用者已登入
- 檢查 RLS 政策設定
- 使用 Supabase Dashboard 的 RLS Helper 測試

### 問題：同步腳本失敗
**解決方案**：
- 檢查 Service Role Key 是否正確
- 確認 Google Sheets API 權限
- 查看詳細錯誤訊息

---

## ✨ 下一步

- [ ] 實作「我的收藏」頁面 UI
- [ ] 新增紀念品篩選功能
- [ ] 實作通知功能（即將到期的紀念品）
- [ ] 優化行動裝置體驗
- [ ] 新增資料匯出功能
- [ ] 考慮使用 Supabase Realtime 即時更新

---

**遷移完成日期**：2025-01-14
**版本**：v1.0.0
