# 📚 Stock Souvenir - 文件索引

快速找到你需要的文件和資源。

## 🚀 快速開始

| 文件 | 說明 | 適合對象 |
|------|------|----------|
| [README_SUPABASE.md](README_SUPABASE.md) | Supabase 遷移總覽 | 所有人 |
| [.antigravity/QUICK_START_SUPABASE.md](.antigravity/QUICK_START_SUPABASE.md) | 5 分鐘快速開始 | 新手 |
| [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) | 完整設定檢查清單 | 首次設定 |

## 📖 主要文件

### 專案說明
- [README.md](README.md) - 專案主要說明文件
- [README_SUPABASE.md](README_SUPABASE.md) - Supabase 遷移說明
- [INDEX.md](INDEX.md) - 本文件（文件索引）

### 遷移相關
- [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md) - 原始遷移計畫
- [SUPABASE_MIGRATION_COMPLETE.md](SUPABASE_MIGRATION_COMPLETE.md) - 完整遷移清單
- [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) - 遷移總結

### 設定指南
- [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) - 設定檢查清單
- [supabase/README.md](supabase/README.md) - Supabase 詳細設定指南

## 🛠️ 技術文件

### Supabase
- [.antigravity/supabase-setup.md](.antigravity/supabase-setup.md) - Antigravity 環境使用
- [.antigravity/supabase-commands.md](.antigravity/supabase-commands.md) - 指令速查表
- [.antigravity/QUICK_START_SUPABASE.md](.antigravity/QUICK_START_SUPABASE.md) - 快速開始

### 專案結構
- [.antigravity/PROJECT_STRUCTURE.md](.antigravity/PROJECT_STRUCTURE.md) - 完整專案結構說明

## 📁 核心檔案

### 資料庫
```
supabase/
├── schema.sql          # 資料庫 schema
├── seed.sql            # 測試資料
├── config.toml         # 本地開發設定
└── README.md           # 設定指南
```

### 前端
```
src/
├── supabase.js                      # Supabase client
├── stores/auth.js                   # 認證 store
├── composables/
│   ├── useSupabaseSouvenirs.js     # 紀念品查詢
│   └── useSupabaseGifts.js         # 收藏管理
├── components/
│   └── AddToCollectionButton.vue   # 收藏按鈕
├── views/
│   └── MyCollection.vue            # 我的收藏頁面
└── types/
    └── supabase.ts                  # TypeScript 型別
```

### 後端腳本
```
scripts/
├── sync-sheets-to-supabase.js      # Google Sheets 同步
├── test-supabase-connection.js     # 連線測試
└── create-test-user.js             # 建立測試使用者
```

## 🎯 依情境查找

### 我是新手，想要開始使用
1. 閱讀 [README_SUPABASE.md](README_SUPABASE.md)
2. 跟著 [.antigravity/QUICK_START_SUPABASE.md](.antigravity/QUICK_START_SUPABASE.md) 操作
3. 使用 [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) 確認設定

