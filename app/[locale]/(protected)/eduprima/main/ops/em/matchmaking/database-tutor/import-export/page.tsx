'use client';

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Icon } from "@/components/ui/icon";
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface ParsedRecord {
  rowNumber: number;
  originalData: Record<string, any>;
  mappedData: Record<string, any>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface ImportResult {
  totalRecords: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  errors: Array<{ row: number; message: string; }>;
}

export default function ImportExportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRecord[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [exportProgress, setExportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved column mapping
  const getColumnMapping = () => {
    const saved = localStorage.getItem('tutorColumnMapping');
    if (saved) {
      const config = JSON.parse(saved);
      return config.mappings?.filter((m: any) => m.databaseField && !m.isSkipped) || [];
    }
    return [];
  };

  // Parse file content based on file type
  const parseFile = useCallback(async (file: File): Promise<any[]> => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    switch (fileExtension) {
      case 'csv':
        return new Promise((resolve, reject) => {
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results: Papa.ParseResult<any>) => {
              if (results.errors.length > 0) {
                reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
              } else {
                resolve(results.data as any[]);
              }
            },
            error: (error: Error) => reject(error)
          });
        });
        
      case 'xlsx':
      case 'xls':
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const data = new Uint8Array(e.target?.result as ArrayBuffer);
              const workbook = XLSX.read(data, { type: 'array' });
              const worksheet = workbook.Sheets[workbook.SheetNames[0]];
              const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              
              // Convert to objects with headers
              if (jsonData.length < 2) {
                reject(new Error('File must contain at least one header row and one data row'));
                return;
              }
              
              const headers = jsonData[0] as string[];
              const rows = jsonData.slice(1) as any[][];
              const objects = rows.map(row => {
                const obj: Record<string, any> = {};
                headers.forEach((header, index) => {
                  obj[header] = row[index] || '';
                });
                return obj;
              });
              
              resolve(objects);
            } catch (error) {
              reject(error);
            }
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsArrayBuffer(file);
        });
        
      default:
        throw new Error(`Unsupported file format: ${fileExtension}. Please use CSV or Excel files.`);
    }
  }, []);

  // Apply column mapping and validation
  const processData = (rawData: any[], columnMapping: any[]): ParsedRecord[] => {
    return rawData.map((row, index) => {
      const mappedData: Record<string, any> = {};
      const errors: string[] = [];
      const warnings: string[] = [];

      // Apply column mappings
      columnMapping.forEach(mapping => {
        const sourceValue = row[mapping.formField];
        if (sourceValue !== undefined && sourceValue !== '') {
          // Apply transformations based on database field type
          const transformedValue = transformValue(sourceValue, mapping.databaseField);
          mappedData[mapping.databaseField] = transformedValue;
        } else if (mapping.required) {
          errors.push(`Required field '${mapping.formField}' is missing or empty`);
        }
      });

      // Validate mapped data
      const validationErrors = validateRecord(mappedData);
      errors.push(...validationErrors);

      return {
        rowNumber: index + 1,
        originalData: row,
        mappedData,
        isValid: errors.length === 0,
        errors,
        warnings
      };
    });
  };

  // Transform values based on database field requirements
  const transformValue = (value: any, dbFieldName: string): any => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Handle array fields (subjects, methods, etc.)
    if (dbFieldName.includes('mata_pelajaran') || dbFieldName.includes('metode') || dbFieldName.includes('jadwal')) {
      if (typeof value === 'string') {
        return value.split(/[,;|]/).map(v => v.trim()).filter(v => v);
      }
      return Array.isArray(value) ? value : [value];
    }

    // Handle numeric fields
    if (dbFieldName.includes('tarif') || dbFieldName.includes('ipk') || dbFieldName === 'tahun_lulus' || dbFieldName === 'tahun_masuk') {
      const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
      return isNaN(num) ? null : num;
    }

    // Handle date fields
    if (dbFieldName.includes('tanggal') || dbFieldName.includes('date')) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    }

    // Handle boolean fields
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();
      if (lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1') return true;
      if (lowerValue === 'false' || lowerValue === 'no' || lowerValue === '0') return false;
    }

    // Default: return as string
    return String(value).trim();
  };

  // Validate individual record
  const validateRecord = (record: Record<string, any>): string[] => {
    const errors: string[] = [];

    // Email validation
    if (record.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.email)) {
        errors.push('Invalid email format');
      }
    }

    // Phone validation
    if (record.no_hp_1) {
      const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
      if (!phoneRegex.test(String(record.no_hp_1).replace(/\s|-/g, ''))) {
        errors.push('Invalid phone number format');
      }
    }

    // TRN validation
    if (record.trn) {
      if (!/^[A-Z0-9]+$/.test(record.trn)) {
        errors.push('TRN must contain only uppercase letters and numbers');
      }
    }

    return errors;
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setParsedData([]);
    setShowPreview(false);

    try {
      const rawData = await parseFile(file);
      const columnMapping = getColumnMapping();
      
      if (columnMapping.length === 0) {
        throw new Error('No column mapping found. Please configure column mapping first.');
      }

      const processedData = processData(rawData, columnMapping);
      setParsedData(processedData);
      setShowPreview(true);
    } catch (error) {
      alert(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsParsing(false);
    }
  };

  // Execute import to database
  const executeImport = async () => {
    if (parsedData.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);

    const validRecords = parsedData.filter(record => record.isValid);
    let successCount = 0;
    let errorCount = 0;
    const errors: Array<{ row: number; message: string; }> = [];

    for (let i = 0; i < validRecords.length; i++) {
      const record = validRecords[i];
      
      try {
        // Add system fields
        const recordData = {
          ...record.mappedData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Generate TRN if not provided
          trn: record.mappedData.trn || `TUT${Date.now()}${Math.random().toString(36).substr(2, 5)}`.toUpperCase()
        };

        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        const { error } = await supabase
          .from('t_310_01_01_users_universal')
          .insert(recordData);

        if (error) {
          throw error;
        }
        
        successCount++;
      } catch (error) {
        console.error(`Error importing row ${record.rowNumber}:`, error);
        errorCount++;
        errors.push({
          row: record.rowNumber,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }

      // Update progress
      setImportProgress(Math.round(((i + 1) / validRecords.length) * 100));
    }

    setImportResult({
      totalRecords: parsedData.length,
      successCount,
      errorCount,
      warningCount: parsedData.filter(r => r.warnings.length > 0).length,
      errors
    });

    setIsImporting(false);
  };

  // Export data from database
  const executeExport = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }
      
      setExportProgress(25);
      
      const { data, error } = await supabase
        .from('t_310_01_01_users_universal')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setExportProgress(50);

      if (!data || data.length === 0) {
        alert('No data found to export');
        return;
      }

      setExportProgress(75);

      // Convert to CSV
      const headers = Object.keys(data[0]);
      const csvContent = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header];
            // Handle arrays and objects
            if (Array.isArray(value)) {
              return `"${value.join('; ')}"`;
            }
            if (value === null || value === undefined) {
              return '';
            }
            // Escape quotes and wrap in quotes if contains comma
            const stringValue = String(value);
            return stringValue.includes(',') || stringValue.includes('"') 
              ? `"${stringValue.replace(/"/g, '""')}"` 
              : stringValue;
          }).join(',')
        )
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `tutor_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportProgress(100);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  // Statistics
  const stats = {
    totalRecords: parsedData.length,
    validRecords: parsedData.filter(r => r.isValid).length,
    invalidRecords: parsedData.filter(r => !r.isValid).length,
    warningRecords: parsedData.filter(r => r.warnings.length > 0).length
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Import & Export</h1>
          <p className="text-muted-foreground">
            Import tutor data from files or export existing database records
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => window.open('/en/eduprima/main/ops/em/matchmaking/database-tutor/migration/column-mapping', '_blank')}
          >
            <Icon icon="heroicons:cog-6-tooth" className="w-4 h-4 mr-2" />
            Column Mapping
          </Button>
          <Button onClick={executeExport} disabled={isExporting}>
            <Icon icon="heroicons:arrow-down-tray" className="w-4 h-4 mr-2" />
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </div>

      {/* Export Progress */}
      {isExporting && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Exporting database records...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon icon="heroicons:cloud-arrow-up" className="w-5 h-5 mr-2" />
            Import Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Icon icon="heroicons:document-text" className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <div className="mb-4">
                <p className="text-lg font-medium">Upload your data file</p>
                <p className="text-sm text-muted-foreground">
                  Supports CSV, Excel (.xlsx, .xls) files
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsing}
              >
                <Icon icon="heroicons:folder-open" className="w-4 h-4 mr-2" />
                {isParsing ? 'Processing...' : 'Browse Files'}
              </Button>
              
              {selectedFile && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              )}
            </div>

            {/* Column Mapping Warning */}
            {parsedData.length === 0 && (
              <Alert>
                <Icon icon="heroicons:information-circle" className="h-4 w-4" />
                <AlertDescription>
                  Make sure to configure column mapping before importing. 
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-0 h-auto ml-1 underline"
                    onClick={() => window.open('/en/eduprima/main/ops/em/matchmaking/database-tutor/migration/column-mapping', '_blank')}
                  >
                    Configure now
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {showPreview && parsedData.length > 0 && (
        <>
          {/* Statistics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                <Icon icon="heroicons:document-text" className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRecords}</div>
                <p className="text-xs text-muted-foreground">Parsed from file</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valid</CardTitle>
                <Icon icon="heroicons:check-circle" className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.validRecords}</div>
                <p className="text-xs text-muted-foreground">Ready to import</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invalid</CardTitle>
                <Icon icon="heroicons:x-circle" className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.invalidRecords}</div>
                <p className="text-xs text-muted-foreground">Need fixing</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warnings</CardTitle>
                <Icon icon="heroicons:exclamation-triangle" className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.warningRecords}</div>
                <p className="text-xs text-muted-foreground">Minor issues</p>
              </CardContent>
            </Card>
          </div>

          {/* Data Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Data Preview</CardTitle>
                <Button 
                  onClick={executeImport} 
                  disabled={isImporting || stats.validRecords === 0}
                >
                  <Icon icon="heroicons:arrow-up-tray" className="w-4 h-4 mr-2" />
                  {isImporting ? 'Importing...' : `Import ${stats.validRecords} Records`}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 10).map((record, index) => (
                      <TableRow key={index}>
                        <TableCell>{record.rowNumber}</TableCell>
                        <TableCell>
                          <Badge color={
                            record.isValid ? 'success' : 
                            record.errors.length > 0 ? 'destructive' : 'warning'
                          }>
                            {record.isValid ? 'Valid' : 
                             record.errors.length > 0 ? 'Invalid' : 'Warning'}
                          </Badge>
                        </TableCell>
                        <TableCell>{record.mappedData.nama_lengkap || record.originalData.name || '-'}</TableCell>
                        <TableCell>{record.mappedData.email || record.originalData.email || '-'}</TableCell>
                        <TableCell>{record.mappedData.no_hp_1 || record.originalData.phone || '-'}</TableCell>
                        <TableCell>
                          {record.errors.length > 0 && (
                            <div className="text-xs text-red-600">
                              {record.errors.slice(0, 2).join(', ')}
                              {record.errors.length > 2 && ` +${record.errors.length - 2} more`}
                            </div>
                          )}
                          {record.warnings.length > 0 && (
                            <div className="text-xs text-orange-600">
                              {record.warnings.slice(0, 1).join(', ')}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parsedData.length > 10 && (
                  <div className="text-center text-sm text-muted-foreground mt-4">
                    Showing 10 of {parsedData.length} records
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Import Progress */}
      {isImporting && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importing records to database...</span>
                <span>{importProgress}%</span>
              </div>
              <Progress value={importProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon icon="heroicons:chart-bar" className="w-5 h-5 mr-2" />
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 mb-4">
              <div className="text-center p-4 border rounded-lg bg-green-50">
                <div className="text-2xl font-bold text-green-600">{importResult.successCount}</div>
                <p className="text-sm text-muted-foreground">Successfully Imported</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-red-50">
                <div className="text-2xl font-bold text-red-600">{importResult.errorCount}</div>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
              <div className="text-center p-4 border rounded-lg bg-orange-50">
                <div className="text-2xl font-bold text-orange-600">{importResult.warningCount}</div>
                <p className="text-sm text-muted-foreground">Warnings</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-red-600">Import Errors:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      Row {error.row}: {error.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 