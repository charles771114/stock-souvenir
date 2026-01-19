# 2025 年紀念品資料整合與年份區隔規劃

## 1. 背景與目標 (Background & Goals)
- **Why**: 使用者希望將抓取到的 2025 年紀念品資料寫入資料庫，並在前端目錄中明確區分年份（如 2024 vs 2025），以便查詢不同年度的發放情況。
- **Goals**: 
  1.  單次匯入 2025 年的範例資料到 Supabase。
  2.  設計前端 UI 的年份切換/區隔機制。

## 2. 使用者故事 (User Stories)
- 作為使用者，我希望在紀念品目錄頁面能清楚看到目前是哪個年份的資料，並能切換查看 2024 或 2025 的資料。
- 系統應預設顯示最新年份 (2025) 的資料。

## 3. 功能細節 (Functional Requirements)

### 3.1 資料寫入 (Data Ingestion)
- **資料來源**: 目前採用手動/半自動抓取的 2025 範例資料 (mock_2025_data.json)。
- **資料庫欄位**: `souvenirs` table 需確認是否有 `meeting_date` 或 `year` 欄位來區分。
  - 目前推測使用 `meeting_date`。若 2025 資料無確切日期，暫定設為 `2025-06-01` (股東會旺季) 或新增 `gift_year` 欄位。
  - **決策**: 為了長久之計，建議 schema 確保能從 `meeting_date` 判斷，或在 API 層過濾。

### 3.2 前端目錄年份區分 (UI/UX)
- **年份 Tabs 切換**: 在「搜尋欄」上方或下方，加入明顯的年份 Tabs (例如：[2025 NEW] [2024] [歷史資料])。
  - 預設選中 `2025`。
  - `2025` 標籤可加上 "NEW" 或 "🔥" (SVG icon) 標示。
- **列表顯示**:
  - 列表中的「最後買進日」若為 2025 年，應特別突顯。

## 4. UI/UX 設計 (UI/UX Pro Max)
- **Year Selector**: 使用 Pill-shaped Tabs。
  - Active: `bg-indigo-600 text-white shadow-lg shadow-indigo-200`
  - Inactive: `bg-white text-gray-500 hover:bg-gray-50`
- **Transition**: 切換年份時加入 `fade` 或 `slide` 動畫。

## 5. 技術架構 (Architecture)
- **Backend**: 使用現有 `supabase` client。
- **Script**: 撰寫一個 node script `scripts/seed_2025.js` 讀取 mock data 並寫入 DB。
