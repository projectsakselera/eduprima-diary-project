import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// Initialize R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      console.log('❌ No session found - unauthorized access attempt');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Construct file path
    const filePath = params.path.join('/');
    
    console.log('🔐 File access request details:');
    console.log(`   Path: ${filePath}`);
    console.log(`   User: ${session.user?.email}`);
    console.log(`   Bucket: ${process.env.CLOUDFLARE_R2_BUCKET_NAME}`);
    console.log(`   Endpoint: ${process.env.CLOUDFLARE_R2_ENDPOINT}`);

    // Fetch file from R2
    const command = new GetObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
      Key: filePath,
    });

    const response = await r2Client.send(command);
    
    if (!response.Body) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Stream the file
    const stream = response.Body as ReadableStream;
    
    // Set appropriate headers
    const headers = new Headers();
    if (response.ContentType) {
      headers.set('Content-Type', response.ContentType);
    }
    if (response.ContentLength) {
      headers.set('Content-Length', response.ContentLength.toString());
    }
    
    // Cache for 1 hour
    headers.set('Cache-Control', 'private, max-age=3600');
    headers.set('ETag', response.ETag || '');
    
    console.log(`✅ File served securely: ${filePath}`);
    
    return new NextResponse(stream, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('❌ Secure file access error:', error);
    
    if (error.name === 'NoSuchKey') {
      return new NextResponse('File not found', { status: 404 });
    }
    
    return new NextResponse('Internal server error', { status: 500 });
  }
}