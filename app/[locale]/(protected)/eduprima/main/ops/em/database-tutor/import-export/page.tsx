'use client';

import { useState, useCallback, useRef, useEffect } from "react";
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
import { toast } from '@/components/ui/use-toast';
import { 
  findBestLocationMatches, 
  findBestSubjectMatches, 
  findBestBankMatches, 
  findBestCategoryMatches,
  advancedSimilarity, 
  testLocationMatching, 
  type LocationMatch,
  type FieldMatch 
} from '@/lib/fuzzy-location-matcher';
// Import form config types and data (avoiding potential circular deps)
// import { 
//   tutorFormConfig, 
//   type TutorFormData, 
//   type FormField as TutorFormField 
// } from '../add/form-config';

// Temporary simplified types to avoid dependency issues
interface TutorFormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  multiple?: boolean; // For checkbox groups
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
  validation?: (value: any) => string | null;
  min?: number;
  max?: number;
}

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    key: !!supabaseKey
  });
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Log initialization status
console.log('🔧 Import-Export Page Initialization:', {
  supabaseConfigured: !!supabase,
  papaParseAvailable: typeof Papa !== 'undefined',
  xlsxAvailable: typeof XLSX !== 'undefined'
});

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
  
  // Data cache for fuzzy matching
  const [dataCache, setDataCache] = useState<{
    provinces: Array<{id: string, name: string, local_name?: string}>;
    cities: Array<{id: string, name: string, local_name?: string, province_id: string}>;
    subjects: Array<{id: string, name: string, local_name?: string, alternate_name?: string}>;
    banks: Array<{id: string, name: string, local_name?: string, alternate_name?: string}>;
    categories: Array<{id: string, name: string, local_name?: string, alternate_name?: string}>;
  }>({ provinces: [], cities: [], subjects: [], banks: [], categories: [] });

  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Generate comprehensive field mapping from simplified config
  const generateFieldMapping = (): Array<{field: TutorFormField, csvColumn: string}> => {
    const fieldMap: Array<{field: TutorFormField, csvColumn: string}> = [];
    
    // Define essential fields for bulk import (based on form config)
    const essentialFields: TutorFormField[] = [
      { name: 'status_tutor', label: 'Status Tutor', type: 'select', required: false },
      { name: 'trn', label: 'ERN (Educator Registration Number)', type: 'text', required: false },
      { name: 'namaLengkap', label: 'Nama Lengkap', type: 'text', required: false },
      { name: 'namaPanggilan', label: 'Nama Panggilan', type: 'text', required: false },
      { name: 'tanggalLahir', label: 'Tanggal Lahir', type: 'date', required: false },
      { name: 'jenisKelamin', label: 'Jenis Kelamin', type: 'select', required: false },
      { name: 'agama', label: 'Agama', type: 'select', required: false },
      { name: 'email', label: 'Email Aktif', type: 'email', required: true },
      { name: 'noHp1', label: 'No. HP (WhatsApp)', type: 'tel_split', required: false },
      { name: 'noHp2', label: 'No. HP Alternatif (Opsional)', type: 'tel_split', required: false },
      { name: 'headline', label: 'Headline/Tagline Tutor', type: 'text', required: false },
      { name: 'deskripsiDiri', label: 'Deskripsi Diri/Bio Tutor', type: 'textarea', required: false },
      { name: 'motivasiMenjadiTutor', label: 'Motivasi Menjadi Tutor', type: 'textarea', required: false },
      { name: 'socialMedia1', label: 'Link Media Sosial 1 (Opsional)', type: 'text', required: false },
      { name: 'socialMedia2', label: 'Link Media Sosial 2 (Opsional)', type: 'text', required: false },
      { name: 'provinsiDomisili', label: 'Provinsi', type: 'select', required: false },
      { name: 'kotaKabupatenDomisili', label: 'Kota/Kabupaten', type: 'select', required: false },
      { name: 'kecamatanDomisili', label: 'Kecamatan', type: 'text', required: false },
      { name: 'kelurahanDomisili', label: 'Kelurahan/Desa', type: 'text', required: false },
      { name: 'alamatLengkapDomisili', label: 'Alamat Lengkap/Nama Jalan', type: 'textarea', required: false },
      { name: 'kodePosDomisili', label: 'Kode Pos', type: 'text', required: false },
      { name: 'namaNasabah', label: 'Nama Pemilik Rekening', type: 'text', required: false },
      { name: 'nomorRekening', label: 'Nomor Rekening', type: 'text', required: false },
      { name: 'namaBank', label: 'Nama Bank', type: 'select', required: false },
      { name: 'statusAkademik', label: 'Status Akademik Saat Ini', type: 'select', required: false },
      { name: 'namaUniversitas', label: 'Nama Universitas / Institusi', type: 'text', required: false },
      { name: 'fakultas', label: 'Fakultas', type: 'text', required: false },
      { name: 'jurusan', label: 'Jurusan / Program Studi', type: 'text', required: false },
      { name: 'ipk', label: 'IPK Terakhir', type: 'text', required: false },
      { name: 'tahunMasuk', label: 'Tahun Masuk', type: 'select', required: false },
      { name: 'tahunLulus', label: 'Tahun Lulus', type: 'select', required: false },
      { name: 'namaSMA', label: 'Nama SMA / SMK / Sederajat', type: 'text', required: false },
      { name: 'jurusanSMA', label: 'Jurusan', type: 'select', required: false },
      { name: 'tahunLulusSMA', label: 'Tahun Lulus', type: 'select', required: false },
      { name: 'keahlianSpesialisasi', label: 'Keahlian & Spesialisasi', type: 'textarea', required: false },
      { name: 'keahlianLainnya', label: 'Keahlian Lainnya (jika ada)', type: 'textarea', required: false },
      { name: 'pengalamanMengajar', label: 'Pengalaman Mengajar', type: 'textarea', required: false },
      { name: 'pengalamanLainRelevan', label: 'Pengalaman Lain yang Relevan', type: 'textarea', required: false },
      { name: 'prestasiAkademik', label: 'Prestasi Akademik', type: 'textarea', required: false },
      { name: 'prestasiNonAkademik', label: 'Prestasi Non-Akademik', type: 'textarea', required: false },
      { name: 'sertifikasiPelatihan', label: 'Sertifikasi & Pelatihan', type: 'textarea', required: false },
      { name: 'selectedPrograms', label: '📚 Pilih Program/Mata Pelajaran yang Diajarkan', type: 'checkbox', required: false },
      { name: 'mataPelajaranLainnya', label: '📝 Mata Pelajaran Lainnya (Jika Tidak Ditemukan)', type: 'textarea', required: false },
      { name: 'teaching_radius_km', label: 'Radius Area Mengajar (KM)', type: 'number', required: false },
      { name: 'transportasiTutor', label: 'Transportasi Mengajar', type: 'checkbox', required: false, multiple: true },
      { name: 'alamatTitikLokasi', label: 'Titik Pusat Area Target Mengajar', type: 'textarea', required: false },
      { name: 'location_notes', label: 'Preferensi Area Mengajar (Opsional)', type: 'textarea', required: false },
      { name: 'statusMenerimaSiswa', label: 'Status Availability', type: 'select', required: false, 
        options: [
          { value: 'available', label: 'available' },
          { value: 'limited', label: 'limited' },
          { value: 'unavailable', label: 'unavailable' },
          { value: 'leave', label: 'leave' }
        ]
      },
      { name: 'available_schedule', label: 'Jadwal Mingguan Tersedia', type: 'checkbox', required: false },
      { name: 'teaching_methods', label: 'Metode Pengajaran', type: 'checkbox', required: false },
      { name: 'hourly_rate', label: 'Ekspektasi Fee Minimal Per Jam', type: 'number', required: false, min: 25000, max: 1000000 },
      { name: 'maksimalSiswaBaru', label: 'Maksimal Siswa Baru per Minggu', type: 'number', required: false },
      { name: 'maksimalTotalSiswa', label: 'Maksimal Total Siswa', type: 'number', required: false },
      { name: 'usiaTargetSiswa', label: 'Usia Target Siswa', type: 'checkbox', required: false },
      { name: 'catatanAvailability', label: 'Catatan Availability', type: 'textarea', required: false },
      { name: 'teachingMethods', label: 'Gaya Pembelajaran yang Dikuasai', type: 'checkbox', required: false },
      { name: 'studentLevelPreferences', label: 'Preferensi Level Kemampuan Siswa', type: 'checkbox', required: false },
      { name: 'specialNeedsCapable', label: 'Mampu Mengajar Siswa Berkebutuhan Khusus', type: 'select', required: false },
      { name: 'groupClassWilling', label: 'Bersedia Mengajar Kelas Grup', type: 'select', required: false },
      { name: 'onlineTeachingCapable', label: 'Kemampuan Mengajar Online', type: 'select', required: false },
      { name: 'techSavviness', label: 'Tingkat Melek Teknologi', type: 'select', required: false },
      { name: 'gmeetExperience', label: 'Pengalaman Google Meet/Zoom', type: 'select', required: false },
      { name: 'presensiUpdateCapability', label: 'Kemampuan Update Presensi Online', type: 'select', required: false },
      { name: 'tutorPersonalityType', label: 'Tipe Kepribadian Tutor', type: 'checkbox', required: false },
      { name: 'communicationStyle', label: 'Gaya Komunikasi', type: 'checkbox', required: false },
      { name: 'teachingPatienceLevel', label: 'Level Kesabaran Mengajar (1-10)', type: 'select', required: false },
      { name: 'studentMotivationAbility', label: 'Kemampuan Memotivasi Siswa (1-10)', type: 'select', required: false },
      { name: 'scheduleFlexibilityLevel', label: 'Level Fleksibilitas Jadwal (3-10)', type: 'select', required: false },
      { name: 'emergencyContactName', label: 'Nama Kontak Darurat', type: 'text', required: false },
      { name: 'emergencyContactRelationship', label: 'Hubungan dengan Kontak Darurat', type: 'select', required: false },
      { name: 'emergencyContactPhone', label: 'Nomor HP Kontak Darurat', type: 'tel_split', required: false }
    ];
    
    essentialFields.forEach(field => {
      fieldMap.push({
        field,
        csvColumn: field.label // Default CSV column name
      });
    });
    
    return fieldMap;
  };

  // Generate CSV template based on form config
  const downloadCSVTemplate = () => {
    const fieldMapping = generateFieldMapping();
    
    // Create CSV headers
    const headers = fieldMapping.map(({ field }) => field.label);
    
    // Create sample data row with examples
    const sampleRow = fieldMapping.map(({ field }) => {
      switch (field.type) {
        case 'email':
          return 'contoh@gmail.com';
        case 'tel':
        case 'tel_split':
          return '6281234567890';
        case 'number':
          return field.name.includes('tarif') ? '75000' : 
                 field.name.includes('ipk') ? '3.75' : 
                 field.name.includes('tahun') ? '2023' : '1';
        case 'date':
          return '2000-01-15';
        case 'checkbox':
          return 'Option 1, Option 2';
        case 'select':
          return field.options && field.options.length > 0 ? field.options[0].label : 'Pilih Opsi';
        case 'textarea':
          return 'Contoh deskripsi atau penjelasan...';
        case 'switch':
          return 'Ya';
        default:
          return `Contoh ${field.label}`;
      }
    });
    
    // Generate CSV content
    const csvContent = [
      headers.join(','),
      sampleRow.map(value => `"${value}"`).join(',')
    ].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tutor_import_template_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Template Downloaded",
      description: "CSV template has been downloaded. Use this as a reference for your data import.",
      duration: 3000,
    });
  };

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
    console.log(`🔄 Parsing file: ${file.name} (${fileExtension})`);
    
    switch (fileExtension) {
      case 'csv':
        return new Promise((resolve, reject) => {
          console.log('📄 Starting CSV parsing with Papa Parse...');
          
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            encoding: 'UTF-8',
            transform: (value: string) => {
              // Clean up line breaks and extra whitespace
              return value.replace(/\r?\n|\r/g, ' ').trim();
            },
            complete: (results: Papa.ParseResult<any>) => {
              console.log('📊 CSV Parse Results:', {
                rowCount: results.data?.length || 0,
                errorCount: results.errors?.length || 0,
                hasData: !!results.data,
                meta: results.meta,
                firstRow: results.data?.[0] || null
              });
              
              if (results.errors && results.errors.length > 0) {
                console.error('❌ CSV parsing errors:', results.errors);
                const criticalErrors = results.errors.filter(err => err.type === 'Delimiter' || err.type === 'Quotes');
                
                if (criticalErrors.length > 0) {
                  const errorDetails = criticalErrors.map(err => 
                    `Row ${err.row || 'unknown'}: ${err.message} (Code: ${err.code || 'unknown'})`
                  ).join('\n');
                  reject(new Error(`Critical CSV parsing errors:\n${errorDetails}`));
                  return;
                }
                
                // Log warnings but continue processing
                console.warn('⚠️ CSV parsing warnings (continuing):', results.errors);
              }
              
              if (!results.data || results.data.length === 0) {
                reject(new Error('CSV file appears to be empty or contains no valid data rows. Please check your file format.'));
                return;
              }
              
              // Check if first row has headers
              const firstRow = results.data[0];
              const headers = Object.keys(firstRow);
              console.log('📋 CSV Headers detected:', headers);
              
              if (headers.length === 0) {
                reject(new Error('CSV file has no headers. Please ensure the first row contains column names.'));
                return;
              }
              
              console.log(`✅ Successfully parsed ${results.data.length} rows from CSV with ${headers.length} columns`);
              resolve(results.data as any[]);
            },
            error: (error: Error) => {
              console.error('❌ Papa Parse Error:', error);
              reject(new Error(`Failed to parse CSV file: ${error.message}. Please check if the file is properly formatted.`));
            }
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
                    const objects = rows.map((row: any[]) => {
        const obj: Record<string, any> = {};
        headers.forEach((header: string, index: number) => {
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

  // Apply column mapping and validation using form config
  const processData = async (rawData: any[]): Promise<ParsedRecord[]> => {
    // Get field mapping from form config
    const fieldMapping = generateFieldMapping();
    
    console.log('Processing data with field mapping:', fieldMapping.map(f => f.field.label));
    console.log('Available columns in CSV:', Object.keys(rawData[0] || {}));
    
    const processedResults: ParsedRecord[] = [];
    
    for (let index = 0; index < rawData.length; index++) {
      const row = rawData[index];
      const mappedData: Record<string, any> = {};
      const errors: string[] = [];
      const warnings: string[] = [];

      console.log(`Processing row ${index + 1}:`, row);

              // Apply field mappings based on form config
        fieldMapping.forEach(({ field, csvColumn }) => {
          // Try multiple variations of column names for CSV import
          const possibleColumns = [
            csvColumn,
            field.label,
            field.name,
            field.label.toLowerCase(),
            field.label.replace(/\s+/g, ''),
            field.label.replace(/\s+/g, '_'),
            field.label.replace(/\s+/g, '-'),
            // Additional common variations for import
            field.label.replace(/\([^)]*\)/g, '').trim(), // Remove parentheses
            field.label.replace(/\//g, ' '), // Replace slashes with spaces
            field.label.replace(/\//g, '_'), // Replace slashes with underscores
            field.label.replace(/\s+/g, '').toLowerCase(), // Lowercase no spaces
            field.label.replace(/[^\w\s]/g, '').trim(), // Remove special characters
            // NEW: Remove emojis for better CSV matching
            field.label.replace(/[\ud83c\udf00-\udfff]|[\ud83d\udc00-\ude4f]|[\ud83d\ude80-\udeff]|[\ud7c9\ude00-\ude5f]|[\ud83e\udd10-\uddff]|[\u2600-\u26ff]|[\u2700-\u27bf]/g, '').trim(), // Remove all emojis
            field.label.replace(/📚\s*/, '').trim(), // Remove book emoji 📚
            field.label.replace(/📝\s*/, '').trim(), // Remove memo emoji 📝
            field.label.replace(/Pilih\s*/, '').trim(), // Remove 'Pilih' prefix
            // Specific fixes for program field
            field.name === 'selectedPrograms' ? 'Program/Mata Pelajaran yang Diajarkan' : null,
            field.name === 'selectedPrograms' ? 'Program Mata Pelajaran yang Diajarkan' : null,
            field.name === 'selectedPrograms' ? 'Mata Pelajaran yang Diajarkan' : null
          ].filter(col => col !== null); // Remove null entries
        
        let sourceValue = undefined;
        let usedColumn = '';
        
        // Find the first matching column
        for (const colName of possibleColumns) {
          if (row[colName] !== undefined) {
            sourceValue = row[colName];
            usedColumn = colName;
            break;
          }
        }
        
        // DEBUG: Special logging for selectedPrograms field
        if (field.name === 'selectedPrograms') {
          console.log(`🔍 DEBUG selectedPrograms mapping:`, {
            fieldName: field.name,
            fieldLabel: field.label,
            availableColumns: Object.keys(row),
            possibleColumns: possibleColumns,
            sourceValue: sourceValue,
            usedColumn: usedColumn,
            foundMatch: sourceValue !== undefined
          });
        }

        if (sourceValue !== undefined && sourceValue !== '') {
          try {
            // Apply transformations based on field type
            const transformedValue = transformValue(sourceValue, field.name, field.type);
            mappedData[field.name] = transformedValue;
            console.log(`✅ Mapped ${field.label}: "${sourceValue}" → "${transformedValue}" (from column: ${usedColumn})`);
          } catch (err) {
            const errorMsg = `Error transforming ${field.label}: ${err instanceof Error ? err.message : 'Unknown error'}`;
            errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }
        } else if (field.required) {
          const errorMsg = `Required field '${field.label}' is missing or empty (tried columns: ${possibleColumns.join(', ')})`;
          errors.push(errorMsg);
          console.warn(`⚠️ ${errorMsg}`);
        } else {
          console.log(`⏭️ Skipped optional field ${field.label} (empty or not found)`);
        }
      });

      // ===== ENHANCED LOCATION VALIDATION =====
      // Validate province field with fuzzy matching
      if (mappedData.provinsiDomisili) {
        console.log(`🗺️ Validating province for row ${index + 1}:`, mappedData.provinsiDomisili);
        const provinceValidation = await validateLocationField(
          mappedData.provinsiDomisili, 
          'provinsiDomisili'
        );
        
        console.log(`🗺️ Province validation result:`, {
          isValid: provinceValidation.isValid,
          transformedValue: provinceValidation.transformedValue,
          hasAutoFix: !!provinceValidation.autoFix,
          error: provinceValidation.error
        });
        
        if (provinceValidation.autoFix) {
          mappedData.provinsiDomisili = provinceValidation.transformedValue;
          console.log(`🗺️ Auto-fixed province:`, provinceValidation.transformedValue);
          if (provinceValidation.error) {
            warnings.push(`🔧 ${provinceValidation.error}`);
          }
        } else if (!provinceValidation.isValid) {
          // For CSV import, treat province validation as warning, not error
          console.warn(`⚠️ Province: ${provinceValidation.error}`);
          if (provinceValidation.suggestions.length > 0) {
            const suggestions = provinceValidation.suggestions.slice(0, 2)
              .map(s => `${s.name} (${s.similarity}%)`)
              .join(', ');
            console.warn(`⚠️ Province suggestions: ${suggestions}`);
          }
        } else if (provinceValidation.transformedValue) {
          // Valid without auto-fix
          mappedData.provinsiDomisili = provinceValidation.transformedValue;
          console.log(`🗺️ Valid province (no fix needed):`, provinceValidation.transformedValue);
        }
      }
      
      // Validate city field with fuzzy matching (depends on province)
      if (mappedData.kotaKabupatenDomisili) {
        console.log(`🏢 Validating city for row ${index + 1}:`, mappedData.kotaKabupatenDomisili, 'in province:', mappedData.provinsiDomisili);
        const cityValidation = await validateLocationField(
          mappedData.kotaKabupatenDomisili, 
          'kotaKabupatenDomisili',
          mappedData.provinsiDomisili // Use validated province ID
        );
        
        console.log(`🏢 City validation result:`, {
          isValid: cityValidation.isValid,
          transformedValue: cityValidation.transformedValue,
          hasAutoFix: !!cityValidation.autoFix,
          error: cityValidation.error
        });
        
        if (cityValidation.autoFix) {
          mappedData.kotaKabupatenDomisili = cityValidation.transformedValue;
          console.log(`🏢 Auto-fixed city:`, cityValidation.transformedValue);
          if (cityValidation.error) {
            warnings.push(`🔧 ${cityValidation.error}`);
          }
        } else if (!cityValidation.isValid) {
          errors.push(`City: ${cityValidation.error}`);
          if (cityValidation.suggestions.length > 0) {
            const suggestions = cityValidation.suggestions.slice(0, 2)
              .map(s => `${s.name} (${s.similarity}%)`)
              .join(', ');
            errors.push(`Suggestions: ${suggestions}`);
          }
        } else if (cityValidation.transformedValue) {
          // Valid without auto-fix
          mappedData.kotaKabupatenDomisili = cityValidation.transformedValue;
          console.log(`🏢 Valid city (no fix needed):`, cityValidation.transformedValue);
        }
      }
      
      // ===== DEBUG: Check if selectedPrograms was mapped =====
      console.log(`🔍 Row ${index + 1} - selectedPrograms check:`, {
        exists: !!mappedData.selectedPrograms,
        value: mappedData.selectedPrograms,
        type: typeof mappedData.selectedPrograms,
        allMappedKeys: Object.keys(mappedData)
      });
      
      // ===== ENHANCED SUBJECT VALIDATION =====
      if (mappedData.selectedPrograms) {
        console.log(`📚 Validating subjects for row ${index + 1}:`, mappedData.selectedPrograms);
        const subjectValidation = await validateSubjectField(mappedData.selectedPrograms);
        
        console.log(`📚 Subject validation result:`, {
          isValid: subjectValidation.isValid,
          transformedValue: subjectValidation.transformedValue,
          hasAutoFix: !!subjectValidation.autoFix,
          error: subjectValidation.error
        });
        
        if (subjectValidation.autoFix) {
          mappedData.selectedPrograms = subjectValidation.transformedValue;
          console.log(`📚 Auto-fixed subjects:`, subjectValidation.transformedValue);
          if (subjectValidation.error) {
            warnings.push(`📚 ${subjectValidation.error}`);
          }
        } else if (!subjectValidation.isValid) {
          // For CSV import, treat subject validation as warning, not error
          console.warn(`⚠️ Subjects: ${subjectValidation.error}`);
          if (subjectValidation.suggestions.length > 0) {
            const suggestions = subjectValidation.suggestions.slice(0, 2)
              .map(s => `${s.name} (${s.similarity}%)`)
              .join(', ');
            console.warn(`⚠️ Subject suggestions: ${suggestions}`);
          }
          
          // FALLBACK: For CSV import, try to save original program names as text
          // This ensures data isn't lost even if fuzzy matching fails
          if (mappedData.selectedPrograms) {
            const originalPrograms = Array.isArray(mappedData.selectedPrograms) 
              ? mappedData.selectedPrograms 
              : [mappedData.selectedPrograms];
            console.log(`📚 Fallback: Saving original program names:`, originalPrograms);
            mappedData.selectedPrograms = originalPrograms; // Keep original names for now
          }
        } else if (subjectValidation.transformedValue) {
          // Valid without auto-fix
          mappedData.selectedPrograms = subjectValidation.transformedValue;
          console.log(`📚 Valid subjects (no fix needed):`, subjectValidation.transformedValue);
        }
      }
      
      // ===== ENHANCED BANK VALIDATION =====
      if (mappedData.namaBank) {
        const bankValidation = await validateBankField(mappedData.namaBank);
        
        if (bankValidation.autoFix) {
          mappedData.namaBank = bankValidation.transformedValue;
          if (bankValidation.error) {
            warnings.push(`🏦 ${bankValidation.error}`);
          }
        } else if (!bankValidation.isValid) {
          // For CSV import, treat bank validation as warning, not error
          console.warn(`⚠️ Bank: ${bankValidation.error}`);
          if (bankValidation.suggestions.length > 0) {
            const suggestions = bankValidation.suggestions.slice(0, 2)
              .map(s => `${s.name} (${s.similarity}%)`)
              .join(', ');
            console.warn(`⚠️ Bank suggestions: ${suggestions}`);
          }
        }
      }

      // Standard validation for other fields
      const validationErrors = validateRecord(mappedData);
      errors.push(...validationErrors);

      const result = {
        rowNumber: index + 1,
        originalData: row,
        mappedData,
        isValid: errors.length === 0,
        errors,
        warnings
      };

      console.log(`🔍 Row ${index + 1} DETAILED result:`, {
        isValid: result.isValid,
        errorCount: result.errors.length,
        warningCount: result.warnings.length,
        errors: result.errors,
        warnings: result.warnings,
        mappedFieldCount: Object.keys(result.mappedData).length,
        mappedFields: Object.keys(result.mappedData),
        originalRowKeys: Object.keys(row),
        hasEmail: !!result.mappedData.email,
        emailValue: result.mappedData.email
      });
      
      // Log specific validation failures
      if (!result.isValid) {
        console.error(`❌ Row ${index + 1} FAILED validation:`, {
          totalErrors: result.errors.length,
          errorDetails: result.errors,
          mappedData: result.mappedData
        });
      } else {
        console.log(`✅ Row ${index + 1} PASSED validation successfully`);
      }

      processedResults.push(result);
    }
    
    return processedResults;
  };

  // Transform values based on field type from form config
  const transformValue = (value: any, fieldName: string, fieldType: string): any => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    switch (fieldType) {
      case 'email':
        return String(value).toLowerCase().trim();
        
      case 'tel':
      case 'tel_split':
        // Format phone number (remove spaces, format to Indonesian standard)
        let cleaned = String(value).replace(/[\s\-\(\)\.\+]/g, '');
        if (cleaned.startsWith('0')) {
          cleaned = '62' + cleaned.slice(1);
        } else if (cleaned.startsWith('8')) {
          cleaned = '62' + cleaned;
        } else if (!cleaned.startsWith('62')) {
          cleaned = '62' + cleaned;
        }
        return cleaned;
        
      case 'number':
        const num = parseFloat(String(value).replace(/[^\d.-]/g, ''));
        return isNaN(num) ? null : num;
        
      case 'date':
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
        
      case 'checkbox':
        // Handle array fields (subjects, methods, etc.)
        if (typeof value === 'string') {
          return value.split(/[,;|]/).map(v => v.trim()).filter(v => v);
        }
        return Array.isArray(value) ? value : [value];
        
      case 'switch':
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase();
          return lowerValue === 'true' || lowerValue === 'yes' || lowerValue === '1' || lowerValue === 'ya';
        }
        return false;
        
      case 'select':
      case 'radio':
        return String(value).trim();
        
      case 'textarea':
        return String(value).trim();
        
      default:
        return String(value).trim();
    }
  };

  // Load all data for fuzzy matching
  const loadAllData = async () => {
    try {
      console.log('🌍 Loading all reference data for fuzzy matching...');
      
      // Load data in parallel for better performance
      const [
        provincesResponse,
        citiesResponse,
        subjectsResponse,
        banksResponse,
        categoriesResponse
      ] = await Promise.all([
        fetch('/api/locations/provinces'),
        fetch('/api/locations/cities'),
        fetch('/api/programs/lookup'),
        fetch('/api/banks/indonesia?limit=1000'),
        fetch('/api/subjects/simple-categories')
      ]);
      
      // Parse provinces
      const provincesData = await provincesResponse.json();
      const provinces = provincesData.provinces?.map((p: any) => ({
        id: p.value,
        name: p.label,
        local_name: p.local_name
      })) || [];
      
      // Parse cities
      const citiesData = await citiesResponse.json();
      const cities = citiesData.cities?.map((c: any) => ({
        id: c.value,
        name: c.label,
        local_name: c.local_name,
        province_id: c.province_id
      })) || [];
      
      // Parse subjects/programs
      const subjectsData = await subjectsResponse.json();
      console.log('📚 Raw subjects API response:', subjectsData);
      
      const subjects = subjectsData.success && subjectsData.data ? 
        subjectsData.data.map((s: any) => ({
          id: s.id,
          name: s.program_name_local || s.program_name,
          local_name: s.program_name,
          alternate_name: s.subject_focus || s.program_code
        })) : [];
      
      console.log('📚 Processed subjects for fuzzy matching:', subjects.slice(0, 3));
      
      // Parse banks
      const banksData = await banksResponse.json();
      const banks = banksData.data?.map((b: any) => ({
        id: b.value,
        name: b.label, // popular_bank_name
        local_name: b.fullName, // bank_name
        alternate_name: b.code // bank_code
      })) || [];
      
      // Parse categories
      const categoriesData = await categoriesResponse.json();
      const categories = categoriesData.categories?.map((c: any) => ({
        id: c.id,
        name: c.label,
        local_name: c.code,
        alternate_name: c.description
      })) || [];
      
      setDataCache({ provinces, cities, subjects, banks, categories });
      
      console.log(`✅ Successfully loaded reference data:`, {
        provinces: provinces.length,
        cities: cities.length,
        subjects: subjects.length,
        banks: banks.length,
        categories: categories.length
      });
      
    } catch (error) {
      console.error('❌ Failed to load reference data:', error);
      toast({
        title: "Warning",
        description: "Failed to load reference data. Validation may be limited.",
        variant: "destructive",
      });
    }
  };

  // Enhanced location validation with fuzzy matching
  const validateLocationField = async (
    value: string, 
    fieldName: string, 
    provinceId?: string
  ): Promise<{
    isValid: boolean;
    transformedValue: string | null;
    suggestions: LocationMatch[];
    autoFix?: string;
    error?: string;
  }> => {
    if (!value || value.trim() === '') {
      return { isValid: true, transformedValue: null, suggestions: [] };
    }

    const cleanValue = value.trim();
    
    // Determine if this is province or city field
    const isProvinceField = fieldName.toLowerCase().includes('provinsi');
    const locationData = isProvinceField ? dataCache.provinces : dataCache.cities;
    
    // Filter cities by province if provided and we're validating city
    const filteredData = !isProvinceField && provinceId 
      ? dataCache.cities.filter(city => city.province_id === provinceId)
      : locationData;
    
    if (filteredData.length === 0) {
      // If no location data loaded, fallback to basic validation
      return { 
        isValid: false, 
        transformedValue: null, 
        suggestions: [],
        error: `Location data not available for validation`
      };
    }

    // Use fuzzy matching to find best matches
    const matches = findBestLocationMatches(
      cleanValue, 
      filteredData, 
      isProvinceField ? 'provinces' : 'cities'
    );

    if (matches.length === 0) {
      return {
        isValid: false,
        transformedValue: null,
        suggestions: [],
        error: `No matching ${isProvinceField ? 'province' : 'city'} found for "${cleanValue}"`
      };
    }

    const bestMatch = matches[0];
    
    // Auto-accept if similarity is very high (95%+)
    if (bestMatch.similarity >= 95) {
      return {
        isValid: true,
        transformedValue: bestMatch.id,
        suggestions: matches.slice(0, 3), // Top 3 suggestions
        autoFix: bestMatch.id
      };
    }
    
    // Accept with warning if similarity is high (85%+)
    if (bestMatch.similarity >= 85) {
      return {
        isValid: true,
        transformedValue: bestMatch.id,
        suggestions: matches.slice(0, 3),
        autoFix: bestMatch.id,
        error: `Auto-corrected "${cleanValue}" to "${bestMatch.name}" (${bestMatch.similarity}% match)`
      };
    }
    
    // Smart auto-accept for reasonable matches (60%+) - especially if it's the clear best option
    if (bestMatch.similarity >= 60 && (matches.length === 1 || bestMatch.similarity > matches[1]?.similarity + 10)) {
      return {
        isValid: true,
        transformedValue: bestMatch.id,
        suggestions: matches.slice(0, 3),
        autoFix: bestMatch.id,
        error: `Auto-selected "${cleanValue}" → "${bestMatch.name}" (${bestMatch.similarity}% confidence)`
      };
    }
    
    // Accept moderate matches (50%+) but with lower confidence note
    if (bestMatch.similarity >= 50) {
      return {
        isValid: true,
        transformedValue: bestMatch.id,
        suggestions: matches.slice(0, 3),
        autoFix: bestMatch.id,
        error: `Best guess: "${cleanValue}" → "${bestMatch.name}" (${bestMatch.similarity}% confidence)`
      };
    }
    
    // Reject if similarity is too low
    return {
      isValid: false,
      transformedValue: null,
      suggestions: matches.slice(0, 3),
      error: `"${cleanValue}" not found. Did you mean: ${matches.slice(0, 2).map(m => m.name).join(', ')}?`
    };
  };

  // Enhanced subject validation with fuzzy matching
  const validateSubjectField = async (
    value: string | string[]
  ): Promise<{
    isValid: boolean;
    transformedValue: string[] | null;
    suggestions: FieldMatch[];
    autoFix?: string[];
    error?: string;
  }> => {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      return { isValid: true, transformedValue: null, suggestions: [] };
    }

    const subjects = Array.isArray(value) ? value : [value];
    const validatedSubjects: string[] = [];
    const allSuggestions: FieldMatch[] = [];
    const errors: string[] = [];
    let hasAutoFix = false;

    console.log(`📚 Available subjects in cache: ${dataCache.subjects.length}`);
    if (dataCache.subjects.length === 0) {
      console.error('❌ No subjects loaded in dataCache! This will cause validation failures.');
    }
    
    for (const subject of subjects) {
      const cleanSubject = subject.trim();
      if (!cleanSubject) continue;

      console.log(`📚 Searching for subject: "${cleanSubject}" in ${dataCache.subjects.length} available subjects`);
      const matches = findBestSubjectMatches(cleanSubject, dataCache.subjects);
      console.log(`📚 Found ${matches.length} matches for "${cleanSubject}":`, matches.slice(0, 2));
      
      if (matches.length === 0) {
        errors.push(`Subject "${cleanSubject}" not found`);
        continue;
      }

      const bestMatch = matches[0];
      
      // Auto-accept high similarity
      if (bestMatch.similarity >= 85) {
        validatedSubjects.push(bestMatch.id);
        if (bestMatch.similarity < 95) {
          hasAutoFix = true;
        }
      } 
      // Smart auto-accept for reasonable matches (60%+) - especially if it's the clear best option
      else if (bestMatch.similarity >= 60 && (matches.length === 1 || bestMatch.similarity > matches[1]?.similarity + 10)) {
        validatedSubjects.push(bestMatch.id);
        hasAutoFix = true; // Mark as auto-fix to show confidence level
      } 
      // Accept moderate matches (50%+) but with lower confidence note
      else if (bestMatch.similarity >= 50) {
        validatedSubjects.push(bestMatch.id);
        hasAutoFix = true; // Mark as auto-fix to show confidence level
      } 
      // Only reject very low similarity
      else {
        errors.push(`Subject "${cleanSubject}" not found. Suggestions: ${matches.slice(0, 2).map(m => m.name).join(', ')}`);
        allSuggestions.push(...matches.slice(0, 2));
      }
    }

    return {
      isValid: errors.length === 0,
      transformedValue: validatedSubjects.length > 0 ? validatedSubjects : null,
      suggestions: allSuggestions,
      autoFix: hasAutoFix ? validatedSubjects : undefined,
      error: errors.length > 0 ? errors.join('; ') : undefined
    };
  };

  // Enhanced bank validation with fuzzy matching
  const validateBankField = async (
    value: string
  ): Promise<{
    isValid: boolean;
    transformedValue: string | null;
    suggestions: FieldMatch[];
    autoFix?: string;
    error?: string;
  }> => {
    if (!value || value.trim() === '') {
      return { isValid: true, transformedValue: null, suggestions: [] };
    }

    const cleanValue = value.trim();
    const matches = findBestBankMatches(cleanValue, dataCache.banks);

    if (matches.length === 0) {
      return {
        isValid: false,
        transformedValue: null,
        suggestions: [],
        error: `Bank "${cleanValue}" not found`
      };
    }

    const bestMatch = matches[0];
    
    // Auto-accept high similarity
    if (bestMatch.similarity >= 85) {
      return {
        isValid: true,
        transformedValue: bestMatch.id,
        suggestions: matches.slice(0, 3),
        autoFix: bestMatch.id,
        error: bestMatch.similarity < 95 ? `Auto-corrected "${cleanValue}" to "${bestMatch.name}" (${bestMatch.similarity}% match)` : undefined
      };
    } 
    
    // Smart auto-accept for reasonable matches (60%+) - especially if it's the clear best option
    if (bestMatch.similarity >= 60 && (matches.length === 1 || bestMatch.similarity > matches[1]?.similarity + 10)) {
      return {
        isValid: true,
        transformedValue: bestMatch.id,
        suggestions: matches.slice(0, 3),
        autoFix: bestMatch.id,
        error: `Auto-selected "${cleanValue}" → "${bestMatch.name}" (${bestMatch.similarity}% confidence)`
      };
    }
    
    // Accept moderate matches (50%+) but with lower confidence note
    if (bestMatch.similarity >= 50) {
      return {
        isValid: true,
        transformedValue: bestMatch.id,
        suggestions: matches.slice(0, 3),
        autoFix: bestMatch.id,
        error: `Best guess: "${cleanValue}" → "${bestMatch.name}" (${bestMatch.similarity}% confidence)`
      };
    }
    
    // Only reject if very low similarity
    return {
      isValid: false,
      transformedValue: null,
      suggestions: matches.slice(0, 3),
      error: `Bank "${cleanValue}" not found. Did you mean: ${matches.slice(0, 2).map(m => m.name).join(', ')}?`
    };
  };

  // Comprehensive validation based on form config (RELAXED FOR CSV IMPORT)
  const validateRecord = (record: Record<string, any>): string[] => {
    const errors: string[] = [];

    // Get all fields for validation
    const fieldMapping = generateFieldMapping();
    const allFields = fieldMapping.map(f => f.field);

    // For CSV import, only validate essential fields as required
    const essentialFields: string[] = []; // No fields are strictly required for CSV import testing
    
    console.log(`🔍 Validating record with ${Object.keys(record).length} mapped fields`);
    
    // If no fields were mapped at all, that's still valid for testing
    if (Object.keys(record).length === 0) {
      console.warn(`⚠️ No fields were mapped for this record, but allowing for CSV import testing`);
      return errors; // Return empty errors array - record is still valid
    }

    // Validate each field
    allFields.forEach(field => {
      const value = record[field.name];
      
      // Only require essential fields for CSV import
      const isEssentialRequired = essentialFields.includes(field.name);
      if (isEssentialRequired && (!value || (Array.isArray(value) && value.length === 0))) {
        errors.push(`${field.label} is required for import`);
        return;
      }

      // Skip validation if field is empty and not essential
      if (!value || value === '') return;

      try {
        // Type-specific validation
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              // For CSV import, treat invalid email as warning, not error
              console.warn(`⚠️ ${field.label}: Invalid email format - ${value}`);
              // Don't add to errors for CSV import, just log warning
            }
            break;
            
          case 'tel':
          case 'tel_split':
            const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
            const cleanPhone = String(value).replace(/[\s\-\(\)\.\+]/g, '');
            if (!phoneRegex.test(cleanPhone)) {
              // For CSV import, treat invalid phone as warning, not error
              console.warn(`⚠️ ${field.label}: Invalid phone number format - ${value}`);
              // Don't add to errors for CSV import, just log warning
            }
            break;
            
          case 'number':
            const num = parseFloat(value);
            if (isNaN(num)) {
              // For CSV import, treat invalid numbers as warnings, not errors
              console.warn(`⚠️ ${field.label}: Invalid number format - ${value}`);
            } else {
              if (field.min !== undefined && num < field.min) {
                console.warn(`⚠️ ${field.label}: Value ${num} is below minimum ${field.min}`);
              }
              if (field.max !== undefined && num > field.max) {
                console.warn(`⚠️ ${field.label}: Value ${num} is above maximum ${field.max}`);
              }
            }
            break;
            
          case 'date':
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              // For CSV import, treat invalid dates as warnings, not errors
              console.warn(`⚠️ ${field.label}: Invalid date format - ${value}`);
            }
            break;
            
          case 'select':
            if (field.options && field.options.length > 0) {
              const validValues = field.options.map(opt => opt.value);
              if (!validValues.includes(value)) {
                // For CSV import, treat invalid select as warning, not error
                console.warn(`⚠️ ${field.label}: Invalid option "${value}" selected. Valid options: ${validValues.join(', ')}`);
              }
            }
            break;
        }

        // Apply basic validation rules (RELAXED FOR CSV IMPORT)
        if (field.name === 'trn' && value) {
          if (!/^[A-Z0-9]+$/.test(value)) {
            console.warn(`⚠️ ${field.label}: ERN should contain only uppercase letters and numbers - ${value}`);
          }
          if (value.length < 8) {
            console.warn(`⚠️ ${field.label}: ERN should be at least 8 characters - ${value}`);
          }
        }
        
        if (field.name === 'ipk' && value) {
          if (value.includes(',')) {
            console.warn(`⚠️ ${field.label}: Use dot (.) as decimal separator, not comma (,) - ${value}`);
          }
          const numValue = parseFloat(value);
          if (numValue < 2.0 || numValue > 4.0) {
            console.warn(`⚠️ ${field.label}: Should be between 2.0 - 4.0 - ${value}`);
          }
        }
      } catch (err) {
        errors.push(`${field.label}: Validation error - ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    });

    return errors;
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['csv', 'xlsx', 'xls'];
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: "Please select a CSV or Excel file (.csv, .xlsx, .xls)",
        variant: "destructive",
        duration: 5000,
      });
      // Reset file input
      event.target.value = '';
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
        duration: 5000,
      });
      // Reset file input
      event.target.value = '';
      return;
    }

    console.log('📁 File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      extension: fileExtension,
      lastModified: new Date(file.lastModified)
    });

    setSelectedFile(file);
    setIsParsing(true);
    setParsedData([]);
    setShowPreview(false);
    setImportResult(null);

    try {
      console.log('🔄 Starting file parsing...');
      const rawData = await parseFile(file);
      
      if (rawData.length === 0) {
        throw new Error('The file appears to be empty or has no valid data rows.');
      }

      console.log('🔄 Processing parsed data...');
      const processedData = await processData(rawData);
      
      console.log('✅ Processing complete:', {
        totalRecords: processedData.length,
        validRecords: processedData.filter(r => r.isValid).length,
        invalidRecords: processedData.filter(r => !r.isValid).length,
        warningRecords: processedData.filter(r => r.warnings.length > 0).length
      });

      setParsedData(processedData);
      setShowPreview(true);

      // Show summary toast
      const validCount = processedData.filter(r => r.isValid).length;
      const invalidCount = processedData.filter(r => !r.isValid).length;
      
      toast({
        title: "File Processed Successfully",
        description: `Found ${processedData.length} records. ${validCount} valid, ${invalidCount} invalid.`,
        variant: validCount > 0 ? "default" : "destructive",
        duration: 5000,
      });

    } catch (error) {
      console.error('❌ File processing error:', error);
      
      // Show detailed error in console for debugging
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }

      toast({
        title: "Error Processing File",
        description: (
          <div className="space-y-2">
            <div className="font-medium">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </div>
            <div className="text-xs opacity-80">
              Check browser console (F12) for detailed debugging information.
            </div>
          </div>
        ),
        variant: "destructive",
        duration: 8000,
      });
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

    // ===== STEP 0: Find tutor role ID (same as add form) =====
    console.log('🔍 Finding tutor role ID...');
    
    let tutorRoleId = null;
    
    try {
      const possibleTableNames = ['t_340_01_01_roles', 'roles', 'user_roles', 'system_roles'];
      
      for (const tableName of possibleTableNames) {
        const testResult = await supabase
          ?.from(tableName)
          .select('*')
          .limit(5);
          
        if (testResult?.data && testResult.data.length > 0) {
          console.log(`✅ Found roles in table: ${tableName}`);
          
          // Try to find tutor role
          const possibleRoleNames = ['tutor', 'Tutor', 'TUTOR', 'educator', 'Educator'];
          
          for (const roleName of possibleRoleNames) {
            const roleResult = await supabase
              ?.from(tableName)
              .select('*')
              .eq('role_name', roleName)
              .single();
            
            if (roleResult?.data?.id) {
              tutorRoleId = roleResult.data.id;
              console.log(`✅ Found tutor role ID: ${tutorRoleId}`);
              break;
            }
          }
          
          if (tutorRoleId) break;
          
          // Fallback: use first role
          if (testResult.data[0]?.id) {
            tutorRoleId = testResult.data[0].id;
            console.log(`⚠️ Using first available role as fallback: ${tutorRoleId}`);
            break;
          }
        }
      }
      
      if (!tutorRoleId) {
        // Create a default UUID for testing
        tutorRoleId = 'default-tutor-role-id';
        console.warn('⚠️ Using default role ID for testing');
      }
      
    } catch (roleError) {
      console.error('❌ Error finding role:', roleError);
      tutorRoleId = 'default-tutor-role-id';
      console.warn('⚠️ Using default role ID due to error');
    }

    for (let i = 0; i < validRecords.length; i++) {
      const record = validRecords[i];
      
      try {
        // ===== STEP 1: Prepare data for relational insertion (same as add form) =====
        
        // TRN akan di-generate otomatis oleh database trigger jika kosong
        const trn = record.mappedData.trn || null; // Pass null jika kosong, database akan generate
        
        // Phone number formatting (same as add form)
        const formatPhoneNumber = (phone: string): string => {
          if (!phone) return '';
          let cleaned = phone.replace(/[\s\-\(\)\.\+]/g, '');
          if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.slice(1);
          } else if (cleaned.startsWith('8')) {
            cleaned = '62' + cleaned;
          } else if (!cleaned.startsWith('62')) {
            cleaned = '62' + cleaned;
          }
          return cleaned;
        };

        // Generate password from birth date (same as add form)
        const generatePasswordFromBirthDate = (birthDate: string): string => {
          if (!birthDate) return 'EduPrima2024'; // Default password if no birth date
          try {
            const date = new Date(birthDate);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = String(date.getFullYear()).slice(-2);
            return `${day}${month}${year}`;
          } catch (error) {
            return 'EduPrima2024'; // Fallback password
          }
        };

        // Hash password (using simple method for import)
        const autoGeneratedPassword = generatePasswordFromBirthDate(record.mappedData.tanggalLahir || '');
        
        // Sanitize account number (same as add form)
        const sanitizeAccountNumber = (accountNumber: string): string => {
          if (!accountNumber) return '';
          // Remove all spaces, dashes, and non-numeric characters except dots
          return accountNumber.replace(/[\s\-\(\)\+]/g, '').replace(/[^0-9\.]/g, '');
        };
        
        console.log(`🔄 Processing row ${record.rowNumber} with ERN: ${trn || 'will be auto-generated'}`);
        console.log('Mapped data fields:', Object.keys(record.mappedData));

        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }

        // ===== STEP 2: Insert to users_universal (main table) =====
        const usersUniversalData = {
          user_code: trn || `TEMP${Date.now().toString().slice(-7)}`, // Temporary code jika TRN kosong
          email: record.mappedData.email,
          phone: formatPhoneNumber(record.mappedData.noHp1 || ''),
          password_hash: autoGeneratedPassword, // Simple password for import
          primary_role_id: tutorRoleId, // Dynamic role ID from database
          account_type: 'individual',
          user_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        console.log(`📝 Creating user with data:`, usersUniversalData);

        const userResult = await supabase
          .from('t_310_01_01_users_universal')
          .insert([usersUniversalData])
          .select('id, email, user_code')
          .single();

        if (userResult.error) {
          console.error(`❌ User creation failed for row ${record.rowNumber}:`, userResult.error);
          throw new Error(`User creation failed: ${userResult.error.message}`);
        }

        const userId = userResult.data.id;
        console.log(`✅ User created with ID: ${userId}`);

        // ===== STEP 3: Insert to user_profiles =====
        const userProfilesData = {
          user_id: userId,
          full_name: record.mappedData.namaLengkap || '',
          nick_name: record.mappedData.namaPanggilan || null,
          date_of_birth: record.mappedData.tanggalLahir || null,
          gender: record.mappedData.jenisKelamin || null,
          nationality: 'IDN',
          country_code: 'ID',
          address_line1: record.mappedData.alamatLengkapDomisili || null,
          // Keep text versions for backup (fuzzy IDs stored in educator_locations table)
          city: record.mappedData.kotaKabupatenDomisili || null,
          state_province: record.mappedData.provinsiDomisili || null,
          postal_code: record.mappedData.kodePosDomisili || null,
          mobile_phone: formatPhoneNumber(record.mappedData.noHp1 || ''),
          mobile_phone_2: record.mappedData.noHp2 ? formatPhoneNumber(record.mappedData.noHp2) : null,
          headline: record.mappedData.headline || null,
          bio: record.mappedData.deskripsiDiri || null,
          education_level: record.mappedData.statusAkademik || null,
          university: record.mappedData.namaUniversitas || null,
          major: record.mappedData.jurusan || null,
          graduation_year: record.mappedData.tahunLulus || null,
          gpa: record.mappedData.ipk || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const profileResult = await supabase
          .from('t_310_01_02_user_profiles')
          .insert([userProfilesData])
          .select('id')
          .single();

        if (profileResult.error) {
          console.error(`❌ Profile creation failed for row ${record.rowNumber}:`, profileResult.error);
          // Don't throw - continue with minimal data
          console.warn('⚠️ Continuing without full profile data');
        } else {
          console.log(`✅ Profile created for user ${userId}`);
        }

        // ===== STEP 4: Insert to educator_details (simplified) =====
        const educatorDetailsData = {
          user_id: userId,
          // Educator Registration Number - Pass null jika kosong, trigger akan generate
          educator_registration_number: trn, // Pass null jika kosong, database akan generate
          academic_status: record.mappedData.statusAkademik || null,
          university_s1_name: record.mappedData.namaUniversitas || null,
          faculty: record.mappedData.fakultas || null,
          major_s1: record.mappedData.jurusan || null,
          entry_year: record.mappedData.tahunMasuk ? parseInt(record.mappedData.tahunMasuk) : null,
          teaching_experience: record.mappedData.pengalamanMengajar || null,
          special_skills: record.mappedData.keahlianSpesialisasi || null,
          // Teaching Service Options - Map from teaching methods
          teaching_service_options: record.mappedData.teaching_methods || [],
          academic_achievements: record.mappedData.prestasiAkademik || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const educatorResult = await supabase
          .from('t_315_01_01_educator_details')
          .insert([educatorDetailsData])
          .select('id, educator_registration_number')
          .single();

        let generatedTRN = null;
        let educatorId = null;
        if (educatorResult.error) {
          console.error(`❌ Educator details failed for row ${record.rowNumber}:`, educatorResult.error);
          console.warn('⚠️ Continuing without educator details');
        } else {
          educatorId = educatorResult.data?.id;
          generatedTRN = educatorResult.data?.educator_registration_number;
          console.log(`✅ Educator details created for user ${userId}`);
          console.log(`✅ Generated ERN: ${generatedTRN}`);
        }

        // ===== STEP 5: Insert banking information (if provided) =====
        if (educatorId && record.mappedData.namaBank) {
          console.log(`🏦 Creating banking info for educator ${educatorId}...`);
          
          // Get bank name from bank ID (similar to add form)
          let bankName = 'Bank Indonesia'; // Default fallback
          try {
            if (record.mappedData.namaBank) {
              const bankResult = await supabase
                ?.from('t_120_02_01_banks_indonesia')
                .select('name, local_name')
                .eq('id', record.mappedData.namaBank)
                .single();
              
              if (bankResult?.data) {
                bankName = bankResult.data.local_name || bankResult.data.name || bankName;
              }
            }
          } catch (bankError) {
            console.warn('⚠️ Could not fetch bank name, using fallback');
          }

          const bankingData = {
            educator_id: educatorId,
            bank_id: record.mappedData.namaBank, // UUID from fuzzy matching
            bank_name: bankName,
            account_holder_name: record.mappedData.namaNasabah || record.mappedData.namaLengkap || '',
            account_number: sanitizeAccountNumber(record.mappedData.nomorRekening || ''),
            country_code: 'IDN',
            is_verified: false,
            total_payouts: 0,
            payout_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          const bankingResult = await supabase
            ?.from('t_460_02_04_educator_banking_info')
            .insert([bankingData])
            .select('id')
            .single();

          if (bankingResult?.error) {
            console.error(`❌ Banking info failed for row ${record.rowNumber}:`, bankingResult.error);
            console.warn('⚠️ Continuing without banking info');
          } else {
            console.log(`✅ Banking info created for educator ${educatorId}`);
          }
        }

        // ===== STEP 6: Insert address data (domicile) to CORRECT TABLE =====
        if (userId && (record.mappedData.provinsiDomisili || record.mappedData.kotaKabupatenDomisili)) {
          console.log(`🏠 Creating domicile address for user ${userId}...`);
          console.log(`🗺️ Province ID from fuzzy matching:`, record.mappedData.provinsiDomisili);
          console.log(`🏢 City ID from fuzzy matching:`, record.mappedData.kotaKabupatenDomisili);
          
          const addressData = {
            user_id: userId, // Link to users_universal (NOT educator_id)
            address_type: 'domicile',
            address_label: 'Alamat Domisili',
            province_id: record.mappedData.provinsiDomisili || null, // UUID from fuzzy matching
            city_id: record.mappedData.kotaKabupatenDomisili || null, // UUID from fuzzy matching
            district_name: record.mappedData.kecamatanDomisili || null,
            village_name: record.mappedData.kelurahanDomisili || null,
            street_address: record.mappedData.alamatLengkapDomisili || null,
            postal_code: record.mappedData.kodePosDomisili || null,
            is_primary: true,
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log(`🏠 Address data to insert:`, addressData);

          const addressResult = await supabase
            ?.from('t_310_01_03_user_addresses') // CORRECT TABLE NAME
            .insert([addressData])
            .select('id');

          if (addressResult?.error) {
            console.error(`❌ Address data failed for row ${record.rowNumber}:`, addressResult.error);
            console.error('Address data that failed:', addressData);
            console.warn('⚠️ Continuing without address data');
          } else {
            console.log(`✅ Domicile address created for user ${userId}:`, addressResult.data?.[0]?.id);
          }
        }

        // ===== STEP 7: Insert program mappings (subjects/lessons) =====
        if (educatorId && record.mappedData.selectedPrograms) {
          console.log(`📚 Processing programs for educator ${educatorId}...`);
          console.log(`📚 Raw selectedPrograms:`, record.mappedData.selectedPrograms);
          console.log(`📚 Type of selectedPrograms:`, typeof record.mappedData.selectedPrograms);
          console.log(`📚 Is array:`, Array.isArray(record.mappedData.selectedPrograms));
          
          // Handle both string and array inputs
          let programIds = [];
          if (Array.isArray(record.mappedData.selectedPrograms)) {
            programIds = record.mappedData.selectedPrograms;
          } else if (typeof record.mappedData.selectedPrograms === 'string') {
            // If it's a string, try to parse it
            try {
              programIds = JSON.parse(record.mappedData.selectedPrograms);
            } catch {
              // If parsing fails, treat as single program ID
              programIds = [record.mappedData.selectedPrograms];
            }
          }
          
          console.log(`📚 Processed programIds:`, programIds);
          
          // Filter out any invalid/null program IDs and try to resolve program names to IDs
          const validPrograms = [];
          for (const programItem of programIds) {
            if (!programItem || typeof programItem !== 'string' || programItem.length === 0) {
              console.warn(`⚠️ Invalid program item found:`, programItem, typeof programItem);
              continue;
            }
            
            // Check if it's already a valid UUID (program ID)
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (uuidPattern.test(programItem)) {
              validPrograms.push(programItem);
              console.log(`✅ Valid program ID:`, programItem);
            } else {
              // Try to find program ID by name from dataCache
              console.log(`🔍 Trying to resolve program name to ID:`, programItem);
              const matchingProgram = dataCache.subjects.find(subject => 
                subject.name.toLowerCase().includes(programItem.toLowerCase()) ||
                subject.local_name?.toLowerCase().includes(programItem.toLowerCase()) ||
                subject.alternate_name?.toLowerCase().includes(programItem.toLowerCase())
              );
              
              if (matchingProgram) {
                validPrograms.push(matchingProgram.id);
                console.log(`✅ Resolved "${programItem}" to ID:`, matchingProgram.id);
              } else {
                console.warn(`⚠️ Could not resolve program name "${programItem}" to ID`);
                // For now, save the original name - we'll handle this in display
                validPrograms.push(programItem);
              }
            }
          }
          
          console.log(`📚 Valid programs after filtering:`, validPrograms);
          
          if (validPrograms.length === 0) {
            console.warn('⚠️ No valid program IDs found, skipping program mappings');
          } else {
            // Separate UUID program IDs from program names
            const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const validUUIDs = validPrograms.filter(p => uuidPattern.test(p));
            const programNames = validPrograms.filter(p => !uuidPattern.test(p));
            
            console.log(`📚 Splitting programs:`, {
              validUUIDs: validUUIDs,
              programNames: programNames
            });
            
            // Only create mappings for valid UUIDs
            const programMappingsData = validUUIDs.map((programId: string) => ({
              educator_id: educatorId,
              program_id: programId, // UUID from fuzzy matching
              proficiency_level: 'intermediate', // Default value
              years_of_experience: 1, // Default value  
              certification_status: 'none', // Default value
              competency_level: 'intermediate', // Required field based on table schema
              confidence_score: 0.8, // Default confidence
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }));
            
            // Store program names in additional subjects table for non-UUID programs
            if (programNames.length > 0) {
              console.log(`📝 Storing ${programNames.length} program names in additional subjects table`);
              const additionalSubjectsData = programNames.map((programName: string) => ({
                educator_id: educatorId,
                subject_name: programName,
                subject_description: `Imported from CSV: ${programName}`,
                target_level: 'all',
                competency_description: 'Competent',
                teaching_method_description: 'Various methods',
                approval_status: 'pending',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }));
              
              const additionalSubjectsResult = await supabase
                ?.from('t_315_07_01_tutor_additional_subjects')
                .insert(additionalSubjectsData)
                .select('id');
                
              if (additionalSubjectsResult?.error) {
                console.error(`❌ Additional subjects failed:`, additionalSubjectsResult.error);
              } else {
                console.log(`✅ Additional subjects created: ${programNames.length} subjects`);
              }
            }

            // Insert program mappings only if we have valid UUIDs
            if (programMappingsData.length > 0) {
              console.log(`📚 Final data to insert (${programMappingsData.length} records):`);
              programMappingsData.forEach((data: any, index: number) => {
                console.log(`  ${index + 1}. Program ID: ${data.program_id}, Educator ID: ${data.educator_id}`);
              });

              const mappingsResult = await supabase
                ?.from('t_315_06_01_tutor_program_mappings')
                .insert(programMappingsData)
                .select('id, program_id');

              if (mappingsResult?.error) {
                console.error(`❌ Program mappings failed for row ${record.rowNumber}:`);
                console.error('Error details:', mappingsResult.error);
                console.error('Failed data:', programMappingsData);
                console.warn('⚠️ Continuing without program mappings');
              } else {
                console.log(`✅ Program mappings created for educator ${educatorId}: ${programMappingsData.length} programs`);
                console.log('Created mappings:', mappingsResult.data);
              }
            } else {
              console.log(`ℹ️ No valid program UUIDs to insert for educator ${educatorId}`);
            }
          }
        } else {
          console.log(`⚠️ Skipping program mappings - educatorId: ${educatorId}, selectedPrograms:`, record.mappedData.selectedPrograms);
        }

        // ===== STEP 8A: Insert teaching preferences (MISSING TABLE!) =====
        if (educatorId) {
          console.log(`🎯 Creating teaching preferences for educator ${educatorId}...`);
          
          const teachingPreferencesData = {
            educator_id: educatorId,
            teaching_styles: record.mappedData.teachingMethods ? [record.mappedData.teachingMethods] : [],
            student_level_preferences: record.mappedData.studentLevelPreferences ? [record.mappedData.studentLevelPreferences] : [],
            tech_savviness_level: record.mappedData.techSavviness || null,
            gmeet_experience_level: record.mappedData.gmeetExperience || null,
            attendance_update_capability: record.mappedData.presensiUpdateCapability || null,
            special_needs_capability: record.mappedData.specialNeedsCapable || null,
            group_class_willingness: record.mappedData.groupClassWilling || null,
            online_teaching_capability: record.mappedData.onlineTeachingCapable || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log(`🎯 Teaching preferences data:`, teachingPreferencesData);
          console.log(`🎯 Debug specific fields:`, {
            specialNeedsCapable_raw: record.mappedData.specialNeedsCapable,
            groupClassWilling_raw: record.mappedData.groupClassWilling,
            onlineTeachingCapable_raw: record.mappedData.onlineTeachingCapable,
            special_needs_final: teachingPreferencesData.special_needs_capability,
            group_class_final: teachingPreferencesData.group_class_willingness,
            online_teaching_final: teachingPreferencesData.online_teaching_capability
          });
          console.log(`🚨 CRITICAL DEBUG - Group Class Willing:`, {
            csvValue: record.mappedData.groupClassWilling,
            databaseValue: teachingPreferencesData.group_class_willingness,
            isNull: teachingPreferencesData.group_class_willingness === null,
            isEmpty: teachingPreferencesData.group_class_willingness === '',
            type: typeof teachingPreferencesData.group_class_willingness
          });

          const preferencesResult = await supabase
            ?.from('t_315_04_01_tutor_teaching_preferences')
            .insert([teachingPreferencesData])
            .select('id')
            .single();

          if (preferencesResult?.error) {
            console.error(`❌ Failed to create teaching preferences for educator ${educatorId}:`, preferencesResult.error);
            console.warn('⚠️ Continuing without teaching preferences');
          } else {
            console.log(`✅ Teaching preferences created for educator ${educatorId}:`, preferencesResult.data?.id);
          }
        }

        // ===== STEP 8B: Insert personality traits (MISSING TABLE!) =====
        if (educatorId) {
          console.log(`💫 Creating personality traits for educator ${educatorId}...`);
          
          const personalityTraitsData = {
            educator_id: educatorId,
            teaching_patience_level: record.mappedData.teachingPatienceLevel || null,
            student_motivation_ability: record.mappedData.studentMotivationAbility || null,
            schedule_flexibility_level: record.mappedData.scheduleFlexibilityLevel || null,
            personality_type: record.mappedData.tutorPersonalityType ? [record.mappedData.tutorPersonalityType] : [],
            communication_style: record.mappedData.communicationStyle ? [record.mappedData.communicationStyle] : [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log(`💫 Personality traits data:`, personalityTraitsData);
          console.log(`💫 Debug specific personality fields:`, {
            teachingPatienceLevel_raw: record.mappedData.teachingPatienceLevel,
            studentMotivationAbility_raw: record.mappedData.studentMotivationAbility,
            scheduleFlexibilityLevel_raw: record.mappedData.scheduleFlexibilityLevel,
            teaching_patience_level_final: personalityTraitsData.teaching_patience_level,
            student_motivation_ability_final: personalityTraitsData.student_motivation_ability,
            schedule_flexibility_level_final: personalityTraitsData.schedule_flexibility_level,
            personality_type_final: personalityTraitsData.personality_type,
            communication_style_final: personalityTraitsData.communication_style
          });

          const personalityResult = await supabase
            ?.from('t_315_05_01_tutor_personality_traits')
            .insert([personalityTraitsData])
            .select('id')
            .single();

          if (personalityResult?.error) {
            console.error(`❌ Failed to create personality traits for educator ${educatorId}:`, personalityResult.error);
            console.error(`❌ FULL ERROR DETAILS:`, JSON.stringify(personalityResult.error, null, 2));
            console.warn('⚠️ Continuing without personality traits');
          } else {
            console.log(`✅ Personality traits created for educator ${educatorId}:`, personalityResult.data?.id);
            console.log(`✅ PERSONALITY DATA CREATED:`, JSON.stringify(personalityResult.data, null, 2));
          }
        }

        // ===== STEP 8C: Insert availability config (MISSING TABLE!) =====
        if (educatorId) {
          console.log(`📅 Creating availability config for educator ${educatorId}...`);
          
          const availabilityConfigData = {
            educator_id: educatorId,
            availability_status: (() => {
              const status = record.mappedData.statusMenerimaSiswa?.toLowerCase() || '';
              switch (status) {
                case 'available': return 'available';
                case 'limited': return 'limited';
                case 'unavailable': return 'unavailable';
                case 'leave': return 'leave';
                // Legacy support for old values
                case 'aktif': 
                case 'yes': 
                  return 'available';
                case 'tidak_aktif': 
                case 'no': 
                  return 'unavailable';
                case 'terbatas':
                  return 'limited';
                default: 
                  return 'unavailable';
              }
            })(),
            available_schedule: record.mappedData.available_schedule || [],
            teaching_methods: record.mappedData.teaching_methods || [],
            hourly_rate: record.mappedData.hourly_rate ? parseInt(record.mappedData.hourly_rate) : null,
            max_new_students_per_week: record.mappedData.maksimalSiswaBaru ? parseInt(record.mappedData.maksimalSiswaBaru) : null,
            max_total_students: record.mappedData.maksimalTotalSiswa ? parseInt(record.mappedData.maksimalTotalSiswa) : null,
            teaching_radius_km: record.mappedData.teaching_radius_km ? parseInt(record.mappedData.teaching_radius_km) : null,
            transportation_method: record.mappedData.transportasiTutor || [],
            teaching_center_location: record.mappedData.alamatTitikLokasi || null,
            location_notes: record.mappedData.location_notes || null,
            target_student_ages: record.mappedData.usiaTargetSiswa || [],
            availability_notes: record.mappedData.catatanAvailability || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log(`📅 Availability config data:`, availabilityConfigData);
          console.log(`📅 Debug specific availability fields:`, {
            statusMenerimaSiswa_raw: record.mappedData.statusMenerimaSiswa,
            hourly_rate_raw: record.mappedData.hourly_rate,
            maksimalSiswaBaru_raw: record.mappedData.maksimalSiswaBaru,
            maksimalTotalSiswa_raw: record.mappedData.maksimalTotalSiswa,
            teaching_radius_km_raw: record.mappedData.teaching_radius_km,
            availability_status_final: availabilityConfigData.availability_status,
            hourly_rate_final: availabilityConfigData.hourly_rate,
            max_new_students_final: availabilityConfigData.max_new_students_per_week,
            max_total_students_final: availabilityConfigData.max_total_students,
            teaching_radius_final: availabilityConfigData.teaching_radius_km
          });

          const availabilityResult = await supabase
            ?.from('t_315_03_01_tutor_availability_config')
            .insert([availabilityConfigData])
            .select('id')
            .single();

          if (availabilityResult?.error) {
            console.error(`❌ Failed to create availability config for educator ${educatorId}:`, availabilityResult.error);
            console.error(`❌ FULL AVAILABILITY ERROR DETAILS:`, JSON.stringify(availabilityResult.error, null, 2));
            console.warn('⚠️ Continuing without availability config');
          } else {
            console.log(`✅ Availability config created for educator ${educatorId}:`, availabilityResult.data?.id);
            console.log(`✅ AVAILABILITY DATA CREATED:`, JSON.stringify(availabilityResult.data, null, 2));
          }
        }

        // ===== STEP 8D: Insert tutor management (MISSING TABLE FOR STATUS_TUTOR!) =====
        if (userId) {
          console.log(`🎯 Creating tutor management for user ${userId}...`);
          
          const tutorManagementData = {
            user_id: userId,
            status_tutor: record.mappedData.status_tutor || 'registration',
            approval_level: record.mappedData.approval_level || 'junior',
            staff_notes: record.mappedData.staff_notes || null,
            additional_screening: [],
            
            // Document Verification Status - use defaults if not provided
            identity_verification_status: record.mappedData.status_verifikasi_identitas || 'pending',
            education_verification_status: record.mappedData.status_verifikasi_pendidikan || 'pending',
            
            // Initialize recruitment tracking
            recruitment_stage_history: [{
              stage: record.mappedData.status_tutor || 'registration',
              timestamp: new Date().toISOString(),
              changed_by: 'system_import',
              notes: `Imported from CSV - Row ${record.rowNumber}`
            }],
            last_status_change: new Date().toISOString(),
            status_changed_by: null,
            
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          console.log(`🎯 Tutor management data:`, tutorManagementData);
          console.log(`🎯 Debug specific management fields:`, {
            status_tutor_raw: record.mappedData.status_tutor,
            approval_level_raw: record.mappedData.approval_level,
            status_tutor_final: tutorManagementData.status_tutor,
            approval_level_final: tutorManagementData.approval_level
          });

          const managementResult = await supabase
            ?.from('t_315_02_01_tutor_management')
            .insert([tutorManagementData])
            .select('id')
            .single();

          if (managementResult?.error) {
            console.error(`❌ Failed to create tutor management for user ${userId}:`, managementResult.error);
            console.error(`❌ FULL MANAGEMENT ERROR DETAILS:`, JSON.stringify(managementResult.error, null, 2));
            console.warn('⚠️ Continuing without tutor management');
          } else {
            console.log(`✅ Tutor management created for user ${userId}:`, managementResult.data?.id);
            console.log(`✅ MANAGEMENT DATA CREATED:`, JSON.stringify(managementResult.data, null, 2));
          }
        }
        
        console.log(`✅ Successfully processed row ${record.rowNumber} - User ID: ${userId}, Educator ID: ${educatorId}, ERN: ${generatedTRN || trn || 'Not generated'}`);
        successCount++;
      } catch (error) {
        console.error(`❌ Full error details for row ${record.rowNumber}:`, error);
        
        let errorMessage = 'Unknown error';
        
        if (error && typeof error === 'object') {
          // Handle Supabase specific errors
          if ('message' in error) {
            errorMessage = String(error.message);
          }
          if ('code' in error && error.code) {
            errorMessage += ` (Code: ${error.code})`;
          }
          if ('details' in error && error.details) {
            errorMessage += ` - Details: ${error.details}`;
          }
          if ('hint' in error && error.hint) {
            errorMessage += ` - Hint: ${error.hint}`;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        errorCount++;
        errors.push({
          row: record.rowNumber,
          message: errorMessage
        });
      }

      // Update progress
      setImportProgress(Math.round(((i + 1) / validRecords.length) * 100));
    }

    // Show final results
    console.log('📊 Import completed:', {
      totalRecords: parsedData.length,
      validRecords: validRecords.length,
      successCount,
      errorCount,
      processingTime: Date.now() - Date.now() // Will be calculated later
    });

    setImportResult({
      totalRecords: parsedData.length,
      successCount,
      errorCount,
      warningCount: parsedData.filter(r => r.warnings.length > 0).length,
      errors
    });

    // Show completion toast
    if (successCount > 0) {
      toast({
        title: "Import Completed",
        description: `Successfully imported ${successCount} out of ${validRecords.length} valid records.`,
        variant: successCount === validRecords.length ? "default" : "destructive",
        duration: 5000,
      });
    } else if (errorCount > 0) {
      toast({
        title: "Import Failed",
        description: `All ${errorCount} records failed to import. Check error details below.`,
        variant: "destructive",
        duration: 8000,
      });
    }

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
      
      // 🔍 Finding tutor role ID...
      console.log('🔍 Finding tutor role ID...');
      
      const { data: rolesData, error: roleError } = await supabase
        .from('t_340_01_01_roles')
        .select('*');

      if (roleError) {
        console.error('❌ Failed to fetch roles:', roleError);
        throw new Error(`Failed to fetch roles: ${roleError.message}`);
      }

      console.log('✅ Found roles in table: t_340_01_01_roles');
      
      const tutorRole = rolesData?.find(role => role.role_name?.toLowerCase() === 'tutor');
      
      if (!tutorRole) {
        throw new Error('Tutor role not found in database');
      }

      const tutorRoleId = tutorRole.id;
      console.log('✅ Found tutor role ID:', tutorRoleId);

      // 📊 Comprehensive export query with JOINs
      const { data, error } = await supabase
        .from('t_310_01_01_users_universal')
        .select(`
          *,
          user_profiles:t_310_02_01_user_profiles(*),
          educator_details:t_315_01_01_educator_details(*),
          tutor_management:t_315_02_01_tutor_management(*),
          availability_config:t_315_03_01_tutor_availability_config(*),
          teaching_preferences:t_315_04_01_tutor_teaching_preferences(*),
          personality_traits:t_315_05_01_tutor_personality_traits(*),
          banking_info:t_315_06_01_educator_banking_info(*),
          program_mappings:t_315_07_01_tutor_program_mappings(*),
          addresses:t_310_03_01_addresses(*)
        `)
        .eq('primary_role_id', tutorRoleId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setExportProgress(50);

      if (!data || data.length === 0) {
        toast({
        title: "No Data Found",
        description: "Tidak ada data yang ditemukan untuk di export",
        variant: "destructive",
        duration: 3000,
      });
        return;
      }

      setExportProgress(75);

      // 🔄 Transform joined data to CSV format matching template
      console.log('🔄 Transforming', data.length, 'records for export...');
      
      const transformedData = data.map(user => {
        const profile = Array.isArray(user.user_profiles) ? user.user_profiles[0] : user.user_profiles;
        const educator = Array.isArray(user.educator_details) ? user.educator_details[0] : user.educator_details;
        const management = Array.isArray(user.tutor_management) ? user.tutor_management[0] : user.tutor_management;
        const availability = Array.isArray(user.availability_config) ? user.availability_config[0] : user.availability_config;
        const preferences = Array.isArray(user.teaching_preferences) ? user.teaching_preferences[0] : user.teaching_preferences;
        const personality = Array.isArray(user.personality_traits) ? user.personality_traits[0] : user.personality_traits;
        const banking = Array.isArray(user.banking_info) ? user.banking_info[0] : user.banking_info;
        const addresses = Array.isArray(user.addresses) ? user.addresses : [];
        const domicileAddress = addresses.find((addr: any) => addr.address_type === 'domicile');

        return {
          // System & Status (FROM TUTOR_MANAGEMENT)
          'Status Tutor': management?.status_tutor || 'registration',
          'Level Approval': management?.approval_level || 'junior',
          'Catatan Staff': management?.staff_notes || '',
          
          // Personal Info
          'Nama Lengkap': profile?.full_name || '',
          'Nama Panggilan': profile?.nickname || '',
          'Tanggal Lahir': profile?.date_of_birth || '',
          'Jenis Kelamin': profile?.gender || '',
          'Agama': profile?.religion || '',
          'Email': user.email || '',
          'No HP 1': user.phone || '',
          'Social Media 1': profile?.social_media_1 || '',
          
          // Address
          'Provinsi Domisili': domicileAddress?.province_name || '',
          'Kota/Kabupaten Domisili': domicileAddress?.city_name || '',
          'Kecamatan Domisili': domicileAddress?.district_name || '',
          'Kelurahan Domisili': domicileAddress?.village_name || '',
          'Alamat Lengkap Domisili': domicileAddress?.full_address || '',
          'Kode Pos Domisili': domicileAddress?.postal_code || '',
          
          // Banking
          'Nama Nasabah': banking?.account_holder_name || '',
          'Nomor Rekening': banking?.account_number || '',
          'Nama Bank': banking?.bank_name || '',
          
          // Education
          'Status Akademik': educator?.academic_status || '',
          'Nama Universitas': educator?.university_s1_name || '',
          'Fakultas': educator?.faculty_s1 || '',
          'Jurusan': educator?.major_s1 || '',
          'IPK': educator?.gpa || '',
          'Tahun Lulus Universitas': educator?.graduation_year || '',
          'Tahun Lulus SMA': educator?.high_school_graduation_year || '',
          
          // Professional
          'Pengalaman Mengajar': educator?.teaching_experience || '',
          'Pengalaman Lain Relevan': educator?.other_relevant_experience || '',
          
          // Schedule & Availability (FROM AVAILABILITY_CONFIG)
          'Radius Area Mengajar (KM)': availability?.teaching_radius_km || '',
          'Alamat Titik Lokasi': availability?.teaching_center_location || '',
          'Catatan Lokasi': availability?.location_notes || '',
          'Status Availability': (() => {
            switch (availability?.availability_status) {
              case 'available': return 'available';
              case 'limited': return 'limited';
              case 'unavailable': return 'unavailable';
              case 'leave': return 'leave';
              default: return 'unavailable';
            }
          })(),
          'Jadwal Mingguan Tersedia': Array.isArray(availability?.available_schedule) ? availability.available_schedule.join('; ') : '',
          'Metode Pengajaran': Array.isArray(availability?.teaching_methods) ? availability.teaching_methods.join('; ') : '',
          'Ekspektasi Fee Minimal Per Jam': availability?.hourly_rate || '',
          'Maksimal Siswa Baru per Minggu': availability?.max_new_students_per_week || '',
          'Maksimal Total Siswa': availability?.max_total_students || '',
          'Usia Target Siswa': Array.isArray(availability?.target_student_ages) ? availability.target_student_ages.join('; ') : '',
          
          // Teaching Preferences (FROM TEACHING_PREFERENCES)
          'Gaya Pembelajaran': Array.isArray(preferences?.teaching_styles) ? preferences.teaching_styles.join('; ') : '',
          'Preferensi Level Siswa': Array.isArray(preferences?.student_level_preferences) ? preferences.student_level_preferences.join('; ') : '',
          'Kemampuan Mengajar ABK': preferences?.special_needs_capability || 'tidak',
          'Bersedia Mengajar Kelas Grup': preferences?.group_class_willingness || 'tidak',
          'Kemampuan Mengajar Online': preferences?.online_teaching_capability || 'tidak',
          'Level Tech Savviness': preferences?.tech_savviness_level || 'basic',
          'Pengalaman Google Meet': preferences?.gmeet_experience_level || 'pemula',
          'Kemampuan Update Presensi': preferences?.attendance_update_capability || 'tidak',
          
          // Personality Traits (FROM PERSONALITY_TRAITS)
          'Tipe Kepribadian Tutor': Array.isArray(personality?.personality_type) ? personality.personality_type.join('; ') : '',
          'Level Kesabaran Mengajar (1-10)': personality?.teaching_patience_level || '',
          'Kemampuan Memotivasi Siswa (1-10)': personality?.student_motivation_ability || '',
          'Level Fleksibilitas Jadwal (3-10)': personality?.schedule_flexibility_level || ''
        };
      });

      console.log('✅ Transformed data sample:', transformedData[0]);

      if (transformedData.length === 0) {
        toast({
          title: "No Data Found",
          description: "Tidak ada data tutor yang ditemukan untuk di export",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      // Convert to CSV
      const headers = Object.keys(transformedData[0]);
      const csvContent = [
        headers.join(','),
        ...transformedData.map((row: any) => 
          headers.map((header: string) => {
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
      toast({
        title: "Export Failed",
        description: `${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
        duration: 3000,
      });
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
            onClick={downloadCSVTemplate}
          >
            <Icon icon="heroicons:document-arrow-down" className="w-4 h-4 mr-2" />
            Download Template
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
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsing}
                >
                  <Icon icon="heroicons:folder-open" className="w-4 h-4 mr-2" />
                  {isParsing ? 'Processing...' : 'Browse Files'}
                </Button>
                
                {selectedFile && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedFile(null);
                      setParsedData([]);
                      setShowPreview(false);
                      setImportResult(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    disabled={isParsing}
                  >
                    <Icon icon="heroicons:x-mark" className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
              
              {selectedFile && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Unknown type'}
                      </p>
                    </div>
                    <Icon icon="heroicons:document-text" className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Import Instructions */}
            {parsedData.length === 0 && (
              <Alert>
                <Icon icon="heroicons:information-circle" className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>
                      Upload a CSV or Excel file with tutor data. The system will automatically map columns based on field names.
                      Make sure your file has column headers that match the expected field names.
                    </p>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="p-0 h-auto underline"
                        onClick={() => downloadCSVTemplate()}
                      >
                        Download CSV Template
                      </Button>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        Supported formats: .csv, .xlsx, .xls (max 10MB)
                      </span>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* System Status Check */}
            <div className="mt-4">
              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">System Status & Debug Info</summary>
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs space-y-1">
                  <div>Supabase Client: {supabase ? '✅ Connected' : '❌ Not Available'}</div>
                  <div>Papa Parse: {typeof Papa !== 'undefined' ? '✅ Loaded' : '❌ Not Available'}</div>
                  <div>XLSX: {typeof XLSX !== 'undefined' ? '✅ Loaded' : '❌ Not Available'}</div>
                  <div>File Input Ref: {fileInputRef.current ? '✅ Ready' : '❌ Not Ready'}</div>
                  <div>Current State: {
                    isParsing ? 'Parsing File' : 
                    isImporting ? 'Importing Data' : 
                    isExporting ? 'Exporting Data' : 
                    'Ready'
                  }</div>
                </div>
              </details>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Information Section */}
      {showPreview && parsedData.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Icon icon="heroicons:bug-ant" className="w-5 h-5 mr-2" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-blue-800 mb-2">File Information:</h4>
                <div className="text-sm space-y-1">
                  <p>• File: {selectedFile?.name}</p>
                  <p>• Size: {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB</p>
                  <p>• Rows processed: {parsedData.length}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-800 mb-2">Column Mapping:</h4>
                <details className="cursor-pointer">
                  <summary className="text-sm text-blue-700 hover:text-blue-900">
                    Available columns in your CSV (click to expand)
                  </summary>
                  <div className="mt-2 p-3 bg-white rounded border">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                      {parsedData.length > 0 && Object.keys(parsedData[0].originalData).map((col, idx) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded">
                          {col}
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              </div>

              <div>
                <h4 className="font-medium text-blue-800 mb-2">Common Issues:</h4>
                <div className="text-sm space-y-1">
                  {stats.invalidRecords > 0 && (
                    <>
                      <p className="text-red-600">• {stats.invalidRecords} records have validation errors</p>
                      <p className="text-gray-600">• Most common: missing required fields or invalid formats</p>
                    </>
                  )}
                  {stats.validRecords === 0 && (
                    <p className="text-red-600">• No valid records found - check column names and data format</p>
                  )}
                  {stats.validRecords > 0 && (
                    <p className="text-green-600">• {stats.validRecords} records ready for import</p>
                  )}
                </div>
              </div>

              <div className="text-xs text-blue-600 bg-white p-2 rounded">
                💡 Tip: Open browser console (F12) for detailed field mapping logs
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                            <div className="space-y-1">
                              <details className="cursor-pointer">
                                <summary className="text-xs text-red-600 hover:text-red-800">
                                  {record.errors.length} error{record.errors.length > 1 ? 's' : ''} (click to expand)
                                </summary>
                                <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700 max-w-md">
                                  <ul className="space-y-1">
                                    {record.errors.map((error, idx) => (
                                      <li key={idx} className="flex items-start">
                                        <span className="text-red-500 mr-1">•</span>
                                        <span>{error}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </details>
                            </div>
                          )}
                          {record.warnings.length > 0 && (
                            <div className="space-y-1">
                              <details className="cursor-pointer">
                                <summary className="text-xs text-orange-600 hover:text-orange-800">
                                  {record.warnings.length} warning{record.warnings.length > 1 ? 's' : ''} (click to expand)
                                </summary>
                                <div className="mt-2 p-2 bg-orange-50 rounded text-xs text-orange-700 max-w-md">
                                  <ul className="space-y-1">
                                    {record.warnings.map((warning, idx) => (
                                      <li key={idx} className="flex items-start">
                                        <span className="text-orange-500 mr-1">•</span>
                                        <span>{warning}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </details>
                            </div>
                          )}
                          {record.errors.length === 0 && record.warnings.length === 0 && (
                            <span className="text-xs text-green-600">✓ No issues</span>
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