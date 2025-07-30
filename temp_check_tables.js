const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load environment variables manually
let supabaseUrl, supabaseKey;
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1];
    }
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
      supabaseKey = line.split('=')[1];
    }
  });
} catch (error) {
  console.error('Error reading .env.local:', error.message);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('🔍 Checking correct table structure...\n');
    
    // Check t_310_01_01_users_universal
    console.log('1. Checking t_310_01_01_users_universal (Universal Users)...');
    const { data: universalUsers, error: universalError } = await supabase
      .from('t_310_01_01_users_universal')
      .select('*')
      .limit(1);
    
    if (universalError) {
      console.error('❌ Error:', universalError.message);
    } else {
      console.log('✅ t_310_01_01_users_universal exists');
      if (universalUsers && universalUsers.length > 0) {
        console.log('📋 Sample columns:', Object.keys(universalUsers[0]).slice(0, 10).join(', '));
      }
    }
    
    // Check t_310_01_02_user_profiles
    console.log('\n2. Checking t_310_01_02_user_profiles (User Profiles)...');
    const { data: userProfiles, error: profilesError } = await supabase
      .from('t_310_01_02_user_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ Error:', profilesError.message);
    } else {
      console.log('✅ t_310_01_02_user_profiles exists');
      if (userProfiles && userProfiles.length > 0) {
        console.log('📋 Sample columns:', Object.keys(userProfiles[0]).slice(0, 10).join(', '));
      }
    }
    
    // Check t_315_01_01_educator_details
    console.log('\n3. Checking t_315_01_01_educator_details (Educator Details)...');
    const { data: educatorDetails, error: educatorError } = await supabase
      .from('t_315_01_01_educator_details')
      .select('*')
      .limit(1);
    
    if (educatorError) {
      console.error('❌ Error:', educatorError.message);
    } else {
      console.log('✅ t_315_01_01_educator_details exists');
      if (educatorDetails && educatorDetails.length > 0) {
        console.log('📋 Sample columns:', Object.keys(educatorDetails[0]).slice(0, 10).join(', '));
      }
    }
    
    // Check old tutors table
    console.log('\n4. Checking old tutors table...');
    const { data: tutors, error: tutorsError } = await supabase
      .from('tutors')
      .select('*')
      .limit(1);
    
    if (tutorsError) {
      console.error('❌ Error:', tutorsError.message);
    } else {
      console.log('✅ tutors table exists (old structure)');
      if (tutors && tutors.length > 0) {
        console.log('📋 Sample columns:', Object.keys(tutors[0]).slice(0, 10).join(', '));
      }
    }
    
    console.log('\n🎯 CONCLUSION:');
    console.log('- Form currently uses: "tutors" table (old structure)');
    console.log('- Should use: t_310_01_01_users_universal + t_310_01_02_user_profiles + t_315_01_01_educator_details');
    console.log('- Need to update form to use proper relational structure');
    
  } catch (error) {
    console.error('❌ General error:', error.message);
  }
}

checkTables(); 