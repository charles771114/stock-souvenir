-- Allow public access to view scraper sources and logs
-- This is useful for development or if we want to show status publicly

create policy "Public can view scraper sources"
  on public.scraper_sources for select
  using (true);

create policy "Public can view scraper logs"
  on public.scraper_logs for select
  using (true);
