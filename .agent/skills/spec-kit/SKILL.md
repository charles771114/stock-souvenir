---
name: spec-kit
description: 實作 GitHub Spec Kit 方法論，推動規格驅動開發 (Spec-Driven Development, SDD)。
---

# Spec-Driven Development (Spec Kit)

此技能指引 Agent 遵循 GitHub Spec Kit 定義的規格驅動開發 (SDD) 流程。最適合用於開發新功能、複雜重構或啟動新專案。

## 核心哲學 (Core Philosophy)

**「三思而後行 (Measure twice, cut once)。」**

不要急著寫程式。先理解 (Specify)，再設計 (Plan)，接著拆解 (Tasks)，最後才執行 (Implement)。

## 工作流程階段 (Workflow Phases)

### Phase 1: 定義 (Specify)
**目標**: 建立對 *WHAT* (做什麼) 和 *WHY* (為什麼做) 的清晰理解。
**行動**: 建立或更新 `.specs/01_requirements.md`。
**內容**:
-   使用者故事 (User Story) / 背景脈絡 (Context)
-   目標與非目標 (Goals & Non-Goals)
-   關鍵功能 (Key Features)
-   成功指標 (Success Metrics)

### Phase 2: 規劃 (Plan)
**目標**: 定義 *HOW* (如何) 技術性地建構此功能。
**行動**: 建立或更新 `.specs/02_architecture.md`。
**內容**:
-   資料模型 (Data Models / Schema changes)
-   API 端點 (API Endpoints)
-   元件階層 (Component Hierarchy)
-   狀態管理策略 (State Management Strategy)
-   邊界情況 (Edge Cases)

### Phase 3: 任務拆解 (Tasks)
**目標**: 將計畫拆解為微小、可執行的步驟。
**行動**: 建立 `.specs/03_task_plan.md`。
**內容**:
-   小任務清單 (Checklist) (每個任務理想上 < 1 小時)。
-   標註相依性 (Dependencies)。
-   為每個任務包含「驗證」步驟 (Verification)。

### Phase 4: 執行 (Implement)
**目標**: 根據任務撰寫程式碼。
**行動**:
1.  閱讀 Phase 3 的任務。
2.  撰寫程式碼。
3.  驗證/測試。
4.  標記任務為完成。
5.  重複上述步驟。

## Agent 指引 (Instructions for Agent)
1.  當使用者要求開發複雜功能時，主動建議使用 `spec-kit` 流程。
2.  如果獲得同意，從 Phase 1 開始。在使用者核准當前產出物之前，不要進入下一階段。
3.  將所有規格文件存放在專案根目錄的 `.specs/` 資料夾中。

## 文件範本 (Templates)

### 01_requirements.md 範本
```markdown
# 需求規格: [功能名稱]

## 背景 (Context)
[為什麼我們要建構這個功能？]

## 目標 (Goals)
- [ ] 目標 1
- [ ] 目標 2

## 功能需求 (Functional Requirements)
1. 系統應該能夠...
2. 使用者可以...

## 限制 (Constraints)
- 必須使用 [技術堆疊]
```

### 02_architecture.md 範本
```markdown
# 系統架構: [功能名稱]

## 資料庫變更 (Database Changes)
```sql
-- Schema changes
```

## API 變更 (API Changes)
- `GET /api/...`

## 前端元件 (Frontend Components)
- `BigComponent.vue`
  - `SmallComponent.vue`
```
