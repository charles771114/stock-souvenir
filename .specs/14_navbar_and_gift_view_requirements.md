# Navbar Admin Link & Gift Catalog Refinements 需求規格書

## 1. 背景與目標 (Background & Goals)
- **Why**: 
    1. 管理員目前在登入後，即便有權限但在某些裝置（如手機）或視覺上缺乏明顯的「後台入口」，導致操作不便。
    2. 首頁 (`/gifts`) 目前預設為列表視圖，但為了展示豐富的紀念品圖片與設計感，用戶希望預設為「商品卡 (Grid)」模式。
    3. 用戶即使在卡片模式下，仍需要方便地切換不同紀念品類別（如「電子」、「金融」等）。
- **Goals**:
    1. 修正 Navbar，確保 Admin 登入時有明確的後台入口（包含手機版）。
    2. `/gifts` 頁面進入時預設顯示 Grid View (商品卡)。
    3. 確保類別切換功能（Categories）在商品卡模式下依然流暢易用。

## 2. 使用者故事 (User Stories)
- **Admin User**:
    - 作為管理員，我登入後希望在導覽列（Desktop & Mobile）都能看到「後台管理」或相關入口，以便快速切換到管理介面。
- **General User**:
    - 作為一般使用者，我進入紀念品目錄時，希望預設看到精美的商品卡片網格，以便快速瀏覽圖片。
    - 作為一般使用者，我希望在瀏覽卡片時，也能透過上方的類別標籤快速篩選（如只看「金融股」），以便找到感興趣的紀念品。

## 3. 功能細節 (Functional Requirements)

### 3.1 Navbar Admin Link
- [ ] **Desktop View**: 確認現有的 Admin Links 是否足夠明顯，或需整合成單一「後台管理」按鈕？
    - *提案*: 現有 Desktop 已有 Icon Links，維持現狀或增加一個顯眼的 "Dashboard" 按鈕。
    - *修正*: 檢查 `isAdmin` 判斷邏輯是否正確。
- [ ] **Mobile View**: 
    - 目前 Mobile Menu (`sm:hidden`) **完全沒有** Admin 相關連結。
    - **必須新增**: 在手機版選單中加入 Admin 相關連結 (Panel, Scraper, Classification, etc.)，或是加入一個 "Admin Dashboard" 連結導向 `/admin/panel`。

### 3.2 Gift Catalog View Defaults
- [ ] **Default View State**: 將 `viewMode` 的預設值由 `'list'` 改為 `'grid'`。
- [ ] **Category Switching**: 
    - 確保上方的「類別篩選器 (Glassmorphic Filter Bar)」在 Grid View 下正常運作。
    - 當切換類別時，Grid View 應即時更新顯示內容。

## 4. UI/UX 設計 (參考 ui-ux skill)
- **Navbar Mobile**: 保持一致的條列式風格，Admin 區域可用分隔線區隔，並使用不同顏色的文字（如 Purple/Amber）標示為管理區。
- **Product Card**: 確保 Grid View 在不同螢幕尺寸下的 RWD 表現 (1欄/2欄/3欄/4欄)。

## 5. 技術注意事項
- **State Persistence**: 考慮是否將使用者的 View Mode 偏好 (Grid/List) 存入 `localStorage`，讓用戶下次進來時保持上次的選擇？（本次需求僅說「預設商品卡」，可先改預設值即可）。
