import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

if (!process.env.VITE_SUPABASE_URL) {
    try {
        const envFile = fs.readFileSync('.env', 'utf8')
        envFile.split('\n').forEach(line => {
            const [key, val] = line.split('=')
            if (key && val) process.env[key.trim()] = val.trim()
        })
    } catch (e) { }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkYears() {
    console.log('Checking for years in souvenirs table...')
    const { data: souvenirs, error } = await supabase
        .from('souvenirs')
        .select('meeting_date')
        .order('meeting_date', { ascending: false })
        .limit(50)

    if (error) console.error('Error souvenirs:', error.message)
    else {
        const years = [...new Set(souvenirs.map(s => s.meeting_date ? s.meeting_date.substring(0, 4) : 'null'))]
        console.log('Years found in souvenirs:', years)
    }

    // Check for other tables existence by trying to select from them
    console.log('Checking stock_souvenirs_2026...')
    const { error: err2026 } = await supabase.from('stock_souvenirs_2026').select('*').limit(1)
    if (err2026) console.log('stock_souvenirs_2026 error (likely not exist):', err2026.message)
    else console.log('stock_souvenirs_2026 exists.')

    console.log('Checking stock_souvenirs_2025...')
    const { error: err2025 } = await supabase.from('stock_souvenirs_2025').select('*').limit(1)
    if (err2025) console.log('stock_souvenirs_2025 error (likely not exist):', err2025.message)
    else console.log('stock_souvenirs_2025 exists.')
}

checkYears()
