import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config()

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

async function check() {
  const { data, error } = await supabase.rpc('get_constraints', { table_name: 'user_collections' })
  console.log(data || error)
}

// Since I don't have RPC, I will just use a raw query if possible, but I can't.
// I'll try to list the constraints by catching the error message more clearly.
check()
