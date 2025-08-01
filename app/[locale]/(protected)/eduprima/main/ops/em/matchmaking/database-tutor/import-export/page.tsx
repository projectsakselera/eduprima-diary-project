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
import { toast } from '@/components/ui/use-toast';
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
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
  validation?: (value: any) => string | null;
  min?: number;
  max?: number;
}

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

  // Generate comprehensive field mapping from simplified config
  const generateFieldMapping = (): Array<{field: TutorFormField, csvColumn: string}> => {
    const fieldMap: Array<{field: TutorFormField, csvColumn: string}> = [];
    
    // Define essential fields for bulk import (based on form config)
    const essentialFields: TutorFormField[] = [
      { name: 'status_tutor', label: 'Status Tutor', type: 'select', required: false },
      { name: 'trn', label: 'TRN (Tutor Registration Number)', type: 'text', required: false },
      { name: 'namaLengkap', label: 'Nama Lengkap', type: 'text', required: true },
      { name: 'namaPanggilan', label: 'Nama Panggilan', type: 'text', required: false },
      { name: 'tanggalLahir', label: 'Tanggal Lahir', type: 'date', required: true },
      { name: 'jenisKelamin', label: 'Jenis Kelamin', type: 'select', required: true },
      { name: 'agama', label: 'Agama', type: 'select', required: false },
      { name: 'email', label: 'Email Aktif', type: 'email', required: true },
      { name: 'noHp1', label: 'No. HP (WhatsApp)', type: 'tel_split', required: true },
      { name: 'noHp2', label: 'No. HP Alternatif (Opsional)', type: 'tel_split', required: false },
      { name: 'headline', label: 'Headline/Tagline Tutor', type: 'text', required: false },
      { name: 'deskripsiDiri', label: 'Deskripsi Diri/Bio Tutor', type: 'textarea', required: false },
      { name: 'motivasiMenjadiTutor', label: 'Motivasi Menjadi Tutor', type: 'textarea', required: true },
      { name: 'socialMedia1', label: 'Link Media Sosial 1 (Opsional)', type: 'text', required: false },
      { name: 'socialMedia2', label: 'Link Media Sosial 2 (Opsional)', type: 'text', required: false },
      { name: 'provinsiDomisili', label: 'Provinsi', type: 'select', required: true },
      { name: 'kotaKabupatenDomisili', label: 'Kota/Kabupaten', type: 'select', required: true },
      { name: 'kecamatanDomisili', label: 'Kecamatan', type: 'text', required: true },
      { name: 'kelurahanDomisili', label: 'Kelurahan/Desa', type: 'text', required: true },
      { name: 'alamatLengkapDomisili', label: 'Alamat Lengkap/Nama Jalan', type: 'textarea', required: true },
      { name: 'kodePosDomisili', label: 'Kode Pos', type: 'text', required: false },
      { name: 'namaNasabah', label: 'Nama Pemilik Rekening', type: 'text', required: true },
      { name: 'nomorRekening', label: 'Nomor Rekening', type: 'text', required: true },
      { name: 'namaBank', label: 'Nama Bank', type: 'select', required: true },
      { name: 'statusAkademik', label: 'Status Akademik Saat Ini', type: 'select', required: true },
      { name: 'namaUniversitas', label: 'Nama Universitas / Institusi', type: 'text', required: false },
      { name: 'fakultas', label: 'Fakultas', type: 'text', required: false },
      { name: 'jurusan', label: 'Jurusan / Program Studi', type: 'text', required: false },
      { name: 'ipk', label: 'IPK Terakhir', type: 'text', required: false },
      { name: 'tahunMasuk', label: 'Tahun Masuk', type: 'select', required: false },
      { name: 'tahunLulus', label: 'Tahun Lulus', type: 'select', required: false },
      { name: 'namaSMA', label: 'Nama SMA / SMK / Sederajat', type: 'text', required: false },
      { name: 'jurusanSMA', label: 'Jurusan', type: 'select', required: false },
      { name: 'tahunLulusSMA', label: 'Tahun Lulus', type: 'select', required: false },
      { name: 'keahlianSpesialisasi', label: 'Keahlian & Spesialisasi', type: 'textarea', required: true },
      { name: 'keahlianLainnya', label: 'Keahlian Lainnya (jika ada)', type: 'textarea', required: false },
      { name: 'pengalamanMengajar', label: 'Pengalaman Mengajar', type: 'textarea', required: true },
      { name: 'pengalamanLainRelevan', label: 'Pengalaman Lain yang Relevan', type: 'textarea', required: false },
      { name: 'prestasiAkademik', label: 'Prestasi Akademik', type: 'textarea', required: false },
      { name: 'prestasiNonAkademik', label: 'Prestasi Non-Akademik', type: 'textarea', required: false },
      { name: 'sertifikasiPelatihan', label: 'Sertifikasi & Pelatihan', type: 'textarea', required: false },
      { name: 'selectedPrograms', label: '📚 Pilih Program/Mata Pelajaran yang Diajarkan', type: 'checkbox', required: true },
      { name: 'mataPelajaranLainnya', label: '📝 Mata Pelajaran Lainnya (Jika Tidak Ditemukan)', type: 'textarea', required: false },
      { name: 'teaching_radius_km', label: 'Radius Area Mengajar (KM)', type: 'number', required: false },
      { name: 'alamatTitikLokasi', label: 'Titik Pusat Area Target Mengajar', type: 'textarea', required: false },
      { name: 'location_notes', label: 'Preferensi Area Mengajar (Opsional)', type: 'textarea', required: false },
      { name: 'statusMenerimaSiswa', label: 'Status Availability', type: 'select', required: true },
      { name: 'available_schedule', label: 'Jadwal Mingguan Tersedia', type: 'checkbox', required: true },
      { name: 'teaching_methods', label: 'Metode Pengajaran', type: 'checkbox', required: true },
      { name: 'hourly_rate', label: 'Ekspektasi Fee Minimal Per Jam', type: 'number', required: true, min: 25000, max: 1000000 },
      { name: 'maksimalSiswaBaru', label: 'Maksimal Siswa Baru per Minggu', type: 'number', required: false },
      { name: 'maksimalTotalSiswa', label: 'Maksimal Total Siswa', type: 'number', required: false },
      { name: 'usiaTargetSiswa', label: 'Usia Target Siswa', type: 'checkbox', required: false },
      { name: 'catatanAvailability', label: 'Catatan Availability', type: 'textarea', required: false },
      { name: 'teachingMethods', label: 'Gaya Pembelajaran yang Dikuasai', type: 'checkbox', required: false },
      { name: 'studentLevelPreferences', label: 'Preferensi Level Kemampuan Siswa', type: 'checkbox', required: false },
      { name: 'specialNeedsCapable', label: 'Mampu Mengajar Siswa Berkebutuhan Khusus', type: 'select', required: false },
      { name: 'groupClassWilling', label: 'Bersedia Mengajar Kelas Grup', type: 'select', required: false },
      { name: 'onlineTeachingCapable', label: 'Kemampuan Mengajar Online', type: 'select', required: true },
      { name: 'techSavviness', label: 'Tingkat Melek Teknologi', type: 'select', required: false },
      { name: 'gmeetExperience', label: 'Pengalaman Google Meet/Zoom', type: 'select', required: false },
      { name: 'presensiUpdateCapability', label: 'Kemampuan Update Presensi Online', type: 'select', required: false },
      { name: 'tutorPersonalityType', label: 'Tipe Kepribadian Tutor', type: 'checkbox', required: true },
      { name: 'communicationStyle', label: 'Gaya Komunikasi', type: 'checkbox', required: true },
      { name: 'teachingPatienceLevel', label: 'Level Kesabaran Mengajar (1-10)', type: 'select', required: true },
      { name: 'studentMotivationAbility', label: 'Kemampuan Memotivasi Siswa (1-10)', type: 'select', required: true },
      { name: 'scheduleFlexibilityLevel', label: 'Level Fleksibilitas Jadwal (1-10)', type: 'select', required: false },
      { name: 'emergencyContactName', label: 'Nama Kontak Darurat', type: 'text', required: true },
      { name: 'emergencyContactRelationship', label: 'Hubungan dengan Kontak Darurat', type: 'select', required: true },
      { name: 'emergencyContactPhone', label: 'Nomor HP Kontak Darurat', type: 'tel_split', required: true }
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

  // Apply column mapping and validation using form config
  const processData = (rawData: any[]): ParsedRecord[] => {
    // Get field mapping from form config
    const fieldMapping = generateFieldMapping();
    
    return rawData.map((row, index) => {
      const mappedData: Record<string, any> = {};
      const errors: string[] = [];
      const warnings: string[] = [];

      // Apply field mappings based on form config
      fieldMapping.forEach(({ field, csvColumn }) => {
        // Try multiple variations of column names
        const possibleColumns = [
          csvColumn,
          field.label,
          field.name,
          field.label.toLowerCase(),
          field.label.replace(/\s+/g, ''),
          field.label.replace(/\s+/g, '_'),
          field.label.replace(/\s+/g, '-')
        ];
        
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

        if (sourceValue !== undefined && sourceValue !== '') {
          try {
            // Apply transformations based on field type
            const transformedValue = transformValue(sourceValue, field.name, field.type);
            mappedData[field.name] = transformedValue;
          } catch (err) {
            errors.push(`Error transforming ${field.label}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        } else if (field.required) {
          errors.push(`Required field '${field.label}' is missing or empty (tried columns: ${possibleColumns.join(', ')})`);
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

  // Comprehensive validation based on form config
  const validateRecord = (record: Record<string, any>): string[] => {
    const errors: string[] = [];

    // Get all fields for validation
    const fieldMapping = generateFieldMapping();
    const allFields = fieldMapping.map(f => f.field);

    // Validate each field
    allFields.forEach(field => {
      const value = record[field.name];
      
      // Required field validation
      if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
        errors.push(`${field.label} is required`);
        return;
      }

      // Skip validation if field is empty and not required
      if (!value || value === '') return;

      try {
        // Type-specific validation
        switch (field.type) {
          case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.push(`${field.label}: Invalid email format`);
            }
            break;
            
          case 'tel':
          case 'tel_split':
            const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
            if (!phoneRegex.test(String(value).replace(/\s|-/g, ''))) {
              errors.push(`${field.label}: Invalid phone number format`);
            }
            break;
            
          case 'number':
            const num = parseFloat(value);
            if (isNaN(num)) {
              errors.push(`${field.label}: Must be a valid number`);
            } else {
              if (field.min !== undefined && num < field.min) {
                errors.push(`${field.label}: Must be at least ${field.min}`);
              }
              if (field.max !== undefined && num > field.max) {
                errors.push(`${field.label}: Must be at most ${field.max}`);
              }
            }
            break;
            
          case 'date':
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              errors.push(`${field.label}: Invalid date format`);
            }
            break;
            
          case 'select':
            if (field.options && field.options.length > 0) {
              const validValues = field.options.map(opt => opt.value);
              if (!validValues.includes(value)) {
                errors.push(`${field.label}: Invalid option selected`);
              }
            }
            break;
        }

        // Apply basic validation rules
        if (field.name === 'trn' && value) {
          if (!/^[A-Z0-9]+$/.test(value)) {
            errors.push(`${field.label}: Must contain only uppercase letters and numbers`);
          }
        }
        
        if (field.name === 'ipk' && value) {
          if (value.includes(',')) {
            errors.push(`${field.label}: Use dot (.) as decimal separator, not comma (,)`);
          }
          const numValue = parseFloat(value);
          if (numValue < 2.0 || numValue > 4.0) {
            errors.push(`${field.label}: Must be between 2.0 - 4.0`);
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
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setParsedData([]);
    setShowPreview(false);

    try {
      const rawData = await parseFile(file);
      
      if (rawData.length === 0) {
        throw new Error('The file appears to be empty or has no valid data rows.');
      }

      const processedData = processData(rawData);
      setParsedData(processedData);
      setShowPreview(true);
    } catch (error) {
              toast({
          title: "Error Parsing File",
          description: `${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
          duration: 3000,
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
        toast({
        title: "No Data Found",
        description: "Tidak ada data yang ditemukan untuk di export",
        variant: "destructive",
        duration: 3000,
      });
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

            {/* Import Instructions */}
            {parsedData.length === 0 && (
              <Alert>
                <Icon icon="heroicons:information-circle" className="h-4 w-4" />
                <AlertDescription>
                  Upload a CSV or Excel file with tutor data. The system will automatically map columns based on field names.
                  Make sure your file has column headers that match the expected field names.
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-0 h-auto ml-1 underline"
                    onClick={() => downloadCSVTemplate()}
                  >
                    Download CSV Template
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