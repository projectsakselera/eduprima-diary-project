import { NextRequest, NextResponse } from 'next/server';
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
  source: 'users' | 'profiles' | 'demographics' | 'addresses' | 'educator' | 'management' | 'static';
  staticValues?: string[];
}> = {
  // Status and system fields
  'status_tutor': {
    source: 'static',
    field: 'status_tutor',
    type: 'select',
    staticValues: ['active', 'inactive', 'pending', 'registration', 'suspended', 'verified']
  },
  'approval_level': {
    source: 'static', 
    field: 'approval_level',
    type: 'select',
    staticValues: ['level_1', 'level_2', 'level_3', 'approved', 'rejected']
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
    staticValues: ['available', 'busy', 'full', 'inactive', 'vacation']
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
  
  // Location fields - these would come from addresses table
  'provinsiDomisili': {
    source: 'addresses',
    field: 'provinsiDomisili',
    type: 'text'
  },
  'kotaKabupatenDomisili': {
    source: 'addresses', 
    field: 'kotaKabupatenDomisili',
    type: 'text'
  },
  
  // Programs - this is complex, will need special handling
  'selectedPrograms': {
    source: 'static',
    field: 'selectedPrograms',
    type: 'array',
    staticValues: ['SD Matematika', 'SD Bahasa Indonesia', 'SD IPA', 'SMP Matematika', 'SMP IPA', 'SMP Bahasa Indonesia', 'SMA Matematika', 'SMA Fisika', 'SMA Kimia', 'SMA Biologi', 'SMA Bahasa Indonesia', 'SMA Bahasa Inggris']
  },
  
  // Verification status
  'status_verifikasi_identitas': {
    source: 'static',
    field: 'status_verifikasi_identitas',
    type: 'select',
    staticValues: ['pending', 'verified', 'rejected', 'recheck_needed']
  },
  'status_verifikasi_pendidikan': {
    source: 'static',
    field: 'status_verifikasi_pendidikan', 
    type: 'select',
    staticValues: ['pending', 'verified', 'rejected', 'recheck_needed']
  }
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
        .from('t_310_01_01_users_universal')
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
        .from('t_310_01_02_user_profiles')
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
        .from('t_315_01_01_educator_details')
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
        .from('t_310_01_03_user_addresses')
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