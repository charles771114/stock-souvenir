
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDuplicates() {
    console.log('Fetching all souvenirs to check for duplicates...');
    const { data, error } = await supabase
        .from('souvenirs')
        .select('id, code, name, meeting_date, last_buy_date, souvenir_item, doc_id');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Total records: ${data.length}`);

    const groups = {};
    data.forEach(r => {
        // Use a conservative key: code + meeting_date + name + souvenir_item
        const key = `${r.code}_${r.meeting_date}_${r.name}_${r.souvenir_item}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(r);
    });

    const duplicates = Object.entries(groups).filter(([k, v]) => v.length > 1);

    if (duplicates.length === 0) {
        console.log('No duplicates found based on code, meeting_date, name, and souvenir_item.');
    } else {
        console.log(`Found ${duplicates.length} sets of duplicates.`);
        duplicates.slice(0, 10).forEach(([key, items]) => {
            console.log(`\nKey: ${key}`);
            console.log(`Count: ${items.length}`);
            items.forEach(i => {
                console.log(`  - ID: ${i.id}, doc_id: ${i.doc_id}, last_buy: ${i.last_buy_date}`);
            });
        });
    }
}

checkDuplicates();
