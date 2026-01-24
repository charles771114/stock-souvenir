# 需求與架構規格: 全面 RWD 優化 (360px - Desktop)

## 1. 斷點策略 (Breakpoint Strategy)
我們採用行動端優先 (Mobile First) 的原則，定義以下關鍵斷點：

| 斷點名稱 | 寬度門檻 | 佈局行為 |
| :--- | :--- | :--- |
| **Mobile (Min)** | 360px | 單欄佈局, 緊湊 Padding, 隱藏非核心元素 |
| **Tablet** | 768px | 雙欄佈局 or 寬鬆單欄, 顯示輔助資訊 |
| **Laptop** | 1024px | 標準多欄佈局, 加入側邊欄 or 導航優化 |
| **Desktop (Max)**| 1440px | 最大容器寬度限制, 高階視覺裝飾元素顯示 |

## 2. 核心架構視覺標準 (System Design)
- **Container**: 使用 Tailwind 的 `max-w-7xl` (1280px) 作為主要容器邊界，並在 Desktop 下置中。
- **Grid Layout**: 
  - 360px: 1 Column
  - 640px (sm): 2 Columns
  - 1024px (lg): 3-4 Columns
- **Typography**: 適應性字體縮放，窄屏下 `-10%` font-size。

## 3. 重點優化視圖
### 3.1 Navbar (全域)
- [ ] 360px - 768px: 僅顯示漢堡選單與 Logo。
- [ ] 1024px+: 顯示完整橫向選單。

### 3.2 紀念品目錄 ([GiftCatalog.vue](file:///Users/uniza/WorkSpace/github/stock-souvenir/src/views/GiftCatalog.vue))
- [ ] 篩選列在 360px 需為橫向捲軸或多行折疊。
- [ ] 卡片寬度需自適應填充。

### 3.3 管理端表格
- [ ] 針對 360px 提供 `Table-Wrapper` 產生的橫向捲軸。
- [ ] 窄屏下隱藏次要欄位 (如 ID 或 備註)。

## 4. 實作任務 (SDD Phase 3 預覽)
- [ ] 修復 `main.css` 全域容器斷點。
- [ ] 更新 `GiftCatalog` 響應式 Grid。
- [ ] 優化 `InventoryStaging` 表格滾動容器。
