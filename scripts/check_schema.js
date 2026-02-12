
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
        if (!line || line.startsWith('#')) return
        const parts = line.split('=')
        if (parts.length >= 2) {
            const key = parts[0].trim()
            let value = parts.slice(1).join('=').trim()
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1)
            }
            process.env[key] = value
        }
    })
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log('Checking column type for last_buy_date...')
    // Cannot query information_schema directly with anon key usually due to permissions, 
    // but let's try RPC or infer from select

    // Try to insert a timestamp string and see if it works or fails, OR
    // just try to select invoking a type cast error? No.

    // Let's just fetch one row and inspect the JSON type returned by Supabase
    const { data, error } = await supabase
        .from('souvenirs')
        .select('last_buy_date')
        .limit(1)

    if (data && data.length > 0) {
        console.log('Value:', data[0].last_buy_date)
        console.log('Type of value:', typeof data[0].last_buy_date)
    }
}

main()
