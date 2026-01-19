
import { createClient } from '@supabase/supabase-js';

// Use local defaults
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log('Checking profiles table...');
    const { data, error } = await supabase.from('profiles').select('*').limit(1);

    if (error) {
        console.error('Error profiles:', error);
    } else {
        console.log('Success! Profiles found (or empty list):', data);
    }

    console.log('Checking souvenirs table...');
    const { data: sData, error: sError } = await supabase.from('souvenirs').select('*').limit(1);
    if (sError) {
        console.error('Error souvenirs:', sError);
    } else {
        console.log('Success! Souvenirs found:', sData);
    }
}

check();

