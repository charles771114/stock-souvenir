import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser(email, password = 'test123456') {
  console.log(`\n🔧 Creating test user: ${email}\n`);

  try {
    // Create user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists');
        
        // Try to get existing user
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error('❌ Error listing users:', listError.message);
          return false;
        }
        
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
          console.log('✅ Found existing user:', existingUser.id);
          
          // Check if profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', existingUser.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('❌ Error checking profile:', profileError.message);
          } else if (!profile) {
            console.log('⚠️  Profile not found, creating...');
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({ id: existingUser.id, email: existingUser.email });
            
            if (insertError) {
              console.error('❌ Error creating profile:', insertError.message);
            } else {
              console.log('✅ Profile created');
            }
          } else {
            console.log('✅ Profile exists');
          }
          
          return true;
        }
      } else {
        console.error('❌ Error creating user:', authError.message);
        return false;
      }
    }

    console.log('✅ User created successfully!');
    console.log('   User ID:', authData.user.id);
    console.log('   Email:', authData.user.email);

    // Profile should be created automatically by trigger
    // Wait a bit and verify
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.log('⚠️  Profile not found (trigger might not have fired)');
      console.log('   Creating profile manually...');
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: authData.user.id, email: authData.user.email });
      
      if (insertError) {
        console.error('❌ Error creating profile:', insertError.message);
      } else {
        console.log('✅ Profile created manually');
      }
    } else {
      console.log('✅ Profile created automatically by trigger');
    }

    console.log('\n📝 Login credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n💡 You can now login with these credentials in the app\n');

    return true;

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Get email from command line or use default
const testEmail = process.argv[2] || 'test@example.com';
const testPassword = process.argv[3] || 'test123456';

createTestUser(testEmail, testPassword)
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
