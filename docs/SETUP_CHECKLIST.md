# Supabase 設定檢查清單

使用此清單確保所有設定都正確完成。

## ☑️ 前置準備

- [ ] 已安裝 Node.js (v18+)
- [ ] 已安裝 npm 或 pnpm
- [ ] 已安裝 Docker（如果要本地開發）
- [ ] 已安裝 Supabase CLI（可選）
- [ ] 有 Google Cloud 服務帳號（用於 Sheets 同步）

## ☑️ Supabase 專案設定

### 1. 建立專案
- [ ] 前往 https://app.supabase.com/
- [ ] 點擊 "New Project"
- [ ] 填寫專案名稱
- [ ] 設定資料庫密碼（請記住！）
- [ ] 選擇區域：Southeast Asia (Singapore)
- [ ] 等待專案建立完成（約 2 分鐘）

### 2. 執行資料庫 Schema
- [ ] 前往 SQL Editor
- [ ] 點擊 "New Query"
- [ ] 複製 `supabase/schema.sql` 內容
- [ ] 點擊 "Run" 執行
- [ ] 確認沒有錯誤訊息
- [ ] 前往 Table Editor 確認 3 個資料表已建立：
  - [ ] souvenirs
  - [ ] profiles
  - [ ] user_collections

### 3. 設定 Google OAuth
- [ ] 前往 Authentication > Providers
- [ ] 找到 Google 並啟用
- [ ] 填入 Google OAuth Client ID
- [ ] 填入 Google OAuth Client Secret
- [ ] 複製 Callback URL
- [ ] 前往 Google Cloud Console
- [ ] 在 OAuth 2.0 Client IDs 新增 Callback URL
- [ ] 儲存設定

### 4. 取得 API Keys
- [ ] 前往 Settings > API
- [ ] 複製 Project URL
- [ ] 複製 anon public key
- [ ] 複製 service_role key（小心保管！）

## ☑️ 本地專案設定

### 1. 安裝依賴
```bash
# 根目錄
npm install

# scripts 目錄
cd scripts
npm install
cd ..
```
- [ ] 根目錄依賴安裝完成
- [ ] scripts 目錄依賴安裝完成

### 2. 設定環境變數
```bash
cp .env.example .env
```
- [ ] 已建立 `.env` 檔案
- [ ] 填入 `VITE_SUPABASE_URL`
- [ ] 填入 `VITE_SUPABASE_ANON_KEY`
- [ ] 填入 `SUPABASE_URL`
- [ ] 填入 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 填入 `SHEET_ID`（如果有 Google Sheets）
- [ ] 填入 `GCP_SERVICE_ACCOUNT_JSON`（如果有）

### 3. 測試連線
```bash
npm run supabase:test
```
- [ ] 連線測試通過
- [ ] 可以讀取資料表
- [ ] 沒有權限錯誤

### 4. 插入測試資料（可選）
```bash
npm run db:seed
```
- [ ] 測試資料插入成功
- [ ] 可以在 Table Editor 看到資料

### 5. 建立測試使用者（可選）
```bash
npm run supabase:create-user test@example.com password123
```
- [ ] 測試使用者建立成功
- [ ] Profile 自動建立
- [ ] 可以用此帳號登入

## ☑️ 功能測試

### 1. 啟動開發伺服器
```bash
npm run dev
```
- [ ] 前端啟動成功
- [ ] 可以開啟 http://localhost:5173
- [ ] 沒有 console 錯誤

### 2. 測試認證
- [ ] 點擊登入按鈕
- [ ] Google OAuth 彈窗出現
- [ ] 可以選擇 Google 帳號
- [ ] 登入成功
- [ ] 使用者資訊顯示正確
- [ ] 可以登出

### 3. 測試紀念品查詢
- [ ] 可以看到紀念品列表
- [ ] 搜尋功能正常
- [ ] 篩選功能正常
- [ ] 資料顯示正確

### 4. 測試收藏功能
- [ ] 可以新增收藏
- [ ] 可以查看「我的收藏」
- [ ] 可以更新收藏狀態
- [ ] 可以刪除收藏
- [ ] 資料即時更新

