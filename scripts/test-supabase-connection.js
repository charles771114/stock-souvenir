import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables!');
  console.error('Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)');
  process.exit(1);
}

console.log('📍 Supabase URL:', SUPABASE_URL);
console.log('🔑 Using Key:', SUPABASE_KEY.substring(0, 20) + '...\n');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  try {
    // Test 1: Check connection
    console.log('Test 1: Checking connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('souvenirs')
      .select('count', { count: 'exact', head: true });
    
    if (healthError) {
      console.error('❌ Connection failed:', healthError.message);
      return false;
    }
    console.log('✅ Connection successful!\n');

    // Test 2: Count souvenirs
    console.log('Test 2: Counting souvenirs...');
    const { count, error: countError } = await supabase
      .from('souvenirs')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count failed:', countError.message);
    } else {
      console.log(`✅ Found ${count} souvenirs\n`);
    }

    // Test 3: Fetch sample data
    console.log('Test 3: Fetching sample souvenirs...');
    const { data: souvenirs, error: fetchError } = await supabase
      .from('souvenirs')
      .select('code, name, souvenir_item, meeting_date')
      .limit(5);
    
    if (fetchError) {
      console.error('❌ Fetch failed:', fetchError.message);
    } else {
      console.log(`✅ Fetched ${souvenirs.length} sample souvenirs:`);
      souvenirs.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.code} ${s.name} - ${s.souvenir_item}`);
      });
      console.log();
    }

    // Test 4: Check profiles table
    console.log('Test 4: Checking profiles table...');
    const { count: profileCount, error: profileError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (profileError) {
      console.error('❌ Profiles check failed:', profileError.message);
    } else {
      console.log(`✅ Found ${profileCount} profiles\n`);
    }

    // Test 5: Check user_collections table
    console.log('Test 5: Checking user_collections table...');
    const { count: collectionCount, error: collectionError } = await supabase
      .from('user_collections')
      .select('*', { count: 'exact', head: true });
    
    if (collectionError) {
      console.error('❌ Collections check failed:', collectionError.message);
    } else {
      console.log(`✅ Found ${collectionCount} collections\n`);
    }

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 Summary:');
    console.log('═══════════════════════════════════════');
    console.log(`Souvenirs: ${count || 0}`);
    console.log(`Profiles: ${profileCount || 0}`);
    console.log(`Collections: ${collectionCount || 0}`);
    console.log('═══════════════════════════════════════\n');

    if (count === 0) {
      console.log('💡 Tip: Run the sync script to populate souvenirs:');
      console.log('   node scripts/sync-sheets-to-supabase.js\n');
    }

    console.log('✅ All tests passed!');
    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
