# Stock Souvenir (股東會紀念品小幫手) - Master PRD

## 1. 產品概述 (Product Overview)
**Stock Souvenir** 是一個專為台股投資人設計的「股東會紀念品管理系統」。旨在解決用戶難以追蹤零散紀念品資訊、錯過最後買進日、以及缺乏質感管理工具的痛點。本產品堅持 **"UI/UX Pro Max"** 的設計哲學，提供極致流暢且美觀的使用體驗。

## 2. 核心價值主張 (Core Value Proposition)
1.  **資訊透明 (Transparency)**：整合公開資訊（如 Wantgoo, MOPS），提供最即時的紀念品發放情報。
2.  **時效掌握 (Timeliness)**：自動計算並突顯「最後買進日」，確保用戶不錯過領取資格。
3.  **收藏管理 (Collection)**：提供個人化的收藏清單，讓用戶標記有興趣或已持有的股票。
4.  **極致體驗 (Aesthetics)**：以玻璃擬態 (Glassmorphism)、流暢動畫與現代化排版，打造超越競品的視覺享受。

## 3. 系統架構與狀態 (System Architecture & Status)

### 3.1 技術堆疊
- **Frontend**: Vue 3 + Vite + TailwindCSS (Vanilla)
- **Backend/Database**: Supabase (PostgreSQL) + Docker (Local Development)
- **Scraping**: Agent-driven Browser Scraping (Target: Wantgoo)

### 3.2 資料流 (Data Flow)
- **Source**: Wantgoo Web Pages (Yearly Data).
- **Processing**: `scripts/seed_full_merge.js` (Cleaning, Cross-year logic).
- **Storage**: Supabase `souvenirs` table (Fields: `code`, `name`, `souvenir_item`, `last_buy_date`, `meeting_date`, `doc_id`).

## 4. 功能模組 (Feature Modules)

### 4.1 紀念品目錄 (Gift Catalog) - [已實作/優化中]
- **列表顯示**：以卡片或表格形式展示紀念品。
- **搜尋篩選**：支援關鍵字（代號、名稱）、年份篩選。
- **年份切換**：
    - [x] 2024/2025 切換 (目前 Hardcoded)。
    - [ ] **待辦**: 支援動態年份 (包含已在庫的 2026 EGM 資料)。
- **狀態顯示**：
    - [x] 最後買進日 (過期變灰、倒數提示)。
    - [x] 2025 開會日期顯示。

### 4.2 個人收藏 (My Collection) - [已實作]
- **收藏動作**：用戶可對任一紀念品點擊「愛心」加入收藏。
- **清單管理**：查看已收藏的清單。
- **權限控制**：需登入後始可使用。

### 4.3 身份驗證 (Authentication) - [已實作]
- **Supabase Auth**：支援 Email/Password 或 Social Login (Google/Line - 規劃中)。
- **Login UI**：全屏玻璃擬態登入頁，移除 Emoji 改用 SVG Icons。

### 4.4 資料維運 (Data Ops) - [已建立]
- **爬蟲腳本**：標準化的 Agent 爬蟲流程。
- **資料驗證**：`verify_seeding.js` 用於核對關鍵數據。

## 5. 待辦事項清單 (Backlog / Future Roadmap)

### P0: 立即修正 (Fix Immediately)
- [ ] **前端年份選單優化**：目前 `GiftCatalog.vue` 年份寫死 `['2025', '2024']`，導致資料庫中的 `2026` 資料無法顯示。需改為動態讀取 DB 年份或自動偵測。
- [ ] **UI 細節打磨**：確認所有 Emoji 完全移除，替換為高品質 SVG。

### P1: 近期規劃 (Short-term)
- [ ] **自動化爬蟲排程**：將爬蟲腳本整合至 Supabase Edge Function 或 GitHub Actions (目前為 Local Script)。
- [ ] **通知系統**：針對已收藏的股票，在最後買進日前發送 Email 或 Line 通知。

### P2: 長期願景 (Long-term)
- [ ] **零股代領資訊**：整合是否支援零股、代領處資訊。
- [ ] **社群功能**：用戶留言回報領取狀況。

## 6. UI/UX 規範摘要 (UI Guidelines)
- **字體**: Inter / Noto Sans TC
- **配色**: Indigo-600 (Primary), Slate-500 (Text), Emerald-500 (Success/Active)
- **元件風格**:
    - **Card**: 白底 + 柔和陰影 (Shadow-lg) + 圓角 (Rounded-2xl)。
    - **Backdrop**: 使用 `backdrop-blur-md` 營造層次感。
    - **Interaction**: 按鈕 Hover 需有 `scale-105` 或顏色變化。

---
*Last Updated: 2026-01-18 by Agent (Antigravity)*
