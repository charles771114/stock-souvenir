import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from "https://esm.sh/deno-dom-native@v0.1.45/wasm.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
            {
                auth: {
                    persistSession: false
                }
            }
        )

        const { source_id } = await req.json()

        if (!source_id) {
            throw new Error('Missing source_id')
        }

        // 1. Fetch Source Configuration
        const { data: source, error: sourceError } = await supabaseClient
            .from('scraper_sources')
            .select('*')
            .eq('id', source_id)
            .single()

        if (sourceError || !source) throw new Error(`Source not found: ${sourceError?.message}`)

        console.log(`Starting scrape for source: ${source.source_name} (${source.source_url})`)

        // 2. Create Log Entry (Running)
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

        // 3. Fetch Website Content
        const response = await fetch(source.source_url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        })

        if (!response.ok) {
            throw new Error(`Failed to fetch source: ${response.statusText}`)
        }

        const html = await response.text()
        const doc = new DOMParser().parseFromString(html, "text/html")
        if (!doc) throw new Error('Failed to parse HTML')

        // 4. Parse Based on Source
        let scrapedItems = []

        if (source.source_name.includes('HiStock') || source.source_url.includes('histock.tw')) {
            const rows = doc.querySelectorAll('.stock-gift table tr')
            // Skip header row
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i]
                const cols = row.querySelectorAll('td')
                if (cols.length < 5) continue

                // HiStock Structure:
                // 0: 股號/名稱 (e.g., 2330台積電)
                // 1: 收盤價
                // 2: 最後買進日
                // 3: 股東會日期
                // 4: 紀念品名稱
                // 5: 股代

                const stockRaw = cols[0]?.textContent?.trim() || ''
                const match = stockRaw.match(/^(\d+)(.*)$/)
                const code = match ? match[1] : ''
                const name = match ? match[2].trim() : stockRaw

                const meetingDateRaw = cols[3]?.textContent?.trim() || ''
                const souvenirItem = cols[4]?.textContent?.trim() || ''

                // Construct a unique doc_id to avoid duplicates
                const docId = `HISTOCK_${code}_${meetingDateRaw.replace(/\//g, '')}`

                scrapedItems.push({
                    code,
                    name,
                    souvenir_item: souvenirItem,
                    meeting_date: meetingDateRaw,
                    doc_id: docId,
                    updated_at: new Date().toISOString()
                })
            }
        } else if (source.source_name.includes('股代網') || source.source_url.includes('gooddie.tw')) {
            const cards = doc.querySelectorAll('.section-meeting .list .card')
            console.log(`Found ${cards.length} cards on Gooddie`)

            for (const card of cards) {
                // Gooddie structure within .card-header/body
                const titleLink = card.querySelector('a[data-target^="#collapse"]')
                const text = titleLink?.textContent?.trim() || ''
                // Format: "4162 智擎 5/26 常會"
                const match = text.match(/^(\d+)\s+(.+?)\s+(\d+\/\d+)\s+(.+)$/)

                if (!match) continue

                const code = match[1]
                const name = match[2]
                const meetingDateShort = match[3] // e.g., 5/26

                // Souvenir item usually in a div with text "(開會55日前再行公告)" or real item name
                const souvenirDiv = card.querySelector('.text-truncate[title]')
                const souvenirItem = souvenirDiv?.textContent?.trim() || ''

                // Thumbnail
                const img = card.querySelector('.gift-picture img')
                const thumbUrl = img?.getAttribute('src') || ''

                const docId = `GOODDIE_${code}_2026${meetingDateShort.replace(/\//g, '')}`

                scrapedItems.push({
                    code,
                    name,
                    souvenir_item: souvenirItem,
                    meeting_date: `115/${meetingDateShort}`, // Assuming 2026/115 for now as per sample
                    thumbnail_url: thumbUrl ? (thumbUrl.startsWith('http') ? thumbUrl : `https://www.gooddie.tw${thumbUrl}`) : null,
                    doc_id: docId,
                    updated_at: new Date().toISOString()
                })
            }
        } else {
            throw new Error(`Scraping logic not implemented for ${source.source_name}`)
        }

        console.log(`Scraped ${scrapedItems.length} items. Upserting to souvenirs table...`)

        // 5. Upsert Data in Batches
        if (scrapedItems.length > 0) {
            // Upsert souvenirs
            const { error: giftError } = await supabaseClient
                .from('souvenirs')
                .upsert(scrapedItems, { onConflict: 'doc_id' })

            if (giftError) throw giftError
        }

        // 6. Update Log Entry (Success)
        const { error: updateError } = await supabaseClient
            .from('scraper_logs')
            .update({
                status: 'success',
                items_scraped: scrapedItems.length,
                completed_at: new Date().toISOString()
            })
            .eq('id', logEntry.id)

        if (updateError) throw updateError

        return new Response(JSON.stringify({
            message: `Scraping completed. Scraped ${scrapedItems.length} items.`,
            log_id: logEntry.id,
            items_scraped: scrapedItems.length
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
