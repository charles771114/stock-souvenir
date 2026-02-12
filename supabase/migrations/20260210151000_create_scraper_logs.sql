-- Create scraper_logs table
create table if not exists public.scraper_logs (
    id uuid primary key default gen_random_uuid(),
    scraper_name text not null,
    status text not null, -- 'success', 'error', 'running'
    items_processed int default 0,
    items_added int default 0,
    items_updated int default 0,
    message text,
    created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.scraper_logs enable row level security;

-- Policies
-- Admins can view all logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'scraper_logs' AND policyname = 'Admins can view scraper logs'
    ) THEN
        create policy "Admins can view scraper logs"
            on public.scraper_logs for select
            to authenticated
            using (
                exists (
                    select 1 from public.profiles
                    where profiles.id = auth.uid()
                    and profiles.role = 'admin'
                )
            );
    END IF;
END $$;

-- Service Role (Edge Functions) can insert logs
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'scraper_logs' AND policyname = 'Service role can insert scraper logs'
    ) THEN
        create policy "Service role can insert scraper logs"
            on public.scraper_logs for insert
            to service_role
            with check (true);
    END IF;
END $$;
