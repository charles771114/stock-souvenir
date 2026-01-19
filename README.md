# Stock Souvenir - 股東會紀念品管理系統

一個完整的股東會紀念品管理系統，支援一般用戶瀏覽和收藏紀念品，以及 Admin 管理爬蟲和系統設定。

## ✨ 主要功能

### 一般用戶
- 🔐 使用 Google 帳號登入
- 🎁 瀏覽所有股東會紀念品
- 🔍 多條件搜尋和篩選（年份、分類、關鍵字）
- ⭐ 標記已收藏的紀念品
- 📝 查看和管理收藏記錄（備註、日期）
- 📊 收藏統計

### Admin 用戶
- 🔐 Google OAuth 登入，系統自動判定 admin 權限（依 email 白名單）
- 🤖 手動觸發爬蟲更新紀念品資料
- ➕ 新增/編輯爬蟲來源網站設定
- 📋 查看爬蟲執行記錄和狀態
- ✏️ 編輯/刪除紀念品資料
- 📥 批次匯入歷史資料 (CSV/Excel)
- 👥 管理 admin 白名單
- 📊 查看系統統計資料

## 🚀 技術棧

- **前端**：
  - [Vue 3](https://vuejs.org/) (Composition API)
  - [Vite](https://vitejs.dev/)
  - [Vue Router](https://router.vuejs.org/)
  - [Tailwind CSS](https://tailwindcss.com/)
  
- **後端 & 資料庫**：
  - [Supabase](https://supabase.com/)
    - PostgreSQL (資料庫)
    - Row Level Security (權限控制)
    - Authentication (Google OAuth)
    - Edge Functions (爬蟲功能)
    
- **CI/CD & 自動化**：
  - [GitHub Actions](https://github.com/features/actions)

## 📦 快速開始

### 環境需求
- [Node.js](https://nodejs.org/) (v18 或以上)
- [npm](https://www.npmjs.com/) 或 [pnpm](https://pnpm.io/)
- [Supabase](https://supabase.com/) 帳號
- [Google Cloud](https://console.cloud.google.com/) 帳號（OAuth）

### 安裝步驟

詳細步驟請參考 [QUICK_START.md](QUICK_START.md)

# 1. 安裝依賴
npm install

# 2. 本地開發環境 (Local Development)
# 本專案支援「本地開發 (Local)」與「遠端開發 (Remote)」兩種模式。
# 預設建議使用 Local 模式以方便除錯與修改 Edge Functions。

## 2.1 啟動 Docker
# 本地 Supabase 依賴 Docker 運行。
# 請確保已安裝並啟動 Docker Desktop (Mac)。
open -a Docker # Mac 快速啟動指令

## 2.2 啟動 Supabase 本地服務
npx supabase start

## 2.3 設定環境變數 (.env)
cp .env.example .env
# 如果使用本地模式，確認 .env 中使用 127.0.0.1 的設定：
# VITE_SUPABASE_URL=http://127.0.0.1:54321
# VITE_SUPABASE_ANON_KEY=... (來自 npx supabase status)

# 3. 啟動前端開發伺服器
npm run dev
```

詳細步驟請參考 [QUICK_START.md](QUICK_START.md)

訪問 http://localhost:5173

## 📖 文件

- [快速開始指南](QUICK_START.md) - 5 分鐘快速啟動
- [專案總結](PROJECT_SUMMARY.md) - 完整的專案說明
- [Phase 1 驗證](PHASE1_VERIFICATION.md) - 資料庫設定驗證
- [前端完成總結](FRONTEND_COMPLETE.md) - 前端功能說明
- [Supabase 設定](supabase/README.md) - Supabase 詳細設定

## 🗂️ 專案結構

```
stock-souvenir/
├── supabase/              # Supabase 設定和 migrations
├── src/
│   ├── lib/              # 核心函式庫
│   ├── composables/      # Vue Composables（業務邏輯）
│   ├── router/           # 路由設定
│   ├── views/            # 頁面元件
│   ├── components/       # 共用元件
│   └── style/            # 樣式檔案
├── scripts/              # 工具腳本
└── 文件/                 # 專案文件
```

## 📜 主要指令

```bash
# 開發
npm run dev              # 啟動開發伺服器
npm run build            # 建置生產版本
npm run preview          # 預覽生產版本

# Supabase（需要 Supabase CLI）
npm run supabase:start   # 啟動本地 Supabase
npm run supabase:stop    # 停止本地 Supabase
npm run supabase:test    # 測試 Supabase 連線
npm run supabase:types   # 生成 TypeScript 型別

# 資料同步
npm run sync:supabase    # 同步 Google Sheets 到 Supabase

# 程式碼品質
npm run format           # 格式化程式碼
npm run lint             # 檢查程式碼
```

## 🎯 開發狀態

- ✅ **Phase 1**: 資料庫設計與認證機制 - 完成
- ⏳ **Phase 2**: Supabase Edge Function（爬蟲）- 待開發
- ✅ **Phase 3**: 前端專案建置 - 完成

## 🤝 貢獻

歡迎任何形式的貢獻！

## 📄 授權

本專案為私有專案。

---

**最後更新**：2026-01-19  
**版本**：v1.1.0
