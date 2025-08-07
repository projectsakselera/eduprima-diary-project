import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * GET /api/banks/indonesia
 * Fetch all active Indonesian banks for form dropdown
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    console.log('🏦 Fetching Indonesian banks...');

    // Get search query if provided
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;

    let query = supabase
      .from('finance_banks_indonesia')
      .select(`
        id,
        bank_name,
        popular_bank_name,
        bank_code,
        swift_code,
        bank_category,
        display_order
      `)
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('popular_bank_name', { ascending: true });

    // Add search filter if provided
    if (search && search.trim() !== '') {
      const searchTerm = search.trim().toLowerCase();
      query = query.or(`
        popular_bank_name.ilike.%${searchTerm}%,
        bank_name.ilike.%${searchTerm}%,
        bank_code.ilike.%${searchTerm}%
      `);
    }

    // Apply limit
    query = query.limit(limit);

    const { data: banks, error } = await query;

    if (error) {
      console.error('❌ Error fetching banks:', error);
      return NextResponse.json(
        { error: 'Failed to fetch banks data', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully fetched ${banks?.length || 0} banks`);

    // Transform data for dropdown format
    const transformedBanks = (banks || []).map(bank => ({
      value: bank.id,
      label: bank.popular_bank_name,
      fullName: bank.bank_name,
      code: bank.bank_code,
      swiftCode: bank.swift_code,
      category: bank.bank_category,
      displayOrder: bank.display_order
    }));

    return NextResponse.json({
      success: true,
      data: transformedBanks,
      count: transformedBanks.length,
      search: search || null
    });

  } catch (error) {
    console.error('❌ Unexpected error in banks API:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/banks/indonesia
 * Create new bank entry (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      country_id,
      bank_name,
      popular_bank_name,
      bank_code,
      swift_code,
      bank_category = 'commercial',
      display_order = 999
    } = body;

    // Validate required fields
    if (!country_id || !bank_name || !popular_bank_name || !bank_code) {
      return NextResponse.json(
        { error: 'Missing required fields: country_id, bank_name, popular_bank_name, bank_code' },
        { status: 400 }
      );
    }

    console.log('🏦 Creating new bank:', popular_bank_name);

    const { data: newBank, error } = await supabase
      .from('finance_banks_indonesia')
      .insert({
        country_id,
        bank_name,
        popular_bank_name,
        bank_code,
        swift_code,
        bank_category,
        display_order,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating bank:', error);
      return NextResponse.json(
        { error: 'Failed to create bank', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Successfully created bank:', newBank.id);

    return NextResponse.json({
      success: true,
      data: newBank,
      message: 'Bank created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Unexpected error in banks POST:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
} 