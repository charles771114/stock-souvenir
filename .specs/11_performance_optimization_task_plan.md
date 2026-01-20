# 實作計畫：紀念品目錄效能優化

## 概述

本計畫將實作 localStorage 快取機制與分頁功能，以優化 `/gifts` 路徑的資料載入效能與使用者體驗。

## 使用者審核事項

> [!IMPORTANT]
> **快取策略確認**
> - **過去年度**：使用 localStorage 永久快取（不過期），因為歷史資料不會變動
> - **當年度（2026）**：使用當日快取，每天第一次訪問會自動更新
> - 快取僅適用於「全部紀念品」，篩選結果不快取
> - 提供管理員手動清除快取功能
> 
> 請確認此策略是否符合您的需求。

> [!WARNING]
> **瀏覽器相容性**
> - 本功能依賴 localStorage，若使用者瀏覽器不支援或禁用，將自動 fallback 到純 API 模式
> - 預估單一年度快取約 500KB，最多儲存 5 個年度約 2.5MB
> - 當年度使用當日快取，每天會自動更新一次

## 提議變更

### Composables

#### [NEW] [useLocalStorageCache.js](file:///Users/unizalin/github/stock-souvenir/src/composables/useLocalStorageCache.js)

**功能**：通用 localStorage 快取管理工具

**核心方法**：
- `get(key)` - 取得快取資料，自動檢查過期時間與版本
- `set(key, data, ttl)` - 設定快取資料，包含時間戳與版本資訊
- `remove(key)` - 移除指定快取
- `clear()` - 清除所有專案相關快取
- `has(key)` - 檢查快取是否存在且有效

**特色**：
- 自動處理 JSON 序列化/反序列化
- 版本控制（當資料結構變更時自動清除舊快取）
- 錯誤處理（localStorage 不可用時不會中斷程式）
- 過期時間管理（預設 24 小時）

---

#### [NEW] [usePagination.js](file:///Users/unizalin/github/stock-souvenir/src/composables/usePagination.js)

**功能**：前端分頁邏輯管理

**核心功能**：
- 自動計算總頁數
- 提供分頁資料（`paginatedItems`）
- 頁面導航（上一頁、下一頁、跳頁）
- 每頁筆數設定（10/25/50/100）
- 記住使用者偏好（localStorage）

**Reactive State**：
- `currentPage` - 當前頁碼
- `pageSize` - 每頁筆數
- `totalPages` - 總頁數
- `paginatedItems` - 當前頁資料
- `hasNextPage` / `hasPrevPage` - 導航狀態

---

#### [MODIFY] [useGifts.js](file:///Users/unizalin/github/stock-souvenir/src/composables/useGifts.js)

**變更內容**：

1. **引入快取機制**
   - 整合 `useLocalStorageCache`
   - 修改 `fetchAllGifts` 方法，加入快取邏輯

2. **快取邏輯**
   ```javascript
   // 偽代碼
   if (requestYear !== currentYear) {
     const cached = cache.get(`gifts:${requestYear}`)
     if (cached) return cached
   }
   
   // 呼叫 API
   const data = await supabase.from('souvenirs').select(...)
   
   // 儲存快取（僅過去年度）
   if (requestYear !== currentYear) {
     cache.set(`gifts:${requestYear}`, data)
   }
   ```

3. **錯誤處理增強**
   - API 失敗時，嘗試使用快取資料（降級策略）
   - 回傳 `fromCache` 標記，供 UI 顯示快取狀態

4. **新增回傳值**
   - `{ data, error, fromCache }` - 標記資料來源

---

### Views

#### [MODIFY] [GiftCatalog.vue](file:///Users/unizalin/github/stock-souvenir/src/views/GiftCatalog.vue)

**變更內容**：

1. **引入分頁 Composable**
   ```javascript
   import { usePagination } from '@/composables/usePagination'
   
   const {
     currentPage,
     pageSize,
     totalPages,
     paginatedItems,
     hasNextPage,
     hasPrevPage,
     nextPage,
     prevPage,
     goToPage,
     setPageSize,
     reset,
     pageSizeOptions
   } = usePagination(filteredGifts, { defaultPageSize: 25 })
   ```

