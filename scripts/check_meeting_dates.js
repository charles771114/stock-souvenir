
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { count } = await supabase.from('souvenirs').select('*', { count: 'exact', head: true }).not('meeting_date', 'is', null);
    console.log('Records with non-null meeting_date:', count);
}

check();
