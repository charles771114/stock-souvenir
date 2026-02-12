
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/std@0.168.0/dotenv/load.ts";

const supabaseUrl = Deno.env.get('VITE_SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    Deno.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    // Try to insert a dummy log to see if it accepts created_at, or just select
    // We can also query pg_catalog if we had direct access, but via JS client:

    console.log('Checking scraper_logs columns...')

    const { data, error } = await supabase
        .from('scraper_logs')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error selecting:', error)
    } else {
        console.log('Success. Row sample:', data)
        if (data.length > 0) {
            console.log('Columns:', Object.keys(data[0]))
        } else {
            console.log('Table is empty, checking insert...')
            const { error: insertError } = await supabase.from('scraper_logs').insert({
                scraper_name: 'test_schema',
                status: 'test',
                created_at: new Date().toISOString()
            })
            if (insertError) {
                console.error('Insert with created_at failed:', insertError)
            } else {
                console.log('Insert with created_at SUCCESS')
            }
        }
    }
}

checkSchema()
