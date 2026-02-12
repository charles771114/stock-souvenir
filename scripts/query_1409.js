
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check1409() {
    const { data, error } = await supabase
        .from('souvenirs')
        .select('*')
        .eq('code', '1409');

    if (error) {
        console.error('Error fetching 1409:', error);
        return;
    }

    console.log('Results for 1409:', JSON.stringify(data, null, 2));
}

check1409();
