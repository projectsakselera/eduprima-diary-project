import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const userId = params.id;
    console.log('🗑️ Starting CASCADE delete for user:', userId);

    // Step 1: Verify user exists and get basic info
    const { data: userData, error: userError } = await supabase
      .from('users_universal')
      .select('id, email, user_code')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('❌ User not found:', userError);
      return NextResponse.json(
        { error: 'User not found', details: userError?.message },
        { status: 404 }
      );
    }

    console.log('👤 User found:', userData.email, userData.user_code);

    // Step 2: Create backup before deletion (optional but recommended)
    try {
      const backupData = await createBackupBeforeDelete(userId);
      console.log('💾 Backup created:', backupData);
    } catch (backupError) {
      console.warn('⚠️ Backup creation failed (continuing with delete):', backupError);
    }

    // Step 3: Get CASCADE preview for logging
    let cascadePreview: any[] = [];
    try {
      const { data: previewData } = await supabase
        .rpc('preview_user_deletion', { p_user_id: userId });
      cascadePreview = previewData || [];
    } catch (previewError) {
      console.warn('⚠️ Could not get CASCADE preview:', previewError);
    }

    // Step 4: Perform CASCADE DELETE
    // Due to CASCADE constraints, deleting from users_universal will auto-delete all related records
    const { error: deleteError } = await supabase
      .from('users_universal')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('❌ Delete operation failed:', deleteError);
      
      // Check if it's a foreign key constraint violation (CASCADE not configured)
      if (deleteError.code === '23503' && deleteError.message.includes('foreign key constraint')) {
        const constraintMatch = deleteError.message.match(/constraint "([^"]+)"/);
        const tableMatch = deleteError.message.match(/from table "([^"]+)"/);
        const constraintName = constraintMatch ? constraintMatch[1] : 'unknown';
        const tableName = tableMatch ? tableMatch[1] : 'unknown';
        
        // Provide specific guidance based on constraint type
        let guidance = 'Please run the CASCADE cleanup script first.';
        if (constraintName.includes('user_id')) {
          guidance = 'This is a primary user_id constraint that should CASCADE. Run cleanup-duplicate-constraints.sql to fix duplicate constraints.';
        } else if (constraintName.includes('_by')) {
          guidance = 'This is an audit column that should be SET NULL. Run fix-remaining-cascade-constraints.sql to fix admin columns.';
        }
        
        throw new Error(`CASCADE DELETE not configured! Foreign key constraint "${constraintName}" on table "${tableName}" is blocking deletion. ${guidance}`);
      }
      
      throw new Error(`Delete failed: ${deleteError.message}`);
    }

    // Step 5: Verify deletion was successful
    const { data: verifyData, error: verifyError } = await supabase
      .from('users_universal')
      .select('id')
      .eq('id', userId)
      .single();

    if (!verifyError && verifyData) {
      throw new Error('Delete verification failed - user still exists');
    }

    console.log('✅ CASCADE delete completed successfully');

    // Step 6: Log deletion for audit
    try {
      await logDeletion(userId, userData.email, cascadePreview);
    } catch (logError) {
      console.warn('⚠️ Audit logging failed:', logError);
    }

    return NextResponse.json({
      success: true,
      message: `User ${userData.email} (${userData.user_code}) successfully deleted`,
      deleted_user: {
        id: userId,
        email: userData.email,
        user_code: userData.user_code
      },
      cascade_impact: cascadePreview,
      deleted_at: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Error in delete API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete user', 
        details: error.message,
        user_id: params.id
      },
      { status: 500 }
    );
  }
}

// Create backup before deletion
async function createBackupBeforeDelete(userId: string) {
  if (!supabase) throw new Error('Supabase not initialized');

  try {
    // Get user email for backup
    const { data: userData } = await supabase
      .from('users_universal')
      .select('email')
      .eq('id', userId)
      .single();

    // Create comprehensive backup
    const backupData = {
      backup_id: crypto.randomUUID(),
      user_id: userId,
      user_email: userData?.email,
      backup_date: new Date().toISOString(),
      backup_data: {
        users_universal: null as any,
        user_profiles: null as any,
        educator_details: null as any,
        addresses: null as any,
        demographics: null as any,
        documents: null as any
      }
    };

    // Gather all user data
    const [userResult, profileResult, educatorResult, addressResult, demoResult, docResult] = await Promise.all([
      supabase.from('users_universal').select('*').eq('id', userId).single(),
      supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
      supabase.from('educator_details').select('*').eq('user_id', userId).single(),
      supabase.from('user_addresses').select('*').eq('user_id', userId),
      supabase.from('user_demographics').select('*').eq('user_id', userId).single(),
      supabase.from('document_storage').select('*').eq('user_id', userId)
    ]);

    backupData.backup_data.users_universal = userResult.data;
    backupData.backup_data.user_profiles = profileResult.data;
    backupData.backup_data.educator_details = educatorResult.data;
    backupData.backup_data.addresses = addressResult.data;
    backupData.backup_data.demographics = demoResult.data;
    backupData.backup_data.documents = docResult.data;

    // Store backup (you could store this in a backup table or external storage)
    console.log('💾 Backup data prepared:', {
      backup_id: backupData.backup_id,
      user_email: backupData.user_email,
      data_size: JSON.stringify(backupData).length
    });

    // For now, we'll just return the backup data
    // In production, you might want to store this in a dedicated backup table
    return backupData;

  } catch (error) {
    console.error('❌ Backup creation failed:', error);
    throw error;
  }
}

// Log deletion for audit trail
async function logDeletion(userId: string, userEmail: string, cascadePreview: any[]) {
  try {
    // This would typically go to an audit table
    // For now, we'll just log to console
    const auditLog = {
      audit_id: crypto.randomUUID(),
      deleted_user_id: userId,
      deleted_email: userEmail,
      deleted_by: 'system', // In production, this would be the authenticated user ID
      deleted_at: new Date().toISOString(),
      deletion_method: 'cascade_api',
      affected_tables: cascadePreview,
      source: 'view-all-page'
    };

    console.log('📋 Audit log:', auditLog);
    
    // In production, you would store this:
    // await supabase.from('audit.user_deletions').insert([auditLog]);

    return auditLog;
  } catch (error) {
    console.error('❌ Audit logging failed:', error);
    throw error;
  }
}