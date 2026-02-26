-- Create rate limiting table for LINE bot
create table if not exists public.line_rate_limits (
    id text primary key, -- groupId, roomId, or userId
    last_replied_at timestamp with time zone default now(),
    created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.line_rate_limits enable row level security;

-- Policy: Service role (Edge Functions) can manage all
create policy "Service role can manage rate limits"
    on public.line_rate_limits for all
    to service_role
    using (true)
    with check (true);
