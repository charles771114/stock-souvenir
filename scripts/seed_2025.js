import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    // Try local file if not in process env (e.g. running manually)
    try {
        const envFile = fs.readFileSync('.env', 'utf8')
        envFile.split('\n').forEach(line => {
            const [key, val] = line.split('=')
            if (key && val) process.env[key.trim()] = val.trim()
        })
    } catch (e) {
        console.error('Error loading .env file')
    }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env. Seeding requires admin privileges.')
    // Fallback to ANON key just in case, but likely will fail RLS
    if (!process.env.VITE_SUPABASE_ANON_KEY) process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey || process.env.VITE_SUPABASE_ANON_KEY)

const dataPath = path.resolve(process.cwd(), 'scripts/mock_2025_data.json')
const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

async function seed() {
    console.log(`Preparing to seed ${rawData.length} items for 2025...`)

    const formatDate = (d, year = '2025') => {
        if (!d) return null
        if (d.match(/^\d{2}\/\d{2}$/)) {
            return `${year}-${d.replace(/\//g, '-')}`
        }
        return d
    }

    const calculateDates = (meetingDateShort, lastBuyDateShort) => {
        // meetingDateShort and lastBuyDateShort are 'MM/DD'

        let meetingYear = '2025' // Default based on scrape context
        // Try to verify if meetingdate implies next year? No, context is 2025.

        const meetingDate = formatDate(meetingDateShort, meetingYear)

        let lastBuyYear = '2025'
        if (meetingDateShort && lastBuyDateShort) {
            const [mMonth] = meetingDateShort.split('/').map(Number)
            const [bMonth] = lastBuyDateShort.split('/').map(Number)

            // Logic: If Meeting in Jan/Feb/Mar (1,2,3) AND Last Buy in Nov/Dec (11,12)
            // Then Last Buy is Previous Year (2024)
            if (mMonth <= 3 && bMonth >= 11) {
                lastBuyYear = '2024'
            }
        }

        const lastBuyDate = formatDate(lastBuyDateShort, lastBuyYear)

        return { meetingDate, lastBuyDate }
    }

    const formattedData = rawData.map(item => {
        const { meetingDate, lastBuyDate } = calculateDates(item.meeting_date, item.last_buy_date)

        return {
            code: item.code || item.id, // Handle both 'code' and 'id' keys
            name: item.name,
            souvenir_item: item.souvenir_item || item.souvenir, // Handle 'souvenir_item' and 'souvenir'
            meeting_date: meetingDate,
            last_buy_date: lastBuyDate,
            // Let DB handle timestamps
            // created_at, updated_at removed
            doc_id: `mock_2025_${item.code || item.id}_${meetingDate || 'unknown'}`
        }
    })

    // Remove duplicates manually if any still exist with same code+date
    const uniqueFormattedData = formattedData.filter((v, i, a) => a.findIndex(t => (t.doc_id === v.doc_id)) === i)

    const { data, error } = await supabase
        .from('souvenirs')
        .upsert(uniqueFormattedData, { onConflict: 'doc_id' })
        .select()

    if (error) {
        console.error('Error seeding data:', error)
    } else {
        console.log(`Successfully seeded ${data.length} items!`)
    }
}

seed()
