-- Migration: Schedule exact notifications via pg_cron
-- Date: 2026-02-23
-- Description: Enables pg_cron and pg_net to call the line-notify Edge Function at exact times.

-- 1. Enable extensions
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Cleanup existing jobs (if any) to avoid duplicates
-- Using a safe way to unschedule only if they exist
select cron.unschedule(jobid) from cron.job where jobname in ('daily-morning-notification', 'daily-afternoon-notification');

-- 3. Schedule Morning Notification (09:00 AM UTC+8 = 01:00 UTC)
-- Note: '0 1 * * *' is UTC time
select cron.schedule(
  'daily-morning-notification',
  '0 1 * * *',
  $$
  select net.http_post(
    url:='https://hpfggdkhoffhfawsgmtt.supabase.co/functions/v1/line-notify',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZmdnZGtob2ZmaGZhd3NnbXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNzAwOTUsImV4cCI6MjA4Mzk0NjA5NX0.sVtPceocw5b3iHzd_gXCSpWFnsDDzhw8lFwy78Zf2S4"}'::jsonb
  );
  $$
);

-- 4. Schedule Afternoon Notification (13:00 PM UTC+8 = 05:00 UTC)
select cron.schedule(
  'daily-afternoon-notification',
  '0 5 * * *',
  $$
  select net.http_post(
    url:='https://hpfggdkhoffhfawsgmtt.supabase.co/functions/v1/line-notify',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwZmdnZGtob2ZmaGZhd3NnbXR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzNzAwOTUsImV4cCI6MjA4Mzk0NjA5NX0.sVtPceocw5b3iHzd_gXCSpWFnsDDzhw8lFwy78Zf2S4"}'::jsonb
  );
  $$
);
