import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({
        error: 'Image URL is required'
      }, { status: 400 });
    }

    // Validate that it's an R2 URL to prevent abuse
    if (!imageUrl.includes('pub-10086fa546715dab7f29deb601272699.r2.dev')) {
      return NextResponse.json({
        error: 'Invalid image source'
      }, { status: 400 });
    }

    console.log('🖼️ Proxying image from R2:', imageUrl);

    // Fetch image from R2
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Eduprima-Diary-Proxy/1.0',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch image from R2:', response.status, response.statusText);
      return NextResponse.json({
        error: 'Failed to fetch image'
      }, { status: response.status });
    }

    // Get image data
    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    console.log('✅ Successfully proxied image:', imageUrl);

    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('❌ Image proxy error:', error);
    return NextResponse.json({
      error: 'Internal server error'
    }, { status: 500 });
  }
}

