# 📚 API 參考文件

## Composables API

### useAuth

認證相關功能

#### 屬性
```typescript
user: Ref<User | null>              // 當前用戶物件
profile: Ref<Profile | null>        // 用戶資料（含 is_admin）
loading: Ref<boolean>               // 載入狀態
error: Ref<string | null>           // 錯誤訊息
isAdmin: ComputedRef<boolean>       // 是否為 Admin
isAuthenticated: ComputedRef<boolean> // 是否已登入
```

#### 方法

##### signInWithGoogle()
使用 Google OAuth 登入

```javascript
const { signInWithGoogle } = useAuth()
await signInWithGoogle()
```

**回傳**: `Promise<{ data, error }>`

##### signOut()
登出

```javascript
const { signOut } = useAuth()
await signOut()
```

**回傳**: `Promise<{ error }>`

##### fetchProfile(userId)
取得用戶資料

```javascript
const { fetchProfile } = useAuth()
await fetchProfile(userId)
```

**參數**:
- `userId` (string): 用戶 ID

**回傳**: `Promise<{ data, error }>`

##### initAuth()
初始化認證狀態（監聽登入狀態變化）

```javascript
const { initAuth } = useAuth()
await initAuth()
```

---

### useGifts

紀念品和收藏管理

#### 屬性
```typescript
gifts: Ref<Gift[]>                  // 紀念品列表
myCollections: Ref<Collection[]>    // 我的收藏
loading: Ref<boolean>
error: Ref<string | null>
```

#### 方法

##### fetchAllGifts(filters?)
取得紀念品列表

```javascript
const { fetchAllGifts } = useGifts()

// 無篩選
await fetchAllGifts()

// 有篩選
await fetchAllGifts({
  year: 2025,
  companyCode: '2330',
  companyName: '台積電',
  giftName: '環保袋',
  category: '生活用品'
})
```

**參數**:
- `filters` (object, 可選):
  - `year` (number): 年份
  - `companyCode` (string): 公司代號
  - `companyName` (string): 公司名稱（模糊搜尋）
  - `giftName` (string): 紀念品名稱（模糊搜尋）
  - `category` (string): 分類

**回傳**: `Promise<{ data, error }>`

##### fetchMyCollections()
取得我的收藏

```javascript
const { fetchMyCollections } = useGifts()
await fetchMyCollections()
```

**回傳**: `Promise<{ data, error }>`

##### addToCollection(giftId, collectedDate?)
加入收藏

```javascript
const { addToCollection } = useGifts()
await addToCollection(giftId, '2025-01-14')
```

**參數**:
- `giftId` (string): 紀念品 ID
- `collectedDate` (string, 可選): 收藏日期 (YYYY-MM-DD)

**回傳**: `Promise<{ data, error }>`

##### removeFromCollection(collectionId)
移除收藏

```javascript
const { removeFromCollection } = useGifts()
await removeFromCollection(collectionId)
```

**參數**:
- `collectionId` (string): 收藏記錄 ID

**回傳**: `Promise<{ error }>`

##### updateCollectionNote(collectionId, note)
更新收藏備註

```javascript
const { updateCollectionNote } = useGifts()
await updateCollectionNote(collectionId, '很棒的紀念品')
```

**參數**:
- `collectionId` (string): 收藏記錄 ID
- `note` (string): 備註內容

**回傳**: `Promise<{ data, error }>`

##### updateCollectionDate(collectionId, date)
更新收藏日期

```javascript
const { updateCollectionDate } = useGifts()
await updateCollectionDate(collectionId, '2025-01-14')
```

**參數**:
- `collectionId` (string): 收藏記錄 ID
- `date` (string): 日期 (YYYY-MM-DD)

**回傳**: `Promise<{ data, error }>`

##### isInCollection(giftId)
檢查是否已收藏

```javascript
const { isInCollection } = useGifts()
const collected = isInCollection(giftId) // boolean
```

**參數**:
- `giftId` (string): 紀念品 ID

**回傳**: `boolean`

---

### useScraper

爬蟲管理（Admin 專用）

#### 屬性
```typescript
sources: Ref<ScraperSource[]>       // 爬蟲來源列表
logs: Ref<ScraperLog[]>             // 執行記錄
loading: Ref<boolean>
error: Ref<string | null>
```

#### 方法

##### fetchScraperSources()
取得所有爬蟲來源

```javascript
const { fetchScraperSources } = useScraper()
await fetchScraperSources()
```

**回傳**: `Promise<{ data, error }>`

##### addScraperSource(sourceData)
新增爬蟲來源

```javascript
const { addScraperSource } = useScraper()
await addScraperSource({
  source_name: '永豐金證券',
  source_url: 'https://example.com',
  selector_config: {
    container: 'table tbody tr',
    selectors: {
      company_code: 'td:nth-child(1)',
      company_name: 'td:nth-child(2)',
      gift_name: 'td:nth-child(3)',
      gift_year: 'td:nth-child(4)',
      image_url: 'td:nth-child(5) img'
    }
  },
  is_active: true
})
```

**參數**:
- `sourceData` (object):
  - `source_name` (string): 來源名稱
  - `source_url` (string): 網站 URL
  - `selector_config` (object): CSS Selector 設定
  - `is_active` (boolean): 是否啟用

**回傳**: `Promise<{ data, error }>`

