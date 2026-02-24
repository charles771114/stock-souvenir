-- Create line_bots table
CREATE TABLE IF NOT EXISTS public.line_bots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bot_name TEXT NOT NULL,
    channel_id TEXT,
    channel_secret TEXT NOT NULL,
    channel_access_token TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add bot_id to line_groups
ALTER TABLE public.line_groups ADD COLUMN IF NOT EXISTS bot_id UUID REFERENCES public.line_bots(id);

-- Enable RLS for line_bots (though it's mostly used by edge functions)
ALTER TABLE public.line_bots ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins to manage bots
CREATE POLICY "Admins can manage line_bots" ON public.line_bots
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comment
COMMENT ON TABLE public.line_bots IS 'Stores multiple LINE bot credentials for multi-bot support';
