# 🛠️ 開發指南

## 專案架構

### 技術棧
- **前端**: Vue 3 (Composition API) + Vite + Tailwind CSS
- **後端**: Supabase (PostgreSQL + Auth + Edge Functions)
- **認證**: Google OAuth
- **狀態管理**: Composables (無需 Pinia/Vuex)

### 目錄結構
```
src/
├── lib/              # 核心函式庫（Supabase client）
├── composables/      # 業務邏輯層（可重用邏輯）
├── router/           # 路由設定
├── views/            # 頁面元件
├── components/       # 共用元件
└── style/            # 樣式檔案
```

---

## 開發流程

### 1. 新增頁面

#### 步驟
1. 在 `src/views/` 建立 Vue 元件
2. 在 `src/router/index.js` 新增路由
3. 設定 `meta` 屬性（權限控制）

#### 範例
```javascript
// src/router/index.js
{
  path: '/new-page',
  name: 'NewPage',
  component: () => import('@/views/NewPage.vue'),
  meta: { 
    requiresAuth: true,      // 需要登入
    requiresAdmin: false     // 不需要 Admin
  }
}
```

### 2. 新增 API 功能

#### 使用現有 Composable
```javascript
// 在元件中
import { useGifts } from '@/composables/useGifts'

const { gifts, loading, error, fetchAllGifts } = useGifts()

// 呼叫 API
await fetchAllGifts({ year: 2025 })
```

#### 新增 Composable 函數
```javascript
// src/composables/useGifts.js
const newFunction = async (params) => {
  loading.value = true
  error.value = null

  try {
    const { data, error: fetchError } = await supabase
      .from('table_name')
      .select('*')
      .eq('column', params.value)

    if (fetchError) throw fetchError
    return { data, error: null }
  } catch (e) {
    console.error('Error:', e)
    error.value = e.message
    return { data: null, error: e }
  } finally {
    loading.value = false
  }
}
```

### 3. 新增元件

#### 元件結構
```vue
<template>
  <div class="component-wrapper">
    <!-- 元件內容 -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  propName: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['event-name'])

// 邏輯
const handleClick = () => {
  emit('event-name', data)
}
</script>
```

---

## Composables 使用指南

### useAuth
認證相關功能

```javascript
import { useAuth } from '@/composables/useAuth'

const { 
  user,              // 當前用戶
  profile,           // 用戶資料（含 is_admin）
  isAdmin,           // 是否為 Admin
  isAuthenticated,   // 是否已登入
  signInWithGoogle,  // Google 登入
  signOut,           // 登出
  initAuth           // 初始化認證
} = useAuth()

// 登入
await signInWithGoogle()

// 登出
await signOut()
```

### useGifts
紀念品管理

```javascript
import { useGifts } from '@/composables/useGifts'

const {
  gifts,                    // 紀念品列表
  myCollections,            // 我的收藏
  loading,                  // 載入狀態
  error,                    // 錯誤訊息
  fetchAllGifts,            // 取得紀念品
  fetchMyCollections,       // 取得收藏
  addToCollection,          // 加入收藏
  removeFromCollection,     // 移除收藏
  updateCollectionNote,     // 更新備註
  isInCollection            // 檢查是否已收藏
} = useGifts()

// 取得紀念品（支援篩選）
await fetchAllGifts({
  year: 2025,
  companyName: '台積電',
  category: '生活用品'
})

// 加入收藏
await addToCollection(giftId, '2025-01-14')
```

### useScraper
爬蟲管理（Admin）

```javascript
import { useScraper } from '@/composables/useScraper'

const {
  sources,                  // 爬蟲來源列表
  logs,                     // 執行記錄
  loading,
  error,
  fetchScraperSources,      // 取得來源
  addScraperSource,         // 新增來源
  updateScraperSource,      // 更新來源
  deleteScraperSource,      // 刪除來源
  triggerScraper,           // 觸發爬蟲
  fetchScraperLogs          // 取得日誌
} = useScraper()

// 觸發爬蟲
await triggerScraper(sourceId)
```

### useAdmin
Admin 功能

```javascript
import { useAdmin } from '@/composables/useAdmin'

const {
  users,                    // 所有用戶
  adminEmails,              // Admin 白名單
  stats,                    // 統計資料
  loading,
  error,
  fetchAllUsers,            // 取得用戶
  fetchAdminEmails,         // 取得白名單
  addAdminEmail,            // 新增 Admin
  removeAdminEmail,         // 移除 Admin
  fetchGiftStats            // 取得統計
} = useAdmin()

// 新增 Admin
await addAdminEmail('new-admin@gmail.com')
```

---

## 樣式指南

### Tailwind CSS 使用

#### 常用類別
```html
<!-- 佈局 -->
<div class="flex items-center justify-between">
<div class="grid grid-cols-3 gap-4">

<!-- 間距 -->
<div class="p-4 m-2">        <!-- padding, margin -->
<div class="px-6 py-4">      <!-- x, y 軸 -->

<!-- 顏色 -->
<div class="bg-indigo-600 text-white">
<div class="hover:bg-indigo-700">

<!-- 圓角和陰影 -->
<div class="rounded-lg shadow-md">

<!-- 響應式 -->
<div class="w-full md:w-1/2 lg:w-1/3">
```

