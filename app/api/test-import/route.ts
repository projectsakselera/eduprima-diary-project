import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🔥 Test import API called!');
  
  return NextResponse.json({
    success: true,
    message: 'Test API is working!',
    timestamp: new Date().toISOString()
  });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Test API GET is working!',
    timestamp: new Date().toISOString()
  });
}
