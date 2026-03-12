
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyze() {
  console.log('Fetching categories...');
  const { data: categories, error: catError } = await supabase
    .from('souvenir_categories')
    .select('*');

  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }

  console.log(`Found ${categories.length} categories.`);
  console.log(JSON.stringify(categories, null, 2));

  console.log('\nFetching unclassified souvenirs (limit 50)...');
  const { data: souvenirs, error: souError } = await supabase
    .from('souvenirs')
    .select('souvenir_item')
    .eq('classification_status', 'unclassified')
    .limit(50);

  if (souError) {
    console.error('Error fetching souvenirs:', souError);
    return;
  }

  console.log(`Found ${souvenirs.length} unclassified souvenirs.`);
  const uniqueItems = [...new Set(souvenirs.map(s => s.souvenir_item))];
  console.log('Sample items:', uniqueItems);
}

analyze();
