# 任務計畫: 全局 UI/UX 與架構優化

## Phase 1: 基礎基礎設施 (Infrastructure)
- [x] [IMPLEMENT] 定義全局玻璃擬態與動畫 CSS Utility Classes。
- [x] [REFINE] 統一全域字體與排版比例。

## Phase 2: 全域組件 (Shared Components)
- [x] [MODIFY] [Navbar.vue](file:///Users/uniza/WorkSpace/github/stock-souvenir/src/components/Navbar.vue): 升級為玻璃擬態懸浮樣式。
- [x] [MODIFY] [Navbar.vue](file:///Users/uniza/WorkSpace/github/stock-souvenir/src/components/Navbar.vue): 加入使用者選單微動畫。
- [x] [REFINE] [LoadingSpinner.vue](file:///Users/uniza/WorkSpace/github/stock-souvenir/src/components/LoadingSpinner.vue): 優化加載動畫視覺效果。

## Phase 3: 核心視圖優化 (View Overhaul)
- [x] [MODIFY] [GiftCatalog.vue](file:///Users/uniza/WorkSpace/github/stock-souvenir/src/views/GiftCatalog.vue): 加入頁面進場動畫與卡片懸停特效。
- [x] [MODIFY] [InventoryStagingView.vue](file:///Users/uniza/WorkSpace/github/stock-souvenir/src/views/admin/InventoryStagingView.vue): 升級統計卡片與表格美學。
- [x] [MODIFY] [UserManagementView.vue](file:///Users/uniza/WorkSpace/github/stock-souvenir/src/views/admin/UserManagementView.vue): 统一管理端 UI 風格。

## Phase 4: 系統效能 (Performance Ops)
- [x] [VERIFY] 檢查所有 View 的初始載入是否符合 `staggered-fade-in` 規範。
- [x] [CLEAN] 移除各組件中冗餘的 Inline Styles 與舊樣式代碼。
