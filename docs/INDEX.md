# 📚 Stock Souvenir - 文件索引

快速找到你需要的文件和資源。

## 🚀 快速開始

| 文件 | 說明 | 適合對象 |
|------|------|----------|
| [README.md](../README.md) | 專案主要說明與使用指南 | 所有人 |
| [QUICK_START.md](QUICK_START.md) | 5 分鐘快速開始開發 | 新手 |
| [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md) | 完整環境設定檢查清單 | 首次設定 |

## 📖 主要文件

### 專案說明
- [README.md](../README.md) - 專案主要說明文件
- [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) - 專案總結與功能清單
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - 專案結構與架構說明

### 管理員指南
- [ADMIN_WORKFLOWS.md](ADMIN_WORKFLOWS.md) - (新) 管理員操作流程詳解
- [SUPABASE_COMMANDS.md](SUPABASE_COMMANDS.md) - Supabase 常用指令速查

### 技術細節
- [AUTH_BEST_PRACTICES.md](AUTH_BEST_PRACTICES.md) - 驗證與權限最佳實踐
- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Supabase 詳細設定指南
- [MIGRATION_SUMMARY.md](MIGRATION_SUMMARY.md) - 遷移歷史總結

## 📁 核心檔案路徑

### 資料庫
```
supabase/
├── migrations/         # 資料庫變更記錄
├── seed.sql            # 測試資料
└── config.toml         # 本地開發設定
```

### 前端 logic
```
src/
├── lib/supabase.js                  # Supabase client
├── stores/auth.js                   # 認證 store
├── composables/                     # 業務邏輯封裝
│   ├── useGifts.js                  # 紀念品與收藏
│   ├── useAdmin.js                  # 管理員功能
│   └── ...
```

---

**索引版本**：v2.0.0  
**最後更新**：2026-01-28  
