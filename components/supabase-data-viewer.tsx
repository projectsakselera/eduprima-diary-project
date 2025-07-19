'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SupabaseDataViewer() {
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [tableData, setTableData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customTable, setCustomTable] = useState('')

  // Daftar tabel yang umum
  const commonTables = [
    'users', 'profiles', 'posts', 'products', 'orders', 'customers',
    'students', 'teachers', 'courses', 'enrollments', 'assignments',
    'tutors', 'sessions', 'bookings', 'payments', 'reviews'
  ]

  const checkTable = async (tableName: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(10)
      
      if (error) {
        console.log(`Table ${tableName} error:`, error.message)
        return false
      }
      
      if (data && data.length > 0) {
        setTableData(data)
        setSelectedTable(tableName)
        return true
      }
      
      return false
    } catch (err) {
      console.log(`Table ${tableName} not accessible`)
      return false
    } finally {
      setLoading(false)
    }
  }

  const scanTables = async () => {
    setLoading(true)
    setError(null)
    const foundTables: string[] = []
    
    for (const tableName of commonTables) {
      const exists = await checkTable(tableName)
      if (exists) {
        foundTables.push(tableName)
      }
    }
    
    setTables(foundTables)
    setLoading(false)
  }

  const handleCustomTableCheck = async () => {
    if (!customTable.trim()) return
    
    const exists = await checkTable(customTable.trim())
    if (exists && !tables.includes(customTable.trim())) {
      setTables([...tables, customTable.trim()])
    }
  }

  useEffect(() => {
    scanTables()
  }, [scanTables])

  const getColumnTypes = (data: any[]) => {
    if (data.length === 0) return []
    
    const sample = data[0]
    return Object.keys(sample).map(key => ({
      column_name: key,
      data_type: typeof sample[key],
      is_nullable: 'YES'
    }))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Supabase Data Viewer</h1>
          <p className="text-gray-600">
            Menjelajahi data yang sudah ada di database Supabase Anda
          </p>
          <div className="mt-4">
            <Badge color="success">
              {tables.length} Tables Found
            </Badge>
          </div>
        </div>

        {/* Custom Table Checker */}
        <Card>
          <CardHeader>
            <CardTitle>Check Custom Table</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Label htmlFor="customTable">Table Name</Label>
                <Input
                  id="customTable"
                  value={customTable}
                  onChange={(e) => setCustomTable(e.target.value)}
                  placeholder="Enter table name"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleCustomTableCheck} disabled={!customTable.trim()}>
                  Check Table
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Selector */}
        {tables.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Available Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tables.map((tableName) => (
                  <Button
                    key={tableName}
                    variant={selectedTable === tableName ? "default" : "outline"}
                    onClick={() => checkTable(tableName)}
                    size="sm"
                  >
                    {tableName}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Display */}
        {selectedTable && tableData.length > 0 && (
          <Tabs defaultValue="data" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="data">Data ({tableData.length})</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Table: {selectedTable}</CardTitle>
                  {loading && <p className="text-sm text-gray-500">Loading...</p>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tableData.map((row, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <pre className="text-sm overflow-x-auto">
                          {JSON.stringify(row, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

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
                          <th className="border border-gray-300 px-4 py-2 text-left">Sample Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getColumnTypes(tableData).map((column, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-4 py-2 font-medium">
                              {column.column_name}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              <Badge color="info" className="text-xs">
                                {column.data_type}
                              </Badge>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-xs">
                              {JSON.stringify(tableData[0][column.column_name]).substring(0, 50)}
                              {JSON.stringify(tableData[0][column.column_name]).length > 50 ? '...' : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Error Display */}
        {error && (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-500">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="text-center py-8">
              <p>Scanning database tables...</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 