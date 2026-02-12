
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.resolve(__dirname, '../.env')

// Manual .env parsing
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8')
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=')
        if (key && value) {
            process.env[key.trim()] = value.trim()
        }
    })
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role key for RLS bypass if needed, or anon key

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function main() {
    console.log('🔍 Fetching latest LINE User Binding...')

    const { data, error } = await supabase
        .from('user_bindings')
        .select('line_user_id, updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

    if (error) {
        console.error('Error fetching binding:', error.message)
        return
    }

    if (!data) {
        console.log('No user bindings found.')
        return
    }

    const userId = data.line_user_id
    console.log(`✅ Found User ID: ${userId}`)
    console.log(`\nTo test the notification, run the following commands:\n`)

    console.log(`# 1. Set the secret (Replace with your actual project ref if needed, or set in Dashboard)`)
    console.log(`npx supabase secrets set LINE_NOTIFY_TARGET_ID=${userId}`)

    console.log(`\n# 2. Trigger the function`)
    console.log(`curl -i --location --request POST 'https://hpfggdkhoffhfawsgmtt.supabase.co/functions/v1/line-notify' \\
  --header 'Authorization: Bearer ${process.env.VITE_SUPABASE_ANON_KEY}' \\
  --header 'Content-Type: application/json'`)
}

main()
