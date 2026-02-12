
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function readLog() {
    console.log('--- Latest Scraper Log Message ---');
    const { data, error } = await supabase
        .from('scraper_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Status: ${data.status}`);
    console.log(`Message:\n${data.message}`);
}

readLog();
