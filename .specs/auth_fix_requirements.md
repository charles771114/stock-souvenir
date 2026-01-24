# 技術規格: 認證流程與並發請求修復

## 1. 問題分析
- **現狀**: `router.beforeEach`, `App.vue` 與個別視圖 (如 `GiftCatalog`) 在初次載入時會同時呼叫 `supabase.auth.getSession()` 或 `getUser()`。
- **症狀**: 導致 `AbortError: signal is aborted without reason`，這是 Supabase 內部防禦機制或瀏覽器對過度並發請求的取消響應。

## 2. 優化方案 (System Design)

### 2.1 useAuth.js 重構
- **單例初始化**: 引入 `initAuthPromise` 變數，確保 `initAuth` 只會被執行一次。
- **防止冗餘**: 如果 `initAuth` 正在執行中，後續呼叫將直接回傳該 Promise。
- **移除 fetchProfile 衝突**: 在 `onAuthStateChange` 中加入簡單的檢查，避免重複載入同一用戶。

### 2.2 useGifts.js / useCollection.js 優化
- **優先使用 Ref**: 移除內部對 `supabase.auth.getUser()` 的同步呼叫。直接讀取 `useAuth` 提供且已響應的 `user` ref。
- **延遲加載**: 只有在 `user.value` 存在時才執行涉及權限的資料加載。

### 2.3 Router Guard 優化
- **非同步解耦**: Router Guard 應儘量只讀取已存在的 Session，若無則才嘗試 fetch。

## 3. 實作任務
1. [MODIFY] `useAuth.js`: 鎖定初始化 Promise。
2. [MODIFY] `useGifts.js`: 改用共享的 `user` ref 代替每輪 fetch 重新 get user。
3. [MODIFY] `App.vue`: 確保 `initAuth` 的穩定性。
