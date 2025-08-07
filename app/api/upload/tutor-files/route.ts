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
    const userId = formData.get('userId') as string;
    const files = formData.getAll('files') as File[];
    const fileTypes = formData.getAll('fileTypes') as string[];
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    console.log('📁 Received files:', files.length, 'for user:', userId);
    
    // Create admin client for database updates
    const adminSupabase = createAdminSupabaseClient();
    
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
        // Update document storage record in database
        const updateResult = await adminSupabase
          .from('document_storage')
          .update({
            file_url: uploadResult.url,
            stored_filename: fileName,
            file_size: file.size,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('document_type', fileType);
        
        uploadResults.push({
          fileType,
          success: true,
          fileName,
          publicUrl: uploadResult.url,
          dbUpdateSuccess: !updateResult.error,
          etag: uploadResult.etag,
          storage: 'cloudflare-r2'
        });
        
        console.log(`✅ R2 Upload success for ${fileType}:`, uploadResult.url);
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