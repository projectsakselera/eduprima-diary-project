'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
import { cn } from '@/lib/utils';
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
// 1. Import SPREADSHEET_COLUMNS from view-all
import { SPREADSHEET_COLUMNS } from '../view-all/spreadsheet-columns';

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
  // New properties for alignment with Form Add
  apiEndpoint?: string; // For dynamic select options
  dependsOn?: string; // For dependent fields (e.g., cities depend on province)
  className?: string; // For special field handling (e.g., 'map-picker-field')
  accept?: string; // For file upload types
  icon?: string; // For field icons
  helperText?: string; // For additional help text
  placeholder?: string; // For input placeholders
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [useVirtualScrolling, setUseVirtualScrolling] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const virtualScrollContainerRef = useRef<HTMLDivElement>(null);
  const [virtualScrollTop, setVirtualScrollTop] = useState(0);

  // Pagination logic
  const paginatedData = useMemo(() => {
    if (useVirtualScrolling) {
      return parsedData; // Virtual scrolling handles the slicing
    }
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return parsedData.slice(startIndex, endIndex);
  }, [parsedData, currentPage, pageSize, useVirtualScrolling]);

  const totalPages = Math.ceil(parsedData.length / pageSize);

  // Virtual scrolling logic
  const ITEM_HEIGHT = 100; // Approximate height of each table row in pixels
  const CONTAINER_HEIGHT = 400; // Height of the scrollable container
  const BUFFER_SIZE = 5; // Extra items to render for smooth scrolling

  const virtualScrollData = useMemo(() => {
    if (!useVirtualScrolling) return { items: paginatedData, startIndex: 0, endIndex: 0, totalHeight: 0, offsetY: 0 };

    const startIndex = Math.max(0, Math.floor(virtualScrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
    const endIndex = Math.min(
      parsedData.length,
      startIndex + Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT) + BUFFER_SIZE * 2
    );

    return {
      items: parsedData.slice(startIndex, endIndex),
      startIndex,
      endIndex,
      totalHeight: parsedData.length * ITEM_HEIGHT,
      offsetY: startIndex * ITEM_HEIGHT,
    };
  }, [parsedData, virtualScrollTop, useVirtualScrolling, paginatedData]);

  // Handle virtual scroll
  const handleVirtualScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setVirtualScrollTop(e.currentTarget.scrollTop);
  };

  // Auto-enable virtual scrolling for large datasets
  useEffect(() => {
    if (parsedData.length > 200 && !useVirtualScrolling) {
      setUseVirtualScrolling(true);
    } else if (parsedData.length <= 200 && useVirtualScrolling) {
      setUseVirtualScrolling(false);
    }
  }, [parsedData.length, useVirtualScrolling]);

  // Pagination component
  const PaginationControls = () => {
    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, parsedData.length)} of {parsedData.length} records
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <Icon icon="heroicons:chevron-double-left" className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <Icon icon="heroicons:chevron-left" className="w-4 h-4" />
          </Button>

          {getPageNumbers().map((pageNum, idx) => (
            pageNum === '...' ? (
              <span key={idx} className="px-2 text-muted-foreground">...</span>
            ) : (
              <Button
                key={idx}
                variant={currentPage === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => typeof pageNum === 'number' && setCurrentPage(pageNum)}
                className="min-w-[32px]"
              >
                {pageNum}
              </Button>
            )
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <Icon icon="heroicons:chevron-right" className="w-4 h-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <Icon icon="heroicons:chevron-double-right" className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };
  
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

  // Advanced Field Renderer Component
  const AdvancedFieldRenderer: React.FC<{
    field: TutorFormField;
    value: any;
    originalValue?: any;
    isMatched?: boolean;
    className?: string;
  }> = ({ field, value, originalValue, isMatched = false, className = "" }) => {
    const displayValue = value ?? originalValue ?? '';
    
    // Helper to format phone numbers
    const formatPhone = (phone: string) => {
      if (!phone) return '';
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length >= 10) {
        return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`;
      }
      return phone;
    };

    // Helper to format arrays
    const formatArray = (arr: any) => {
      if (Array.isArray(arr)) {
        return arr.slice(0, 3).join(', ') + (arr.length > 3 ? ` +${arr.length - 3} more` : '');
      }
      return String(arr);
    };

    const baseClasses = cn(
      "text-xs px-2 py-1 rounded border",
      isMatched ? "bg-green-50 border-green-200 text-green-800" : "bg-gray-50 border-gray-200 text-gray-700",
      className
    );

    switch (field.type) {
      case 'tel_split':
      case 'tel':
        return (
          <div className={baseClasses}>
            <div className="flex items-center gap-1">
              <Icon icon="ph:phone" className="w-3 h-3" />
              <span>{formatPhone(displayValue)}</span>
              {isMatched && <Icon icon="ph:check-circle" className="w-3 h-3 text-green-600" />}
            </div>
          </div>
        );

      case 'email':
        return (
          <div className={baseClasses}>
            <div className="flex items-center gap-1">
              <Icon icon="ph:envelope" className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{displayValue}</span>
              {isMatched && <Icon icon="ph:check-circle" className="w-3 h-3 text-green-600" />}
            </div>
          </div>
        );

      case 'select':
        return (
          <div className={baseClasses}>
            <div className="flex items-center gap-1">
              <Icon icon="ph:list" className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{displayValue}</span>
              {isMatched && <Icon icon="ph:check-circle" className="w-3 h-3 text-green-600" />}
            </div>
          </div>
        );

      case 'category-program-selector':
        return (
          <div className={baseClasses}>
            <div className="flex items-center gap-1">
              <Icon icon="ph:books" className="w-3 h-3" />
              <span className="truncate max-w-[100px]">{formatArray(displayValue)}</span>
              {isMatched && <Icon icon="ph:check-circle" className="w-3 h-3 text-green-600" />}
            </div>
          </div>
        );

      case 'date':
        let formattedDate = '';
        if (displayValue) {
          try {
            // Handle different date formats
            let dateObj;
            const dateStr = String(displayValue).trim();
            
            // Try parsing various formats
            if (dateStr.includes('/')) {
              // Handle DD/MM/YYYY or MM/DD/YYYY format
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                // Assume DD/MM/YYYY format for Indonesian data
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]) - 1; // Month is 0-indexed
                const year = parseInt(parts[2]);
                dateObj = new Date(year, month, day);
              }
            } else {
              // Try standard date parsing
              dateObj = new Date(dateStr);
            }
            
            if (dateObj && !isNaN(dateObj.getTime())) {
              formattedDate = dateObj.toLocaleDateString('id-ID');
            } else {
              formattedDate = dateStr; // Fallback to original
            }
          } catch (error) {
            formattedDate = String(displayValue);
          }
        }
        
        return (
          <div className={baseClasses}>
            <div className="flex items-center gap-1">
              <Icon icon="ph:calendar" className="w-3 h-3" />
              <span>{formattedDate}</span>
              {isMatched && <Icon icon="ph:check-circle" className="w-3 h-3 text-green-600" />}
            </div>
          </div>
        );

      case 'number':
        return (
          <div className={baseClasses}>
            <div className="flex items-center gap-1">
              <Icon icon="ph:hash" className="w-3 h-3" />
              <span>{displayValue}</span>
              {isMatched && <Icon icon="ph:check-circle" className="w-3 h-3 text-green-600" />}
            </div>
          </div>
        );

      case 'textarea':
        return (
          <div className={baseClasses}>
            <div className="flex items-start gap-1">
              <Icon icon="ph:text-align-left" className="w-3 h-3 mt-0.5" />
              <span className="line-clamp-2 text-xs">{String(displayValue).slice(0, 50)}...</span>
              {isMatched && <Icon icon="ph:check-circle" className="w-3 h-3 text-green-600 mt-0.5" />}
            </div>
          </div>
        );

      case 'file':
        return (
          <div className={baseClasses}>
            <div className="flex items-center gap-1">
              <Icon icon="ph:file" className="w-3 h-3" />
              <span className="text-orange-600">File Upload Required</span>
            </div>
          </div>
        );

      default:
        return (
          <div className={baseClasses}>
            <div className="flex items-center gap-1">
              <Icon icon="ph:text-aa" className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{String(displayValue).slice(0, 30)}</span>
              {isMatched && <Icon icon="ph:check-circle" className="w-3 h-3 text-green-600" />}
            </div>
          </div>
        );
    }
  };

  // Step-based Field Grouping (sesuai Form Add structure)
  const getFieldsByStep = (record: ParsedRecord) => {
    return {
      'identity-basic': {
        title: 'Identitas Dasar',
        icon: 'ph:user-circle',
        fields: [
          { key: 'Email Aktif', type: 'email', mappedKey: 'email' },
          { key: 'No. HP Utama (+62)', type: 'tel_split', mappedKey: 'noHp1' },
          { key: 'Nama Lengkap', type: 'text', mappedKey: 'namaLengkap' },
          { key: 'Tanggal Lahir', type: 'date', mappedKey: 'tanggalLahir' },
          { key: 'Provinsi Domisili', type: 'select', mappedKey: 'provinsiDomisili_matched' },
          { key: 'Kota/Kabupaten Domisili', type: 'select', mappedKey: 'kotaKabupatenDomisili_matched' },
          { key: 'Nama Bank', type: 'select', mappedKey: 'namaBank_matched' }
        ]
      },
      'education-experience': {
        title: 'Pendidikan & Pengalaman',
        icon: 'ph:graduation-cap',
        fields: [
          { key: 'Status Akademik', type: 'select', mappedKey: 'statusAkademik' },
          { key: 'Nama Universitas', type: 'text', mappedKey: 'namaUniversitas' },
          { key: 'Fakultas/Jurusan', type: 'text', mappedKey: 'fakultas' },
          { key: 'IPK/GPA', type: 'number', mappedKey: 'ipk' }
        ]
      },
      'subjects-areas': {
        title: 'Mata Pelajaran',
        icon: 'ph:books',
        fields: [
          { key: 'Program yang Dipilih', type: 'category-program-selector', mappedKey: 'selectedPrograms_matched' }
        ]
      },
      'availability-location': {
        title: 'Ketersediaan & Wilayah',
        icon: 'ph:map-pin',
        fields: [
          { key: 'Status Menerima Siswa', type: 'select', mappedKey: 'statusMenerimaSiswa' },
          { key: 'Tarif per Jam', type: 'number', mappedKey: 'hourly_rate' },
          { key: 'Radius Mengajar (km)', type: 'number', mappedKey: 'teaching_radius_km' }
        ]
      },
      'documents': {
        title: 'Dokumen',
        icon: 'ph:file-text',
        fields: [
          { key: 'Foto Profil', type: 'file', mappedKey: 'fotoProfil' },
          { key: 'Transkrip Nilai', type: 'file', mappedKey: 'transkripNilai' },
          { key: 'Sertifikat Keahlian', type: 'file', mappedKey: 'sertifikatKeahlian' }
        ]
      }
    };
  };

  // Step-based Preview Component
  const StepBasedPreview: React.FC<{ record: ParsedRecord }> = ({ record }) => {
    const steps = getFieldsByStep(record);
    
    return (
      <div className="space-y-3">
        {Object.entries(steps).map(([stepId, step]) => {
          // Filter fields that have data
          const fieldsWithData = step.fields.filter(field => 
            record.originalData[field.key] || record.mappedData[field.mappedKey]
          );
          
          if (fieldsWithData.length === 0) return null;
          
          return (
            <div key={stepId} className="border rounded-lg p-2 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <Icon icon={step.icon} className="w-4 h-4 text-primary" />
                <span className="font-medium text-xs text-primary">{step.title}</span>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {fieldsWithData.map(field => (
                  <AdvancedFieldRenderer
                    key={field.key}
                    field={{ 
                      name: field.mappedKey, 
                      label: field.key, 
                      type: field.type 
                    }}
                    value={record.mappedData[field.mappedKey]}
                    originalValue={record.originalData[field.key]}
                    isMatched={!!record.mappedData[field.mappedKey] && record.mappedData[field.mappedKey] !== record.originalData[field.key]}
                    className="w-full"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Generate comprehensive field mapping from simplified config (UPDATED 2025 - Based on Form-Add-Tutor-Mapping-Guide.md)
  const generateFieldMapping = (): Array<{field: TutorFormField, csvColumn: string}> => {
    const fieldMap: Array<{field: TutorFormField, csvColumn: string}> = [];
    
    // Define comprehensive fields for bulk import (based on updated mapping guide)
    const essentialFields: TutorFormField[] = [
      // === STEP 1: IDENTITY BASIC ===
      {
        name: 'section_identity_basic',
        label: 'IDENTITAS DASAR',
        type: 'text',
        required: false,
        className: 'section-divider',
        icon: 'ph:user-circle'
      },
      
      // 1. SYSTEM & AUTHENTICATION
      { name: 'user_code', label: 'User Code', type: 'text', required: false },
      { name: 'email', label: 'Email Aktif', type: 'email', required: true },
      { name: 'phone', label: 'No. HP Utama (+62)', type: 'tel_split', required: true },
      { name: 'primary_role_id', label: 'Primary Role ID', type: 'text', required: false },
      { name: 'account_type', label: 'Account Type', type: 'select', required: false },
      { name: 'user_status', label: 'User Status', type: 'select', required: false },
      
      // 2. PERSONAL INFORMATION
      { name: 'trn', label: 'TRN (Tutor Registration Number)', type: 'text', required: false },
      { name: 'namaLengkap', label: 'Nama Lengkap', type: 'text', required: true },
      { name: 'namaPanggilan', label: 'Nama Panggilan', type: 'text', required: false },
      { name: 'tanggalLahir', label: 'Tanggal Lahir', type: 'date', required: true },
      { name: 'jenisKelamin', label: 'Jenis Kelamin', type: 'select', required: true },
      { name: 'noHp1', label: 'No. HP Utama (+62)', type: 'tel_split', required: true },
      { name: 'noHp2', label: 'No. HP Alternatif', type: 'tel_split', required: false },
      { name: 'whatsappNumber', label: 'Nomor WhatsApp', type: 'tel_split', required: false },
      { name: 'agama', label: 'Agama', type: 'select', required: false },
      
      // 3. PROFILE & VALUE PROPOSITION
      { name: 'headline', label: 'Headline/Tagline Tutor', type: 'text', required: false },
      { name: 'deskripsiDiri', label: 'Deskripsi Diri/Bio Tutor', type: 'textarea', required: false },
      { name: 'socialMedia1', label: 'Link Media Sosial 1', type: 'text', required: false },
      { name: 'socialMedia2', label: 'Link Media Sosial 2', type: 'text', required: false },
      { name: 'languagesMastered', label: 'Bahasa yang Dikuasai', type: 'text', required: false },
      { name: 'preferredLanguage', label: 'Bahasa Komunikasi Preferred', type: 'text', required: false },
      
      // 4. ADDRESS INFORMATION - DOMICILE
      { name: 'provinsiDomisili', label: 'Provinsi Domisili', type: 'select', apiEndpoint: '/api/locations/provinces', required: true },
      { name: 'kotaKabupatenDomisili', label: 'Kota/Kabupaten Domisili', type: 'select', apiEndpoint: '/api/locations/cities', dependsOn: 'provinsiDomisili', required: true },
      { name: 'kecamatanDomisili', label: 'Kecamatan Domisili', type: 'text', required: true },
      { name: 'kelurahanDomisili', label: 'Kelurahan/Desa Domisili', type: 'text', required: true },
      { name: 'alamatLengkapDomisili', label: 'Alamat Lengkap Domisili', type: 'textarea', required: true },
      { name: 'kodePosDomisili', label: 'Kode Pos Domisili', type: 'text', required: false },
      
      // 5. ADDRESS INFORMATION - KTP/KK
      { name: 'alamatSamaDenganKTP', label: 'Alamat Sama dengan KTP', type: 'select', required: false },
      { name: 'provinsiKTP', label: 'Provinsi KTP', type: 'select', apiEndpoint: '/api/locations/provinces', required: false },
      { name: 'kotaKabupatenKTP', label: 'Kota/Kabupaten KTP', type: 'select', apiEndpoint: '/api/locations/cities', dependsOn: 'provinsiKTP', required: false },
      { name: 'kecamatanKTP', label: 'Kecamatan KTP', type: 'text', required: false },
      { name: 'kelurahanKTP', label: 'Kelurahan/Desa KTP', type: 'text', required: false },
      { name: 'alamatLengkapKTP', label: 'Alamat Lengkap KTP', type: 'textarea', required: false },
      { name: 'kodePosKTP', label: 'Kode Pos KTP', type: 'text', required: false },
      
      // 6. BANKING INFORMATION
      { name: 'namaNasabah', label: 'Nama Pemilik Rekening', type: 'text', required: true },
      { name: 'nomorRekening', label: 'Nomor Rekening Bank', type: 'text', required: true },
      { name: 'namaBank', label: 'Nama Bank', type: 'select', apiEndpoint: '/api/banks/indonesia', required: true },
      
      // === STEP 2: EDUCATION & EXPERIENCE ===
      {
        name: 'section_education_experience',
        label: 'PENDIDIKAN & PENGALAMAN',
        type: 'text',
        required: false,
        className: 'section-divider',
        icon: 'ph:graduation-cap'
      },
      
      // 7. EDUCATION INFORMATION
      { name: 'statusAkademik', label: 'Status Akademik', type: 'select', required: true },
      { name: 'namaUniversitas', label: 'Nama Universitas', type: 'text', required: false },
      { name: 'fakultas', label: 'Fakultas/Jurusan', type: 'text', required: false },
      { name: 'ipk', label: 'IPK/GPA', type: 'number', required: false },
      { name: 'tahunLulus', label: 'Tahun Lulus', type: 'number', required: false },
      { name: 'namaUniversitasS1', label: 'Nama Universitas S1', type: 'text', required: false },
      { name: 'fakultasS1', label: 'Fakultas S1', type: 'text', required: false },
      { name: 'jurusanS1', label: 'Jurusan S1', type: 'text', required: false },
      { name: 'jurusan', label: 'Jurusan (General)', type: 'text', required: false },
      { name: 'tahunMasuk', label: 'Tahun Masuk Kuliah', type: 'number', required: false },
      { name: 'namaSMA', label: 'Nama SMA/SMK', type: 'text', required: false },
      { name: 'jurusanSMA', label: 'Jurusan SMA', type: 'text', required: false },
      { name: 'jurusanSMKDetail', label: 'Detail Jurusan SMK', type: 'text', required: false },
      { name: 'tahunLulusSMA', label: 'Tahun Lulus SMA/SMK', type: 'number', required: false },
      
      // 8. ALTERNATIVE LEARNING BACKGROUND
      { name: 'namaInstitusi', label: 'Nama Institusi Alternatif', type: 'text', required: false },
      // { name: 'bidangKeahlian', label: 'Bidang Keahlian', type: 'text', required: false },
      // { name: 'pengalamanBelajar', label: 'Pengalaman Belajar', type: 'textarea', required: false },
      
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
      
      // === STEP 4: AVAILABILITY & LOCATION ===
      {
        name: 'section_availability_location',
        label: 'KETERSEDIAAN & WILAYAH MENGAJAR',
        type: 'text',
        required: false,
        className: 'section-divider',
        icon: 'ph:map-pin'
      },
      
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
      { name: 'alamatTitikLokasi', label: 'Alamat Titik Pusat Mengajar', type: 'text', className: 'map-picker-field', required: false },
      
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
      { name: 'emergencyContactPhone', label: 'Nomor Telepon Kontak Darurat', type: 'tel_split', required: false },
      
      // === STEP 3: SUBJECTS & AREAS ===
      {
        name: 'section_subjects_areas',
        label: 'MATA PELAJARAN & BIDANG KEAHLIAN',
        type: 'text',
        required: false,
        className: 'section-divider',
        icon: 'ph:books'
      },
      
      // 17. PROGRAM SELECTION
      { name: 'selectedPrograms', label: 'Program yang Dipilih', type: 'category-program-selector', required: false },
      { name: 'mataPelajaranLainnya', label: 'Mata Pelajaran Lainnya', type: 'textarea', required: false },
      
      // === STEP 5: DOCUMENTS ===
      {
        name: 'section_documents',
        label: 'DOKUMEN PENDUKUNG',
        type: 'text',
        required: false,
        className: 'section-divider',
        icon: 'ph:file-text'
      },
      
      // 18. DOCUMENT UPLOADS (CRITICAL - Missing in Import-Export)
      { name: 'fotoProfil', label: 'Foto Profil', type: 'file', required: false },
      { name: 'transkripNilai', label: 'Transkrip Nilai/Ijazah', type: 'file', required: false },
      { name: 'sertifikatKeahlian', label: 'Sertifikat Keahlian', type: 'file', required: false },
      { name: 'dokumenIdentitas', label: 'Dokumen Identitas (KTP/Passport)', type: 'file', required: false },
      { name: 'dokumenPendidikan', label: 'Dokumen Pendidikan', type: 'file', required: false },
    ];
    
    essentialFields.forEach(field => {
      fieldMap.push({
        field,
        csvColumn: field.label // Default CSV column name
      });
    });
    
    return fieldMap;
  };

  // Generate CSV template dengan proper column names
  const downloadCSVTemplate = () => {
    // Filter out system/display-only columns
    const skipKeys = [
      'id', 'created_at', 'updated_at', 'recruitment_stage_history', 'last_status_change', 'status_changed_by',
      'form_agreement_check', 'recruitment_stage_history', 'fotoProfil', 'dokumenIdentitas', 'dokumenPendidikan', 'dokumenSertifikat', 'transkripNilai',
      'status_verifikasi_identitas', 'status_verifikasi_pendidikan', 'additional_screening', 'staff_notes', 'approval_level', 'trn', 'status_tutor',
      'recruitment_stage_history', 'form_agreement_check', 'recruitment_stage_history', 'recruitment_stage_history', 'recruitment_stage_history',
    ];
    const csvColumns = SPREADSHEET_COLUMNS.filter((col: any) => !skipKeys.includes(col.key));

    // Generate headers, example, and required info
    const headers = csvColumns.map((col: any) => col.label);
    const exampleRow = csvColumns.map((col: any) => {
      switch (col.type) {
        case 'email': return 'tutor@email.com';
        case 'phone': return '08123456789';
        case 'date': return '1990-01-01';
        case 'number': return '100';
        case 'array': return 'item1; item2';
        case 'select': return 'Pilihan';
        case 'boolean': return 'TRUE/FALSE';
        default: return 'Contoh';
      }
    });
    const requiredRow = csvColumns.map((col: any) => col.required ? 'WAJIB' : 'Opsional');

    // Create CSV with 3 rows: headers, required info, example data
    const csvData = [headers, requiredRow, exampleRow];
    const csvContent = Papa.unparse(csvData, {
      header: false,
      skipEmptyLines: false,
      quotes: true
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `eduprima_tutor_import_template_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log('✅ CSV template downloaded with', csvColumns.length, 'columns');
    
    toast({
      title: "Template CSV Berhasil Diunduh! 📥",
      description: `Template dengan ${csvColumns.length} kolom telah diunduh. Baris ke-2 menunjukkan field wajib/opsional, baris ke-3 berisi contoh data.`,
      duration: 4000,
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
      console.log('🏦 Raw banks API response:', banksData);
      
      const banks = banksData.success && banksData.data ? 
        banksData.data.map((b: any) => ({
          id: b.value || b.id,
          name: b.label || b.popular_bank_name || b.bank_name,
          local_name: b.popular_bank_name,
          alternate_name: b.fullName || b.bank_name
        })) : [];
      
      console.log('🏦 Processed banks for fuzzy matching:', banks.slice(0, 3));

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

  // Process records with fuzzy matching
  const processRecordsWithFuzzyMatching = async (rawData: any[]): Promise<ParsedRecord[]> => {
    const processedRecords: ParsedRecord[] = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i];
      const rowNumber = i + 1;
      const errors: string[] = [];
      const warnings: string[] = [];
      const mappedData = { ...row };
      
      console.log(`🔍 Processing record ${rowNumber}:`, Object.keys(row));
      
      // === FUZZY MATCHING VARIABLES ===
      let resolvedProvinceName = null;
      let resolvedCityName = null;
      let resolvedBankName = null;
      let resolvedProgramIds: string[] = [];
      
      // === FUZZY MATCHING FOR PROVINCES ===
      if (row['Provinsi Domisili'] && typeof row['Provinsi Domisili'] === 'string' && row['Provinsi Domisili'].trim() && dataCache.provinces.length > 0) {
        const provinceMatches = findBestLocationMatches(
          row['Provinsi Domisili'], 
          dataCache.provinces, 
          'provinces'
        );
        
        if (provinceMatches.length > 0) {
          const bestMatch = provinceMatches[0];
          mappedData['provinsiDomisili'] = bestMatch.id;
          mappedData['provinsiDomisili_matched'] = bestMatch.name;
          resolvedProvinceName = bestMatch.name;
          
          if (provinceMatches[0].similarity && provinceMatches[0].similarity < 90) {
            warnings.push(`Province "${row['Provinsi Domisili']}" matched to "${bestMatch.name}" with ${provinceMatches[0].similarity}% confidence`);
          }
          
          console.log(`✅ Province matched: "${row['Provinsi Domisili']}" → "${bestMatch.name}" (${provinceMatches[0].similarity}%)`);
        } else {
          errors.push(`Province "${row['Provinsi Domisili']}" not found`);
          console.log(`❌ Province not matched: "${row['Provinsi Domisili']}"`);
        }
      }
      
      // === FUZZY MATCHING FOR CITIES ===
      if (row['Kota/Kabupaten Domisili'] && typeof row['Kota/Kabupaten Domisili'] === 'string' && row['Kota/Kabupaten Domisili'].trim() && dataCache.cities.length > 0) {
        // Filter cities by province if province was matched
        let citiesToSearch = dataCache.cities;
        if (mappedData['provinsiDomisili']) {
          citiesToSearch = dataCache.cities.filter(city => 
            city.province_id === mappedData['provinsiDomisili']
          );
        }
        
        const cityMatches = findBestLocationMatches(
          row['Kota/Kabupaten Domisili'], 
          citiesToSearch, 
          'cities'
        );
        
        if (cityMatches.length > 0) {
          const bestMatch = cityMatches[0];
          mappedData['kotaKabupatenDomisili'] = bestMatch.id;
          mappedData['kotaKabupatenDomisili_matched'] = bestMatch.name;
          resolvedCityName = bestMatch.name;
          
          if (cityMatches[0].similarity && cityMatches[0].similarity < 90) {
            warnings.push(`City "${row['Kota/Kabupaten Domisili']}" matched to "${bestMatch.name}" with ${cityMatches[0].similarity}% confidence`);
          }
          
          console.log(`✅ City matched: "${row['Kota/Kabupaten Domisili']}" → "${bestMatch.name}" (${cityMatches[0].similarity}%)`);
        } else {
          errors.push(`City "${row['Kota/Kabupaten Domisili']}" not found`);
          console.log(`❌ City not matched: "${row['Kota/Kabupaten Domisili']}"`);
        }
      }
      
      // === FUZZY MATCHING FOR BANKS ===
      if (row['Nama Bank'] && typeof row['Nama Bank'] === 'string' && row['Nama Bank'].trim() && dataCache.banks.length > 0) {
        const bankMatches = findBestBankMatches(row['Nama Bank'], dataCache.banks);
        
        if (bankMatches.length > 0) {
          const bestMatch = bankMatches[0];
          mappedData['namaBank'] = bestMatch.id;
          mappedData['namaBank_matched'] = bestMatch.name;
          resolvedBankName = bestMatch.name;
          
          if (bankMatches[0].similarity && bankMatches[0].similarity < 90) {
            warnings.push(`Bank "${row['Nama Bank']}" matched to "${bestMatch.name}" with ${bankMatches[0].similarity}% confidence`);
          }
          
          console.log(`✅ Bank matched: "${row['Nama Bank']}" → "${bestMatch.name}" (${bankMatches[0].similarity}%)`);
        } else {
          errors.push(`Bank "${row['Nama Bank']}" not found`);
          console.log(`❌ Bank not matched: "${row['Nama Bank']}"`);
        }
      }
      
      // === FUZZY MATCHING FOR SUBJECTS/PROGRAMS ===
      if (row['Program yang Dipilih'] && typeof row['Program yang Dipilih'] === 'string' && row['Program yang Dipilih'].trim() && dataCache.subjects.length > 0) {
        // Handle multiple programs separated by comma/semicolon
        const programsList = row['Program yang Dipilih'].split(/[,;]/).map((p: string) => p.trim()).filter((p: string) => p);
        const matchedPrograms: string[] = [];
        const matchedProgramNames: string[] = [];
        
        for (const program of programsList) {
          const programMatches = findBestSubjectMatches(program, dataCache.subjects);
          
          if (programMatches.length > 0) {
            const bestMatch = programMatches[0];
            matchedPrograms.push(bestMatch.id);
            matchedProgramNames.push(bestMatch.name);
            
            if (programMatches[0].similarity && programMatches[0].similarity < 75) {
              warnings.push(`Program "${program}" matched to "${bestMatch.name}" with ${programMatches[0].similarity}% confidence`);
            }
            
            console.log(`✅ Program matched: "${program}" → "${bestMatch.name}" (${programMatches[0].similarity}%)`);
          } else {
            warnings.push(`Program "${program}" not found in database`);
            console.log(`⚠️ Program not matched: "${program}"`);
          }
        }
        
        if (matchedPrograms.length > 0) {
          mappedData['selectedPrograms'] = matchedPrograms;
          mappedData['selectedPrograms_matched'] = matchedProgramNames;
          resolvedProgramIds = matchedPrograms;
        }
      }
      
      // === COMPREHENSIVE VALIDATION ===
      console.log(`🔍 Running comprehensive validation for record ${rowNumber}...`);
      
      // Required field validation
      const requiredFields = [
        { key: 'Nama Lengkap', message: 'Nama lengkap wajib diisi' },
        { key: 'Email Aktif', message: 'Email aktif wajib diisi' }
      ];
      for (const field of requiredFields) {
        if (!row[field.key] || String(row[field.key]).trim() === '') {
          errors.push(field.message);
        }
      }
      // Validasi nomor HP utama hanya cek 'No. HP (WhatsApp)'
      if (!row['No. HP (WhatsApp)'] || String(row['No. HP (WhatsApp)']).trim() === '') {
        errors.push('Nomor HP utama wajib diisi');
      }
      
      // Email validation
      if (row['Email Aktif']) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(row['Email Aktif'])) {
          errors.push('Format email tidak valid');
        }
      }
      
      // Phone validation
      if (row['No. HP Utama (+62)']) {
        const phoneRegex = /^[\d\s\-\+\(\)]{8,15}$/;
        if (!phoneRegex.test(row['No. HP Utama (+62)'])) {
          errors.push('Format nomor HP tidak valid');
        }
      }
      
      // Date validation
      if (row['Tanggal Lahir']) {
        const birthDate = new Date(row['Tanggal Lahir']);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (isNaN(birthDate.getTime())) {
          errors.push('Format tanggal lahir tidak valid');
        } else if (age < 17 || age > 70) {
          warnings.push(`Usia ${age} tahun mungkin tidak sesuai untuk tutor`);
        }
      }
      
      // Location validation warnings
      if (row['Provinsi Domisili'] && typeof row['Provinsi Domisili'] === 'string' && row['Provinsi Domisili'].trim() && !resolvedProvinceName) {
        warnings.push('Provinsi tidak ditemukan dalam database, akan menggunakan teks asli');
      }
      
      if (row['Kota/Kabupaten Domisili'] && typeof row['Kota/Kabupaten Domisili'] === 'string' && row['Kota/Kabupaten Domisili'].trim() && !resolvedCityName) {
        warnings.push('Kota/Kabupaten tidak ditemukan dalam database, akan menggunakan teks asli');
      }
      
      // Bank validation warnings
      if (row['Nama Bank'] && typeof row['Nama Bank'] === 'string' && row['Nama Bank'].trim() && !resolvedBankName) {
        warnings.push('Bank tidak ditemukan dalam database, akan menggunakan teks asli');
      }
      
      // Program validation
      if (row['Program yang Dipilih'] && typeof row['Program yang Dipilih'] === 'string' && row['Program yang Dipilih'].trim()) {
        const programsList = row['Program yang Dipilih'].split(/[,;]/).map((p: string) => p.trim()).filter((p: string) => p);
        if (programsList.length === 0) {
          warnings.push('Program yang dipilih kosong');
        } else if (resolvedProgramIds.length === 0) {
          warnings.push('Tidak ada program yang berhasil dicocokkan dengan database');
        } else if (resolvedProgramIds.length < programsList.length) {
          warnings.push(`Hanya ${resolvedProgramIds.length} dari ${programsList.length} program yang berhasil dicocokkan`);
        }
      }
      
      // Additional validation based on field types
      if (row['IPK/GPA']) {
        const gpa = parseFloat(row['IPK/GPA']);
        if (isNaN(gpa) || gpa < 0 || gpa > 4) {
          warnings.push('IPK/GPA harus berupa angka antara 0-4');
        }
      }
      
      if (row['Tarif per Jam']) {
        const rate = parseFloat(row['Tarif per Jam']);
        if (isNaN(rate) || rate <= 0) {
          warnings.push('Tarif per jam harus berupa angka positif');
        } else if (rate < 10000) {
          warnings.push('Tarif per jam sangat rendah (< Rp 10.000)');
        } else if (rate > 500000) {
          warnings.push('Tarif per jam sangat tinggi (> Rp 500.000)');
        }
      }
      
      // Determine if record is valid (has critical errors)
      const isValid = errors.length === 0;
      
      processedRecords.push({
        rowNumber,
        originalData: row,
        mappedData,
        isValid,
        errors,
        warnings
      });
      
      // Log progress every 10 records
      if (rowNumber % 10 === 0) {
        console.log(`🔄 Processed ${rowNumber}/${rawData.length} records`);
      }
    }
    
    console.log('✅ Fuzzy matching completed:', {
      totalRecords: processedRecords.length,
      validRecords: processedRecords.filter(r => r.isValid).length,
      recordsWithWarnings: processedRecords.filter(r => r.warnings.length > 0).length,
      recordsWithErrors: processedRecords.filter(r => r.errors.length > 0).length
    });
    
    return processedRecords;
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
    setCurrentPage(1);
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

      // Process data with fuzzy matching
      console.log('🔍 Starting fuzzy matching for', rawData.length, 'records...');
      const processedData: ParsedRecord[] = await processRecordsWithFuzzyMatching(rawData);

      setParsedData(processedData);
      setCurrentPage(1);
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
        setCurrentPage(1);
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
                        setCurrentPage(1);
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
                  Download Template CSV
                </Button>
                <p className="text-sm text-muted-foreground">
                  📥 Template CSV lengkap dengan 32 kolom, termasuk info field wajib/opsional dan contoh data. 
                  Mendukung fuzzy matching untuk lokasi, bank, dan program.
                </p>
                
                {/* Debug Buttons */}
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={async () => {
                      try {
                        // Debug DB API removed - use health check instead
                        const response = await fetch('/api/health');
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
                        // Test insert API removed - functionality moved to Edge Functions
                        console.warn('Test insert functionality moved to Edge Functions');
                        const result = { success: false, message: 'API removed - use Edge Functions' };
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
              {/* Page Size Selector */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <label htmlFor="pageSize" className="text-sm font-medium">
                      Rows per page:
                    </label>
                    <select
                      id="pageSize"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {useVirtualScrolling ? (
                      `Virtual scrolling enabled (${parsedData.length} records)`
                    ) : (
                      `Page ${currentPage} of ${totalPages}`
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={useVirtualScrolling}
                      onChange={(e) => setUseVirtualScrolling(e.target.checked)}
                      className="rounded"
                    />
                    Virtual Scrolling {parsedData.length > 200 && "(Recommended)"}
                  </label>
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {/* Validation Status */}
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
                
                {/* Fuzzy Matching Stats */}
                <div className="flex items-center gap-2">
                  <Icon icon="ph:magnifying-glass" className="w-3 h-3 text-blue-500" />
                  <span>Matched: {parsedData.filter(r => 
                    r.mappedData['provinsiDomisili_matched'] || 
                    r.mappedData['kotaKabupatenDomisili_matched'] || 
                    r.mappedData['namaBank_matched'] || 
                    r.mappedData['selectedPrograms_matched']
                  ).length}</span>
                </div>
              </div>
              
              {/* Detailed Fuzzy Matching Stats */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Icon icon="ph:robot" className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">Fuzzy Matching Results</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <Icon icon="ph:map-pin" className="inline w-3 h-3 mr-1 text-blue-600" />
                    Provinces: {parsedData.filter(r => r.mappedData['provinsiDomisili_matched']).length}
                  </div>
                  <div>
                    <Icon icon="ph:buildings" className="inline w-3 h-3 mr-1 text-blue-600" />
                    Cities: {parsedData.filter(r => r.mappedData['kotaKabupatenDomisili_matched']).length}
                  </div>
                  <div>
                    <Icon icon="ph:bank" className="inline w-3 h-3 mr-1 text-blue-600" />
                    Banks: {parsedData.filter(r => r.mappedData['namaBank_matched']).length}
                  </div>
                  <div>
                    <Icon icon="ph:books" className="inline w-3 h-3 mr-1 text-blue-600" />
                    Programs: {parsedData.filter(r => r.mappedData['selectedPrograms_matched']).length}
                  </div>
                </div>
              </div>

              {/* Preview Table */}
              {useVirtualScrolling ? (
                <div 
                  ref={virtualScrollContainerRef}
                  className="border rounded"
                  style={{ height: CONTAINER_HEIGHT, overflow: 'auto' }}
                  onScroll={handleVirtualScroll}
                >
                  <div style={{ height: virtualScrollData.totalHeight, position: 'relative' }}>
                    <div style={{ transform: `translateY(${virtualScrollData.offsetY}px)` }}>
                      <Table>
                        <TableHeader style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
                          <TableRow>
                            <TableHead className="w-16">Row</TableHead>
                            <TableHead className="w-20">Status</TableHead>
                            <TableHead className="w-80">Step-based Preview</TableHead>
                            <TableHead className="w-48">Validation Issues</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {virtualScrollData.items.map((record, index) => (
                            <TableRow key={record.rowNumber} style={{ height: ITEM_HEIGHT }}>
                              <TableCell>{record.rowNumber}</TableCell>
                              <TableCell>
                                <Badge className={record.isValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                  {record.isValid ? "Valid" : "Invalid"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-md">
                                  <StepBasedPreview record={record} />
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
                  </div>
                </div>
              ) : (
                <div className="max-h-96 overflow-auto border rounded">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead className="w-20">Status</TableHead>
                        <TableHead className="w-80">Step-based Preview</TableHead>
                        <TableHead className="w-48">Validation Issues</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedData.map((record) => (
                        <TableRow key={record.rowNumber}>
                          <TableCell>{record.rowNumber}</TableCell>
                          <TableCell>
                            <Badge className={record.isValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                              {record.isValid ? "Valid" : "Invalid"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-md">
                              <StepBasedPreview record={record} />
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
              )}

              {/* Pagination Controls - Only show when not using virtual scrolling */}
              {!useVirtualScrolling && <PaginationControls />}

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