##### updateScraperSource(sourceId, updates)
更新爬蟲來源

```javascript
const { updateScraperSource } = useScraper()
await updateScraperSource(sourceId, {
  is_active: false
})
```

**參數**:
- `sourceId` (string): 來源 ID
- `updates` (object): 要更新的欄位

**回傳**: `Promise<{ data, error }>`

##### deleteScraperSource(sourceId)
刪除爬蟲來源

```javascript
const { deleteScraperSource } = useScraper()
await deleteScraperSource(sourceId)
```

**參數**:
- `sourceId` (string): 來源 ID

**回傳**: `Promise<{ error }>`

##### triggerScraper(sourceId)
手動觸發爬蟲

```javascript
const { triggerScraper } = useScraper()
await triggerScraper(sourceId)
```

**參數**:
- `sourceId` (string): 來源 ID

**回傳**: `Promise<{ data, error }>`

**注意**: 需要先完成 Phase 2 Edge Function

##### fetchScraperLogs(sourceId?, limit?)
查看執行記錄

```javascript
const { fetchScraperLogs } = useScraper()

// 取得所有記錄
await fetchScraperLogs()

// 取得特定來源的記錄
await fetchScraperLogs(sourceId, 10)
```

**參數**:
- `sourceId` (string, 可選): 來源 ID
- `limit` (number, 可選): 限制筆數，預設 50

**回傳**: `Promise<{ data, error }>`

---

### useAdmin

Admin 功能

#### 屬性
```typescript
users: Ref<User[]>                  // 所有用戶
adminEmails: Ref<AdminEmail[]>      // Admin 白名單
stats: Ref<Stats | null>            // 統計資料
loading: Ref<boolean>
error: Ref<string | null>
```

#### 方法

##### fetchAllUsers()
取得所有用戶列表

```javascript
const { fetchAllUsers } = useAdmin()
await fetchAllUsers()
```

**回傳**: `Promise<{ data, error }>`

##### fetchAdminEmails()
取得 Admin 白名單

```javascript
const { fetchAdminEmails } = useAdmin()
await fetchAdminEmails()
```

**回傳**: `Promise<{ data, error }>`

##### addAdminEmail(email)
新增 Admin

```javascript
const { addAdminEmail } = useAdmin()
await addAdminEmail('new-admin@gmail.com')
```

**參數**:
- `email` (string): Email 地址

**回傳**: `Promise<{ data, error }>`

##### removeAdminEmail(email)
移除 Admin

```javascript
const { removeAdminEmail } = useAdmin()
await removeAdminEmail('admin@gmail.com')
```

**參數**:
- `email` (string): Email 地址

**回傳**: `Promise<{ error }>`

**注意**: 不能移除自己的 admin 權限

##### fetchGiftStats()
取得紀念品統計

```javascript
const { fetchGiftStats } = useAdmin()
await fetchGiftStats()
```

**回傳**: `Promise<{ data, error }>`

**回傳資料結構**:
```typescript
{
  total: number,
  byYear: { [year: number]: number },
  byCategory: { [category: string]: number },
  recent: Gift[]
}
```

##### deleteGift(giftId)
刪除紀念品

```javascript
const { deleteGift } = useAdmin()
await deleteGift(giftId)
```

**參數**:
- `giftId` (string): 紀念品 ID

**回傳**: `Promise<{ error }>`

##### updateGift(giftId, updates)
更新紀念品

```javascript
const { updateGift } = useAdmin()
await updateGift(giftId, {
  gift_name: '新名稱',
  gift_category: '新分類'
})
```

**參數**:
- `giftId` (string): 紀念品 ID
- `updates` (object): 要更新的欄位

**回傳**: `Promise<{ data, error }>`

---

## 資料型別

### Gift
```typescript
{
  id: string
  company_code: string
  company_name: string
  gift_name: string
  gift_year: number
  gift_category?: string
  image_url?: string
  source_url?: string
  scraped_at?: string
  created_at: string
  updated_at: string
}
```

### Collection
```typescript
{
  id: string
  user_id: string
  gift_id: string
  collected_date?: string
  notes?: string
  created_at: string
  updated_at: string
  gift?: Gift  // 關聯查詢時包含
}
```

### ScraperSource
```typescript
{
  id: string
  source_name: string
  source_url: string
  selector_config: {
    container: string
    selectors: {
      company_code: string
      company_name: string
      gift_name: string
      gift_year: string
      image_url?: string
    }
  }
  is_active: boolean
  last_scraped_at?: string
  created_at: string
  updated_at: string
}
```

### ScraperLog
```typescript
{
  id: string
  source_id: string
  status: 'success' | 'failed' | 'running'
  items_scraped: number
  error_message?: string
  executed_at: string
  completed_at?: string
  source?: ScraperSource  // 關聯查詢時包含
}
```

---

## 錯誤代碼

### 常見錯誤

| 錯誤訊息 | 原因 | 解決方法 |
|---------|------|---------|
| `User not authenticated` | 未登入 | 呼叫 `signInWithGoogle()` |
| `Permission denied` | 權限不足 | 檢查 RLS 政策和用戶權限 |
| `Row not found` | 資料不存在 | 檢查 ID 是否正確 |
| `Duplicate key` | 唯一約束違反 | 檢查是否重複新增 |

---

**需要更多資訊？** 查看 [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md)
