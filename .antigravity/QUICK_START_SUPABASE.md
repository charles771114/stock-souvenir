# Supabase 快速開始指南

## 🚀 5 分鐘快速設定

### 1. 建立 Supabase 專案
```bash
# 前往 https://app.supabase.com/
# 點擊 "New Project"
# 記錄 Project URL 和 API Keys
```

### 2. 執行資料庫設定
在 Supabase Dashboard > SQL Editor 執行：
```bash
# 複製並執行 supabase/schema.sql
# （可選）執行 supabase/seed.sql 插入測試資料
```

### 3. 設定環境變數
```bash
cp .env.example .env
# 編輯 .env 填入你的 Supabase 憑證
```

### 4. 安裝依賴並啟動
```bash
npm install
npm run dev
```

## 📝 常用指令

```bash
# 開發
npm run dev                    # 啟動開發伺服器

# Supabase 本地開發（需要 Docker）
npm run supabase:start         # 啟動本地 Supabase
npm run supabase:stop          # 停止本地 Supabase
npm run supabase:status        # 查看狀態
npm run supabase:reset         # 重置資料庫

# 資料同步
npm run sync:supabase          # 同步 Google Sheets 到 Supabase

# 型別生成
npm run supabase:types         # 生成 TypeScript 型別
```

## 🔑 環境變數

```env
# Supabase（前端）
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Supabase（後端腳本）
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Google Sheets
SHEET_ID=your-sheet-id
GCP_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

## 💡 使用範例

### 查詢紀念品
```javascript
import { useSupabaseSouvenirs } from '@/composables/useSupabaseSouvenirs'

const { souvenirs, fetchSouvenirs, searchSouvenirs } = useSupabaseSouvenirs()

// 取得所有紀念品
await fetchSouvenirs()

// 搜尋
await searchSouvenirs('台積電')

// 進階篩選
await fetchSouvenirs({
  code: '2330',
  oddLot: true,
  meetingDateFrom: '2025-01-01'
})
```

### 管理收藏
```javascript
import { useSupabaseGifts } from '@/composables/useSupabaseGifts'

const { gifts, addGift, removeGift, fetchGifts } = useSupabaseGifts()

// 取得我的收藏
await fetchGifts()

// 新增收藏
await addGift(souvenirId, 'collected', 1, '很棒的紀念品')

// 刪除收藏
await removeGift(collectionId)
```

### 直接使用 Supabase Client
```javascript
import { supabase } from '@/supabase'

// 查詢
const { data, error } = await supabase
  .from('souvenirs')
  .select('*')
  .eq('code', '2330')
  .order('meeting_date', { ascending: false })

// 新增
const { data, error } = await supabase
  .from('user_collections')
  .insert({ user_id: userId, souvenir_id: souvenirId })
```

## 🔐 認證

```javascript
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 初始化（在 App.vue 中）
await authStore.initAuth()

// 登入
await authStore.login()

// 登出
await authStore.logout()

// 檢查登入狀態
if (authStore.user) {
  console.log('已登入:', authStore.user.email)
}
```

## 📊 資料庫結構

```
souvenirs (紀念品主資料)
├── id
├── doc_id (unique)
├── code (股票代號)
├── name (公司名稱)
├── souvenir_item (紀念品名稱)
├── meeting_date (股東會日期)
└── ...

profiles (使用者)
├── id (uuid)
├── email
└── role

user_collections (使用者收藏)
├── id
├── user_id → profiles.id
├── souvenir_id → souvenirs.id
├── status (pending/collected/missed)
└── quantity
```

## 🛠️ 疑難排解

### 連線錯誤
```bash
# 檢查環境變數
echo $VITE_SUPABASE_URL

# 測試連線
curl https://your-project.supabase.co/rest/v1/
```

### RLS 權限錯誤
```javascript
// 確認已登入
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

// 檢查 RLS 政策（在 Supabase Dashboard）
```

### 同步腳本失敗
```bash
# 檢查環境變數
cd scripts
node -e "require('dotenv').config({path:'../.env'}); console.log(process.env.SUPABASE_URL)"

# 執行並查看詳細錯誤
node sync-sheets-to-supabase.js
```

## 📚 更多資源

- 完整文件：`supabase/README.md`
- 遷移清單：`SUPABASE_MIGRATION_COMPLETE.md`
- Antigravity 指南：`.antigravity/supabase-setup.md`
- [Supabase 官方文件](https://supabase.com/docs)
