-- Create pdf_scraper_logs table
create table if not exists public.pdf_scraper_logs (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade default auth.uid(),
    filename text not null,
    items_count int default 0,
    status text check (status in ('success', 'partial', 'failed')),
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.pdf_scraper_logs enable row level security;

-- Policies
create policy "Users can view their own extraction logs"
    on public.pdf_scraper_logs for select
    using (auth.uid() = user_id);

create policy "Users can insert their own extraction logs"
    on public.pdf_scraper_logs for insert
    with check (auth.uid() = user_id);

create policy "Admins can view all extraction logs"
    on public.pdf_scraper_logs for select
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid() and profiles.role = 'admin'
        )
    );
