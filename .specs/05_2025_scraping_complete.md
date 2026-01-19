# 2025 股東會紀念品全量抓取與整合

## 1. 背景與目標 (Background & Goals)
- **Why**: 使用者需要完整的 2025 年股東會紀念品資料，以便進行收藏管理與查詢。原先僅有部分範例資料，需要補全所有上市櫃公司的資料。
- **Goals**:
    1.  抓取 Wantgoo 網站上所有 2025 年的股東會紀念品資訊 (約 758 筆)。
    2.  解決跨年度日期問題 (如 2025 年初開會，最後買進日其實在 2024 年底)。
    3.  將清洗後的資料寫入 Supabase 資料庫。
    4.  驗證資料正確性。

## 2. 使用者故事 (User Stories)
- 作為使用者，我希望看到完整的 2025 年紀念品清單，包含正確的「最後買進日」和「開會日期」，這樣我才不會錯過買進時機。
- 作為使用者，我希望能搜尋特定的熱門股（如王品、鴻海）並看到它們最新的紀念品資訊。

## 3. 功能細節 (Functional Requirements)

### 3.1 資料抓取對接 (Data Scraping)
- **來源**: `https://www.wantgoo.com/stock/calendar/shareholders-meeting-souvenirs`
- **範圍**: 完整列表 (All Rows, ~758 items)。
- **欄位**:
    - 代號 (code)
    - 名稱 (name)
    - 紀念品 (souvenir_item)
    - 最後買進日 (last_buy_date)
    - 開會日期 (meeting_date)

### 3.2 資料處理邏輯 (Data Logic)
- **跨年度判定**:
    - 若 `Meeting Date` 在 1~3 月，且 `Last Buy Date` 在 11~12 月 -> 判定買進年份為 **2024**。
    - 其餘情況 -> 判定為 **2025**。
- **去重 (Deduplication)**:
    - 使用 `code` + `meeting_date` 組合鍵 (DocID) 進行去重，保留同一公司不同日期的會議紀錄。

### 3.3 資料庫寫入 (Database)
- **Table**: `souvenirs`
- **Schema**:
    - `doc_id` (Primary Key, unique string)
    - `code`
    - `name`
    - `souvenir_item`
    - `meeting_date` (Date)
    - `last_buy_date` (Date)
    - `updated_at`

## 4. 驗證標準 (Success Metrics)
- [x] 資料筆數需接近 758 筆 (實際成功入庫 757 筆)。
- [x] 關鍵個股 (2890, 2880, 2727, 2317) 資料需與公開資訊一致。
- [x] 系統需能正確顯示跨年度的買進日期 (如永豐金的 2024-12-31)。

## 5. 技術產物 (Artifacts)
- Script: `scripts/seed_full_merge.js` (負責讀取、清洗、寫入)
- Local Data: `scripts/temp_*.json` (中間產物，已清理)
