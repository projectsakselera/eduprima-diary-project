import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { r2Client } from '@/lib/cloudflare-r2';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 API: Starting tutor file upload to Cloudflare R2...');
    
    // 🔐 Add minimal auth check - TIDAK MENGUBAH LOGIC UPLOAD SAMA SEKALI
    const session = await auth();
    if (!session?.user) {
      console.log('❌ API Upload: Authentication required');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    console.log('✅ API Upload: User authenticated:', session.user.email);
    
    const formData = await request.formData();
    const authUserId = formData.get('userId') as string;
    const files = formData.getAll('files') as File[];
    const fileTypes = formData.getAll('fileTypes') as string[];
    
    if (!authUserId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    // Create admin client for database operations
    const adminSupabase = createAdminSupabaseClient();
    
    // 🔄 NEW: Lookup users_universal.id from auth.users.id for proper foreign key reference
    console.log('🔍 Looking up users_universal.id for auth user:', authUserId);
    const { data: universalUser, error: userLookupError } = await adminSupabase
      .from('users_universal')
      .select('id, email')
      .eq('id', authUserId)
      .single();
    
    if (userLookupError || !universalUser) {
      console.error('❌ User not found in users_universal:', userLookupError);
      return NextResponse.json({ 
        error: 'User not found in users_universal table. Please ensure user is properly registered.',
        details: userLookupError?.message 
      }, { status: 400 });
    }
    
    const userId = universalUser.id; // Use users_universal.id for foreign key compliance
    console.log('✅ Found users_universal user:', { id: userId, email: universalUser.email });
    
    console.log('📁 Received files:', files.length, 'for user:', userId);
    console.log('📋 File types:', fileTypes);
    
    // Upload files to Cloudflare R2
    const uploadResults = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = fileTypes[i];
      
      if (!file || file.size === 0) continue;
      
      const fileExt = file.name.split('.').pop();
      let fileName = '';
      
      // Use better folder structure for R2
      switch (fileType) {
        case 'profile_photo':
          fileName = `tutors/${userId}/foto-profil.${fileExt}`;
          break;
        case 'identity_document':
          fileName = `tutors/${userId}/identitas.${fileExt}`;
          break;
        case 'education_document':
          fileName = `tutors/${userId}/pendidikan.${fileExt}`;
          break;
        case 'certificate_document':
          fileName = `tutors/${userId}/sertifikat.${fileExt}`;
          break;
        // 🎓 STEP 2: New document types
        case 'transcript_document':
          fileName = `tutors/${userId}/transkrip-nilai.${fileExt}`;
          break;
        case 'expertise_certificate':
          fileName = `tutors/${userId}/sertifikat-keahlian.${fileExt}`;
          break;
        default:
          fileName = `tutors/${userId}/${fileType}.${fileExt}`;
      }
      
      console.log(`📤 Uploading ${fileType} to R2:`, fileName);
      
      // Convert File to Buffer for R2 upload
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Upload to Cloudflare R2
      const uploadResult = await r2Client.uploadFile(
        fileName, 
        buffer, 
        file.type,
        {
          cacheControl: 'public, max-age=31536000', // 1 year cache
          metadata: {
            'user-id': userId,
            'file-type': fileType,
            'original-name': file.name,
            'upload-timestamp': new Date().toISOString()
          }
        }
      );
      
      if (!uploadResult.success) {
        console.error(`❌ R2 Upload failed for ${fileType}:`, uploadResult.error);
        uploadResults.push({
          fileType,
          success: false,
          error: uploadResult.error
        });
      } else {
        console.log(`\n🔄 === DOCUMENT STORAGE OPERATION START ===`);
        console.log(`📊 Processing ${fileType} for user: ${userId}`);
        console.log(`🔗 Cloudflare URL: ${uploadResult.url}`);
        
        // 🔄 SIMPLIFIED: Update document storage using simplified structure (only URL columns)
        const updateData = {
          [`${fileType}_url`]: uploadResult.url,
          updated_at: new Date().toISOString()
        };

        console.log(`💾 Update data object:`, JSON.stringify(updateData, null, 2));
        console.log(`🎯 Target column: ${fileType}_url`);
        console.log(`🆔 User ID: ${userId}`);
        
        // Try to update existing user row first
        console.log(`\n💾 STEP 1: Attempting UPDATE on document_storage...`);
        
        const updateResult = await adminSupabase
          .from('document_storage')
          .update(updateData)
          .eq('user_id', userId)
          .eq('document_type', 'user_documents');

        console.log(`\n📊 UPDATE RESULT:`);
        console.log(`  ✅ Success: ${!updateResult.error}`);
        console.log(`  📊 Count: ${updateResult.count}`);
        console.log(`  🗃️ Data:`, updateResult.data);
        if (updateResult.error) {
          console.error(`  ❌ Error:`, JSON.stringify(updateResult.error, null, 2));
        }

        // If no row exists for this user, create a new one
        const shouldInsert = !updateResult.error && (updateResult.count === 0 || updateResult.count === null || (Array.isArray(updateResult.data) && updateResult.data.length === 0));
        console.log(`\n🤔 DECISION LOGIC:`);
        console.log(`  📊 Update error: ${!!updateResult.error}`);
        console.log(`  📊 Update count: ${updateResult.count}`);
        console.log(`  📊 Should insert: ${shouldInsert}`);
        
        if (shouldInsert) {
          console.log(`\n💾 STEP 2: No existing row found, creating new document_storage row for user: ${userId}`);
          
          const insertData = {
            user_id: userId,
            document_type: 'user_documents',
            original_filename: 'consolidated_record',
            stored_filename: 'consolidated_record',
            file_size: 0,
            mime_type: 'application/json',
            file_url: null,
            upload_status: 'uploaded',
            verification_status: 'pending',
            uploaded_at: new Date().toISOString(),
            uploaded_by: session.user.id ?? null,
            created_at: new Date().toISOString(),
            // Add the specific document URL
            ...updateData
          };
          
          console.log(`💾 Insert data:`, JSON.stringify(insertData, null, 2));
          
          const insertResult = await adminSupabase
            .from('document_storage')
            .insert(insertData);
            
          console.log(`\n📊 INSERT RESULT:`);
          console.log(`  ✅ Success: ${!insertResult.error}`);
          console.log(`  🗃️ Data:`, insertResult.data);
          if (insertResult.error) {
            console.error(`  ❌ Error:`, JSON.stringify(insertResult.error, null, 2));
          }
          
          if (insertResult.error) {
            console.error(`❌ Failed to insert document_storage row:`, insertResult.error);
          } else {
            console.log(`✅ Successfully created document_storage row for user: ${userId}`);
          }
        } else if (updateResult.error) {
          console.error(`❌ Failed to update document_storage row:`, updateResult.error);
        } else {
          console.log(`\n✅ STEP 2: Successfully updated existing document_storage row for user: ${userId}`);
        }
        
        console.log(`🔄 === DOCUMENT STORAGE OPERATION END ===\n`);
        
        // 📸 SPECIAL HANDLING: Update user_profiles.profile_photo_url for profile photos
        let profileUpdateSuccess = true;
        if (fileType === 'profile_photo') {
          console.log('📸 Updating user_profiles.profile_photo_url for user:', userId);
          const { error: profileUpdateError } = await adminSupabase
            .from('user_profiles')
            .update({ 
              profile_photo_url: uploadResult.url,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
          
          if (profileUpdateError) {
            console.error('❌ Failed to update user_profiles.profile_photo_url:', profileUpdateError);
            profileUpdateSuccess = false;
          } else {
            console.log('✅ Successfully updated user_profiles.profile_photo_url');
          }
        }

        uploadResults.push({
          fileType,
          success: true,
          fileName,
          publicUrl: uploadResult.url,
          dbUpdateSuccess: !updateResult.error,
          profileUpdateSuccess: fileType === 'profile_photo' ? profileUpdateSuccess : true,
          etag: uploadResult.etag,
          storage: 'cloudflare-r2'
        });
        
        console.log(`✅ R2 Upload success for ${fileType}:`, uploadResult.url);
        console.log(`💾 Cloudflare URL saved to document_storage.${fileType}_url column for user:`, userId);
        
        // 🎓 Additional logging for Step 2 documents
        if (fileType === 'transcript_document') {
          console.log('📜 Transcript document uploaded successfully to document_storage.transcript_document_url for tutor:', userId);
        } else if (fileType === 'expertise_certificate') {
          console.log('🏆 Expertise certificate uploaded successfully to document_storage.expertise_certificate_url for tutor:', userId);
        }
        
        // 📄 Additional logging for Step 5 documents
        if (fileType === 'identity_document') {
          console.log('📄 Identity document uploaded successfully to document_storage.identity_document_url for tutor:', userId);
        } else if (fileType === 'education_document') {
          console.log('📄 Education document uploaded successfully to document_storage.education_document_url for tutor:', userId);
        } else if (fileType === 'certificate_document') {
          console.log('📄 Certificate document uploaded successfully to document_storage.certificate_document_url for tutor:', userId);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      results: uploadResults,
      message: `Uploaded ${uploadResults.filter(r => r.success).length}/${uploadResults.length} files to Cloudflare R2`
    });
    
  } catch (error) {
    console.error('❌ API Upload error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Upload failed'
    }, { status: 500 });
  }
}