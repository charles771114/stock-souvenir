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

async function inspect2026() {
    console.log('Fetching items with meeting_date in 2026...')
    const { data, error } = await supabase
        .from('souvenirs')
        .select('*')
        .gte('meeting_date', '2026-01-01')
        .lte('meeting_date', '2026-12-31')
        .limit(10)

    if (error) {
        console.error(error)
        return
    }

    console.log(`Found ${data.length} items.`)
    data.forEach(item => {
        console.log(`ID: ${item.id} | Code: ${item.code} | Name: ${item.name} | Meeting: ${item.meeting_date}`)
    })
}

inspect2026()
