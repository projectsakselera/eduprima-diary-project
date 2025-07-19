import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Query untuk melihat semua tabel yang ada
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (tablesError) {
      return NextResponse.json({ error: tablesError.message }, { status: 500 })
    }

    // Cek struktur beberapa tabel yang umum
    const tableInfo: any = {}
    
    for (const table of tables || []) {
      const tableName = table.table_name
      
      // Skip system tables
      if (tableName.startsWith('_') || tableName === 'schema_migrations') continue
      
      try {
        // Cek struktur kolom
        const { data: columns, error: columnsError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_schema', 'public')
          .eq('table_name', tableName)
          .order('ordinal_position')

        if (!columnsError) {
          tableInfo[tableName] = {
            columns: columns,
            sampleData: null
          }

          // Ambil sample data (maksimal 3 baris)
          const { data: sampleData, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(3)

          if (!sampleError) {
            tableInfo[tableName].sampleData = sampleData
          }
        }
      } catch (err) {
        console.log(`Error checking table ${tableName}:`, err)
      }
    }

    return NextResponse.json({ 
      tables: tables?.map(t => t.table_name).filter(name => !name.startsWith('_')),
      tableInfo 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 