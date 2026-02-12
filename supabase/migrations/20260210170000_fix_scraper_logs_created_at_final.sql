-- Force add created_at column to scraper_logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'scraper_logs'
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.scraper_logs ADD COLUMN created_at timestamp with time zone default now();
    END IF;
END $$;
