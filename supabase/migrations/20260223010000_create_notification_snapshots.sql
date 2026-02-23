-- Migration: Create notification broadcast snapshots for deduplication
-- Date: 2026-02-23

CREATE TABLE IF NOT EXISTS public.notification_broadcast_snapshots (
  id SERIAL PRIMARY KEY,
  message_content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for checking the latest snapshot
CREATE INDEX IF NOT EXISTS idx_notification_snapshots_created_at ON public.notification_broadcast_snapshots(created_at DESC);

COMMENT ON TABLE public.notification_broadcast_snapshots IS 'Stores snapshots of sent LINE notification content to prevent redundant messages.';
