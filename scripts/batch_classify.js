
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function batchClassify() {
  console.log('--- Starting Batch Classification ---');

  // 1. Fetch Categories
  const { data: categories, error: catError } = await supabase.from('souvenir_categories').select('*');
  if (catError) {
    console.error('Error fetching categories:', catError);
    return;
  }

  // 2. Fetch Unclassified Souvenirs
  const { data: souvenirs, error: souError } = await supabase
    .from('souvenirs')
    .select('id, souvenir_item')
    .eq('classification_status', 'unclassified');

  if (souError) {
    console.error('Error fetching souvenirs:', souError);
    return;
  }

  console.log(`Analyzing ${souvenirs.length} unclassified items...`);

  let matchedCount = 0;
  const updates = [];

  for (const souvenir of souvenirs) {
    const itemName = souvenir.souvenir_item || '';
    let matchedCategoryId = null;

    // Smart Matching (First match wins)
    for (const cat of categories) {
      if (!cat.keywords) continue;
      for (const keyword of cat.keywords) {
        if (itemName.includes(keyword)) {
          matchedCategoryId = cat.id;
          break;
        }
      }
      if (matchedCategoryId) break;
    }

    if (matchedCategoryId) {
      updates.push({
        id: souvenir.id,
        category_id: matchedCategoryId,
        classification_status: 'verified' // Auto-verified for batch matches
      });
      matchedCount++;
    }
  }

  console.log(`Match Result: ${matchedCount} / ${souvenirs.length} items matched.`);

  if (updates.length > 0) {
    console.log(`Applying ${updates.length} updates...`);
    
    // Batch update in chunks of 50 to avoid payload limits
    const chunkSize = 50;
    for (let i = 0; i < updates.length; i += chunkSize) {
      const chunk = updates.slice(i, i + chunkSize);
      const { error: upError } = await supabase.from('souvenirs').upsert(chunk);
      if (upError) {
        console.error(`Error applying updates at chunk ${i}:`, upError);
      } else {
        process.stdout.write('.');
      }
    }
    console.log('\nUpdates applied successfully.');
  } else {
    console.log('No matches found to update.');
  }

  console.log('--- Batch Classification Finished ---');
}

batchClassify();
