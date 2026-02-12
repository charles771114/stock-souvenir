-- Add missing columns to scraper_logs for Gooddie scraper and future standard logs
DO $$
BEGIN
    -- Add scraper_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'scraper_logs' AND column_name = 'scraper_name') THEN
        ALTER TABLE public.scraper_logs ADD COLUMN scraper_name text;
    END IF;

    -- Add items_processed
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'scraper_logs' AND column_name = 'items_processed') THEN
        ALTER TABLE public.scraper_logs ADD COLUMN items_processed int DEFAULT 0;
    END IF;

    -- Add items_added
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'scraper_logs' AND column_name = 'items_added') THEN
        ALTER TABLE public.scraper_logs ADD COLUMN items_added int DEFAULT 0;
    END IF;

    -- Add items_updated
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'scraper_logs' AND column_name = 'items_updated') THEN
        ALTER TABLE public.scraper_logs ADD COLUMN items_updated int DEFAULT 0;
    END IF;

    -- Add message
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'scraper_logs' AND column_name = 'message') THEN
        ALTER TABLE public.scraper_logs ADD COLUMN message text;
    END IF;
END $$;
