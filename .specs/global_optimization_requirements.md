# 需求規格: 全局 UI/UX 與架構優化

## 1. 背景與目標 (Background & Goals)
- **Why**: 現有介面雖然堪用，但缺乏「Premium」感。系統部分邏輯仍有冗餘請求。
- **Goals**: 讓整個 Web App 感覺像是一個頂級的 SaaS 產品。

## 2. UI/UX Pro Max 準則
- **配色**: 採用 Indigo-600 到 Purple-600 的漸層作為主軸。
- **材質**: 大量使用 `backdrop-blur-xl` 與 `bg-white/70`。
- **動畫**: 列表進入應有 `staggered-fade-in` 效果。

## 3. 系統設計準則
- **Bulk Operations**: 凡是涉及批次資料的更新，必須合併請求。
- **Lazy Loading**: 圖片與大數據組件需有適當的預載或懶載入機制。

## 4. 關鍵功能細節
- [ ] 全域 Navbar 升級
- [ ] 庫存管理介面統一
- [ ] 行動端響應式完美對齊
