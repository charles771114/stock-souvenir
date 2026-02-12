-- 建立 notification_history 表
-- 用於記錄已發送的通知，避免重複提醒

CREATE TABLE IF NOT EXISTS notification_history (
  id SERIAL PRIMARY KEY,
  souvenir_code TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'gift_card_reminder', 'last_buy_date_reminder'
  sent_at TIMESTAMP DEFAULT NOW(),
  year INTEGER NOT NULL,
  metadata JSONB, -- 額外資訊（例如：去年紀念品內容）
  UNIQUE(souvenir_code, notification_type, year)
);

-- 建立索引以加速查詢
CREATE INDEX IF NOT EXISTS idx_notification_history_code_type_year 
ON notification_history(souvenir_code, notification_type, year);

-- 建立索引以加速時間查詢
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at 
ON notification_history(sent_at DESC);

COMMENT ON TABLE notification_history IS '通知歷史記錄表，用於追蹤已發送的通知並避免重複';
COMMENT ON COLUMN notification_history.souvenir_code IS '股票代號';
COMMENT ON COLUMN notification_history.notification_type IS '通知類型：gift_card_reminder（商品卡提醒）、last_buy_date_reminder（最後買進日提醒）';
COMMENT ON COLUMN notification_history.year IS '年度';
COMMENT ON COLUMN notification_history.metadata IS '額外資訊（JSON格式）';
