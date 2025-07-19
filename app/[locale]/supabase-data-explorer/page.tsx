'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSupabaseQuery } from '@/hooks/use-supabase'

interface TableInfo {
  columns: Array<{
    column_name: string
    data_type: string
    is_nullable: string
  }>
  sampleData: any[] | null
}

interface DatabaseInfo {
  tables: string[]
  tableInfo: Record<string, TableInfo>
}

export default function SupabaseDataExplorer() {
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  // Query untuk mengambil data dari tabel yang dipilih
  const { data: tableData, loading: tableDataLoading, error: tableDataError } = useSupabaseQuery<any>(
    selectedTable || '',
    {
      select: '*',
      limit: 50
    }
  )

  useEffect(() => {
    const fetchDatabaseInfo = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/supabase/list-tables')
        const data = await response.json()
        
        if (response.ok) {
          const tables = data.availableTables
          const tableInfo: Record<string, any> = {}
          
          tables.forEach((tableName: string) => {
            const tableData = data.tableData[tableName]
            tableInfo[tableName] = {
              columns: tableData.columns.map((col: string) => ({
                column_name: col,
                data_type: 'unknown',
                is_nullable: 'YES'
              })),
              sampleData: tableData.sampleData
            }
          })
          
          setDatabaseInfo({
            tables,
            tableInfo
          })
          
          if (tables.length > 0) {
            setSelectedTable(tables[0])
          }
        } else {
          setError(data.error || 'Failed to fetch database info')
        }
      } catch (err) {
        setError('Failed to connect to database')
      } finally {
        setLoading(false)
      }
    }

    fetchDatabaseInfo()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading database structure...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">{error}</p>
              <p className="text-sm text-gray-600 mt-2">
                Pastikan environment variables sudah dikonfigurasi dengan benar.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!databaseInfo) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>No Database Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Tidak dapat mengambil informasi database.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Supabase Data Explorer</h1>
          <p className="text-gray-600">
            Menjelajahi data yang sudah ada di database Supabase Anda
          </p>
          <div className="mt-4">
            <Badge color="success">
              {databaseInfo.tables.length} Tables Found
            </Badge>
          </div>
        </div>

        {/* Table Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {databaseInfo.tables.map((tableName) => (
                <Button
                  key={tableName}
                  variant={selectedTable === tableName ? "default" : "outline"}
                  onClick={() => setSelectedTable(tableName)}
                  size="sm"
                >
                  {tableName}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table Information */}
        {selectedTable && databaseInfo.tableInfo[selectedTable] && (
          <Tabs defaultValue="structure" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="structure">Structure</TabsTrigger>
              <TabsTrigger value="sample">Sample Data</TabsTrigger>
              <TabsTrigger value="data">All Data</TabsTrigger>
            </TabsList>

            <TabsContent value="structure" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Table Structure: {selectedTable}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-4 py-2 text-left">Column</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Nullable</th>
                        </tr>
                      </thead>
                      <tbody>
                        {databaseInfo.tableInfo[selectedTable].columns.map((column, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-4 py-2 font-medium">
                              {column.column_name}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Badge color="info" className="text-xs">
                                {column.data_type}
                              </Badge>
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Badge color={column.is_nullable === 'YES' ? 'warning' : 'success'} className="text-xs">
                                {column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sample" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sample Data: {selectedTable}</CardTitle>
                </CardHeader>
                <CardContent>
                  {databaseInfo.tableInfo[selectedTable].sampleData ? (
                    <div className="space-y-4">
                      {databaseInfo.tableInfo[selectedTable].sampleData!.map((row, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <pre className="text-sm overflow-x-auto">
                            {JSON.stringify(row, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No sample data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Data: {selectedTable}</CardTitle>
                  {tableDataLoading && <p className="text-sm text-gray-500">Loading...</p>}
                </CardHeader>
                <CardContent>
                  {tableDataError ? (
                    <p className="text-red-500">Error: {tableDataError}</p>
                  ) : tableData && tableData.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          Showing {tableData.length} records
                        </p>
                      </div>
                      {tableData.map((row, index) => (
                        <div key={index} className="p-4 border rounded-lg">
                          <pre className="text-sm overflow-x-auto">
                            {JSON.stringify(row, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
} 