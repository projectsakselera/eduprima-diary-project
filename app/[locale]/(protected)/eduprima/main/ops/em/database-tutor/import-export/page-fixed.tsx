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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="font-semibold">Import Data</h3>
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


    </div>
  );
}
