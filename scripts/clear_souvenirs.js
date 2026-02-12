
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearSouvenirs() {
    console.log('Attempting to clear souvenirs table...');

    // First, let's see how many records there are
    const { count, error: countError } = await supabase
        .from('souvenirs')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error counting souvenirs:', countError);
        return;
    }

    console.log(`Found ${count} records. Deleting...`);

    // Delete all records. We use a filter that matches everything.
    // eq('status', 'active') or similar if we want to be safe, but "clear db" usually means everything.
    // Since we don't have a guaranteed field for all, we can use neq('id', -1) if id is numeric.
    // Or just a very broad filter.
    const { data, error: deleteError } = await supabase
        .from('souvenirs')
        .delete()
        .neq('id', -1); // Assuming id is always positive or at least not -1

    if (deleteError) {
        console.error('Error deleting souvenirs:', deleteError);
        console.error('Note: If this is an RLS error, ensure the Service Role Key is used.');
        return;
    }

    console.log('Successfully cleared souvenirs table.');

    // Re-verify count
    const { count: finalCount } = await supabase
        .from('souvenirs')
        .select('*', { count: 'exact', head: true });

    console.log(`Records remaining: ${finalCount}`);
}

clearSouvenirs();
