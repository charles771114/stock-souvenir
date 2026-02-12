
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
        // Ignore comments and empty lines
        if (!line || line.startsWith('#')) return

        // Split by first = only
        const parts = line.split('=')
        if (parts.length >= 2) {
            const key = parts[0].trim()
            let value = parts.slice(1).join('=').trim()

            // Remove quotes if present
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
    console.error('Error: Missing credentials (URL or KEY)')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function main() {
    console.log('Querying 6531...')
    const { data, error } = await supabase
        .from('souvenirs')
        .select('code, name, last_buy_date')
        .eq('code', '6531')

    if (error) console.error(error)
    else console.log('Result:', data)

    console.log('Updating 6531 to TOMORROW (2026-02-11)...')
    // Hardcode for reliability or use proper local construction
    // Current Local is Feb 10, Tomorrow is Feb 11

    // Manual construction to be safe
    const now = new Date()
    // Add 1 day
    now.setDate(now.getDate() + 1)

    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const tomorrowStr = `${year}-${month}-${day}`

    const { error: updateError } = await supabase
        .from('souvenirs')
        .update({ last_buy_date: tomorrowStr })
        .eq('code', '6531')

    if (updateError) console.error('Update failed:', updateError)
    else console.log(`Updated 6531 last_buy_date to ${tomorrowStr}`)
}

main()
