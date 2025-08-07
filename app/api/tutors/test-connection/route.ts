import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 TEST CONNECTION API CALLED');
    console.log('🌐 Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('🔑 Supabase Key:', supabaseKey ? '✅ Set (length: ' + supabaseKey?.length + ')' : '❌ Missing');

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing Supabase environment variables',
        details: {
          supabaseUrl: !!supabaseUrl,
          supabaseKey: !!supabaseKey
        }
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Test 1: Basic connection
    console.log('🔍 Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('users_universal')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Connection test failed:', connectionError);
      return NextResponse.json({
        success: false,
        error: 'Supabase connection failed',
        details: connectionError
      }, { status: 500 });
    }

    console.log('✅ Basic connection successful');

    // Test 2: Count users
    const { count: userCount, error: countError } = await supabase
      .from('users_universal')
      .select('*', { count: 'exact', head: true });

    console.log('👥 User count:', userCount);

    // Test 3: Get first user (if any)
    const { data: firstUser, error: userError } = await supabase
      .from('users_universal')
      .select('id, email, user_code')
      .limit(1)
      .single();

    console.log('👤 First user sample:', firstUser);

    // Test 4: Test RPC function
    let rpcTest = null;
    let rpcError = null;
    
    if (firstUser?.id) {
      console.log('🔧 Testing RPC function with user:', firstUser.id);
      const { data: rpcData, error: rpcErr } = await supabase
        .rpc('preview_user_deletion', { p_user_id: firstUser.id });
      
      rpcTest = rpcData;
      rpcError = rpcErr;
      console.log('🔧 RPC test result:', { rpcTest, rpcError });
    }

    // Test 5: Check CASCADE constraints
    console.log('🔗 Testing CASCADE constraints...');
    const { data: cascadeCheck, error: cascadeError } = await supabase
      .rpc('test_cascade_relationships');

    console.log('🔗 CASCADE check result:', { cascadeCheck, cascadeError });

    let cascadeStatus = 'Unknown';
    let cascadeDetails = [];
    
    if (!cascadeError && cascadeCheck) {
      const totalConstraints = cascadeCheck.length;
      const cascadeConfigured = cascadeCheck.filter((c: any) => c.delete_rule === 'CASCADE').length;
      const notConfigured = totalConstraints - cascadeConfigured;
      
      cascadeStatus = notConfigured === 0 ? '✅ All CASCADE configured' : `⚠️ ${notConfigured}/${totalConstraints} need CASCADE setup`;
      cascadeDetails = cascadeCheck.filter((c: any) => c.delete_rule !== 'CASCADE');
    } else if (cascadeError) {
      cascadeStatus = `❌ ${cascadeError.message}`;
    }

    return NextResponse.json({
      success: true,
      message: 'All tests completed',
      tests: {
        connection: '✅ Success',
        userCount: userCount || 0,
        sampleUser: firstUser || 'No users found',
        rpcFunction: rpcError ? `❌ ${rpcError.message}` : '✅ Available',
        rpcResult: rpcTest,
        cascadeConstraints: cascadeStatus,
        cascadeDetails: cascadeDetails
      },
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Test connection error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test connection failed',
      details: error.message
    }, { status: 500 });
  }
}