2. **修改資料綁定**
   - 從 `<TableView :items="mappedGifts" />` 
   - 改為 `<TableView :items="paginatedMappedGifts" />`
   - 新增 computed: `paginatedMappedGifts = computed(() => paginatedItems.value.map(...))`

3. **新增 UI 元件**
   - **每頁筆數選擇器**（篩選列右側）
   - **分頁控制器**（列表下方）
   - **快取狀態指示**（可選，篩選列下方）

4. **新增 Watch**
   ```javascript
   watch(filters, () => {
     reset() // 篩選變更時重置為第一頁
   }, { deep: true })
   ```

5. **UI 佈局調整**
   - 篩選列從 `grid-cols-4` 改為 `grid-cols-5`（新增每頁筆數選擇器）
   - 新增分頁控制器區塊（列表下方，置中）

---

## 驗證計畫

### 自動化測試

**目前專案無前端單元測試框架**，建議未來加入 Vitest，但本次實作暫不包含。

### 手動驗證

#### 1. 快取功能驗證

**步驟**：
1. 開啟瀏覽器開發者工具 → Application → Local Storage
2. 清除所有 `stock-souvenir:*` 相關快取
3. 在應用程式中切換到「2025 年度」
4. **預期結果**：
   - Network 面板顯示 API 請求
   - localStorage 出現 `stock-souvenir:gifts:2025` 鍵值
   - 資料正常顯示
5. 重新整理頁面，再次切換到「2025 年度」
6. **預期結果**：
   - Network 面板**無** API 請求
   - 資料立即顯示（< 0.5 秒）
   - Console 無錯誤訊息

**邊界測試**：
- **測試當年度當日快取**：
  1. 清除快取，切換到「2026 年度」
  2. **預期**：呼叫 API，localStorage 儲存快取（含 `date` 欄位）
  3. 重新整理頁面，再次切換到「2026 年度」
  4. **預期**：使用快取，不呼叫 API（因為是同一天）
  5. 手動修改 localStorage 中的 `date` 為昨天的日期
  6. 重新整理頁面，切換到「2026 年度」
  7. **預期**：呼叫 API 並更新快取（因為快取已過期）

- **測試版本控制**：
  - 手動修改 localStorage 中的 `version` 欄位，使其不符合當前版本
  - **預期**：自動清除舊快取並重新呼叫 API

---

#### 2. 分頁功能驗證

**步驟**：
1. 載入「全部紀念品」（預設 2025 年度，約 775 筆）
2. **預期結果**：
   - 預設顯示 25 筆
   - 分頁控制器顯示「第 1 頁 / 共 31 頁」
   - 「上一頁」按鈕禁用
   - 「下一頁」按鈕可用
3. 點擊「下一頁」
4. **預期結果**：
   - 顯示第 2 頁的 25 筆資料
   - 頁碼更新為「第 2 頁 / 共 31 頁」
   - 頁面自動捲動到列表頂部
5. 修改每頁筆數為「50 筆」
6. **預期結果**：
   - 自動重置為第 1 頁
   - 顯示 50 筆資料
   - 總頁數更新為「共 16 頁」
   - localStorage 儲存偏好設定
7. 重新整理頁面
8. **預期結果**：
   - 記住「50 筆」的設定

**邊界測試**：
- 在最後一頁時，「下一頁」按鈕應禁用
- 使用快速跳頁下拉選單，跳至第 10 頁
  - **預期**：正確顯示第 10 頁資料

---

#### 3. 篩選與分頁整合驗證

**步驟**：
1. 載入資料後，切換到第 3 頁
2. 在搜尋框輸入「台積電」
3. **預期結果**：
   - 自動重置為第 1 頁
   - 顯示篩選後的結果
   - 總頁數根據篩選結果重新計算
4. 清除篩選
5. **預期結果**：
   - 回到第 1 頁（不是原本的第 3 頁）
   - 顯示全部資料

---

#### 4. 效能驗證

**工具**：Chrome DevTools → Performance / Network

**測試場景**：
1. **初次載入（無快取）**
   - 清除快取
   - 載入 2025 年度資料
   - **目標**：載入時間 < 2 秒（正常網路環境）

