# 股東會紀念品管理系統 - Antigravity 指南

這是一個完整的股東會紀念品管理系統，使用 Vue 3 + Supabase 建構。

## 🎯 專案概述

### 功能特色
- **一般用戶**: Google OAuth 登入、瀏覽紀念品、收藏管理
- **Admin 用戶**: 爬蟲管理、系統統計、用戶管理

### 技術棧
- **前端**: Vue 3 + Vite + Tailwind CSS
- **後端**: Supabase (PostgreSQL + Auth + Edge Functions)
- **認證**: Google OAuth

## 📚 文件導航

### 快速開始
- [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md) - 5 分鐘快速啟動
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - 完整設定指南

### 開發指南
- [DEVELOPMENT_GUIDE.md](DEVELOPMENT_GUIDE.md) - 開發指南和最佳實踐
- [API_REFERENCE.md](API_REFERENCE.md) - API 和 Composables 參考

### Supabase
- [supabase-setup.md](supabase-setup.md) - Supabase 設定
- [supabase-commands.md](supabase-commands.md) - 指令速查表

### 專案資訊
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - 專案結構說明
- [CHANGELOG.md](CHANGELOG.md) - 變更記錄

## 🚀 快速開始

```bash
# 1. 安裝依賴
npm install

# 2. 設定環境變數
cp .env.example .env
# 編輯 .env 填入 Supabase 憑證

# 3. 啟動開發伺服器
npm run dev
```

## 📋 開發檢查清單

### Supabase 設定
- [ ] 建立 Supabase 專案
- [ ] 執行 `supabase/migrations/001_initial_schema.sql`
- [ ] 設定 Google OAuth
- [ ] 新增 Admin email 到白名單

### 本地開發
- [ ] 安裝依賴
- [ ] 設定環境變數
- [ ] 測試 Supabase 連線
- [ ] 測試登入功能

## 🔗 相關連結

- [Supabase Dashboard](https://app.supabase.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [專案 GitHub](https://github.com/your-repo)

## 💡 常用指令

```bash
# 開發
npm run dev                    # 啟動開發伺服器
npm run build                  # 建置生產版本

# Supabase
npm run supabase:test          # 測試連線
npm run supabase:types         # 生成型別

# 資料同步
npm run sync:supabase          # 同步 Google Sheets
```

## 🆘 需要幫助？

1. 查看對應的文件
2. 執行測試指令確認問題
3. 查看 Supabase Dashboard 日誌
4. 在 GitHub Issues 提問

---

**最後更新**: 2025-01-14  
**版本**: v1.0.0
