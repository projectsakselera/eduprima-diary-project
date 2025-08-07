import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('🔍 DELETE PREVIEW API CALLED');
    console.log('📍 User ID:', params.id);
    console.log('🌐 Supabase URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('🔑 Supabase Key:', supabaseKey ? '✅ Set' : '❌ Missing');

    if (!supabase) {
      console.error('❌ Supabase client not initialized');
      throw new Error('Supabase client not initialized');
    }

    const userId = params.id;
    console.log('🔍 Preview deletion impact for user:', userId);

    // First, check if user exists
    const { data: userCheck, error: userCheckError } = await supabase
      .from('users_universal')
      .select('id, email')
      .eq('id', userId)
      .single();

    console.log('👤 User check result:', userCheck, userCheckError);

    if (userCheckError || !userCheck) {
      console.error('❌ User not found:', userCheckError);
      return NextResponse.json({
        success: false,
        error: 'User not found',
        details: userCheckError?.message,
        user_id: userId
      }, { status: 404 });
    }

    console.log('🔧 Attempting RPC function call...');
    
    // Execute the preview function from CASCADE documentation
    const { data: previewData, error: previewError } = await supabase
      .rpc('preview_user_deletion', { p_user_id: userId });

    console.log('🔧 RPC Result:', { previewData, previewError });

    if (previewError) {
      console.error('❌ RPC Error getting deletion preview:', previewError);
      console.log('📝 Falling back to manual preview...');
      
      const manualPreview = await createManualPreview(userId);
      console.log('📊 Manual preview result:', manualPreview);
      
      return NextResponse.json({
        success: true,
        preview: manualPreview,
        message: 'Manual preview generated (RPC function not available)',
        rpc_error: previewError.message
      });
    }

    console.log('✅ Deletion preview generated:', previewData);

    return NextResponse.json({
      success: true,
      preview: previewData,
      user_id: userId
    });

  } catch (error: any) {
    console.error('❌ Error in delete preview API:', error);
    return NextResponse.json(
      { error: 'Failed to generate deletion preview', details: error.message },
      { status: 500 }
    );
  }
}

// Manual preview function if RPC is not available
async function createManualPreview(userId: string) {
  console.log('📝 Starting manual preview for user:', userId);
  
  if (!supabase) {
    console.error('❌ No supabase client in manual preview');
    return [];
  }

  const preview = [];

  try {
    // User core data
    const { data: userData, error: userError } = await supabase
      .from('users_universal')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('User not found:', userError);
      return [{ table_name: 'user_not_found', records_affected: 0, data_type: 'Error' }];
    }

    preview.push({
      table_name: 'users_universal',
      records_affected: 1,
      data_type: 'User Account'
    });

    // User profiles
    const { count: profileCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (profileCount && profileCount > 0) {
      preview.push({
        table_name: 'user_profiles',
        records_affected: profileCount,
        data_type: 'Personal Profile'
      });
    }

    // User addresses
    const { count: addressCount } = await supabase
      .from('user_addresses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (addressCount && addressCount > 0) {
      preview.push({
        table_name: 'user_addresses',
        records_affected: addressCount,
        data_type: 'Addresses'
      });
    }

    // User demographics
    const { count: demoCount } = await supabase
      .from('user_demographics')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (demoCount && demoCount > 0) {
      preview.push({
        table_name: 'user_demographics',
        records_affected: demoCount,
        data_type: 'Demographics'
      });
    }

    // Educator details
    const { data: educatorData, count: educatorCount } = await supabase
      .from('educator_details')
      .select('id', { count: 'exact' })
      .eq('user_id', userId);

    if (educatorCount && educatorCount > 0) {
      preview.push({
        table_name: 'educator_details',
        records_affected: educatorCount,
        data_type: 'Educator Profile'
      });

      // Get educator ID for sub-tables
      const educatorId = educatorData?.[0]?.id;

      if (educatorId) {
        // Availability config
        const { count: availabilityCount } = await supabase
          .from('tutor_availability_config')
          .select('*', { count: 'exact', head: true })
          .eq('tutor_id', educatorId);

        if (availabilityCount && availabilityCount > 0) {
          preview.push({
            table_name: 'availability_config',
            records_affected: availabilityCount,
            data_type: 'Schedule Config'
          });
        }

        // Teaching preferences
        const { count: preferencesCount } = await supabase
          .from('tutor_teaching_preferences')
          .select('*', { count: 'exact', head: true })
          .eq('tutor_id', educatorId);

        if (preferencesCount && preferencesCount > 0) {
          preview.push({
            table_name: 'teaching_preferences',
            records_affected: preferencesCount,
            data_type: 'Teaching Preferences'
          });
        }

        // Personality traits
        const { count: personalityCount } = await supabase
          .from('tutor_personality_traits')
          .select('*', { count: 'exact', head: true })
          .eq('tutor_id', educatorId);

        if (personalityCount && personalityCount > 0) {
          preview.push({
            table_name: 'personality_traits',
            records_affected: personalityCount,
            data_type: 'Personality Profile'
          });
        }

        // Program mappings
        const { count: programCount } = await supabase
          .from('tutor_program_mappings')
          .select('*', { count: 'exact', head: true })
          .eq('tutor_id', educatorId);

        if (programCount && programCount > 0) {
          preview.push({
            table_name: 'program_mappings',
            records_affected: programCount,
            data_type: 'Subject Mappings'
          });
        }

        // Banking info
        const { count: bankingCount } = await supabase
          .from('tutor_banking_info')
          .select('*', { count: 'exact', head: true })
          .eq('tutor_id', educatorId);

        if (bankingCount && bankingCount > 0) {
          preview.push({
            table_name: 'tutor_banking_info',
            records_affected: bankingCount,
            data_type: 'Banking Information'
          });
        }
      }
    }

    // Tutor management
    const { count: managementCount } = await supabase
      .from('tutor_management')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (managementCount && managementCount > 0) {
      preview.push({
        table_name: 'tutor_management',
        records_affected: managementCount,
        data_type: 'Management Data'
      });
    }

    // Document storage
    const { count: documentCount } = await supabase
      .from('document_storage')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (documentCount && documentCount > 0) {
      preview.push({
        table_name: 'document_storage',
        records_affected: documentCount,
        data_type: 'Documents'
      });
    }

    console.log('📊 Manual preview generated:', preview);
    return preview;

  } catch (error) {
    console.error('❌ Error in manual preview:', error);
    return [{ table_name: 'error', records_affected: 0, data_type: 'Error generating preview' }];
  }
}