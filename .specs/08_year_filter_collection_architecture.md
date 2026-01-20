# 系統架構: 年份篩選與使用者收藏管理

## 資料庫變更 (Database Changes)

### 現有資料表確認
```sql
-- user_collections 表格已存在，無需變更
-- 欄位：id, user_id, souvenir_id, status, quantity, note, created_at, updated_at

-- souvenirs 表格已有 meeting_date，可用於年份篩選
```

### 新增 View (Admin 用)
```sql
-- 建立管理員用的使用者收藏總覽 View
create or replace view public.admin_user_favorites as
select
  uc.id as collection_id,
  uc.user_id,
  p.email,
  s.id as souvenir_id,
  s.code as stock_code,
  s.name as company_name,
  s.souvenir_item,
  uc.created_at as collected_at,
  s.last_buy_date,
  s.meeting_date,
  extract(year from s.meeting_date) as gift_year
from public.user_collections uc
join public.profiles p on uc.user_id = p.id
join public.souvenirs s on uc.souvenir_id = s.id;
```

### RLS 政策檢查
- `user_collections`: 確保用戶只能 CRUD 自己的收藏 ✅ (已存在)
- `admin_user_favorites`: Admin 限定讀取權限

---

## API / Composable 架構

### 1. `useGifts.js` (擴充)
**新增功能**:
- `filterByYear(year)`: 依年份篩選紀念品
- `selectedYear`: ref(2025) - 當前選擇的年份

**修改邏輯**:
```javascript
const fetchGifts = async () => {
  let query = supabase.from('souvenirs').select('*')
  
  // 年份篩選
  if (selectedYear.value) {
    const startDate = `${selectedYear.value}-01-01`
    const endDate = `${selectedYear.value}-12-31`
    query = query.gte('meeting_date', startDate).lte('meeting_date', endDate)
  }
  
  // ... 其他篩選邏輯
}
```

### 2. `useCollection.js` (新建)
**功能**:
- `userCollections`: ref([]) - 當前用戶的收藏清單
- `addToCollection(souvenirId)`: 新增收藏
- `removeFromCollection(souvenirId)`: 移除收藏
- `isCollected(souvenirId)`: 判斷是否已收藏
- `fetchUserCollections()`: 載入用戶收藏

**實作範例**:
```javascript
export function useCollection() {
  const userCollections = ref([])
  
  const addToCollection = async (souvenirId) => {
    const { data, error } = await supabase
      .from('user_collections')
      .insert({
        user_id: supabase.auth.user().id,
        souvenir_id: souvenirId,
        status: 'collected'
      })
    
    if (!error) {
      await fetchUserCollections()
    }
    return { data, error }
  }
  
  // ... 其他方法
}
```

### 3. `useAdmin.js` (擴充)
**新增功能**:
- `fetchUserFavorites(userEmail?)`: 取得收藏統計
- `exportFavoritesCSV(filters)`: 匯出 CSV

---

## 前端元件架構

### 1. `GiftCatalog.vue` (主頁面 - 修改)

**新增 UI 元素**:
```vue
<template>
  <div>
    <!-- 年份選擇器 + 視圖切換 -->
    <div class="filters-bar">
      <YearSelector v-model="selectedYear" />
      <ViewToggle v-model="currentView" />
    </div>
    
    <!-- 紀念品列表 -->
    <div class="gifts-grid">
      <GiftCard 
        v-for="gift in filteredGifts" 
        :key="gift.id"
        :gift="gift"
        @toggle-favorite="handleFavorite"
      />
    </div>
    
    <!-- 空狀態 -->
    <EmptyState v-if="filteredGifts.length === 0" />
  </div>
</template>
```

**邏輯**:
```javascript
const currentView = ref('all') // 'all' | 'collection'
const selectedYear = ref(2025)

const filteredGifts = computed(() => {
  let gifts = allGifts.value
  
  // 依視圖篩選
  if (currentView.value === 'collection') {
    const collectionIds = userCollections.value.map(c => c.souvenir_id)
    gifts = gifts.filter(g => collectionIds.includes(g.id))
  }
  
  return gifts
})
```

### 2. `YearSelector.vue` (新建)
```vue
<template>
  <div class="year-selector">
    <button 
      v-for="year in years" 
      :key="year"
      :class="{ active: modelValue === year }"
      @click="$emit('update:modelValue', year)"
    >
      {{ year }}
    </button>
  </div>
</template>

<script setup>
defineProps(['modelValue'])
defineEmits(['update:modelValue'])

const years = [2023, 2024, 2025, 2026]
</script>
```

### 3. `ViewToggle.vue` (新建)
```vue
<template>
  <div class="view-toggle">
    <button 
      :class="{ active: modelValue === 'all' }"
      @click="$emit('update:modelValue', 'all')"
    >
      全部紀念品
    </button>
    <button 
      :class="{ active: modelValue === 'collection' }"
      @click="$emit('update:modelValue', 'collection')"
    >
      我的收藏
    </button>
  </div>
</template>
```