#### 配色方案
- 主色：`indigo-600`
- 成功：`green-600`
- 警告：`yellow-600`
- 錯誤：`red-600`
- Admin：`purple-600`

---

## 路由守衛

### 權限控制

```javascript
// src/router/index.js
meta: {
  requiresAuth: true,      // 需要登入
  requiresAdmin: true,     // 需要 Admin 權限
  requiresGuest: true      // 只允許未登入用戶
}
```

### 自動導向
- 未登入訪問需登入頁面 → 導向登入頁
- 已登入訪問登入頁 → 導向紀念品目錄
- 非 Admin 訪問 Admin 頁面 → 導向紀念品目錄
- Admin 登入成功 → 導向 Admin 主控台
- 一般用戶登入成功 → 導向紀念品目錄

---

## 資料庫操作

### 查詢資料
```javascript
const { data, error } = await supabase
  .from('gift_catalog')
  .select('*')
  .eq('gift_year', 2025)
  .order('created_at', { ascending: false })
  .limit(10)
```

### 新增資料
```javascript
const { data, error } = await supabase
  .from('user_collections')
  .insert({
    user_id: userId,
    gift_id: giftId,
    collected_date: '2025-01-14'
  })
  .select()
  .single()
```

### 更新資料
```javascript
const { data, error } = await supabase
  .from('user_collections')
  .update({ notes: 'Updated note' })
  .eq('id', collectionId)
  .select()
```

### 刪除資料
```javascript
const { error } = await supabase
  .from('user_collections')
  .delete()
  .eq('id', collectionId)
```

### 關聯查詢
```javascript
const { data, error } = await supabase
  .from('user_collections')
  .select(`
    *,
    gift:gift_catalog (*)
  `)
  .eq('user_id', userId)
```

---

## 錯誤處理

### 統一錯誤處理模式
```javascript
try {
  const { data, error } = await supabase.from('table').select()
  if (error) throw error
  
  // 處理成功
  return { data, error: null }
} catch (e) {
  console.error('Error:', e)
  error.value = e.message
  return { data: null, error: e }
} finally {
  loading.value = false
}
```

### 顯示錯誤訊息
```vue
<template>
  <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
    <p class="text-red-800">{{ error }}</p>
  </div>
</template>
```

---

## 測試

### 手動測試檢查清單

#### 認證功能
- [ ] Google 登入成功
- [ ] 登出成功
- [ ] Admin 權限正確判定
- [ ] 路由守衛正常運作

#### 一般用戶功能
- [ ] 瀏覽紀念品列表
- [ ] 搜尋和篩選
- [ ] 加入收藏
- [ ] 移除收藏
- [ ] 編輯備註和日期

#### Admin 功能
- [ ] 查看主控台統計
- [ ] 管理爬蟲來源
- [ ] 觸發爬蟲
- [ ] 查看執行記錄
- [ ] 管理 Admin 白名單

---

## 效能優化

### 最佳實踐
1. 使用 `v-if` 而非 `v-show` 對於不常切換的元素
2. 使用 `computed` 快取計算結果
3. 避免在 `v-for` 中使用複雜計算
4. 使用 `key` 屬性優化列表渲染
5. 懶加載路由元件

### 範例
```javascript
// 使用 computed 快取
const filteredGifts = computed(() => {
  return gifts.value.filter(g => g.gift_year === selectedYear.value)
})

// 懶加載路由
component: () => import('@/views/GiftCatalog.vue')
```

---

## 除錯技巧

### Vue Devtools
安裝 Vue Devtools 瀏覽器擴充功能

### Console 除錯
```javascript
console.log('Debug:', { user, profile, isAdmin })
console.error('Error:', error)
console.table(gifts.value)
```

### Supabase 除錯
1. 查看 Supabase Dashboard > Logs
2. 檢查 RLS 政策
3. 使用 SQL Editor 測試查詢

---

## Git 工作流程

### 分支策略
- `main` - 生產環境
- `dev` - 開發環境
- `feature/*` - 功能分支

### Commit 訊息格式
```
feat: 新增功能
fix: 修復錯誤
docs: 更新文件
style: 程式碼格式
refactor: 重構
test: 測試
chore: 雜項
```

---

## 常見問題

### Q: 如何新增新的資料表？
**A**: 
1. 在 Supabase SQL Editor 建立表格
2. 設定 RLS 政策
3. 建立對應的 Composable 函數
4. 更新 TypeScript 型別

### Q: 如何處理圖片上傳？
**A**: 使用 Supabase Storage
```javascript
const { data, error } = await supabase.storage
  .from('bucket-name')
  .upload('file-path', file)
```

### Q: 如何實作 Realtime 功能？
**A**: 使用 Supabase Realtime
```javascript
const channel = supabase
  .channel('table-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'gift_catalog' },
    (payload) => console.log(payload)
  )
  .subscribe()
```

---

**需要更多幫助？** 查看 [API_REFERENCE.md](API_REFERENCE.md) 或提問。
