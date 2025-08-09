'use client';

import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Icon } from "@/components/ui/icon";
// Removed Supabase import - using API endpoints instead
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

// Log initialization status
console.log('🔧 Import-Export Page Initialization:', {
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

  // Generate comprehensive field mapping from simplified config (UPDATED 2025 - Based on Form-Add-Tutor-Mapping-Guide.md)
  const generateFieldMapping = (): Array<{field: TutorFormField, csvColumn: string}> => {
    const fieldMap: Array<{field: TutorFormField, csvColumn: string}> = [];
    
    // Define comprehensive fields for bulk import (based on updated mapping guide)
    const essentialFields: TutorFormField[] = [
      // 1. SYSTEM & AUTHENTICATION
      { name: 'user_code', label: 'User Code', type: 'text', required: false },
      { name: 'email', label: 'Email Aktif', type: 'email', required: true },
      { name: 'phone', label: 'No. HP Utama (+62)', type: 'tel', required: true },
      { name: 'primary_role_id', label: 'Primary Role ID', type: 'text', required: false },
      { name: 'account_type', label: 'Account Type', type: 'select', required: false },
      { name: 'user_status', label: 'User Status', type: 'select', required: false },
      
      // 2. PERSONAL INFORMATION
      { name: 'trn', label: 'TRN (Tutor Registration Number)', type: 'text', required: false },
      { name: 'namaLengkap', label: 'Nama Lengkap', type: 'text', required: true },
      { name: 'namaPanggilan', label: 'Nama Panggilan', type: 'text', required: false },
      { name: 'tanggalLahir', label: 'Tanggal Lahir', type: 'date', required: true },
      { name: 'jenisKelamin', label: 'Jenis Kelamin', type: 'select', required: true },
      { name: 'noHp1', label: 'No. HP Utama (+62)', type: 'tel', required: true },
      { name: 'noHp2', label: 'No. HP Alternatif', type: 'tel', required: false },
      { name: 'whatsappNumber', label: 'Nomor WhatsApp', type: 'tel', required: false },
      { name: 'agama', label: 'Agama', type: 'select', required: false },
      
      // 3. PROFILE & VALUE PROPOSITION
      { name: 'headline', label: 'Headline/Tagline Tutor', type: 'text', required: false },
      { name: 'deskripsiDiri', label: 'Deskripsi Diri/Bio Tutor', type: 'textarea', required: false },
      { name: 'socialMedia1', label: 'Link Media Sosial 1', type: 'text', required: false },
      { name: 'socialMedia2', label: 'Link Media Sosial 2', type: 'text', required: false },
      { name: 'languagesMastered', label: 'Bahasa yang Dikuasai', type: 'text', required: false },
      { name: 'preferredLanguage', label: 'Bahasa Komunikasi Preferred', type: 'text', required: false },
      
      // 4. ADDRESS INFORMATION - DOMICILE
      { name: 'provinsiDomisili', label: 'Provinsi Domisili', type: 'select', required: true },
      { name: 'kotaKabupatenDomisili', label: 'Kota/Kabupaten Domisili', type: 'select', required: true },
      { name: 'kecamatanDomisili', label: 'Kecamatan Domisili', type: 'text', required: true },
      { name: 'kelurahanDomisili', label: 'Kelurahan/Desa Domisili', type: 'text', required: true },
      { name: 'alamatLengkapDomisili', label: 'Alamat Lengkap Domisili', type: 'textarea', required: true },
      { name: 'kodePosDomisili', label: 'Kode Pos Domisili', type: 'text', required: false },
      
      // 5. ADDRESS INFORMATION - KTP/KK
      { name: 'alamatSamaDenganKTP', label: 'Alamat Sama dengan KTP', type: 'select', required: false },
      { name: 'provinsiKTP', label: 'Provinsi KTP', type: 'select', required: false },
      { name: 'kotaKabupatenKTP', label: 'Kota/Kabupaten KTP', type: 'select', required: false },
      { name: 'kecamatanKTP', label: 'Kecamatan KTP', type: 'text', required: false },
      { name: 'kelurahanKTP', label: 'Kelurahan/Desa KTP', type: 'text', required: false },
      { name: 'alamatLengkapKTP', label: 'Alamat Lengkap KTP', type: 'textarea', required: false },
      { name: 'kodePosKTP', label: 'Kode Pos KTP', type: 'text', required: false },
      
      // 6. BANKING INFORMATION
      { name: 'namaNasabah', label: 'Nama Pemilik Rekening', type: 'text', required: true },
      { name: 'nomorRekening', label: 'Nomor Rekening Bank', type: 'text', required: true },
      { name: 'namaBank', label: 'Nama Bank', type: 'select', required: true },
      
      // 7. EDUCATION INFORMATION
      { name: 'statusAkademik', label: 'Status Akademik', type: 'select', required: true },
      { name: 'namaUniversitas', label: 'Nama Universitas', type: 'text', required: false },
      { name: 'fakultas', label: 'Fakultas/Jurusan', type: 'text', required: false },
      { name: 'ipk', label: 'IPK/GPA', type: 'number', required: false },
      { name: 'tahunLulus', label: 'Tahun Lulus', type: 'number', required: false },
      { name: 'namaUniversitasS1', label: 'Nama Universitas S1', type: 'text', required: false },
      { name: 'fakultasS1', label: 'Fakultas S1', type: 'text', required: false },
      { name: 'jurusanS1', label: 'Jurusan S1', type: 'text', required: false },
      { name: 'tahunMasuk', label: 'Tahun Masuk Kuliah', type: 'number', required: false },
      { name: 'namaSMA', label: 'Nama SMA/SMK', type: 'text', required: false },
      { name: 'jurusanSMA', label: 'Jurusan SMA', type: 'text', required: false },
      { name: 'jurusanSMKDetail', label: 'Detail Jurusan SMK', type: 'text', required: false },
      { name: 'tahunLulusSMA', label: 'Tahun Lulus SMA/SMK', type: 'number', required: false },
      
      // 8. ALTERNATIVE LEARNING BACKGROUND
      { name: 'namaInstitusi', label: 'Nama Institusi Alternatif', type: 'text', required: false },
      { name: 'bidangKeahlian', label: 'Bidang Keahlian', type: 'text', required: false },
      { name: 'pengalamanBelajar', label: 'Pengalaman Belajar', type: 'textarea', required: false },
      
      // 9. PROFESSIONAL PROFILE & EXPERIENCE
      { name: 'motivasiMenjadiTutor', label: 'Motivasi Menjadi Tutor', type: 'textarea', required: false },
      { name: 'keahlianSpesialisasi', label: 'Keahlian Spesialisasi', type: 'textarea', required: false },
      { name: 'keahlianLainnya', label: 'Keahlian Lainnya', type: 'textarea', required: false },
      { name: 'pengalamanMengajar', label: 'Pengalaman Mengajar', type: 'textarea', required: false },
      { name: 'pengalamanLainRelevan', label: 'Pengalaman Lain Relevan', type: 'textarea', required: false },
      
      // 10. ACHIEVEMENTS & CREDENTIALS
      { name: 'prestasiAkademik', label: 'Prestasi Akademik', type: 'textarea', required: false },
      { name: 'prestasiNonAkademik', label: 'Prestasi Non-Akademik', type: 'textarea', required: false },
      { name: 'sertifikasiPelatihan', label: 'Sertifikasi dan Pelatihan', type: 'textarea', required: false },
      
      // 11. TUTOR MANAGEMENT & STATUS
      { name: 'status_tutor', label: 'Status Tutor', type: 'select', required: true },
      { name: 'approval_level', label: 'Level Approval', type: 'select', required: true },
      { name: 'staff_notes', label: 'Catatan Staff', type: 'textarea', required: false },
      { name: 'additionalScreening', label: 'Screening Tambahan', type: 'text', required: false },
      { name: 'status_verifikasi_identitas', label: 'Status Verifikasi Identitas', type: 'select', required: false },
      { name: 'status_verifikasi_pendidikan', label: 'Status Verifikasi Pendidikan', type: 'select', required: false },
      
      // 12. AVAILABILITY CONFIGURATION
      { name: 'statusMenerimaSiswa', label: 'Status Menerima Siswa', type: 'select', required: true },
      { name: 'maksimalSiswaBaru', label: 'Maksimal Siswa Baru per Minggu', type: 'number', required: false },
      { name: 'maksimalTotalSiswa', label: 'Maksimal Total Siswa', type: 'number', required: false },
      { name: 'usiaTargetSiswa', label: 'Usia Target Siswa', type: 'text', required: false },
      { name: 'catatanAvailability', label: 'Catatan Ketersediaan', type: 'textarea', required: false },
      { name: 'available_schedule', label: 'Jadwal Ketersediaan', type: 'text', required: true },
      { name: 'teaching_methods', label: 'Metode Mengajar', type: 'text', required: true },
      { name: 'hourly_rate', label: 'Tarif per Jam', type: 'number', required: true },
      
      // 13. TEACHING AREA INFORMATION
      { name: 'teaching_radius_km', label: 'Radius Mengajar (km)', type: 'number', required: false },
      { name: 'transportasiTutor', label: 'Metode Transportasi', type: 'text', required: false },
      { name: 'location_notes', label: 'Catatan Lokasi', type: 'textarea', required: false },
      { name: 'titikLokasiLat', label: 'Latitude Titik Pusat', type: 'number', required: false },
      { name: 'titikLokasiLng', label: 'Longitude Titik Pusat', type: 'number', required: false },
      { name: 'alamatTitikLokasi', label: 'Alamat Titik Pusat Mengajar', type: 'text', required: false },
      
      // 14. TEACHING PREFERENCES
      { name: 'studentLevelPreferences', label: 'Level Siswa yang Disukai', type: 'text', required: false },
      { name: 'specialNeedsCapable', label: 'Kemampuan Mengajar Siswa Berkebutuhan Khusus', type: 'select', required: false },
      { name: 'groupClassWilling', label: 'Kesediaan Mengajar Kelas Grup', type: 'select', required: false },
      { name: 'onlineTeachingCapable', label: 'Kemampuan Mengajar Online', type: 'select', required: false },
      { name: 'techSavviness', label: 'Level Kemampuan Teknologi', type: 'select', required: false },
      { name: 'gmeetExperience', label: 'Level Pengalaman Google Meet', type: 'select', required: false },
      { name: 'presensiUpdateCapability', label: 'Kemampuan Update Presensi', type: 'select', required: false },
      
      // 15. PERSONALITY & CHARACTER
      { name: 'tutorPersonalityType', label: 'Tipe Kepribadian Tutor', type: 'select', required: false },
      { name: 'communicationStyle', label: 'Gaya Komunikasi', type: 'select', required: false },
      { name: 'teachingPatienceLevel', label: 'Level Kesabaran Mengajar', type: 'select', required: false },
      { name: 'studentMotivationAbility', label: 'Kemampuan Memotivasi Siswa', type: 'select', required: false },
      { name: 'scheduleFlexibilityLevel', label: 'Level Fleksibilitas Jadwal', type: 'select', required: false },
      
      // 16. EMERGENCY CONTACT & COMMUNICATION
      { name: 'emergencyContactName', label: 'Nama Kontak Darurat', type: 'text', required: false },
      { name: 'emergencyContactRelationship', label: 'Hubungan dengan Kontak Darurat', type: 'text', required: false },
      { name: 'emergencyContactPhone', label: 'Nomor Telepon Kontak Darurat', type: 'tel', required: false },
      
      // 17. PROGRAM SELECTION
      { name: 'selectedPrograms', label: 'Program yang Dipilih', type: 'text', required: false },
      { name: 'mataPelajaranLainnya', label: 'Mata Pelajaran Lainnya', type: 'textarea', required: false },
    ];
    
    essentialFields.forEach(field => {
      fieldMap.push({
        field,
        csvColumn: field.label // Default CSV column name
      });
    });
    
    return fieldMap;
  };

  // Generate CSV template based on updated form config
  const downloadCSVTemplate = () => {
    const fieldMapping = generateFieldMapping();
    
    // Create CSV headers
    const headers = fieldMapping.map(({ field }) => field.label);
    
    // Create sample data row with examples based on updated mapping
    const sampleRow = fieldMapping.map(({ field }) => {
      switch (field.type) {
        case 'email':
          return 'tutor@example.com';
        case 'tel':
          return '628123456789';
        case 'number':
          return field.name.includes('tarif') || field.name.includes('hourly_rate') ? '75000' : 
                 field.name.includes('ipk') ? '3.75' : 
                 field.name.includes('tahun') ? '2023' :
                 field.name.includes('maksimal') ? '10' :
                 field.name.includes('radius') ? '15' : '1';
        case 'date':
          return '2000-01-15';
        case 'select':
          if (field.name.includes('jenisKelamin')) return 'L';
          if (field.name.includes('agama')) return 'Islam';
          if (field.name.includes('status')) return 'active';
          if (field.name.includes('akademik')) return 'S1';
          if (field.name.includes('approval')) return 'junior';
          if (field.name.includes('provinsi')) return 'DKI Jakarta';
          if (field.name.includes('bank')) return 'Bank Mandiri';
          return 'Pilih Opsi';
        case 'textarea':
          return 'Contoh deskripsi atau penjelasan lengkap...';
        case 'text':
        default:
          if (field.name.includes('nama')) return 'Contoh Nama';
          if (field.name.includes('alamat')) return 'Jl. Contoh No. 123';
          if (field.name.includes('kode')) return 'AUTO-GENERATED';
          return 'Contoh isi field';
      }
    });
    
    // Combine headers and sample data
    const csvData = [headers, sampleRow];
    const csvContent = Papa.unparse(csvData);
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tutor_import_template_v2_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Updated Template Downloaded",
      description: "CSV template v2.0 has been downloaded with complete field mapping based on Form-Add-Tutor-Mapping-Guide.md",
      duration: 3000,
    });
  };

  // Load all reference data for fuzzy matching
  const loadAllData = async () => {
    try {
      console.log('🔄 Loading reference data for fuzzy matching...');
      
      const [
        provincesResponse,
        citiesResponse, 
        subjectsResponse,
        banksResponse
      ] = await Promise.all([
        fetch('/api/locations/provinces'),
        fetch('/api/locations/cities'),
        fetch('/api/programs/lookup?limit=1000'),
        fetch('/api/banks/indonesia?limit=1000')
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
          local_name: s.program_name_local,
          alternate_name: s.program_name
        })) : [];
      
      // Parse banks
      const banksData = await banksResponse.json();
      const banks = banksData.success && banksData.data ? 
        banksData.data.map((b: any) => ({
          id: b.id,
          name: b.bank_name,
          local_name: b.popular_bank_name,
          alternate_name: b.bank_name
        })) : [];

      console.log('✅ Reference data loaded:', {
        provinces: provinces.length,
        cities: cities.length,
        subjects: subjects.length,
        banks: banks.length
      });

      setDataCache({ 
        provinces, 
        cities, 
        subjects, 
        banks,
        categories: [] // We'll add this if needed
      });

    } catch (error) {
      console.error('❌ Failed to load reference data:', error);
      toast({
        title: "Warning",
        description: "Failed to load reference data. Fuzzy matching may be limited.",
        duration: 5000,
      });
    }
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

      console.log('✅ File parsed successfully:', {
        totalRecords: rawData.length,
        firstRecord: rawData[0]
      });

      // For now, just create simple parsed records
      const processedData: ParsedRecord[] = rawData.map((row, index) => ({
        rowNumber: index + 1,
        originalData: row,
        mappedData: row,
        isValid: true,
        errors: [],
        warnings: []
      }));

      setParsedData(processedData);
      setShowPreview(true);

      toast({
        title: "File Processed Successfully",
        description: `Found ${processedData.length} records ready for import.`,
        duration: 5000,
      });

    } catch (error) {
      console.error('❌ File processing error:', error);
      
      toast({
        title: "Error Processing File",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsParsing(false);
    }
  };

  // Handle import to database
  const handleImport = async () => {
    console.log('🔥 handleImport called', { parsedDataLength: parsedData?.length });
    
    if (!parsedData || parsedData.length === 0) {
      toast({
        title: "No Data",
        description: "No data to import. Please upload a file first.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    const validRecords = parsedData.filter(r => r.isValid);
    if (validRecords.length === 0) {
      toast({
        title: "No Valid Records",
        description: "No valid records found to import.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    try {
      console.log('🚀 Starting import process for', validRecords.length, 'records');
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setImportProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      // Prepare data for API
      const importData = validRecords.map(record => record.mappedData);
      
      // Call import API
      console.log('🚀 Calling API with data:', {
        recordsCount: importData.length,
        source: 'csv_import',
        totalRecords: validRecords.length,
        firstRecord: importData[0]
      });
      
      const response = await fetch('/api/tutors/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: importData,
          source: 'csv_import',
          totalRecords: validRecords.length
        })
      });
      
      console.log('📡 API Response status:', response.status, response.statusText);

      clearInterval(progressInterval);
      setImportProgress(95);

      if (!response.ok) {
        console.error('❌ API Response not OK:', response.status, response.statusText);
        let errorMessage = `Import failed with status: ${response.status}`;
        
        try {
          const errorData = await response.json();
          console.error('❌ Error data:', errorData);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ API Response data:', result);
      
      setImportResult({
        totalRecords: validRecords.length,
        successCount: result.successCount ?? 0,
        errorCount: result.errorCount ?? 0,
        warningCount: result.warningCount ?? 0,
        errors: result.errors ?? []
      });

      toast({
        title: "Import Completed",
        description: `Successfully imported ${result.successCount ?? 0} out of ${validRecords.length} records.`,
        duration: 8000,
      });

      // Reset form after successful import
      setTimeout(() => {
        setSelectedFile(null);
        setParsedData([]);
        setShowPreview(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);

    } catch (error) {
      console.error('❌ Import error:', error);
      
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred during import.',
        variant: "destructive",
        duration: 10000,
      });

      setImportResult({
        totalRecords: validRecords.length,
        successCount: 0,
        errorCount: validRecords.length,
        warningCount: 0,
        errors: [{ row: 0, message: error instanceof Error ? error.message : 'Unknown error' }]
      });
    } finally {
      setIsImporting(false);
      setImportProgress(100);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="heroicons:arrow-down-tray" className="w-5 h-5" />
            Import & Export Tutor Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Import Data</h3>
              
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
                  className="sr-only"
                  style={{ display: 'none !important', visibility: 'hidden', position: 'absolute', left: '-9999px' }}
                />
                <div className="flex gap-2 justify-center">
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
                    <div className="flex items-center justify-center gap-3">
                      <Icon icon="heroicons:document-text" className="w-6 h-6 text-blue-600 flex-shrink-0" />
                      <div className="text-center">
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || 'Unknown type'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Download Template */}
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  onClick={downloadCSVTemplate}
                  className="w-full"
                >
                  <Icon icon="heroicons:document-arrow-down" className="w-4 h-4 mr-2" />
                  Download Template v2.0
                </Button>
                <p className="text-sm text-muted-foreground">
                  Template has been updated with complete field mapping based on Form-Add-Tutor-Mapping-Guide.md
                </p>
                
                {/* Debug Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/debug-db');
                        const result = await response.json();
                        console.log('🔍 Debug DB Result:', result);
                        toast({
                          title: "Debug DB",
                          description: `Connection: ${result.success ? 'OK' : 'Failed'} - Check console for details`,
                          duration: 5000,
                        });
                      } catch (error) {
                        console.error('Debug DB Error:', error);
                        toast({
                          title: "Debug DB Error",
                          description: "Check console for details",
                          variant: "destructive",
                          duration: 5000,
                        });
                      }
                    }}
                  >
                    🔍 Debug DB
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/test-insert', { method: 'POST' });
                        const result = await response.json();
                        console.log('🧪 Test Insert Result:', result);
                        toast({
                          title: "Test Insert",
                          description: `Result: ${result.success ? 'Success' : 'Failed'} - Check console for details`,
                          duration: 5000,
                        });
                      } catch (error) {
                        console.error('Test Insert Error:', error);
                        toast({
                          title: "Test Insert Error",
                          description: "Check console for details",
                          variant: "destructive",
                          duration: 5000,
                        });
                      }
                    }}
                  >
                    🧪 Test Insert
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Export Data</h3>
              <Button 
                variant="outline"
                className="w-full"
                disabled={true}
              >
                <Icon icon="heroicons:arrow-up-tray" className="w-4 h-4 mr-2" />
                Export Current Data
              </Button>
              <p className="text-sm text-muted-foreground">
                Export functionality will be implemented in the next phase
              </p>
            </div>
          </div>
        </CardContent>
      </Card>



      {/* Data Preview */}
      {showPreview && parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="heroicons:eye" className="w-5 h-5" />
              Data Preview ({parsedData.length} records)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Valid: {parsedData.filter(r => r.isValid).length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Invalid: {parsedData.filter(r => !r.isValid).length}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Warnings: {parsedData.filter(r => r.warnings.length > 0).length}</span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="max-h-96 overflow-auto border rounded">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Row</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Preview</TableHead>
                      <TableHead>Issues</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 10).map((record) => (
                      <TableRow key={record.rowNumber}>
                        <TableCell>{record.rowNumber}</TableCell>
                        <TableCell>
                          <Badge className={record.isValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {record.isValid ? "Valid" : "Invalid"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            {Object.entries(record.originalData).slice(0, 3).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {String(value).slice(0, 30)}...
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs space-y-1">
                            {record.errors.map((error, idx) => (
                              <div key={idx} className="text-red-600">❌ {error}</div>
                            ))}
                            {record.warnings.map((warning, idx) => (
                              <div key={idx} className="text-yellow-600">⚠️ {warning}</div>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {parsedData.length > 10 && (
                <p className="text-sm text-muted-foreground text-center">
                  Showing first 10 records out of {parsedData.length} total records
                </p>
              )}

              {/* Import Progress */}
              {isImporting && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importing records...</span>
                    <span>{Math.round(importProgress)}%</span>
                  </div>
                  <Progress value={importProgress} className="h-2" />
                </div>
              )}

              {/* Import Result */}
              {importResult && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Import Results</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Total Records: {importResult.totalRecords}</div>
                    <div className="text-green-600">Success: {importResult.successCount}</div>
                    <div className="text-red-600">Errors: {importResult.errorCount}</div>
                    <div className="text-yellow-600">Warnings: {importResult.warningCount}</div>
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-red-600 mb-1">Errors:</h5>
                      <div className="text-xs space-y-1">
                        {importResult.errors.slice(0, 5).map((error, idx) => (
                          <div key={idx} className="text-red-600">
                            Row {error.row}: {error.message}
                          </div>
                        ))}
                        {importResult.errors.length > 5 && (
                          <div className="text-gray-500">
                            ... and {importResult.errors.length - 5} more errors
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Import Button - Only show if not imported yet */}
              {!importResult && (
                <div className="flex justify-center">
                  <Button 
                    onClick={handleImport}
                    disabled={parsedData.filter(r => r.isValid).length === 0 || isImporting}
                    size="lg"
                  >
                    {isImporting ? (
                      <>
                        <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Icon icon="heroicons:arrow-up-tray" className="w-4 h-4 mr-2" />
                        Import {parsedData.filter(r => r.isValid).length} Valid Records
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
