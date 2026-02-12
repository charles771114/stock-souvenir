# Stock Souvenir - 股東會紀念品管理系統

一個現代化、響應式且功能完善的股東會紀念品管理系統。從 Firebase 全面遷移至 **Supabase** 架構，支援一般用戶瀏覽和收藏紀念品，以及高級 Admin 管理員工具。

---

## ✨ 核心功能

### 👤 一般用戶 (General User)
- **Google 快速登入**：支援 Google OAuth。
- **精品目錄 (Gift Catalog)**：現代化網格介面，查看數千筆上市櫃公司紀念品資料（含圖片、開會日期、最後買進日）。
- **我的收藏 (My Collections)**：標記感興趣的股票，並追蹤其發放狀態。
- **智慧統計**：自動统计收藏品中的「超商禮券」總額與各項目的庫存狀態。
- **庫存同步**：一鍵將收藏品加入個人庫存。

### 🛡️ Admin 管理員 (後台)
- **後台主控台**：系統概況與數據統計。
- **庫存歸戶管理 (Staging)**：支援 Excel/CSV 批量匯入，自動匹配用戶並建立歸戶資料。
- **分類中心 (Classification)**：智慧分類對應，自動將關鍵字匹配至紀念品類別。
- **審核隊列 (Review Queue)**：處理抓取過程中產生的存疑資料。
- **用戶管理**：查看用戶權限、收藏統計，並可直接管理管理員名單。
- **爬蟲管理**：手動觸發 Edge Functions 抓取最新數據，並監控抓取日誌。
- **LINE 群組管理**：管理機器人加入的群組，可一鍵切換各群組的通知開關。
- **多群組廣播**：自動將最新情報發送至所有已啟用的 LINE 群組。

---

## 📖 使用指南

### 👤 一般用戶使用流程
1. **登入**：點擊首頁「使用 Google 登入」。
2. **瀏覽**：首頁即為紀念品目錄，可使用上方搜尋框關鍵字過濾，或使用年度、分類篩選。
3. **收藏**：點擊卡片上的「收藏」按鈕（加號/心型）。
4. **管理**：前往「我的收藏」，您可以：
    - 查看所選年度的收藏清單。
    - 點擊「展開統計」查看禮券總額、紀念品項目的分類加總。
    - 點擊「新增到庫存」標記您已實際領取或持有的實體物品。
    - 編輯收藏備註或特定領取日期。

### 🛡️ 管理員操作指南
1. **進入後台**：登入具管理員權限的帳號後，點擊導航列的「管理員」選單。
2. **批量匯入資料**：
    - 前往「庫存歸戶管理」。
    - 上傳 CSV/Excel 檔案（需包含代號、姓名、年份等欄位）。
    - 系統會自動比對現有用戶的資料。
    - 針對「未匹配」的項目，您可以手動指定用戶。
3. **維護紀念品分類**：
    - 前往「分類中心」。
    - 若系統抓取到新的紀念品名稱，可將其分配至正確的分類（如「居家」、「食品」）。
    - 設定關鍵字，讓未來的抓取自動分類。
4. **權限管理**：
    - 前往「用戶管理」可將特定用戶升級為 Admin。
    - 前往「Admin 設定」可直接編輯 Admin 白名單。

---

## 🚀 技術架構

- **Frontend**: Vue 3 (Composition API), Vite, TailwindCSS (Hosted on GitHub Pages)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Functions**: Supabase Edge Functions (Deno + Typescript)
- **UI Architecture**: UI/UX Pro Max (Glassmorphism, Tailwind Animation System)

---

## 🤖 自動化與維護

### 保持 Supabase 專案活躍 (Keep-Alive)
為了防止 Supabase 免費版專案因 7 天無活動而被暫停，系統包含了一個 GitHub Actions 自動化流程：
- **路徑**: `.github/workflows/keep-supabase-alive.yml`
- **功能**: 每天台灣時間 09:00 自動對資料庫執行簡單查詢，保持專案活躍狀態。
- **設定**: 需在 GitHub Repo Settings 中設定以下 Secrets:
    - `SUPABASE_URL`: 您的專案 URL。
    - `SUPABASE_KEY`: 您的 API Key (anon 或 service_role)。

---

## 📱 行動版優化
- **歷史參考**：在手機版清單與卡片中，會特別顯示「去年度紀念品」資訊，方便用戶在今年資料尚未公布時作為參考參考標記。

---

## 📦 快速開始 (Local Development)

### 1. 安裝與設定
```bash
npm install
cp .env.example .env
```
請將 `VITE_SUPABASE_URL` 與 `VITE_SUPABASE_ANON_KEY` 填入 `.env`。

### 2. 啟動開發環境
```bash
npm run dev
```

---

## � 專案結構
詳細結構請參閱 [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md)

---

**最後更新**: 2026-02-09
**版本**: v3.2.0 (Automation & Mobile Enhancement)
