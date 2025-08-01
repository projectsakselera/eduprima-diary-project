import { NextRequest, NextResponse } from 'next/server';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    console.log('📤 API: Starting tutor file upload...');
    
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
    
    // Create admin client
    const adminSupabase = createAdminSupabaseClient();
    
    // Upload files
    const uploadResults = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = fileTypes[i];
      
      if (!file || file.size === 0) continue;
      
      const fileExt = file.name.split('.').pop();
      let fileName = '';
      
      switch (fileType) {
        case 'profile_photo':
          fileName = `${userId}/foto-profil.${fileExt}`;
          break;
        case 'identity_document':
          fileName = `${userId}/identitas.${fileExt}`;
          break;
        case 'education_document':
          fileName = `${userId}/pendidikan.${fileExt}`;
          break;
        case 'certificate_document':
          fileName = `${userId}/sertifikat.${fileExt}`;
          break;
        default:
          fileName = `${userId}/${fileType}.${fileExt}`;
      }
      
      console.log(`📤 Uploading ${fileType}:`, fileName);
      
      const uploadResult = await adminSupabase.storage
        .from('eduprimadiary')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadResult.error) {
        console.error(`❌ Upload failed for ${fileType}:`, uploadResult.error);
        uploadResults.push({
          fileType,
          success: false,
          error: uploadResult.error.message
        });
      } else {
        // Get public URL
        const { data: urlData } = adminSupabase.storage
          .from('eduprimadiary')
          .getPublicUrl(fileName);
        
        // Update document storage record
        const updateResult = await adminSupabase
          .from('t_460_03_01_document_storage')
          .update({
            file_url: urlData.publicUrl,
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
          publicUrl: urlData.publicUrl,
          dbUpdateSuccess: !updateResult.error
        });
        
        console.log(`✅ Upload success for ${fileType}:`, urlData.publicUrl);
      }
    }
    
    return NextResponse.json({
      success: true,
      results: uploadResults,
      message: `Uploaded ${uploadResults.filter(r => r.success).length}/${uploadResults.length} files`
    });
    
  } catch (error) {
    console.error('❌ API Upload error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Upload failed'
    }, { status: 500 });
  }
}