import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Coba ambil data dari beberapa tabel yang umum
    const commonTables = ['users', 'profiles', 'posts', 'products', 'orders', 'customers']
    const tableData: any = {}
    
    for (const tableName of commonTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(5)
        
        if (!error && data) {
          tableData[tableName] = {
            count: data.length,
            sampleData: data,
            columns: data.length > 0 ? Object.keys(data[0]) : []
          }
        }
      } catch (err) {
        // Table tidak ada, skip
        console.log(`Table ${tableName} not found or not accessible`)
      }
    }

    return NextResponse.json({ 
      availableTables: Object.keys(tableData),
      tableData 
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
} 