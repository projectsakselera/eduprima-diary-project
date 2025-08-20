import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Column mapping for database fields
const COLUMN_MAPPING: Record<string, {
  table?: string;
  field: string;
  type: 'text' | 'select' | 'array' | 'boolean' | 'number';
  source: 'users' | 'profiles' | 'demographics' | 'addresses' | 'educator' | 'management' | 'static' | 'location_province' | 'location_cities' | 'banking' | 'tutor_status_types' | 'corporate_entities' | 'programs_unit';
  staticValues?: string[];
}> = {
  // Status and system fields
  'status_tutor': {
    source: 'tutor_status_types',
    field: 'code',
    type: 'select'
  },
  'brand': {
    source: 'corporate_entities',
    field: 'entity_code',
    type: 'select'
  },
  
  // Personal info (visible in screenshot)
  'namaLengkap': {
    source: 'profiles',
    field: 'full_name',
    type: 'text'
  },
  'email': {
    source: 'users',
    field: 'email', 
    type: 'text'
  },
  'jenisKelamin': {
    source: 'static',
    field: 'jenisKelamin', 
    type: 'select',
    staticValues: ['Laki-laki', 'Perempuan']
  },
  'agama': {
    source: 'static',
    field: 'agama',
    type: 'select', 
    staticValues: ['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya']
  },
  
  // Education fields
  'statusAkademik': {
    source: 'static',
    field: 'statusAkademik',
    type: 'select',
    staticValues: ['SMA', 'D3', 'S1', 'S2', 'S3', 'SMK', 'Lainnya']
  },
  'namaUniversitas': {
    source: 'educator',
    field: 'namaUniversitas',
    type: 'text'
  },
  'fakultas': {
    source: 'educator', 
    field: 'fakultas',
    type: 'text'
  },
  'jurusan': {
    source: 'educator',
    field: 'jurusan', 
    type: 'text'
  },
  
  // Availability
  'statusMenerimaSiswa': {
    source: 'static',
    field: 'statusMenerimaSiswa',
    type: 'select',
    staticValues: ['available', 'limited', 'unavailable', 'leave']
  },
  'available_schedule': {
    source: 'static',
    field: 'available_schedule',
    type: 'array',
    staticValues: ['Senin Pagi', 'Senin Siang', 'Senin Sore', 'Selasa Pagi', 'Selasa Siang', 'Selasa Sore', 'Rabu Pagi', 'Rabu Siang', 'Rabu Sore', 'Kamis Pagi', 'Kamis Siang', 'Kamis Sore', 'Jumat Pagi', 'Jumat Siang', 'Jumat Sore', 'Sabtu Pagi', 'Sabtu Siang', 'Sabtu Sore', 'Minggu Pagi', 'Minggu Siang', 'Minggu Sore']
  },
  'teaching_methods': {
    source: 'static',
    field: 'teaching_methods', 
    type: 'array',
    staticValues: ['Online', 'Offline', 'Hybrid', 'Home Visit', 'Center']
  },
  
  // Location fields - these come from location tables via lookup
  'provinsiDomisili': {
    source: 'location_province',
    field: 'region_name',
    type: 'text'
  },
  'kotaKabupatenDomisili': {
    source: 'location_cities', 
    field: 'city_name',
    type: 'text'
  },
  'provinsiKTP': {
    source: 'location_province',
    field: 'region_name',
    type: 'text'
  },
  'kotaKabupatenKTP': {
    source: 'location_cities',
    field: 'city_name', 
    type: 'text'
  },
  
  // Programs - dynamic from programs_unit table
  'selectedPrograms': {
    source: 'programs_unit',
    field: 'program_name',
    type: 'array'
  },
  
  
  // Banking fields
  'namaBank': {
    source: 'banking',
    field: 'bank_name',
    type: 'text'
  },
};

