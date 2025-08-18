import { NextResponse } from 'next/server';

// GET /api/test-env - Test environment variables loading
export async function GET() {
  try {
    console.log('🔍 Testing environment variables...');
    
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
      HUGGINGFACE_API_TOKEN: process.env.HUGGINGFACE_API_TOKEN ? 'SET' : 'NOT SET',
      REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN ? 'SET' : 'NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      // Check if we can access the actual values (for debugging)
      SUPABASE_URL_LENGTH: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
      ANON_KEY_LENGTH: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      SERVICE_KEY_LENGTH: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      // Check for common issues
      SUPABASE_URL_STARTS_WITH_HTTPS: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') || false,
      ANON_KEY_STARTS_WITH_EY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ') || false,
      SERVICE_KEY_STARTS_WITH_EY: process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ') || false,
    };

    console.log('📊 Environment variables status:', envVars);

    return NextResponse.json({
      success: true,
      message: 'Environment variables check completed',
      data: envVars,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error checking environment variables:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check environment variables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