### 4. `GiftCard.vue` (修改 - 新增收藏按鈕)
```vue
<template>
  <div class="gift-card">
    <!-- 收藏按鈕 -->
    <button 
      class="favorite-btn"
      @click.stop="$emit('toggle-favorite', gift.id)"
    >
      <HeartIcon :filled="isCollected" />
    </button>
    
    <!-- 原有內容 -->
    <div class="gift-info">...</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useCollection } from '@/composables/useCollection'

const props = defineProps(['gift'])
const { isCollected } = useCollection()

const isFavorite = computed(() => isCollected(props.gift.id))
</script>
```

### 5. `UserFavoritesTable.vue` (新建 - Admin 用)
```vue
<template>
  <div class="admin-favorites">
    <!-- 篩選器 -->
    <div class="filters">
      <select v-model="selectedUser">
        <option value="">全部用戶</option>
        <option v-for="user in users" :key="user.id" :value="user.email">
          {{ user.email }}
        </option>
      </select>
      
      <button @click="exportCSV">匯出 CSV</button>
    </div>
    
    <!-- 統計卡片 -->
    <div class="stats">
      <StatCard title="總收藏數" :value="totalCollections" />
      <StatCard title="活躍用戶" :value="activeUsers" />
    </div>
    
    <!-- 資料表格 -->
    <table>
      <thead>
        <tr>
          <th>用戶</th>
          <th>公司名稱</th>
          <th>紀念品</th>
          <th>收藏時間</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="fav in favorites" :key="fav.collection_id">
          <td>{{ fav.email }}</td>
          <td>{{ fav.company_name }}</td>
          <td>{{ fav.souvenir_item }}</td>
          <td>{{ formatDate(fav.collected_at) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
```

---

## URL 路由設計

### 前端路由
```javascript
// router/index.js
{
  path: '/gifts',
  name: 'GiftCatalog',
  component: GiftCatalog,
  // 支援 query params: ?year=2025&view=collection
}

{
  path: '/admin/favorites',
  name: 'AdminFavorites',
  component: UserFavoritesTable,
  meta: { requiresAdmin: true }
}
```

### Query Params 邏輯
```javascript
// 在 GiftCatalog.vue 中
const route = useRoute()
const router = useRouter()

// 初始化從 URL 讀取
const selectedYear = ref(Number(route.query.year) || 2025)
const currentView = ref(route.query.view || 'all')

// 監聽變化並更新 URL
watch([selectedYear, currentView], ([year, view]) => {
  router.replace({
    query: { year, view }
  })
})
```

---

## 狀態管理策略

採用 **Composables Pattern**（不使用 Pinia/Vuex）:

```
useGifts.js (全域單例)
  ├─ gifts: ref([])
  ├─ selectedYear: ref(2025)
  └─ fetchGifts()

useCollection.js (全域單例)
  ├─ userCollections: ref([])
  ├─ addToCollection()
  └─ removeFromCollection()

useAdmin.js (全域單例)
  ├─ favorites: ref([])
  └─ fetchUserFavorites()
```

---

## 邊界情況處理 (Edge Cases)

1. **未登入用戶**:
   - 收藏按鈕顯示但點擊時提示「請先登入」
   - 或直接隱藏收藏按鈕

2. **空收藏清單**:
   - 顯示 Empty State 引導用戶開始收藏

3. **年份無資料**:
   - 顯示「該年份暫無資料」提示

4. **並發收藏**:
   - 使用 Supabase 的 `upsert` 避免重複收藏
   - 在 `user_collections` 表上有 `unique(user_id, souvenir_id)` 約束

5. **RLS 權限**:
   - 確保用戶只能查看/修改自己的收藏
   - Admin 透過 Service Role 或特殊 policy 查看全局數據

---

## 效能優化

1. **懶加載**: 收藏清單只在用戶切換到「我的收藏」視圖時才載入
2. **快取**: 使用 `ref` 快取已載入的年份資料
3. **樂觀更新**: 收藏動作立即更新 UI，後台 API 非同步執行

---

## 安全性考量

1. **RLS 強制執行**: 所有 `user_collections` 操作必須通過 RLS
2. **Admin 驗證**: `admin_user_favorites` view 僅限 `role='admin'` 的用戶查詢
3. **輸入驗證**: 年份參數檢查範圍（2020-2030）

---

## UI/UX 設計原則

遵循既有的 **Pro Max Glassmorphism** 風格：
- 年份選擇器：使用 Pill Button 群組
- 視圖切換：使用 Tab 樣式
- 收藏按鈕：愛心 Icon + 微動畫（點擊時放大）
- 空狀態：插圖 + 友善文案

---

## 下一步

建立 `.specs/09_task_plan.md` 詳細任務清單，然後開始實作。
