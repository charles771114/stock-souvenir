# Stock Souvenir 專案結構說明

本文檔說明已經過清理和重構後的專案結構。

## 📁 目錄結構

```
stock-souvenir/
├── docs/                 # 專案文件 (包含遷移指南、清理摘要等)
├── scripts/              # 後端與資料同步腳本
│   ├── sync-sheets-to-supabase.js  # 同步 Google Sheets 資料至 Supabase
│   └── ...
├── src/
│   ├── assets/           # 靜態資源 (圖片等)
│   ├── components/       # Vue 元件
│   │   ├── GiftCard.vue        # 紀念品卡片
│   │   ├── Navbar.vue          # 導航列
│   │   ├── ScraperLogTable.vue # 爬蟲紀錄表
│   │   └── ...
│   ├── composables/      # Vue Composables (邏輯複用)
│   │   ├── useAuth.js            # 認證邏輯
│   │   ├── useGifts.js           # 紀念品資料存取
│   │   ├── useScraper.js         # 爬蟲管理邏輯
│   │   └── useCollection.js      # (舊) 待確認是否合併至 useGifts
│   ├── lib/              # 第三方函式庫設定
│   │   └── supabase.js   # Supabase Client 初始化
│   ├── router/           # 路由設定
│   │   └── index.js
│   ├── stores/           # Pinia 狀態管理
│   │   └── auth.js       # (舊) 待確認是否由 useAuth 取代
│   ├── views/            # 頁面元件
│   │   ├── Login.vue           # 登入頁
│   │   ├── GiftCatalog.vue     # 紀念品目錄頁
│   │   ├── MyCollections.vue   # 我的收藏頁
│   │   ├── AdminPanel.vue      # 管理員主控台
│   │   └── ScraperManager.vue  # 爬蟲管理頁
│   ├── App.vue           # 根元件
│   └── main.js           # 進入點
├── supabase/             # Supabase 設定與 Functions
│   ├── functions/        # Edge Functions
│   │   └── stock-api/    # (舊) 可能已改名或整合
│   ├── schema.sql        # 資料庫結構
│   └── seed.sql          # 測試資料
├── index.html            # Vite 進入點
└── package.json          # 專案設定
```

## 🧹 清理與重構摘要 (2025-01-14)

### 移除的項目
- **Firebase 相關**: 移除非必要的 Firebase 設定與 api 轉送。
- **舊版 API**: 移除 `src/api` 目錄下的本地 API 處理邏輯 (如 `mopsApi.js`)，改由 Supabase Edge Functions 或直接查詢 Supabase Database 處理。
- **舊版視圖**: 移除 `GiftList.vue` (舊版列表), `DataUpdater.vue` (舊版手動更新), `GiftNavigation.vue` (舊版導航)。
- **暫存檔案**: 移除 `output/` 目錄 (本地 json 緩存) 和 `validate-endpoint.mjs`。

### 核心功能對應
1. **認證**: 使用 `src/composables/useAuth.js` 配合 Supabase Auth。
2. **資料展示**: `GiftCatalog.vue` 使用 `useGifts.js` 從 Supabase `gift_catalog` table 讀取資料。
3. **資料更新**: `ScraperManager.vue` 使用 `useScraper.js` 呼叫 Supabase Edge Function 觸發爬蟲。
4. **我的收藏**: `MyCollections.vue` 管理 `user_collections` table 的資料。

## 🔗 下一步建議
1. 確認 `supabase/functions` 中的 Edge Function 名稱是否與 `useScraper.js` 中的呼叫一致 (目前呼叫 `scrape-gifts`)。
2. 檢查 `src/stores/auth.js` 是否仍被使用，若已完全轉移至 `useAuth.js` 則可移除。
3. 確保 Supabase Dashboard 的 Redirect URL 已設定為 `http://localhost:5173/auth/callback`。
