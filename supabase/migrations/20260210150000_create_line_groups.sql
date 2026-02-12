-- Create line_groups table
create table if not exists public.line_groups (
    group_id text primary key,
    group_name text,
    display_name text,
    picture_url text,
    is_active boolean default true,
    last_active_at timestamp with time zone default now(),
    created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.line_groups enable row level security;

-- Policies
-- Admins can view all groups
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'line_groups' AND policyname = 'Admins can view all line groups'
    ) THEN
        create policy "Admins can view all line groups"
            on public.line_groups for select
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

-- Admins can update groups (e.g., display_name)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'line_groups' AND policyname = 'Admins can update line groups'
    ) THEN
        create policy "Admins can update line groups"
            on public.line_groups for update
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

-- Service Role (Edge Functions) can do anything
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'line_groups' AND policyname = 'Service role can manage line groups'
    ) THEN
        create policy "Service role can manage line groups"
            on public.line_groups for all
            to service_role
            using (true)
            with check (true);
    END IF;
END $$;
