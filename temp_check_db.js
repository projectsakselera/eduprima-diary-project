const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    console.log('🔍 Checking t_210_02_07_m_simple_categories table...');
    
    // Check simple_categories table
    const { data: simpleCategories, error: simpleCatError } = await supabase
      .from('t_210_02_07_m_simple_categories')
      .select('*')
      .order('id')
      .limit(10);
    
    if (simpleCatError) {
      console.error('❌ Error fetching simple_categories:', simpleCatError);
    } else {
      console.log('✅ Simple categories found:', simpleCategories?.length || 0);
      console.log('📋 Sample data:', JSON.stringify(simpleCategories?.slice(0, 3), null, 2));
    }
    
    console.log('\n🔍 Checking programs catalog for simple_category column...');
    
    // Check if programs catalog has simple_category column
    const { data: programs, error: programsError } = await supabase
      .from('t_210_02_02_programs_catalog')
      .select('id, program_name, simple_category')
      .limit(5);
    
    if (programsError) {
      console.error('❌ Error fetching programs:', programsError);
    } else {
      console.log('✅ Programs with simple_category:', programs?.length || 0);
      console.log('📋 Sample data:', JSON.stringify(programs, null, 2));
    }
    
  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkDatabase(); 