
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
    const { data, error } = await supabase
        .from('scraper_logs')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error selecting:', error);
    } else {
        console.log('Columns in scraper_logs:', Object.keys(data[0] || {}));
    }
}

verify();
