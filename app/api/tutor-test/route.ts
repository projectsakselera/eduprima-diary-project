import { NextResponse } from 'next/server';
import { SupabaseTutorService } from '@/lib/supabase-service';

export async function GET() {
  try {
    console.log('🔍 Testing tutor service from API endpoint...');
    
    // Test connection first
    const connectionTest = await SupabaseTutorService.testConnection();
    
    if (!connectionTest.isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        connectionTest,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Fetch tutors
    const result = await SupabaseTutorService.getAllTutors();
    
    return NextResponse.json({
      success: true,
      connectionTest,
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 