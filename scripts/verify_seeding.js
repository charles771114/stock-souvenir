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

async function verify() {
    const codes = ['2317', '2727', '2890', '2880']

    console.log('Verifying stock codes:', codes)

    // We can't use 'in' filter easily with mixed types if code column var type varies, but let's assume text/int
    // Actually standard is 'code' column.

    const { data, error } = await supabase
        .from('souvenirs')
        .select('*')
        .in('code', codes)
        .like('doc_id', '2025_%') // Only check 2025 data

    if (error) {
        console.error('Error:', error)
        return
    }

    console.log(`Found ${data.length} records.`)
    data.forEach(row => {
        console.log(`[${row.code}] ${row.name}: ${row.souvenir_item} (Buy: ${row.last_buy_date}, Meet: ${row.meeting_date})`)
    })
}

verify()
