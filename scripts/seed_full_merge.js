import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'

// Simulate __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
    // Try local file if not in process env
    try {
        const envFile = fs.readFileSync('.env', 'utf8')
        envFile.split('\n').forEach(line => {
            const [key, val] = line.split('=')
            if (key && val) process.env[key.trim()] = val.trim()
        })
    } catch (e) {
        console.error('Error loading .env file:', e.message)
    }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
// Prefer SUPABASE_SERVICE_ROLE_KEY from env
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
    console.error('Missing VITE_SUPABASE_URL')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const tempFiles = [
    'scripts/temp_0_200.json',
    'scripts/temp_200_340.json',
    'scripts/temp_340_440.json',
    'scripts/temp_440_550.json',
    'scripts/temp_550_650.json',
    'scripts/temp_650_end.json'
]

async function seed() {
    let allData = []

    // Read and merge all files
    for (const file of tempFiles) {
        const filePath = path.resolve(process.cwd(), file)
        try {
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8')
                const jsonData = JSON.parse(content)
                console.log(`Loaded ${jsonData.length} items from ${file}`)
                allData = allData.concat(jsonData)
            } else {
                console.warn(`File not found: ${file}`)
            }
        } catch (e) {
            console.error(`Error reading ${file}:`, e.message)
        }
    }

    console.log(`Total items to process: ${allData.length}`)

    const formatDate = (d, year = '2025') => {
        if (!d) return null
        // Handle MM/DD format
        if (typeof d === 'string' && d.match(/^\d{2}\/\d{2}$/)) {
            return `${year}-${d.replace(/\//g, '-')}`
        }
        return d
    }

    const calculateDates = (meetingDateShort, lastBuyDateShort) => {
        let meetingYear = '2025' // Default based on scrape context

        // Basic reformat to see if we have valid date strings
        // Just use raw strings for month extraction
        let lastBuyYear = '2025'

        if (meetingDateShort && lastBuyDateShort &&
            typeof meetingDateShort === 'string' &&
            typeof lastBuyDateShort === 'string' &&
            meetingDateShort.includes('/') && lastBuyDateShort.includes('/')) {

            const [mMonth] = meetingDateShort.split('/').map(Number)
            const [bMonth] = lastBuyDateShort.split('/').map(Number)

            // Logic: If Meeting in Jan/Mar (1-3) AND Last Buy in Nov/Dec (11-12)
            // Then Last Buy is Previous Year (2024)
            if (mMonth <= 3 && bMonth >= 11) {
                lastBuyYear = '2024'
            }
        }

        const meetingDate = formatDate(meetingDateShort, meetingYear)
        const lastBuyDate = formatDate(lastBuyDateShort, lastBuyYear)

        return { meetingDate, lastBuyDate }
    }

    const formattedData = allData.map(item => {
        // Normalize keys
        // Input variations:
        // souvenir, souvenir_item
        // last_buy_date, last_buying_date

        // Prefer explicit keys, fallback to alternatives
        const rawMeetingDate = item.meeting_date
        const rawLastBuyDate = item.last_buy_date || item.last_buying_date

        const { meetingDate, lastBuyDate } = calculateDates(rawMeetingDate, rawLastBuyDate)

        // Clean Code (remove non-digits if any, though scraper tried to be clean)
        const code = (item.code || item.id || '').toString().replace(/\D/g, '')

        return {
            code: code,
            name: item.name,
            souvenir_item: item.souvenir_item || item.souvenir,
            meeting_date: meetingDate,
            last_buy_date: lastBuyDate,
            // Unique ID for upsert logic
            // Using 2025 prefix
            doc_id: `2025_${code}_${meetingDate || 'unknown'}`
        }
    }).filter(item => item.code) // Filter out items without code

    // Deduplicate based on doc_id
    // If a stock has multiple meetings with different dates, they will have different doc_ids -> Preserved.
    // If exact duplicates (same code, same date), we keep one.
    const uniqueFormattedData = formattedData.filter((v, i, a) => a.findIndex(t => (t.doc_id === v.doc_id)) === i)

    console.log(`Unique items to seed: ${uniqueFormattedData.length}`)

    if (uniqueFormattedData.length === 0) {
        console.log('No data to seed.')
        return
    }

    // Insert into 'souvenirs' table
    const chunk_size = 100;
    for (let i = 0; i < uniqueFormattedData.length; i += chunk_size) {
        const chunk = uniqueFormattedData.slice(i, i + chunk_size);
        const { data, error } = await supabase
            .from('souvenirs')
            .upsert(chunk, { onConflict: 'doc_id' })
            .select()

        if (error) {
            console.error(`Error seeding chunk ${i}:`, error)
        } else {
            console.log(`Seeded chunk ${i / chunk_size + 1}/${Math.ceil(uniqueFormattedData.length / chunk_size)}`)
        }
    }

    console.log('Seeding complete.')
}

seed()
