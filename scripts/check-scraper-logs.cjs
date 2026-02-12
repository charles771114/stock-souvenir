
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);

async function checkLogs() {
    const { data, error } = await supabase
        .from('scraper_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error('Error fetching logs:', error);
    } else {
        console.log('Last 5 Scraper Logs:');
        console.log(JSON.stringify(data, null, 2));
    }
}

checkLogs();
