
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('--- Final System Verification ---');

    // 1. Check for 1409
    const { data: s1409, error: e1409 } = await supabase
        .from('souvenirs')
        .select('*')
        .eq('code', '1409');

    if (e1409) console.error('Error fetching 1409:', e1409);
    else {
        console.log(`1409 Records Found: ${s1409.length}`);
        s1409.forEach(s => {
            console.log(`  - name: ${s.name}, meeting_date: ${s.meeting_date}, souvenir: ${s.souvenir_item}, doc_id: ${s.doc_id}`);
        });
    }

    // 2. Check for Duplicates
    const { data: all, error: eAll } = await supabase.from('souvenirs').select('code, meeting_date, souvenir_item');
    if (!eAll) {
        const groups = {};
        all.forEach(r => {
            const key = `${r.code}_${r.meeting_date}_${r.souvenir_item}`;
            groups[key] = (groups[key] || 0) + 1;
        });
        const dups = Object.entries(groups).filter(([k, v]) => v > 1);
        console.log(`Duplicate sets: ${dups.length}`);
    }

    // 3. Overall Count
    const { count } = await supabase.from('souvenirs').select('*', { count: 'exact', head: true });
    console.log(`Total souvenirs in DB: ${count}`);
}

verify();
