import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('缺少 Supabase 環境變數 (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)')
}

// Custom lock definition removed as it was causing issues

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'stock-souvenir-auth-token-v2',
    storage: window.localStorage,
    debug: false,
  },
})