2. **快取載入**
   - 重新整理頁面
   - 切換到 2025 年度
   - **目標**：載入時間 < 0.5 秒

3. **分頁切換**
   - 點擊「下一頁」
   - **目標**：切換時間 < 100ms

**網路節流測試**：
- 使用 Chrome DevTools → Network → Throttling: Fast 3G
- 驗證快取機制在慢速網路下的效果

---

#### 5. 錯誤處理驗證

**場景 1：localStorage 不可用**
- 使用無痕模式 + 禁用 localStorage（某些瀏覽器設定）
- **預期**：應用程式正常運作，僅無快取功能

**場景 2：API 失敗 + 有快取**
- 使用 DevTools 模擬離線狀態（Offline）
- 切換到已有快取的年度
- **預期**：顯示快取資料 + 錯誤提示訊息

**場景 3：快取損壞**
- 手動修改 localStorage 中的 JSON 資料（使其無效）
- 重新載入頁面
- **預期**：自動清除損壞快取，重新呼叫 API

---

### 驗證檢查清單

- [ ] 快取功能：過去年度使用永久快取
- [ ] 快取功能：當年度使用當日快取
- [ ] 快取功能：當年度隔天自動更新
- [ ] 快取功能：版本不符時自動清除
- [ ] 分頁功能：預設 25 筆
- [ ] 分頁功能：切換每頁筆數
- [ ] 分頁功能：記住使用者偏好
- [ ] 分頁功能：上一頁/下一頁導航
- [ ] 分頁功能：快速跳頁
- [ ] 整合：篩選時重置為第一頁
- [ ] 整合：搜尋時重置為第一頁
- [ ] 效能：初次載入 < 2 秒
- [ ] 效能：快取載入 < 0.5 秒
- [ ] 效能：分頁切換 < 100ms
- [ ] 錯誤處理：localStorage 不可用時 fallback
- [ ] 錯誤處理：API 失敗時使用快取
- [ ] 錯誤處理：快取損壞時自動清除
- [ ] UI：分頁控制器顯示正確
- [ ] UI：每頁筆數選擇器運作正常
- [ ] UI：快取狀態指示（可選）

---

## 實作順序

### Phase 1: 基礎建設
1. 建立 `useLocalStorageCache.js`
2. 建立 `usePagination.js`
3. 撰寫簡單的測試驗證 composables 運作

### Phase 2: 整合快取
4. 修改 `useGifts.js`，整合快取邏輯
5. 測試快取功能（手動驗證）

### Phase 3: 整合分頁
6. 修改 `GiftCatalog.vue`，引入 `usePagination`
7. 新增每頁筆數選擇器 UI
8. 新增分頁控制器 UI
9. 測試分頁功能（手動驗證）

### Phase 4: 整合測試
10. 測試快取 + 分頁整合
11. 測試篩選 + 分頁整合
12. 效能測試
13. 錯誤處理測試

### Phase 5: 文件與收尾
14. 撰寫 `walkthrough.md`
15. 更新 `task.md`

---

## 風險與緩解

| 風險 | 影響 | 緩解策略 |
|------|------|----------|
| localStorage 容量限制 | 快取失敗 | 僅快取必要年度，設定 TTL 自動清理 |
| 快取資料過時 | 使用者看到舊資料 | 當年度不快取，過去年度 24 小時過期 |
| 分頁與篩選衝突 | UI 混亂 | 篩選變更時自動重置為第一頁 |
| 瀏覽器不支援 localStorage | 功能失效 | 自動 fallback 到純 API 模式 |

---

## 預估工時

- Phase 1: 2 小時
- Phase 2: 1.5 小時
- Phase 3: 2 小時
- Phase 4: 1.5 小時
- Phase 5: 1 小時

**總計**：約 8 小時

---

## 成功指標

- ✅ 初次載入時間從 ~5 秒降至 < 2 秒
- ✅ 快取命中率 > 90%（過去年度切換）
- ✅ 分頁功能使用率 > 50%
- ✅ 無 localStorage 相關錯誤（< 1% 錯誤率）
- ✅ 使用者體驗提升（主觀評估）