async function getUniqueValuesForColumn(column: string): Promise<string[]> {
  if (!supabase) {
    return [];
  }

  const columnConfig = COLUMN_MAPPING[column];
  
  if (!columnConfig) {
    console.warn(`⚠️ Column "${column}" not mapped for filtering`);
    return [];
  }

  // Return static values for predefined options
  if (columnConfig.source === 'static' && columnConfig.staticValues) {
    return columnConfig.staticValues;
  }

  try {
    // For database-sourced values, we need to query the appropriate table
    if (columnConfig.source === 'users') {
      const { data, error } = await supabase
        .from('users_universal')
        .select(columnConfig.field)
        .not(columnConfig.field, 'is', null)
        .not(columnConfig.field, 'eq', '');

      if (error) {
        console.error(`❌ Error fetching ${column} values:`, error);
        return [];
      }

      const uniqueValues = [...new Set(
        data
          ?.map((row: any) => row[columnConfig.field] as string)
          .filter(val => val !== null && val !== '')
      )] as string[];

      return uniqueValues.sort();
    }

    if (columnConfig.source === 'profiles') {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(columnConfig.field)
        .not(columnConfig.field, 'is', null)
        .not(columnConfig.field, 'eq', '');

      if (error) {
        console.error(`❌ Error fetching ${column} values:`, error);
        return [];
      }

      const uniqueValues = [...new Set(
        data
          ?.map((row: any) => row[columnConfig.field] as string)
          .filter(val => val !== null && val !== '')
      )] as string[];

      return uniqueValues.sort();
    }

    if (columnConfig.source === 'educator') {
      const { data, error } = await supabase
        .from('tutor_details')
        .select(columnConfig.field)
        .not(columnConfig.field, 'is', null)
        .not(columnConfig.field, 'eq', '');

      if (error) {
        console.error(`❌ Error fetching ${column} values:`, error);
        return [];
      }

      // Extract unique values
      const uniqueValues = [...new Set(
        data
          ?.map((row: any) => row[columnConfig.field] as string)
          .filter(val => val !== null && val !== '')
      )] as string[];

      return uniqueValues.sort();
    }

    // For addresses
    if (columnConfig.source === 'addresses') {
      const { data, error } = await supabase
        .from('user_addresses')
        .select(columnConfig.field)
        .not(columnConfig.field, 'is', null)
        .not(columnConfig.field, 'eq', '');

      if (error) {
        console.error(`❌ Error fetching ${column} values:`, error);
        return [];
      }

      const uniqueValues = [...new Set(
        data
          ?.map((row: any) => row[columnConfig.field] as string)
          .filter(val => val !== null && val !== '')
      )] as string[];

      return uniqueValues.sort();
    }

    // For demographics
    if (columnConfig.source === 'demographics') {
      const { data, error } = await supabase
        .from('user_demographics')
        .select(columnConfig.field)
        .not(columnConfig.field, 'is', null)
        .not(columnConfig.field, 'eq', '');

      if (error) {
        console.error(`❌ Error fetching ${column} values:`, error);
        return [];
      }

      const uniqueValues = [...new Set(
        data
          ?.map((row: any) => row[columnConfig.field] as string)
          .filter(val => val !== null && val !== '')
      )] as string[];

      return uniqueValues.sort();
    }

    // For management
    if (columnConfig.source === 'management') {
      const { data, error } = await supabase
        .from('tutor_management')
        .select(columnConfig.field)
        .not(columnConfig.field, 'is', null)
        .not(columnConfig.field, 'eq', '');

      if (error) {
        console.error(`❌ Error fetching ${column} values:`, error);
        return [];
      }

      const uniqueValues = [...new Set(
        data
          ?.map((row: any) => row[columnConfig.field] as string)
          .filter(val => val !== null && val !== '')
      )] as string[];

      return uniqueValues.sort();
    }

    // For location provinces
    if (columnConfig.source === 'location_province') {
      const { data, error } = await supabase
        .from('location_province')
        .select(columnConfig.field)
        .not(columnConfig.field, 'is', null)
        .not(columnConfig.field, 'eq', '');

      if (error) {
        console.error(`❌ Error fetching ${column} values:`, error);
        return [];
      }

      const uniqueValues = [...new Set(
        data
          ?.map((row: any) => row[columnConfig.field] as string)
          .filter(val => val !== null && val !== '')
      )] as string[];

      return uniqueValues.sort();
    }

    // For location cities
    if (columnConfig.source === 'location_cities') {
      const { data, error } = await supabase
        .from('location_cities')
        .select(columnConfig.field)
        .not(columnConfig.field, 'is', null)
        .not(columnConfig.field, 'eq', '');

      if (error) {
        console.error(`❌ Error fetching ${column} values:`, error);
        return [];
      }

      const uniqueValues = [...new Set(
        data
          ?.map((row: any) => row[columnConfig.field] as string)
          .filter(val => val !== null && val !== '')
      )] as string[];

      return uniqueValues.sort();
    }

    // For banking
    if (columnConfig.source === 'banking') {
      const { data, error } = await supabase
        .from('user_banking')
        .select(columnConfig.field)
        .not(columnConfig.field, 'is', null)
        .not(columnConfig.field, 'eq', '');

      if (error) {
        console.error(`❌ Error fetching ${column} values:`, error);
        return [];
      }

      const uniqueValues = [...new Set(
        data
          ?.map((row: any) => row[columnConfig.field] as string)
          .filter(val => val !== null && val !== '')
      )] as string[];

      return uniqueValues.sort();
    }

    // For tutor status types
    if (columnConfig.source === 'tutor_status_types') {
      const { data, error } = await supabase
        .from('tutor_status_types')
        .select(columnConfig.field)
        .not(columnConfig.field, 'is', null)
        .not(columnConfig.field, 'eq', '')
        .order('created_at', { ascending: true });

      if (error) {
        console.error(`❌ Error fetching ${column} values from tutor_status_types:`, error);
        return [];
      }

      const uniqueValues = [...new Set(
        data
          ?.map((row: any) => row[columnConfig.field] as string)
          .filter(val => val !== null && val !== '')
      )] as string[];

      return uniqueValues;
    }

    // For corporate entities
    if (columnConfig.source === 'corporate_entities') {
      const { data, error } = await supabase
        .from('corporate_entities')
        .select(columnConfig.field)
        .not(columnConfig.field, 'is', null)
        .not(columnConfig.field, 'eq', '')
        .order('created_at', { ascending: true });

      if (error) {
        console.error(`❌ Error fetching ${column} values from corporate_entities:`, error);
        return [];
      }

      const uniqueValues = [...new Set(
        data
          ?.map((row: any) => row[columnConfig.field] as string)
          .filter(val => val !== null && val !== '')
      )] as string[];

      return uniqueValues.sort();
    }

    // For programs unit
    if (columnConfig.source === 'programs_unit') {
      const { data, error } = await supabase
        .from('programs_unit')
        .select(columnConfig.field)
        .not(columnConfig.field, 'is', null)
        .not(columnConfig.field, 'eq', '')
        .order(columnConfig.field, { ascending: true });

      if (error) {
        console.error(`❌ Error fetching ${column} values from programs_unit:`, error);
        return [];
      }

      const uniqueValues = [...new Set(
        data
          ?.map((row: any) => row[columnConfig.field] as string)
          .filter(val => val !== null && val !== '')
      )] as string[];

      return uniqueValues.sort();
    }

    // Add other sources as needed
    return [];

  } catch (error) {
    console.error(`❌ Error fetching unique values for ${column}:`, error);
    return [];
  }
}

// GET endpoint - fetch unique values for a column
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const column = searchParams.get('column');

    if (!column) {
      return NextResponse.json({
        success: false,
        error: 'Column parameter is required',
        data: []
      }, { status: 400 });
    }

    console.log(`🔍 Fetching unique values for column: ${column}`);

    const uniqueValues = await getUniqueValuesForColumn(column);

    return NextResponse.json({
      success: true,
      data: uniqueValues,
      total: uniqueValues.length,
      column: column,
      message: `Found ${uniqueValues.length} unique values for ${column}`
    });

  } catch (error) {
    console.error('❌ Column values API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      data: []
    }, { status: 500 });
  }
}