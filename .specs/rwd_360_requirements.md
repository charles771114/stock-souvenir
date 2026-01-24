# 需求規格: RWD 最小寬度優化 (360px)

## 1. 背景與目標
- **目的**: 確保使用者在較窄的手機（如 iPhone SE 等，最低 320px-360px）上瀏覽時，介面不會崩潰。
- **目標**: 設定全域最小寬度為 360px，並優化核心視圖在窄屏下的排列。

## 2. 優化項目
- [ ] **全域設定**: 在 `main.css` 替 `body` 加強 `min-width: 360px` 限制，防止內容過度擠壓。
- [ ] **GiftCatalog**: 
  - 確保網格視圖在 360px 下自動切換為 1 欄或更小間距。
  - 導航欄橫向捲軸優化。
- [ ] **InventoryStaging**: 
  - 確保表格有 `overflow-x-auto` 且不會撐開容器。

## 3. 視覺語彙 (Visual Adjustment)
- 針對 360px 以下，適度縮小內距 (Padding) 與 字體 (Font Size)。
