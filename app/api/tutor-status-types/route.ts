import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-service';

/**
 * GET /api/tutor-status-types
 * Fetch all tutor status types from database for form dropdowns
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Fetching tutor status types from database...');
    
    // List of possible table names to try - including the one you mentioned
    const possibleTableNames = [
      'tutor_registration_types',  // The one you mentioned
      'tutor_status_types',
      'tutor_status_type', 
      'status_types',
      'tutor_statuses',
      'tutor_management_status'
    ];
    
    let finalStatusTypes: any[] = [];
    let foundTable = '';
    
    // Try each table name
    for (const tableName of possibleTableNames) {
      console.log(`📊 Testing table: ${tableName}`);
      try {
        const { data: testData, error: testError } = await supabase
          .from(tableName)
          .select('*')
          .limit(5);
        
        if (!testError && testData && testData.length > 0) {
          console.log(`✅ Found table: ${tableName} with ${testData.length} sample records`);
          console.log('📊 Sample record:', testData[0]);
          foundTable = tableName;
          
          // Fetch all data from found table
          console.log(`🔍 Fetching all data from table: ${foundTable}`);
          const { data: allData, error: fetchError } = await supabase
            .from(foundTable)
            .select('*')
            .order('created_at', { ascending: true });

          if (!fetchError && allData) {
            finalStatusTypes = allData;
            break;
          }
        } else {
          console.log(`❌ Table ${tableName} not accessible:`, testError?.message);
        }
      } catch (err) {
        console.log(`❌ Error testing table ${tableName}:`, err);
      }
    }
    
    // If no table found or no data, return fallback options
    if (!foundTable || finalStatusTypes.length === 0) {
      console.log('⚠️ No tutor status table found or no data, using fallback options');
      const fallbackOptions = [
        { value: 'registration', label: '📝 Registration - Registrasi' },
        { value: 'learning_materials', label: '📚 Learning Materials - Belajar Materi' },
        { value: 'examination', label: '📋 Examination - Ujian' },
        { value: 'data_completion', label: '📄 Data Completion - Melengkapi Data' },
        { value: 'active', label: '✅ Active - Aktif' },
        { value: 'inactive', label: '⏸️ Inactive - Tidak Aktif' },
        { value: 'suspended', label: '🚫 Suspended - Ditangguhkan' }
      ];
      
      return NextResponse.json({
        success: true,
        data: fallbackOptions,
        count: fallbackOptions.length,
        message: `Using fallback options - table: ${foundTable || 'none found'}`
      });
    }

    console.log(`📊 Raw data fetched: ${finalStatusTypes.length} records from table: ${foundTable}`);
    if (finalStatusTypes.length > 0) {
      console.log('📊 Sample record structure:', Object.keys(finalStatusTypes[0]));
      console.log('📊 Sample record:', finalStatusTypes[0]);
    }

    // Transform data to format expected by form fields with flexible field names
    const options = finalStatusTypes.map((status, index) => {
      // Prioritize 'code' column as requested, then try other possible field names for the data
      const statusCode = status.code || status.status_code || status.value || status.type_code || `status_${index}`;
      const statusName = status.status_name || status.name || status.label || status.type_name || 'Unknown Status';
      const statusIcon = status.status_icon || status.icon || status.emoji || '';
      
      return {
        value: statusCode,
        label: `${statusIcon} ${statusName}`.trim(),
        disabled: false
      };
    });

    console.log(`✅ Successfully transformed ${options.length} tutor status types`);
    console.log('📊 Transformed options:', options.slice(0, 3)); // Show first 3 options

    return NextResponse.json({
      success: true,
      data: options,
      count: options.length,
      table_used: foundTable,
      raw_sample: finalStatusTypes[0] // Include one sample for debugging
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Return fallback even on error
    const fallbackOptions = [
      { value: 'registration', label: '📝 Registration - Registrasi' },
      { value: 'active', label: '✅ Active - Aktif' },
      { value: 'inactive', label: '⏸️ Inactive - Tidak Aktif' }
    ];
    
    return NextResponse.json({
      success: true,
      data: fallbackOptions,
      count: fallbackOptions.length,
      message: 'Using fallback options - error occurred',
      error_details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}