# 紀念品分類系統需求規格書 (Souvenir Classification System)

## 1. 背景與目標 (Background & Goals)
- **Background**: 目前紀念品資料匯入時僅有「名稱」欄位，缺乏分類（如：超商卡、衛生紙、廚房用品等）。導致使用者無法透過分類快速篩選想要的紀念品。
- **Goals**:
  1.  建立自動化的分類機制，減少人工標註成本。
  2.  在 Admin Panel 提供關鍵字管理功能，持續優化分類準確率。
  3.  確保所有紀念品最終都能被歸類（包含人工審核補網）。

## 2. 使用者故事 (User Stories)
### 2.1 系統管理員 (Admin)
- 我想要在後台**設定分類與對應關鍵字**（例如：「超商卡」 -> [「超商」, 「商品卡」, 「全家」, 「7-11」]）。
- 我想要在**匯入 CSV 時**，系統能自動根據名稱判斷分類。
- 我想要系統自動標記**無法判別**的紀念品為「需審核」，並在首頁或顯眼處提醒我。
- 我想要有一個介面能**快速檢視並修正**「需審核」的紀念品分類，同時能將生難字直接加入關鍵字庫，避免下次再錯。

### 2.2 一般使用者 (User) (未來延伸，本次 Scope 僅需支援資料面)
- 我想要用「分類」篩選紀念品（例如：只看「超商卡」）。

## 3. 功能細節 (Functional Requirements)

### 3.1 分類管理 (Admin Panel > Settings)
- [ ] **分類列表 CRUD**: 新增、修改、刪除分類。
- [ ] **關鍵字設定**: 每個分類可綁定多組關鍵字 (Array of String)。
- [ ] **預設分類**: 系統內建基礎分類（開發時預塞 Data）。

### 3.2 匯入自動分類 (Import Logic)
- [ ] **Matching Logic**: 在前端解析 CSV 後，對每一筆 `souvenir_item` 進行關鍵字比對。
  - 此規則採 "First Match" 或 "Best Match" (詳細定義於架構章節)。
- [ ] **Preview UI**: 在匯入預覽表格中，新增「預判分類」欄位。
  - 若有對應分類：顯示分類名稱。
  - 若無對應分類：顯示「❌ 需審核 (Unclassified)」。

### 3.3 資料寫入與狀態 (Database)
- [ ] 新增 `category_id` 欄位。
- [ ] 新增 `classification_status` 欄位 ('verified', 'unclassified', 'system_matched')。
  - 匯入且匹配成功 -> `system_matched`
  - 匯入但無匹配 -> `unclassified` (需審核)
  - 人工修正/確認 -> `verified`

### 3.4 待審核清單 (Admin Panel > Review Queue)
- [ ] **Dashboard Widget**: 顯示目前有多少「需審核」項目。
- [ ] **Review Interface**:
  - 列出所有 `unclassified` 項目。
  - 允許單筆或批次設定分類。
  - **Quick Add Keyword**: 在修正分類時，可選擇是否將該商品名稱的部分關鍵字加入規則庫。

## 4. UI/UX 參考
- 使用既有的 Admin UI 元件。
- 狀態顯示使用 Badge (Green for Verified, Yellow for System, Red for Needs Review).
