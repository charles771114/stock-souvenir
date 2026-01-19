import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // 1. Handle CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // 2. Initialize Supabase Client
        // Service Role Key is required to bypass RLS for scraping operations (inserting logs, etc.)
        // Note: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') is available in Supabase Edge Functions environment
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    persistSession: false
                }
            }
        )

        // 3. Parse Request Body
        const { source_id } = await req.json()

        if (!source_id) {
            throw new Error('Missing source_id')
        }

        console.log(`Starting scrape for source: ${source_id}`)

        // 4. Create Log Entry (Running)
        const { data: logEntry, error: logError } = await supabaseClient
            .from('scraper_logs')
            .insert({
                source_id,
                status: 'running',
                executed_at: new Date().toISOString()
            })
            .select()
            .single()

        if (logError) throw logError

        // 5. Mock Scraping Process
        // In a real implementation, you would fetch source_url, parse HTML, etc.
        // Here we will just simulate a delay and insert some mock data
        await new Promise(resolve => setTimeout(resolve, 2000))

        // Mock: Insert a test gift
        const mockGift = {
            company_code: 'TEST' + Math.floor(Math.random() * 1000),
            company_name: '測試公司',
            gift_name: '測試紀念品 ' + new Date().toISOString(),
            gift_year: 114,
            gift_category: '日用品',
            scraped_at: new Date().toISOString()
        }

        const { error: giftError } = await supabaseClient
            .from('gift_catalog')
            .upsert(mockGift, { onConflict: 'company_code, gift_year, gift_name' })

        if (giftError) throw giftError

        // 6. Update Log Entry (Success)
        const { error: updateError } = await supabaseClient
            .from('scraper_logs')
            .update({
                status: 'success',
                items_scraped: 1,
                completed_at: new Date().toISOString()
            })
            .eq('id', logEntry.id)

        if (updateError) throw updateError

        return new Response(JSON.stringify({
            message: 'Scraping completed successfully',
            log_id: logEntry.id
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('Scrape failed:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
