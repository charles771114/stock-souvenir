
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.VITE_SUPABASE_URL
// Use Service Role Key for admin access to bypass RLS if needed, though user key might work if policy allows
// But for schema inspection (indirectly via select *), service role is safer to see everything
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
    console.log('Checking scraper_logs columns...')

    // Try to insert a row with created_at to see if it errors
    const testId = crypto.randomUUID()
    const payload = {
        id: testId,
        scraper_name: 'schema_check',
        status: 'checking',
        created_at: new Date().toISOString()
    }

    const { error } = await supabase.from('scraper_logs').insert(payload)

    if (error) {
        console.error('Insert Error:', error)
        if (error.message.includes('does not exist')) {
            console.log('CONFIRMED: created_at column is missing.')
        }
    } else {
        console.log('Insert Success! created_at column exists.')
        // Cleanup
        await supabase.from('scraper_logs').delete().eq('id', testId)
    }
}

checkSchema()
