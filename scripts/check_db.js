import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function check() {
  const { data, count, error } = await supabase
    .from('souvenirs')
    .select('*', { count: 'exact' })
    .gte('meeting_date', '2026-01-01')
    .lte('meeting_date', '2026-12-31')

  if (error) {
    console.error('Error:', error)
  } else {
    console.log(`Found ${count} souvenirs for 2026`)
    console.log('Sample:', data.slice(0, 2))
  }
}

check()
