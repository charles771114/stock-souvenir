
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('--- Souvenir Data Quality Inspection ---');
    const { data, error } = await supabase.from('souvenirs').select('*').limit(20);
    if (error) {
        console.error(error);
        return;
    }

    console.log(`Inspecting ${data.length} records...`);
    data.forEach(r => {
        console.log(`Code: ${r.code}, Name: ${r.name}`);
        console.log(`  Meeting: ${r.meeting_date}, Last Buy: ${r.last_buy_date}`);
        console.log(`  Souvenir: [${r.souvenir_item}]`);
        console.log(`  DocID: ${r.doc_id}`);
        console.log('---');
    });
}

inspect();
