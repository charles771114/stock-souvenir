# 需求規格: LINE 通知機器人 (Messaging API)

## 背景 (Context)
使用者優先選擇實作「通知機器人」。
目標是建立一個 LINE 官方帳號 (OA)，使用者加入好友後，系統可以主動發送通知給使用者。

## 核心功能 (Core Features)

### Phase 1: 基礎訊息推播
1.  **Webhook 接收**: 建立 Supabase Edge Function (`line-bot`) 接收 LINE 平台傳來的 Webhook 事件。
2.  **訊息回覆 (Reply)**: 當使用者傳送訊息時，簡單回覆 (Echo) 以確認連結成功。
3.  **主動推播 (Push)**: 透過 API 發送訊息給特定 User ID (需取得 User ID)。

### Phase 2: 帳號綁定 (Account Linking)
為了發送「個人化通知」（如：您的台積電紀念品已可領取），我們需要知道 LINE User ID 對應到哪個 Supabase User。

- **情境**: 使用者在 LINE 中輸入 `/bind <email>` 或點擊連結綁定帳號。
- *註: 這部分需要與 User 確認綁定流程。*

## 技術架構 (Data Flow)
`Line Platform` -> `Webhook (Supabase Function)` -> `Process Logic` -> `Reply API`

## 待辦事項 (Checklist)
- [ ] 申請 LINE Official Account & Developers Console
- [ ] 取得 **Channel Access Token** 與 **Channel Secret**
- [ ] 設定 Supabase Edge Function 環境變數
- [ ] 實作 Webhook 驗證與處理邏輯