## ☑️ Google Sheets 同步（可選）

### 1. 準備 Google Sheets
- [ ] 已建立 Google Sheet
- [ ] Sheet 格式正確（11 欄）
- [ ] 已取得 Sheet ID
- [ ] GCP 服務帳號有讀取權限

### 2. 測試同步
```bash
npm run sync:supabase
```
- [ ] 同步腳本執行成功
- [ ] 資料正確寫入 Supabase
- [ ] 沒有錯誤訊息
- [ ] 可以在 Table Editor 看到同步的資料

## ☑️ GitHub Actions 設定（可選）

### 1. 設定 Secrets
前往 GitHub Repository > Settings > Secrets and variables > Actions

- [ ] 新增 `SUPABASE_URL`
- [ ] 新增 `SUPABASE_SERVICE_ROLE_KEY`
- [ ] 新增 `SHEET_ID`
- [ ] 新增 `GCP_SERVICE_ACCOUNT_JSON`

### 2. 測試 Workflow
- [ ] 前往 Actions 頁面
- [ ] 手動觸發 "Sync Google Sheets to Supabase"
- [ ] Workflow 執行成功
- [ ] 資料同步正確

## ☑️ 本地開發（使用 Supabase CLI）

### 1. 安裝 Supabase CLI
```bash
brew install supabase/tap/supabase
# 或
npm install -g supabase
```
- [ ] CLI 安裝成功
- [ ] `supabase --version` 可執行

### 2. 啟動本地 Supabase
```bash
npm run supabase:start
```
- [ ] Docker 容器啟動成功
- [ ] 所有服務運行正常
- [ ] 可以開啟 Studio (http://localhost:54323)

### 3. 套用 Schema
```bash
supabase db execute -f supabase/schema.sql
```
- [ ] Schema 套用成功
- [ ] 資料表建立完成

### 4. 生成 TypeScript 型別
```bash
npm run supabase:types
```
- [ ] 型別檔案生成成功
- [ ] `src/types/supabase.ts` 已更新

## ☑️ 生產環境部署

### 1. 建置專案
```bash
npm run build
```
- [ ] 建置成功
- [ ] `dist` 目錄已建立
- [ ] 沒有建置錯誤

### 2. 環境變數設定
- [ ] 生產環境的 `VITE_SUPABASE_URL` 已設定
- [ ] 生產環境的 `VITE_SUPABASE_ANON_KEY` 已設定
- [ ] 其他必要環境變數已設定

### 3. 部署測試
- [ ] 應用程式可以正常訪問
- [ ] 認證功能正常
- [ ] 資料查詢正常
- [ ] 收藏功能正常

## ☑️ 安全性檢查

- [ ] `.env` 已加入 `.gitignore`
- [ ] Service Role Key 沒有暴露到前端
- [ ] Service Role Key 沒有提交到 Git
- [ ] RLS 政策已啟用
- [ ] RLS 政策測試通過
- [ ] Google OAuth 設定正確
- [ ] Callback URL 白名單設定正確

## ☑️ 效能優化

- [ ] 資料庫索引已建立
- [ ] 查詢使用適當的索引
- [ ] 沒有 N+1 查詢問題
- [ ] 圖片已優化
- [ ] 前端已啟用快取

## ☑️ 文件檢查

- [ ] 已閱讀 `supabase/README.md`
- [ ] 已閱讀 `.antigravity/QUICK_START_SUPABASE.md`
- [ ] 已閱讀 `SUPABASE_MIGRATION_COMPLETE.md`
- [ ] 已閱讀 `.antigravity/supabase-commands.md`
- [ ] 團隊成員了解如何使用

## 🎉 完成！

如果所有項目都已勾選，恭喜你完成了 Supabase 設定！

### 下一步建議：
1. 開始開發新功能
2. 優化使用者體驗
3. 新增更多測試
4. 監控效能和錯誤
5. 收集使用者回饋

### 需要幫助？
- 查看 [Supabase 官方文件](https://supabase.com/docs)
- 查看專案內的文件
- 在 GitHub Issues 提問

---

**檢查清單版本**：v1.0.0  
**最後更新**：2025-01-14