### 我要設定 Supabase
1. 查看 [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
2. 參考 [supabase/README.md](supabase/README.md)
3. 執行 `supabase/schema.sql`

### 我要開發新功能
1. 查看 [.antigravity/PROJECT_STRUCTURE.md](.antigravity/PROJECT_STRUCTURE.md) 了解架構
2. 使用 `src/composables/` 中的 composables
3. 參考 `src/components/AddToCollectionButton.vue` 範例

### 我要查詢指令
1. 查看 [.antigravity/supabase-commands.md](.antigravity/supabase-commands.md)
2. 或執行 `npm run` 查看可用指令

### 我遇到問題
1. 查看 [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) 的疑難排解
2. 執行 `npm run supabase:test` 測試連線
3. 查看 [.antigravity/supabase-commands.md](.antigravity/supabase-commands.md) 的除錯章節

### 我要了解遷移過程
1. 閱讀 [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md)
2. 查看 [SUPABASE_MIGRATION_COMPLETE.md](SUPABASE_MIGRATION_COMPLETE.md)
3. 參考 [SUPABASE_MIGRATION.md](SUPABASE_MIGRATION.md) 原始計畫

## 📝 常用指令

```bash
# 開發
npm run dev                    # 啟動開發伺服器
npm run build                  # 建置

# Supabase
npm run supabase:start         # 啟動本地 Supabase
npm run supabase:test          # 測試連線
npm run supabase:types         # 生成型別

# 資料庫
npm run db:reset               # 重置資料庫
npm run db:seed                # 插入測試資料

# 同步
npm run sync:supabase          # 同步 Google Sheets

# 測試
npm run supabase:create-user   # 建立測試使用者
```

## 🔗 外部資源

### Supabase
- [官方文件](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [從 Firebase 遷移](https://supabase.com/docs/guides/migrations/firebase)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Vue 3
- [Vue 3 文件](https://vuejs.org/)
- [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Pinia](https://pinia.vuejs.org/)

### 其他
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

## 📊 文件地圖

```
專案根目錄/
│
├── 📘 README.md                        # 專案主要說明
├── 📘 README_SUPABASE.md              # Supabase 遷移說明
├── 📘 INDEX.md                         # 本文件
│
├── 📗 SETUP_CHECKLIST.md              # 設定檢查清單
├── 📗 MIGRATION_SUMMARY.md            # 遷移總結
├── 📗 SUPABASE_MIGRATION_COMPLETE.md  # 完整遷移清單
├── 📗 SUPABASE_MIGRATION.md           # 原始遷移計畫
│
├── 📂 .antigravity/
│   ├── 📙 QUICK_START_SUPABASE.md     # 快速開始
│   ├── 📙 supabase-setup.md           # Antigravity 使用
│   ├── 📙 supabase-commands.md        # 指令速查表
│   └── 📙 PROJECT_STRUCTURE.md        # 專案結構
│
└── 📂 supabase/
    └── 📕 README.md                    # Supabase 設定指南
```

## 🎨 圖例

- 📘 藍色：主要文件
- 📗 綠色：遷移相關
- 📙 黃色：技術指南
- 📕 紅色：設定文件

## ✅ 快速檢查

### 設定完成了嗎？
- [ ] 已閱讀 [README_SUPABASE.md](README_SUPABASE.md)
- [ ] 已完成 [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
- [ ] 已執行 `npm run supabase:test` 且通過
- [ ] 已啟動 `npm run dev` 且可以訪問

### 準備開發了嗎？
- [ ] 了解 [專案結構](.antigravity/PROJECT_STRUCTURE.md)
- [ ] 知道如何使用 composables
- [ ] 知道常用指令
- [ ] 知道如何查詢文件

## 💡 小技巧

### 快速搜尋
在 VS Code 中按 `Cmd/Ctrl + Shift + F` 全域搜尋關鍵字。

### 常用搜尋關鍵字
- `useSupabase` - 找到所有 Supabase composables
- `supabase.from` - 找到所有資料庫查詢
- `npm run` - 找到所有可用指令
- `TODO` - 找到待辦事項

### 文件更新
如果文件有誤或需要更新，請：
1. 直接編輯對應的 `.md` 檔案
2. 提交 Pull Request
3. 或在 Issues 中回報

## 🆘 需要幫助？

### 依序嘗試
1. 在本索引中搜尋相關主題
2. 查看對應的文件
3. 執行測試指令確認問題
4. 查看 Supabase Dashboard 的日誌
5. 在 GitHub Issues 提問

### 常見問題文件
- 連線問題 → [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) 疑難排解
- 指令問題 → [.antigravity/supabase-commands.md](.antigravity/supabase-commands.md)
- 權限問題 → [supabase/README.md](supabase/README.md) RLS 章節

---

**索引版本**：v1.0.0  
**最後更新**：2025-01-14  
**維護者**：Stock Souvenir Team

💡 **提示**：將此文件加入書籤，方便隨時查找！
