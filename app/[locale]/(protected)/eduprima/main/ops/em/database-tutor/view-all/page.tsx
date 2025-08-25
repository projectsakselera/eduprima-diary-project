'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useRouter } from "@/components/navigation";
import ColumnFilter from "@/components/ui/column-filter";
import TutorDeleteConfirmationDialog from "@/components/tutor-delete-confirmation-dialog";
import { toast } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { TutorDatabaseHeader } from '@/components/project/TutorDatabaseHeader';
import { SPREADSHEET_COLUMNS, Column } from './spreadsheet-columns';
import { ColumnManager } from './components/ColumnManager';
import { FileCell } from './components/FileCell';
import { getStatusStyle, getAvailabilityStatusStyle } from './utils/statusUtils';
import { truncateToWords, formatHeaderLabel, formatCellValue, formatCellValueForDisplay } from './utils/formatUtils';

// Utility function for converting R2 URLs to proxy URLs
const getProxyUrl = (url: string) => {
  if (!url) return '';
  const cleanUrl = url.replace(/^@?https?:\/\/[^\/]+\//, '');
  return `/api/files/${cleanUrl}`;
};



// Tutor status options used in inline editor - synchronized with database
const TUTOR_STATUS_OPTIONS: Array<
  'registration' | 'learning_materials' | 'examination' | 'exam_verification' | 
  'data_completion' | 'waiting_students' | 'registration_complete' | 'active' | 'inactive' | 'suspended' | 
  'blacklisted' | 'on_trial' | 'additional_screening' | 'top_educator' | 'priority_tutor' | 'pending' | 'verified' | 'unknown'
> = [
  // Recruitment Flow Stages
  'registration',
  'learning_materials', 
  'examination',
  'exam_verification',
  'data_completion',
  'waiting_students',
  'registration_complete',
  
  // Active Status
  'active',
  
  // Special Status
  'top_educator',
  'priority_tutor',
  
  // Management Status  
  'inactive',
  'suspended',
  'blacklisted',
  'on_trial',
  'additional_screening',
  
  // Legacy statuses for compatibility
  'pending',
  'verified', 
  'unknown'
];

// Fixed row height used to compute minimum table body height
const ROW_HEIGHT_PX = 45;
const HEADER_HEIGHT_PX = 48; // approximate header row height for sticky thead



// Complete Tutor Interface matching API response
interface TutorSpreadsheetData {
  // System & Status
  id: string;
  trn: string;
  brand: string;
  registration_current_status: string; // tutor_registration_status.current_status
  operations_current_status: string; // tutor_operations_status.current_status

  staff_notes: string;
  
  // Personal Info
  fotoProfil: string | null;
  namaLengkap: string;
  namaPanggilan: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  email: string;
  noHp1: string;
  noHp2: string;
  
  // Profile & Value Proposition
  headline: string;
  deskripsiDiri: string;
  motivasiMenjadiTutor: string;
  socialMedia1: string;
  socialMedia2: string;

  
  // Address - Domisili
  provinsiDomisili: string;
  kotaKabupatenDomisili: string;
  kecamatanDomisili: string;
  kelurahanDomisili: string;
  alamatLengkapDomisili: string;
  kodePosDomisili: string;
  
  // Address - KTP
  alamatSamaDenganKTP: boolean;
  provinsiKTP: string;
  kotaKabupatenKTP: string;
  kecamatanKTP: string;
  kelurahanKTP: string;
  alamatLengkapKTP: string;
  kodePosKTP: string;
  
  // Banking
  namaNasabah: string;
  nomorRekening: string;
  namaBank: string;
  
  // ✅ UPDATED: Education - Current Education (matches corrected Edge Function structure)
  statusAkademik: string;           // academic_status
  namaUniversitas: string;          // current_university (✅ FIXED from S1 fields)
  fakultas: string;                 // current_faculty (✅ FIXED from S1 fields)
  jurusan: string;                  // current_major (✅ FIXED from S1 fields)
  jurusanSMKDetail: string;         // vocational_school_detail (✅ FIXED mapping added)
  ipk: number;                      // current_gpa (✅ FIXED from user_profiles)
  tahunMasuk: string;               // entry_year
  tahunLulus: string;               // current_graduation_year (✅ FIXED from user_profiles)
  namaSMA: string;                  // high_school
  jurusanSMA: string;               // high_school_major
  tahunLulusSMA: string;            // high_school_graduation_year
  
  // Professional Profile
  keahlianSpesialisasi: string;
  keahlianLainnya: string;
  pengalamanMengajar: string;
  pengalamanLainRelevan: string;
  prestasiAkademik: string;
  prestasiNonAkademik: string;
  sertifikasiPelatihan: string;
  

  
  // ✅ UPDATED: Programs & Subjects
  selectedPrograms: string[];       // Program mappings + additional subjects combined
  mataPelajaranLainnya: string;     // ✅ FIXED: Now shows data from tutor_additional_subjects
  
  // Availability
  statusMenerimaSiswa: string;
  available_schedule: string[];
  teaching_methods: string[];
  hourly_rate: number;
  maksimalSiswaBaru: number;
  maksimalTotalSiswa: number;
  usiaTargetSiswa: string[];
  teaching_radius_km: number;
  alamatTitikLokasi: string;
  location_notes: string;
  catatanAvailability: string;
  transportasiTutor: string[];
  titikLokasiLat: number | null;
  titikLokasiLng: number | null;
  
  // Teaching Preferences
  teachingMethods: string[];
  studentLevelPreferences: string[];
  specialNeedsCapable: string;
  groupClassWilling: string;
  onlineTeachingCapable: string;
  techSavviness: string;
  gmeetExperience: string;
  presensiUpdateCapability: string;
  
  // Personality
  tutorPersonalityType: string[];
  communicationStyle: string[];
  teachingPatienceLevel: string;
  studentMotivationAbility: string;
  scheduleFlexibilityLevel: string;
  
  // Transportation & Location Details
  transportation_method: string | null;
  teaching_center_lat: number | null;
  teaching_center_lng: number | null;
  
  // Extended Professional Info
  
  // ✅ UPDATED: S1 Education Fields (for S2/S3 students - now uses dedicated S1 columns)
  namaUniversitasS1: string | null; // university_s1_name (✅ FIXED mapping)
  fakultasS1: string | null;        // faculty_s1 (✅ FIXED mapping)
  jurusanS1: string | null;         // major_s1 (✅ FIXED mapping)
  namaInstitusi: string | null;     // alternative_institution_name (✅ FIXED to use dedicated column)
  bidangKeahlian: string | null;    // expertise_field (✅ FIXED to use dedicated column)
  pengalamanBelajar: string | null; // learning_experience (✅ FIXED to use dedicated column)
  
  // Form Agreement & Management
  form_agreement_check: boolean;
  additional_screening: string[];
  recruitment_stage_history: any[]; // JSONB
  last_status_change: string | null;
  status_changed_by: string | null;
  
  // Enhanced Banking Info

  // Emergency Contact
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;

  
  // Documents
  dokumenIdentitas: string | null;
  dokumenPendidikan: string | null;
  dokumenSertifikat: string | null;
  transkripNilai: string | null;
  
  // ✅ ADDED: Document Preview Fields (missing from Form Add)
  
  // Document Verification - REMOVED: Fields tidak ada di database
  
  // Timestamps
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

export default function ViewAllTutorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [tutorData, setTutorData] = useState<TutorSpreadsheetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Separate input state for debouncing
  const [isSearching, setIsSearching] = useState(false); // Loading state for search only
  const [programsLookup, setProgramsLookup] = useState<Record<string, string>>({});
  const [brandsOptions, setBrandsOptions] = useState<string[]>([]);

  // Inline saving state for status update
  const [savingStatusUserId, setSavingStatusUserId] = useState<string | null>(null);
  // Bulk status state
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // 🚀 PAGINATION STATE - Advanced pagination system
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    // Initialize itemsPerPage from sessionStorage or searchParams
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const rowsParam = urlParams?.get('rows');
    if (rowsParam) {
      return parseInt(rowsParam) || 25;
    }
    const savedRows = typeof window !== 'undefined' ? sessionStorage.getItem('tutorViewAll:rowsPerPage') : null;
    if (savedRows) {
      return parseInt(savedRows) || 25;
    }
    return 25; // Default value
  });
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // 🚀 COLUMN FILTERS STATE - Advanced filtering like Excel/Google Sheets
  const [columnFilters, setColumnFilters] = useState<Record<string, string[]>>({});
  const [columnUniqueValues, setColumnUniqueValues] = useState<Record<string, string[]>>({});
  const [loadingColumnValues, setLoadingColumnValues] = useState<Record<string, boolean>>({});
  const [columnValuesErrors, setColumnValuesErrors] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{key: keyof TutorSpreadsheetData; direction: 'asc' | 'desc'} | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  // Create dynamic columns with updated brand options
  const dynamicColumns = useMemo(() => {
    return SPREADSHEET_COLUMNS.map(col => {
      if (col.key === 'brand') {
        return {
          ...col,
          options: brandsOptions
        };
      }
      return col;
    });
  }, [brandsOptions]);

  // Essential columns to show by default - Updated based on user testing feedback
  const essentialColumns = useMemo(() => [
    'trn',
    'brand',
    'status_tutor',
    'namaLengkap',
    'staff_notes',
    'jenisKelamin',
    'tanggalLahir',
    'agama',
    'selectedPrograms',
    'mataPelajaranLainnya',
    'provinsiDomisili',
    'kotaKabupatenDomisili',
    'kecamatanDomisili',
    'kelurahanDomisili',
    'alamatLengkapDomisili',
    'jurusanSMKDetail',
    'statusAkademik',
    'current_university',
    'current_faculty',
    'current_major',
    'ipk',
    'namaUniversitasS1',
    'fakultasS1',
    'jurusanS1',
    'namaSMA',
    'jurusanSMA',
    'namaInstitusi',
    'keahlianSpesialisasi',
    'keahlianLainnya',
    'pengalamanMengajar',
    'pengalamanLainRelevan',
    'prestasiAkademik',
    'prestasiNonAkademik',
    'sertifikasiPelatihan',
    'statusMenerimaSiswa',
    'available_schedule',
    'teaching_methods',
    'maksimalSiswaBaru',
    'maksimalTotalSiswa',
    'usiaTargetSiswa',
    'teaching_radius_km',
    'catatanAvailability',
    'teachingMethods',
    'studentLevelPreferences',
    'specialNeedsCapable',
    'groupClassWilling',
    'onlineTeachingCapable',
    'techSavviness',
    'tutorPersonalityType',
    'communicationStyle',
    'teachingPatienceLevel',
    'fotoProfil',
    'email',
    'noHp1',
    'headline',
    'deskripsiDiri',
    'socialMedia1',
    'studentMotivationAbility',
    'scheduleFlexibilityLevel',
    'dokumenSertifikat',
    'created_at',
    'updated_at'
  ], []);

  const allColumnKeys = useMemo(() => dynamicColumns.map(col => col.key), [dynamicColumns]);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set(essentialColumns));
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [isResizing, setIsResizing] = useState<{column: string; startX: number; startWidth: number} | null>(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  // 🚀 CELL SELECTION STATE - Google Sheets-like selection
  const [selectedCell, setSelectedCell] = useState<{row: number; col: string} | null>(null);
  const [selectionRange, setSelectionRange] = useState<{
    start: {row: number; col: string} | null;
    end: {row: number; col: string} | null;
  }>({ start: null, end: null });
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set()); // Format: "row:col"
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'single' | 'range' | 'multi'>('single');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  
  // 🚀 ZOOM STATE - Table zoom functionality
  const [tableZoom, setTableZoom] = useState(() => {
    // Initialize zoom from sessionStorage or default to 100%
    if (typeof window !== 'undefined') {
      const savedZoom = sessionStorage.getItem('tutorViewAll:tableZoom');
      return savedZoom ? parseInt(savedZoom) : 100;
    }
    return 100;
  });
  
  // Separate state for input value to handle manual typing
  const [zoomInputValue, setZoomInputValue] = useState(tableZoom.toString());
  
  // 🚀 FULL SCREEN TABLE - Always visible (removed popup mode)
  
  // 🚀 FULLSCREEN STATE
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // 🚀 CELL DETAIL POPUP STATE - Modal for viewing full cell content
  const [cellDetailPopup, setCellDetailPopup] = useState<{
    isOpen: boolean;
    content: string;
    columnLabel: string;
    tutorName?: string;
  }>({
    isOpen: false,
    content: '',
    columnLabel: '',
    tutorName: ''
  });
  
  // Zoom configuration
  const ZOOM_MIN = 20;
  const ZOOM_MAX = 200;
  const ZOOM_STEP = 5; // Smaller step for smoother control
  
  // Calculate sticky column offsets dynamically
  const stickyColumnOffsets = useMemo(() => {
    const offsets: Record<string, number> = {};
    let currentLeftOffset = 0; // Start with 0 for the first fixed-left column

    // Account for the initial checkbox column (fixed sticky left, width 48px for w-12 class)
    // Its left is 0, subsequent sticky columns start after its width.
    const checkboxColumnWidth = 48; // Corresponds to w-12 class
    currentLeftOffset += checkboxColumnWidth; 

    // Iterate through dynamicColumns to calculate offsets for other sticky columns
    for (const column of dynamicColumns) {
      if (column.sticky && visibleColumns.has(column.key)) {
        offsets[column.key] = currentLeftOffset;
        currentLeftOffset += (columnWidths[column.key] || column.width); // Use actual width or default
      }
    }
    return offsets;
  }, [visibleColumns, columnWidths]);
  
  // Flag: should the table body be scrollable? - Always true for horizontal/vertical scroll
  const isScrollable = true; // Always scrollable for large datasets and many columns

  // File preview modal state
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    url: string;
    title: string;
    type: string;
  }>({
    isOpen: false,
    url: '',
    title: '',
    type: ''
  });

  // 🚀 DELETE MODAL STATE - Advanced delete with cascade preview
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    tutor: TutorSpreadsheetData | null;
    isLoading: boolean;
    cascadePreview: Array<{table_name: string; records_affected: number; data_type: string}> | null;
    previewError: string | null;
  }>({
    isOpen: false,
    tutor: null,
    isLoading: false,
    cascadePreview: null,
    previewError: null
  });

  // 🚀 BULK DELETE STATE - For multiple tutor deletion
  const [bulkDeleteModal, setBulkDeleteModal] = useState<{
    isOpen: boolean;
    isLoading: boolean;
    cascadePreview: Array<{table_name: string; records_affected: number; data_type: string}> | null;
    previewError: string | null;
  }>({
    isOpen: false,
    isLoading: false,
    cascadePreview: null,
    previewError: null
  });
  
  const spreadsheetRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 🚀 CELL SELECTION HELPER FUNCTIONS
  const getCellId = (row: number, col: string) => `${row}:${col}`;
  
  const getColumnIndex = (columnKey: string) => {
    return filteredColumns.findIndex(col => col.key === columnKey);
  };

  const isInSelectionRange = (row: number, col: string) => {
    if (!selectionRange.start || !selectionRange.end) return false;
    
    const startRowIndex = selectionRange.start.row;
    const endRowIndex = selectionRange.end.row;
    const startColIndex = getColumnIndex(selectionRange.start.col);
    const endColIndex = getColumnIndex(selectionRange.end.col);
    const currentColIndex = getColumnIndex(col);
    
    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startColIndex, endColIndex);
    const maxCol = Math.max(startColIndex, endColIndex);
    
    return row >= minRow && row <= maxRow && currentColIndex >= minCol && currentColIndex <= maxCol;
  };

  const isCellSelected = (row: number, col: string) => {
    const cellId = getCellId(row, col);
    return selectedCells.has(cellId) || isInSelectionRange(row, col);
  };

  const updateSelectionRange = (row: number, col: string) => {
    if (!selectionRange.start) {
      setSelectionRange({ start: { row, col }, end: { row, col } });
    } else {
      setSelectionRange(prev => ({ ...prev, end: { row, col } }));
    }
  };

  const clearSelection = () => {
    setSelectedCell(null);
    setSelectionRange({ start: null, end: null });
    setSelectedCells(new Set());
    setIsSelecting(false);
  };

  // 🚀 MOUSE EVENT HANDLERS for Google Sheets-like selection
  const handleCellMouseDown = (e: React.MouseEvent, row: number, col: string) => {
    e.preventDefault();
    
    const isCtrlPressed = e.ctrlKey || e.metaKey;
    const isShiftPressed = e.shiftKey;
    
    if (isCtrlPressed) {
      // Multi-selection mode
      setSelectionMode('multi');
      const cellId = getCellId(row, col);
      setSelectedCells(prev => {
        const newSet = new Set(prev);
        if (newSet.has(cellId)) {
          newSet.delete(cellId);
        } else {
          newSet.add(cellId);
        }
        return newSet;
      });
    } else if (isShiftPressed && selectedCell) {
      // Range selection mode
      setSelectionMode('range');
      setSelectionRange({
        start: { row: selectedCell.row, col: selectedCell.col },
        end: { row, col }
      });
    } else {
      // Single cell selection
      setSelectionMode('single');
      clearSelection();
      setSelectedCell({ row, col });
      setSelectionRange({ start: { row, col }, end: { row, col } });
      setIsSelecting(true);
    }
  };

  const handleCellMouseEnter = (row: number, col: string) => {
    if (isSelecting && selectionMode === 'single') {
      // Drag to create range selection
      setSelectionMode('range');
      updateSelectionRange(row, col);
    } else if (isSelecting && selectionMode === 'range') {
      // Update range end
      updateSelectionRange(row, col);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  // 🚀 COPY FUNCTIONALITY - Copy selected cells to clipboard
  const copySelectedCells = async () => {
    try {
      let dataToCopy: string[][] = [];
      
      if (selectionMode === 'range' && selectionRange.start && selectionRange.end) {
        // Copy range selection
        const startRowIndex = selectionRange.start.row;
        const endRowIndex = selectionRange.end.row;
        const startColIndex = getColumnIndex(selectionRange.start.col);
        const endColIndex = getColumnIndex(selectionRange.end.col);
        
        const minRow = Math.min(startRowIndex, endRowIndex);
        const maxRow = Math.max(startRowIndex, endRowIndex);
        const minCol = Math.min(startColIndex, endColIndex);
        const maxCol = Math.max(startColIndex, endColIndex);
        
        for (let row = minRow; row <= maxRow; row++) {
          const rowData: string[] = [];
          for (let col = minCol; col <= maxCol; col++) {
            const column = filteredColumns[col];
            const tutor = tutorData[row];
            if (tutor && column) {
              const value = formatCellValue(tutor[column.key], column, programsLookup);
              rowData.push(value || '');
            }
          }
          dataToCopy.push(rowData);
        }
      } else if (selectionMode === 'multi' && selectedCells.size > 0) {
        // Copy multi-selection
        const sortedCells = Array.from(selectedCells)
          .map(cellId => {
            const [row, col] = cellId.split(':');
            return { row: parseInt(row), col, cellId };
          })
          .sort((a, b) => a.row - b.row || getColumnIndex(a.col) - getColumnIndex(b.col));
        
        for (const cell of sortedCells) {
          const column = filteredColumns.find(col => col.key === cell.col);
          const tutor = tutorData[cell.row];
          if (tutor && column) {
            const value = formatCellValue(tutor[column.key], column, programsLookup);
            dataToCopy.push([value || '']);
          }
        }
      } else if (selectedCell) {
        // Copy single cell
        const column = filteredColumns.find(col => col.key === selectedCell.col);
        const tutor = tutorData[selectedCell.row];
        if (tutor && column) {
          const value = formatCellValue(tutor[column.key], column, programsLookup);
          dataToCopy.push([value || '']);
        }
      }
      
      if (dataToCopy.length > 0) {
        // Convert to TSV (Tab Separated Values)
        const tsvData = dataToCopy.map(row => row.join('\t')).join('\n');
        await navigator.clipboard.writeText(tsvData);
        
        // Show success feedback
        toast.success(`Copied ${dataToCopy.length} row(s) to clipboard`);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      toast.error('Failed to copy to clipboard');
    }
  };



  // Fetch programs lookup data
  useEffect(() => {
    const fetchProgramsData = async () => {
      try {
        console.log('🔄 Fetching programs lookup data for view-all...');
        const response = await fetch('/api/programs/lookup', {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        const result = await response.json();
        
        console.log('📚 Programs lookup API response (view-all):', result);
        
        if (result.success && result.lookup) {
          setProgramsLookup(result.lookup);
          console.log('✅ Programs lookup loaded (view-all):', Object.keys(result.lookup).length, 'programs');
        } else {
          console.error('❌ Failed to load programs lookup (view-all):', result.error || 'Unknown error');
        }
      } catch (err) {
        console.error('❌ Error fetching programs lookup (view-all):', err);
      }
    };

    fetchProgramsData();
  }, []);

  // Fetch brands data for filtering
  useEffect(() => {
    const fetchBrandsData = async () => {
      try {
        console.log('🔄 Fetching brands data for filtering...');
        const response = await fetch('/api/brands', {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        const result = await response.json();
        
        console.log('🏷️ Brands API response:', result);
        
        if (result.success && result.brands) {
          setBrandsOptions(result.brands);
          console.log('✅ Brands loaded:', result.brands.length, 'brands');
        } else {
          console.error('❌ Failed to load brands:', result.error || 'Unknown error');
        }
      } catch (err) {
        console.error('❌ Error fetching brands:', err);
      }
    };

    fetchBrandsData();
  }, []);

  // Initialize visible columns (show essential columns by default)
  useEffect(() => {
    // Only initialize if visibleColumns is empty or contains invalid columns
    setVisibleColumns(prev => {
      const validEssentialColumns = essentialColumns.filter(key => 
        dynamicColumns.some(col => col.key === key)
      );
      // If no valid visible columns, use essential columns
      if (prev.size === 0 || !Array.from(prev).some(key => dynamicColumns.some(col => col.key === key))) {
        return new Set(validEssentialColumns);
      }
      return prev;
    });
  }, [dynamicColumns, essentialColumns]);

  // 🚀 ADVANCED FETCH DATA - With pagination, column filters, and smart caching
  const fetchTutorData = async (search = '', page = 1, limit = 25) => {
    try {
      setIsLoading(true);
      setError(null);

      const url = new URL('/api/tutors/spreadsheet', window.location.origin);
      
      // Add pagination parameters
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', limit.toString());
      
      // Add search parameter
      if (search && search.trim()) {
        url.searchParams.set('search', search.trim());
      }
      
      
      // Add column filters (use filter_<column>=comma,separated,values)
      if (Object.keys(columnFilters).length > 0) {
        Object.entries(columnFilters).forEach(([col, values]) => {
          if (values && values.length > 0) {
            url.searchParams.set(`filter_${col}`,(values as string[]).join(','));
          }
        });
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Expected JSON but got:', contentType, 'Response:', text.substring(0, 200));
        throw new Error(`Expected JSON response but got ${contentType}. Response: ${text.substring(0, 100)}`);
      }
      
      const result = await response.json();

      if (result.success) {
        setTutorData(result.data);
        setTotalRecords(result.total);
        setTotalPages(Math.ceil(result.total / limit));
        setCurrentPage(page);
        
        console.log(`✅ Loaded ${result.data.length} tutors (Page ${page}/${Math.ceil(result.total / limit)}) - Total: ${result.total}`);
      } else {
        setError(result.error || 'Failed to fetch data');
        setTutorData([]);
        setTotalRecords(0);
        setTotalPages(0);
      }
    } catch (err) {
      console.error('❌ Error fetching tutor data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTutorData([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // 🚀 COLUMN FILTERS EFFECT - Only for filters, not search
  useEffect(() => {
    // Only fetch when filters change (not search term)
    if (Object.keys(columnFilters).length > 0) {
      const debounceTimer = setTimeout(() => {
        fetchTutorData(searchTerm, 1, itemsPerPage);
      }, 500);

      return () => {
        clearTimeout(debounceTimer);
      };
    }
  }, [columnFilters]);
  
  // Manual refresh function that can be called by user action
  const refreshData = useCallback(async () => {
    console.log('🔄 Manual refresh triggered');
    await fetchTutorData(searchTerm, currentPage, itemsPerPage);
  }, [searchTerm, currentPage, itemsPerPage]);

  // Load initial data on mount only
  useEffect(() => {
    fetchTutorData('', 1, itemsPerPage);
  }, []);

  // 🚀 COLUMN FILTERS: Define which columns support filtering
  const filterableColumns = useMemo(() => {
    const filterable = new Set([
      // System & Status columns (visible in screenshot)
      'status_tutor', 'brand',
      
      // Personal columns (visible in screenshot) 
      'namaLengkap', 'email', 'jenisKelamin', 'agama',
      
      // Education columns
      'statusAkademik', 'namaUniversitas', 'fakultas', 'jurusan',
      
      // Availability columns
      'statusMenerimaSiswa', 'available_schedule', 'teaching_methods',
      
      // Location columns - Now all should work with API backend
      'provinsiDomisili', 'kotaKabupatenDomisili', 'provinsiKTP', 'kotaKabupatenKTP',
      
      // Programs
      'selectedPrograms',
      
      // Verification columns
      // REMOVED: 'status_verifikasi_identitas', 'status_verifikasi_pendidikan' - tidak ada di database
      
      // Banking
      'namaBank'
    ]);
    return filterable;
  }, []);

  // 🚀 COLUMN FILTER FUNCTIONS
  const fetchColumnValues = async (columnKey: string) => {
    if (loadingColumnValues[columnKey]) return;
    
    // Clear any previous errors for this column
    setColumnValuesErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[columnKey];
      return newErrors;
    });
    
    setLoadingColumnValues(prev => ({ ...prev, [columnKey]: true }));
    
    try {
      console.log(`🔍 Fetching column values for: ${columnKey}`);
      const response = await fetch(`/api/tutors/column-values?column=${columnKey}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP ${response.status} for column ${columnKey}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Expected JSON but got:', contentType, 'Response:', text.substring(0, 200));
        throw new Error(`Expected JSON response but got ${contentType}`);
      }
      
      const result = await response.json();
      console.log(`📊 Column values response for ${columnKey}:`, result);
      
      if (result.success) {
        const values = result.data || result.values || [];
        console.log(`✅ Found ${values.length} unique values for ${columnKey}:`, values);
        setColumnUniqueValues(prev => ({
          ...prev,
          [columnKey]: values
        }));
        
        // Clear any errors for this column on success
        setColumnValuesErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[columnKey];
          return newErrors;
        });
      } else {
        console.error(`❌ API returned error for ${columnKey}:`, result.error);
        setColumnValuesErrors(prev => ({ ...prev, [columnKey]: result.error || 'Unknown error' }));
      }
    } catch (error) {
      console.error(`❌ Failed to fetch values for ${columnKey}:`, error);
      setColumnValuesErrors(prev => ({ 
        ...prev, 
        [columnKey]: error instanceof Error ? error.message : 'Network error' 
      }));
    } finally {
      setLoadingColumnValues(prev => ({ ...prev, [columnKey]: false }));
    }
  };

  const handleColumnFilter = (columnKey: string, selectedValues: string[]) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      if (selectedValues.length === 0) {
        delete newFilters[columnKey];
      } else {
        newFilters[columnKey] = selectedValues;
      }
      return newFilters;
    });
  };

  const clearAllFilters = () => {
    setColumnFilters({});
  };

  // 🚀 DEBUG FUNCTION - Test all filters
  const testAllFilters = async () => {
    console.log('🧪 Testing all filterable columns...');
    const results: Record<string, { success: boolean; error?: string; count?: number }> = {};
    
    for (const columnKey of Array.from(filterableColumns)) {
      try {
        console.log(`Testing ${columnKey}...`);
        const response = await fetch(`/api/tutors/column-values?column=${columnKey}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            results[columnKey] = { 
              success: true, 
              count: result.data?.length || 0 
            };
            console.log(`✅ ${columnKey}: ${result.data?.length || 0} values`);
          } else {
            results[columnKey] = { 
              success: false, 
              error: result.error 
            };
            console.log(`❌ ${columnKey}: ${result.error}`);
          }
        } else {
          results[columnKey] = { 
            success: false, 
            error: `HTTP ${response.status}` 
          };
          console.log(`❌ ${columnKey}: HTTP ${response.status}`);
        }
      } catch (error) {
        results[columnKey] = { 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
        console.log(`❌ ${columnKey}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('🧪 Filter test results:', results);
    return results;
  };

  // Handle search input change (without auto-search)
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    // Don't auto-update searchTerm - user must click search button
  };

  // Handle explicit search button click
  const handleSearchClick = () => {
    setIsSearching(true);
    setSearchTerm(searchInput);
    fetchTutorData(searchInput, 1, itemsPerPage);
  };

  // Handle clear search - reset pagination
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setIsSearching(false);
    fetchTutorData('', 1, itemsPerPage);
  };

  // 🚀 PAGINATION FUNCTIONS
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      fetchTutorData(searchTerm, page, itemsPerPage);
    }
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tutorViewAll:rowsPerPage', String(newLimit));
      // Update URL without full page reload
      const currentParams = new URLSearchParams(searchParams?.toString() || '');
      currentParams.set('rows', String(newLimit));
      router.replace(`?${currentParams.toString()}`, { scroll: false });
    }
    fetchTutorData(searchTerm, 1, newLimit); // Reset to page 1 when limit changes
  };

  // 🚀 ADVANCED DELETE WITH CASCADE PREVIEW
  const handleDeleteTutor = async (tutor: TutorSpreadsheetData) => {
    setDeleteModal({
      isOpen: true,
      tutor,
      isLoading: true,
      cascadePreview: null,
      previewError: null
    });

    try {
      // Fetch cascade preview
      const response = await fetch(`/api/tutors/delete-preview/${tutor.id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Expected JSON but got:', contentType, 'Response:', text.substring(0, 200));
        throw new Error(`Expected JSON response but got ${contentType}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setDeleteModal(prev => ({
          ...prev,
          isLoading: false,
          cascadePreview: result.preview || result.cascadePreview,
          previewError: null
        }));
      } else {
        setDeleteModal(prev => ({
          ...prev,
          isLoading: false,
          cascadePreview: null,
          previewError: result.error || 'Failed to load cascade preview'
        }));
      }
    } catch (error) {
      console.error('Failed to fetch delete preview:', error);
      setDeleteModal(prev => ({
        ...prev,
        isLoading: false,
        cascadePreview: null,
        previewError: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.tutor) return;

    try {
      setDeleteModal(prev => ({ ...prev, isLoading: true }));
      
      const response = await fetch(`/api/tutors/delete/${deleteModal.tutor.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Expected JSON but got:', contentType, 'Response:', text.substring(0, 200));
        throw new Error(`Expected JSON response but got ${contentType}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message as per documentation
        toast.success(`✅ Tutor ${deleteModal.tutor.namaLengkap} berhasil dihapus dari database`, {
          duration: 5000,
          position: 'top-right',
        });
        
        // Refresh tutor data
        fetchTutorData(searchTerm, currentPage, itemsPerPage);
        
        setDeleteModal({
          isOpen: false,
          tutor: null,
          isLoading: false,
          cascadePreview: null,
          previewError: null
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(`❌ Gagal menghapus tutor: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        duration: 8000,
        position: 'top-right',
      });
      setDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  // 🚀 BULK DELETE HANDLERS
  const handleBulkDeleteTutors = async () => {
    if (selectedRows.size === 0) {
      toast.error('Pilih minimal satu tutor untuk dihapus');
      return;
    }

    try {
      setBulkDeleteModal(prev => ({ ...prev, isOpen: true, isLoading: true }));
      
      const tutorIds = Array.from(selectedRows);
      
      // Get preview for first tutor to show cascade impact
      // (Since we use individual API calls, we'll show preview for one representative tutor)
      const firstTutorId = tutorIds[0];
      const response = await fetch(`/api/tutors/delete-preview/${firstTutorId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Modify preview to reflect bulk operation
        const bulkPreview = result.preview ? result.preview.map((item: any) => ({
          ...item,
          records_affected: item.records_affected * tutorIds.length // Estimate bulk impact
        })) : [];
        
        setBulkDeleteModal(prev => ({
          ...prev,
          isLoading: false,
          cascadePreview: bulkPreview,
          previewError: null
        }));
      } else {
        setBulkDeleteModal(prev => ({
          ...prev,
          isLoading: false,
          cascadePreview: null,
          previewError: result.error || 'Failed to load delete preview'
        }));
      }
    } catch (error) {
      console.error('Failed to fetch delete preview:', error);
      setBulkDeleteModal(prev => ({
        ...prev,
        isLoading: false,
        cascadePreview: null,
        previewError: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedRows.size === 0) return;

    try {
      setBulkDeleteModal(prev => ({ ...prev, isLoading: true }));
      
      const tutorIds = Array.from(selectedRows);
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];
      
      // Process deletions in batches to avoid overwhelming the server
      const batchSize = 5;
      for (let i = 0; i < tutorIds.length; i += batchSize) {
        const batch = tutorIds.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (tutorId) => {
          try {
            const response = await fetch(`/api/tutors/delete/${tutorId}`, {
              method: 'DELETE'
            });
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
              successCount++;
              return { success: true, tutorId };
            } else {
              throw new Error(result.error || 'Delete failed');
            }
          } catch (error) {
            failedCount++;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            errors.push(`Tutor ${tutorId}: ${errorMessage}`);
            return { success: false, tutorId, error: errorMessage };
          }
        });
        
        // Wait for batch to complete
        await Promise.all(batchPromises);
        
        // Small delay between batches to be gentle on the server
        if (i + batchSize < tutorIds.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Show results
      if (successCount > 0) {
        toast.success(`✅ ${successCount} tutor berhasil dihapus dari database`, {
          duration: 5000,
          position: 'top-right',
        });
      }
      
      if (failedCount > 0) {
        toast.error(`❌ ${failedCount} tutor gagal dihapus. Lihat console untuk detail.`, {
          duration: 8000,
          position: 'top-right',
        });
        console.error('Bulk delete errors:', errors);
      }
      
      // Refresh tutor data
      fetchTutorData(searchTerm, currentPage, itemsPerPage);
      
      // Clear selection
      setSelectedRows(new Set());
      
      setBulkDeleteModal({
        isOpen: false,
        isLoading: false,
        cascadePreview: null,
        previewError: null
      });
      
    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast.error(`❌ Gagal menghapus tutor: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        duration: 8000,
        position: 'top-right',
      });
      setBulkDeleteModal(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Safe line breaking for header labels - preserves ALL characters

  // Filter columns by visibility selection
  const filteredColumns = useMemo(() => {
    return dynamicColumns.filter(col => visibleColumns.has(col.key));
  }, [dynamicColumns, visibleColumns]);

  // 🚀 KEYBOARD HANDLERS (placed after filteredColumns declaration)
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Copy functionality (Ctrl+C or Cmd+C)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      e.preventDefault();
      copySelectedCells();
    }
    
    // Clear selection (Escape)
    if (e.key === 'Escape') {
      clearSelection();
    }
    
    // Navigate with arrow keys
    if (selectedCell && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      
      const currentRowIndex = selectedCell.row;
      const currentColIndex = getColumnIndex(selectedCell.col);
      
      let newRowIndex = currentRowIndex;
      let newColIndex = currentColIndex;
      
      switch (e.key) {
        case 'ArrowUp':
          newRowIndex = Math.max(0, currentRowIndex - 1);
          break;
        case 'ArrowDown':
          newRowIndex = Math.min(tutorData.length - 1, currentRowIndex + 1);
          break;
        case 'ArrowLeft':
          newColIndex = Math.max(0, currentColIndex - 1);
          break;
        case 'ArrowRight':
          newColIndex = Math.min(filteredColumns.length - 1, currentColIndex + 1);
          break;
      }
      
      if (newRowIndex !== currentRowIndex || newColIndex !== currentColIndex) {
        const newCol = filteredColumns[newColIndex]?.key;
        if (newCol) {
          if (e.shiftKey) {
            // Extend selection
            setSelectionMode('range');
            setSelectionRange(prev => ({
              start: prev.start || { row: currentRowIndex, col: selectedCell.col },
              end: { row: newRowIndex, col: newCol }
            }));
          } else {
            // Move selection
            setSelectedCell({ row: newRowIndex, col: newCol });
            clearSelection();
            setSelectedCell({ row: newRowIndex, col: newCol });
          }
        }
      }
    }
  }, [selectedCell, tutorData, filteredColumns, selectionMode, copySelectedCells, clearSelection, getColumnIndex]);

  // Attach keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleKeyDown]);


  // Save registration_current_status change to API and update local state
  const handleStatusTutorChange = async (userId: string, newStatus: string) => {
    if (!newStatus) return;
    try {
      setSavingStatusUserId(userId);
      const response = await fetch('/api/tutors/status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, status_tutor: newStatus })
      });
      const result = await response.json();
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || 'Failed to update status');
      }
      // Update local state with latest values from API
      setTutorData(prev => prev.map(t => (
        t.id === userId
          ? {
              ...t,
              status_tutor: result.data?.current_status ?? newStatus.toUpperCase(),
              last_status_change: result.data?.effective_date ?? t.last_status_change,
              updated_at: result.data?.updated_at ?? t.updated_at,
            }
          : t
      )));
      toast.success('Status tutor berhasil diperbarui');
    } catch (error) {
      console.error('Update status failed:', error);
      toast.error(`Gagal memperbarui status tutor`);
    } finally {
      setSavingStatusUserId(null);
    }
  };

  // Bulk update selected rows' status
  const handleBulkStatusUpdate = async () => {
    const ids = Array.from(selectedRows);
    if (ids.length === 0) {
      toast.error('Tidak ada baris yang dipilih');
      return;
    }
    if (!bulkStatus) {
      toast.error('Pilih status terlebih dahulu');
      return;
    }

    try {
      setIsBulkSaving(true);
      console.log('🚀 Bulk status update requested', { count: ids.length, bulkStatus, ids: ids.slice(0, 5) });
      const response = await fetch('/api/tutors/status/bulk', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_ids: ids, status_tutor: bulkStatus })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.success) {
        const message = result?.message || `HTTP ${response.status}`;
        console.error('❌ Bulk update failed:', message, result);
        toast.error(`Bulk update gagal: ${message}`);
        return;
      }

      // Update local state for all affected rows
      setTutorData(prev => prev.map(t => (
        selectedRows.has(t.id)
          ? {
              ...t,
              status_tutor: result.data?.status_tutor ?? bulkStatus.toUpperCase(),
              last_status_change: result.data?.effective_date_map?.[t.id] ?? t.last_status_change,
              updated_at: result.data?.updated_at_map?.[t.id] ?? t.updated_at,
            }
          : t
      )));

      toast.success(`Berhasil mengubah status ${ids.length} tutor`);
      setSelectedRows(new Set());
      setBulkStatus('');
    } catch (error) {
      console.error('Bulk update failed:', error);
      toast.error('Gagal melakukan bulk update');
    } finally {
      setIsBulkSaving(false);
    }
  };



  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig) return tutorData;

    return [...tutorData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const result = aValue.localeCompare(bValue);
        return sortConfig.direction === 'asc' ? result : -result;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [tutorData, sortConfig]);

  // Handle sort
  const handleSort = (key: keyof TutorSpreadsheetData) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle column visibility toggle
  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  };

  // Bulk column management functions
  const selectAllColumns = () => {
    setVisibleColumns(new Set(dynamicColumns.map(col => col.key)));
  };

  const deselectAllColumns = () => {
    setVisibleColumns(new Set());
  };

  const invertColumnSelection = () => {
    const allColumnKeys = dynamicColumns.map(col => col.key);
    setVisibleColumns(prev => {
      const newSet = new Set<string>();
      allColumnKeys.forEach(key => {
        if (!prev.has(key)) {
          newSet.add(key);
        }
      });
      return newSet;
    });
  };

  const showAllInCategory = (category: string) => {
    const categoryColumns = dynamicColumns
      .filter(col => col.category === category)
      .map(col => col.key);
    
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      categoryColumns.forEach(key => newSet.add(key));
      return newSet;
    });
  };

  const hideAllInCategory = (category: string) => {
    const categoryColumns = dynamicColumns
      .filter(col => col.category === category)
      .map(col => col.key);
    
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      categoryColumns.forEach(key => newSet.delete(key));
      return newSet;
    });
  };

  // Handle row selection
  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedRows.size === tutorData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(tutorData.map(tutor => tutor.id)));
    }
  };

  // Export to TSV
  const exportToTSV = () => {
    const headers = filteredColumns.map(col => col.label);
    const rows = sortedData.map(tutor => 
      filteredColumns.map(col => formatCellValue(tutor[col.key], col, programsLookup))
    );

    const tsvContent = [headers, ...rows]
      .map(row => row.map(cell => cell.toString().replace(/\t/g, ' ').replace(/\n/g, ' ')).join('\t'))
      .join('\n');

    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tutor-spreadsheet-${new Date().toISOString().split('T')[0]}.tsv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 🚀 FILE PREVIEW FUNCTIONALITY  
  const handleFilePreview = (url: string, title: string, type: string) => {
    setPreviewModal({
      isOpen: true,
      url,
      title,
      type
    });
  };

  // 🚀 CELL DETAIL POPUP FUNCTIONALITY
  const handleCellClick = (content: string, columnLabel: string, tutorName?: string) => {
    const formattedContent = String(content || '');
    setCellDetailPopup({
      isOpen: true,
      content: formattedContent,
      columnLabel,
      tutorName: tutorName || 'Unknown'
    });
  };

  const closeCellDetailPopup = () => {
    setCellDetailPopup({
      isOpen: false,
      content: '',
      columnLabel: '',
      tutorName: ''
    });
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(SPREADSHEET_COLUMNS.map(col => col.category).filter(Boolean))] as string[];
    return cats.sort();
  }, []);

  // 🚀 ZOOM HANDLERS - Table zoom functionality
  const handleZoomChange = useCallback((newZoom: number) => {
    setTableZoom(newZoom);
    // Save to sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('tutorViewAll:tableZoom', newZoom.toString());
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    const newZoom = Math.min(tableZoom + ZOOM_STEP, ZOOM_MAX);
    handleZoomChange(newZoom);
  }, [tableZoom, handleZoomChange]);

  const handleZoomOut = useCallback(() => {
    const newZoom = Math.max(tableZoom - ZOOM_STEP, ZOOM_MIN);
    handleZoomChange(newZoom);
  }, [tableZoom, handleZoomChange]);

  const handleZoomReset = useCallback(() => {
    handleZoomChange(100);
  }, [handleZoomChange]);

  // Calculate zoom styles using CSS zoom property (better for sticky columns)
  const zoomStyles = useMemo(() => ({
    zoom: `${tableZoom}%`
  }), [tableZoom]);

  // 🚀 FULLSCREEN FUNCTIONALITY
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      // Enter fullscreen
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error('Error attempting to enable fullscreen mode:', err);
      });
    } else {
      // Exit fullscreen
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.error('Error attempting to exit fullscreen mode:', err);
      });
    }
  }, []);

  // Listen for fullscreen changes (e.g., when user presses ESC)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Sync input value with tableZoom when zoom changes from other sources
  useEffect(() => {
    setZoomInputValue(tableZoom.toString());
  }, [tableZoom]);

  // 🚀 KEYBOARD SHORTCUTS for zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + Plus for zoom in
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      }
      
      // Ctrl/Cmd + Minus for zoom out
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      }
      
      // Ctrl/Cmd + 0 for reset zoom
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        handleZoomReset();
      }
      
      // F11 for fullscreen toggle
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
      
      // ESC key to close cell detail popup
      if (e.key === 'Escape' && cellDetailPopup.isOpen) {
        e.preventDefault();
        closeCellDetailPopup();
      }

    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomReset, toggleFullscreen, cellDetailPopup.isOpen, closeCellDetailPopup]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="bg-card rounded-lg shadow-sm border p-6 flex items-center space-x-4">
          <Icon icon="ph:spinner" className="h-8 w-8 animate-spin text-primary" />
          <div>
            <div className="text-lg font-medium text-foreground">Loading tutor data...</div>
            <div className="text-sm text-muted-foreground">Fetching all fields from Supabase database...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col bg-background ${isFullscreen ? 'p-2' : ''}`}>
      {/* Header and Controls Section */}
      <div className="p-4 space-y-4">
        <TutorDatabaseHeader
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={totalRecords}
          isLoading={isLoading}
          isSearching={isSearching}
          searchTerm={searchTerm}
          searchInput={searchInput}
          fetchTutorData={fetchTutorData}
          itemsPerPage={itemsPerPage}
          exportToCSV={exportToTSV}
          columnManager={ <ColumnManager 
                columns={dynamicColumns}
                visibleColumns={visibleColumns}
                onToggleColumn={toggleColumnVisibility}
                categories={categories}
                onSelectAll={selectAllColumns}
                onDeselectAll={deselectAllColumns}
                onInvertSelection={invertColumnSelection}
                onShowAllInCategory={showAllInCategory}
                onHideAllInCategory={hideAllInCategory}
              />}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          handleSearchInputChange={handleSearchInputChange}
          handleSearchClick={handleSearchClick}
          handleClearSearch={handleClearSearch}
          categories={categories}
          refreshData={refreshData}
        />

        {/* Status Info Row - Left Aligned */}
        <div className="flex flex-wrap items-center gap-4 w-full">

            {/* Selected rows indicator */}
            {selectedRows.size > 0 && (
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary">
                  {selectedRows.size} rows selected
                </Badge>
                {/* Bulk status editor */}
                <Select value={bulkStatus} onValueChange={setBulkStatus}>
                  <SelectTrigger className="h-8 w-40">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    {TUTOR_STATUS_OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt} className="uppercase">
                        {opt.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button size="sm" className="h-8" disabled={isBulkSaving || !bulkStatus} onClick={handleBulkStatusUpdate}>
                  {isBulkSaving ? (
                    <span className="inline-flex items-center gap-2">
                      <Icon icon="ph:spinner" className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Icon icon="ph:check-circle" className="h-4 w-4" />
                      Terapkan
                    </span>
                  )}
                </Button>
                {/* Bulk Delete Button */}
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400" 
                  onClick={handleBulkDeleteTutors}
                  disabled={selectedRows.size === 0}
                >
                  <Icon icon="ph:trash" className="h-4 w-4 mr-1" />
                  Hapus ({selectedRows.size})
                </Button>
              </div>
            )}

            {/* Search status & Results count */}
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {isSearching && (
                <div className="flex items-center gap-1 text-primary">
                  <Icon icon="ph:spinner" className="h-3 w-3 animate-spin text-primary" />
                  <span>Searching...</span>
                </div>
              )}
              {searchTerm && !isSearching && (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Icon icon="ph:check-circle" className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  <span>Search results for "{searchTerm}"</span>
                </div>
              )}
              {!isLoading && !isSearching && (
                <div className="flex items-center gap-1 text-green-600">
                  <Icon icon="ph:lightning" className="h-3 w-3 text-green-600" />
                  <span>Fast pagination</span>
                </div>
              )}

              {/* Column & Filter Status */}
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{visibleColumns.size}</span>/{SPREADSHEET_COLUMNS.length} columns
              </span>

              {/* 🚀 ACTIVE FILTERS INDICATOR */}
              {Object.keys(columnFilters).length > 0 && (
                <Badge className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5">
                  <Icon icon="ph:funnel-fill" className="h-3 w-3 mr-1 text-blue-700" />
                  {Object.keys(columnFilters).length} filter{Object.keys(columnFilters).length !== 1 ? 's' : ''}
                </Badge>
              )}

              {/* Clear Filters Button - Compact */}
              {Object.keys(columnFilters).length > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Icon icon="ph:x" className="h-3 w-3 mr-1" />
                  Clear filters
                </Button>
              )}
                          
              {/* Column values loading indicator */}
              {Object.values(loadingColumnValues).some(Boolean) && (
                <Badge className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5">
                  <Icon icon="ph:spinner" className="h-3 w-3 mr-1 animate-spin text-yellow-700" />
                  Loading...
                </Badge>
              )}
              
              {/* Column values error indicator */}
              {Object.keys(columnValuesErrors).length > 0 && (
                <Badge className="bg-red-100 text-red-700 text-xs px-2 py-0.5">
                  <Icon icon="ph:warning" className="h-3 w-3 mr-1 text-red-700" />
                  {Object.keys(columnValuesErrors).length} error{Object.keys(columnValuesErrors).length !== 1 ? 's' : ''}
                </Badge>
              )}
              
              <span>• {sortedData.length} rows</span>
            </div>
          </div>

        {/* 🚀 ZOOM CONTROLS */}
        <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border shadow-sm">
        <div className="flex items-center gap-4">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Zoom:</span>
            
            {/* Main Controls Group */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 border border-border rounded-md">
              {/* Zoom Out */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={tableZoom <= ZOOM_MIN}
                className="h-8 w-8 p-0 border transition-colors bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50"
                title="Zoom Out (Ctrl/Cmd + -)"
              >
                -
              </Button>
              
              {/* Zoom Input */}
              <div className="flex items-center gap-1 px-2">
                <Input
                  type="number"
                  value={zoomInputValue}
                  onChange={(e) => {
                    const inputValue = e.target.value;
                    setZoomInputValue(inputValue);
                    
                    if (inputValue === '') return;
                    
                    const value = parseInt(inputValue);
                    if (!isNaN(value)) {
                      const clampedValue = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value));
                      handleZoomChange(clampedValue);
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value)) {
                      const clampedValue = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, value));
                      handleZoomChange(clampedValue);
                      setZoomInputValue(clampedValue.toString());
                    } else {
                      setZoomInputValue(tableZoom.toString());
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  onWheel={(e) => {
                    e.preventDefault();
                    const delta = e.deltaY > 0 ? -1 : 1;
                    const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, tableZoom + delta));
                    handleZoomChange(newZoom);
                    setZoomInputValue(newZoom.toString());
                  }}
                  min={ZOOM_MIN}
                  max={ZOOM_MAX}
                  step={1}
                  className="w-16 h-7 text-center text-sm font-mono bg-card text-foreground border border-slate-300 dark:border-slate-600 focus:border-primary"
                  placeholder="100"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              
              {/* Zoom In */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={tableZoom >= ZOOM_MAX}
                className="h-8 w-8 p-0 border transition-colors bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50"
                title="Zoom In (Ctrl/Cmd + +)"
              >
                +
              </Button>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Quick:</span>
            <div className="flex items-center gap-1">
              {[50, 75, 100, 125, 150].map((preset) => (
                <Button
                  key={preset}
                  variant={tableZoom === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleZoomChange(preset)}
                  className={cn(
                    "h-7 px-2 text-xs border transition-colors",
                    tableZoom === preset 
                      ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
                      : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                  )}
                  title={`Set zoom to ${preset}%`}
                >
                  {preset}%
                </Button>
              ))}
            </div>
          </div>
          
          {/* Additional Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZoomReset}
              disabled={tableZoom === 100}
              className="h-8 px-3 text-xs border transition-colors bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700 disabled:opacity-50"
              title="Reset to 100% (Ctrl/Cmd + 0)"
            >
              <Icon icon="ph:arrow-clockwise" className="h-3 w-3 mr-1" />
              Reset
            </Button>
            
            {/* Fullscreen Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="h-8 px-3 text-xs border transition-colors bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
              title={isFullscreen ? "Exit Fullscreen (F11 or ESC)" : "Enter Fullscreen (F11)"}
            >
              <Icon 
                icon={isFullscreen ? "ph:arrows-in" : "ph:arrows-out"} 
                className="h-3 w-3 mr-1" 
              />
              {isFullscreen ? "Exit" : "Fullscreen"}
            </Button>
          </div>

        </div>

        {/* Error State */}
        {error && (
          <div>
          <Alert className="border-destructive/50 bg-destructive/10">
            <Icon icon="ph:warning" className="h-4 w-4 text-destructive" />
            <AlertDescription>
              <div className="font-medium text-destructive">Failed to load tutor data</div>
              <div className="text-sm mt-1 text-destructive/80">{error}</div>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => fetchTutorData('')}>
                <Icon icon="ph:arrow-clockwise" className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
          </div>
        )}
      </div>

      {/* Full Screen Table */}
      <div className="flex-1 overflow-hidden">
        <div 
          className="w-full h-full border-t bg-background"
          style={{
            // Ensure minimum visual height equals at least 10 rows + header so header area doesn't look cut
            minHeight: `${Math.max(itemsPerPage, 10) * ROW_HEIGHT_PX + HEADER_HEIGHT_PX}px`
          }}
        >
          {/* Custom CSS for selection styling */}
          <style jsx>{`
            .cell-selected {
              background: rgba(59, 130, 246, 0.15) !important;
              border: 1px solid rgba(59, 130, 246, 0.5) !important;
            }
            .cell-range-selected {
              background: rgba(59, 130, 246, 0.1) !important;
              border: 1px solid rgba(59, 130, 246, 0.3) !important;
            }
            .cell-active {
              background: rgba(59, 130, 246, 0.25) !important;
              border: 2px solid rgb(59, 130, 246) !important;
              box-shadow: 0 0 0 1px rgb(59, 130, 246) !important;
            }
            .selection-indicator {
              position: absolute;
              pointer-events: none;
              border: 2px solid rgb(59, 130, 246);
              background: rgba(59, 130, 246, 0.1);
              border-radius: 2px;
            }
          `}</style>
          
          <div 
            ref={spreadsheetRef}
            className={cn(
              "relative w-full max-w-none",
              isScrollable ? "overflow-auto h-[78vh] md:h-[85vh]" : "overflow-visible h-auto"
            )}
            style={{
              minHeight: `${Math.max(itemsPerPage, 10) * ROW_HEIGHT_PX + HEADER_HEIGHT_PX}px`
            }}
            onScroll={(e) => {
              const target = e.target as HTMLDivElement;
              setScrollPosition({ x: target.scrollLeft, y: target.scrollTop });
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              if (selectedCell || selectionRange.start || selectedCells.size > 0) {
                copySelectedCells();
              }
            }}
          >
            <table 
              className={cn(
                "w-full border-collapse table-fixed",
                isScrollable ? "min-h-[calc(100% + 1px)]" : ""
              )}
              style={{ 
                ...zoomStyles, 
                tableLayout: 'fixed',
                width: '100%'
              }}
            >
              {/* Header */}
              <thead className="sticky top-0 z-20 bg-background border-b">
                <tr>
                  {/* Select All Checkbox */}
                  <th className="w-12 h-10 border border-border bg-background sticky left-0 z-20 p-2">
                    <div className="flex items-center justify-center h-full">
                      <Checkbox
                        checked={selectedRows.size === tutorData.length && tutorData.length > 0}
                        onCheckedChange={toggleSelectAll}
                        className="h-4 w-4"
                      />
                    </div>
                  </th>
                  


                  {/* Actions Header */}
                  <th className="w-12 h-10 border border-border bg-background sticky right-0 z-20 text-xs font-medium text-center text-muted-foreground uppercase tracking-wider">
                    <Icon icon="ph:gear" className="h-4 w-4 mx-auto" />
                  </th>

                  {/* Column Headers */}
                  {filteredColumns.map((column, index) => (
                    <th
                      key={column.key}
                      className={cn(
                        "min-h-[60px] border border-border bg-background text-left px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider select-none cursor-pointer hover:bg-muted/70",
                        column.sticky && "sticky left-12 z-20"
                      )}
                      style={{ 
                        width: '280px',
                        maxWidth: '280px',
                        minWidth: '260px'
                      }}
                      onClick={() => handleSort(column.key as keyof TutorSpreadsheetData)}
                    >
                      <div className="flex items-center justify-between">
                                                 <div className="flex items-center space-x-2 min-w-0 flex-1">
                           <span 
                             className="text-xs font-medium leading-tight break-words hyphens-auto"
                             style={{ 
                               whiteSpace: 'pre-line',
                               wordBreak: 'break-word',
                               lineHeight: '1.3'
                             }}
                           >
                             {formatHeaderLabel(column.label)}
                           </span>
                          {column.required && (
                            <span className="text-destructive text-xs">*</span>
                          )}

                          {/* 🚀 COLUMN FILTER - Advanced filtering like Excel/Google Sheets */}
                          {filterableColumns.has(column.key) && (
                            <div className="flex items-center gap-1">
                              <ColumnFilter
                                column={column.key}
                                columnLabel={column.label}
                                uniqueValues={columnUniqueValues[column.key] || []}
                                selectedValues={columnFilters[column.key] || []}
                                onFilterChange={(col, selectedValues) => handleColumnFilter(col, selectedValues)}
                                isLoading={loadingColumnValues[column.key] || false}
                                error={columnValuesErrors[column.key]}
                                isStatusColumn={column.key === 'status_tutor' || column.key === 'statusMenerimaSiswa'}
                                onClick={(e) => {
                                  console.log(`🔍 Column filter clicked for: ${column.key}`);
                                  fetchColumnValues(column.key);
                                }}
                              />
                              {columnValuesErrors[column.key] && (
                                <span 
                                  className="text-red-500 text-xs cursor-help" 
                                  title={`Error loading values: ${columnValuesErrors[column.key]}`}
                                >
                                  ⚠️
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center">
                          {sortConfig?.key === column.key && (
                            <Icon 
                              icon={sortConfig.direction === 'asc' ? 'ph:caret-up' : 'ph:caret-down'} 
                              className="h-3 w-3" 
                            />
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              {
                /* Body */
              }
              <tbody 
                className="bg-card divide-y divide-border"
                style={{ minHeight: `${Math.max(itemsPerPage, 10) * ROW_HEIGHT_PX}px` }}
              >
                {sortedData.map((tutor, rowIndex) => (
                  <tr
                    key={tutor.id}
                    className={cn(
                      "hover:bg-muted/50 transition-colors",
                      selectedRows.has(tutor.id) && "bg-primary/10"
                    )}
                  >
                    {/* Select Checkbox */}
                    <td className="w-12 h-auto py-3 md:py-4 border border-border bg-card sticky left-0 z-10 p-2">
                      <div className="flex items-center justify-center h-full">
                        <Checkbox
                          checked={selectedRows.has(tutor.id)}
                          onCheckedChange={() => toggleRowSelection(tutor.id)}
                          className="h-4 w-4"
                        />
                      </div>
                    </td>
                    


                    {/* Actions Column */}
                    <td className="w-20 h-auto py-3 md:py-4 border border-border bg-card sticky right-0 z-10 p-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-7 w-7 flex items-center justify-center hover:opacity-70 transition-opacity">
                            <Icon icon="ph:dots-three-vertical" className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => window.open(`/eduprima/main/ops/em/database-tutor/view/${tutor.id}`, '_blank')}
                          >
                            <Icon icon="ph:eye" className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => router.push(`/eduprima/main/ops/em/database-tutor/edit/${tutor.id}`)}
                          >
                            <Icon icon="ph:pencil" className="mr-2 h-4 w-4" />
                            Edit Tutor
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteTutor(tutor)}
                          >
                            <Icon icon="ph:trash" className="mr-2 h-4 w-4" />
                            Delete Tutor
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>

                    {/* Data Cells */}
                    {filteredColumns.map((column, colIndex) => (
                      <td
                        key={column.key}
                        className={cn(
                          "h-auto py-3 md:py-4 border border-border px-3 text-base cursor-pointer hover:bg-muted/50 text-foreground select-none",
                          column.sticky && "sticky left-12 bg-card z-10",
                          // Selection styling
                          isCellSelected(rowIndex, column.key) && "bg-primary/20 ring-1 ring-primary/30",
                          selectedCell?.row === rowIndex && selectedCell?.col === column.key && "bg-primary/30 ring-2 ring-primary",
                          // Special styling for range edges
                          selectionRange.start?.row === rowIndex && selectionRange.start?.col === column.key && "ring-2 ring-primary",
                          selectionRange.end?.row === rowIndex && selectionRange.end?.col === column.key && selectionMode === 'range' && "ring-2 ring-primary ring-dashed"
                        )}
                        style={{
                          width: '280px',
                          maxWidth: '280px',
                          minWidth: '260px'
                        }}
                        onMouseDown={(e) => handleCellMouseDown(e, rowIndex, column.key)}
                        onMouseEnter={() => handleCellMouseEnter(rowIndex, column.key)}
                      >
                        {column.type === 'file' ? (
                          <FileCell 
                            value={tutor[column.key] as string | null} 
                            filename={column.key}
                            tutorName={tutor.namaLengkap}
                                                                        onPreview={(url, title, type) => setPreviewModal({
                              isOpen: true,
                              url,
                              title,
                              type
                            })}
                          />
                        ) : column.key === 'status_tutor' ? (
                          // Combined status with conditional editable logic
                          (() => {
                            const current = String(tutor[column.key] || '');
                            const statusStyle = getStatusStyle(current);
                            const isEditable = !['Registration', 'Learning Materials', 'Examination', 'Exam Verification', 'Data Completion'].includes(current);
                            
                            if (isEditable) {
                              // Editable dropdown for operations status
                              return (
                                <div className="flex justify-center">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <button
                                        className="px-2 py-1 rounded-full text-xs font-semibold text-center w-20 max-w-20 focus:outline-none focus:ring-2 focus:ring-primary/50 truncate"
                                        style={{
                                          backgroundColor: statusStyle.backgroundColor,
                                          color: statusStyle.color
                                        }}
                                        title="Ubah status tutor"
                                        disabled={savingStatusUserId === tutor.id}
                                      >
                                        {savingStatusUserId === tutor.id ? (
                                          <span className="inline-flex items-center gap-1">
                                            <Icon icon="ph:spinner" className="h-3 w-3 animate-spin" />
                                            Saving
                                          </span>
                                        ) : (
                                          current
                                        )}
                                      </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="center" className="w-40">
                                      <DropdownMenuLabel>Ubah Status</DropdownMenuLabel>
                                      <DropdownMenuSeparator />
                                      {TUTOR_STATUS_OPTIONS.map((opt) => (
                                        <DropdownMenuItem
                                          key={opt}
                                          onClick={() => handleStatusTutorChange(tutor.id, opt)}
                                          className="flex items-center gap-2"
                                        >
                                          <span
                                            className="inline-block h-2 w-2 rounded-full"
                                            style={{ backgroundColor: getStatusStyle(opt).backgroundColor }}
                                          />
                                          <span className="uppercase">{opt.replace(/_/g, ' ')}</span>
                                          {current === opt && (
                                            <Icon icon="ph:check" className="ml-auto h-4 w-4 text-primary" />
                                          )}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              );
                            } else {
                              // Read-only badge for recruitment statuses
                              return (
                                <div className="flex justify-center">
                                  <span
                                    className="px-2 py-1 rounded-full text-xs font-semibold text-center w-20 max-w-20 truncate"
                                    style={{
                                      backgroundColor: statusStyle.backgroundColor,
                                      color: statusStyle.color
                                    }}
                                    title={`Recruitment Status: ${current}`}
                                  >
                                    {current}
                                  </span>
                                </div>
                              );
                            }
                          })()
                        ) : column.key === 'statusMenerimaSiswa' ? (
                          // Special rendering for status menerima siswa with colored badges
                          (() => {
                            const statusStyle = getAvailabilityStatusStyle(tutor[column.key]);
                            return (
                              <div className="flex justify-center">
                                <span
                                  className="px-2 py-1 rounded-full text-xs font-semibold text-center w-20 max-w-20 truncate"
                                  style={{
                                    backgroundColor: statusStyle.backgroundColor,
                                    color: statusStyle.color
                                  }}
                                  title={formatCellValue(tutor[column.key], column, programsLookup)}
                                >
                                  {statusStyle.text}
                                </span>
                              </div>
                            );
                          })()
                        ) : (
                          <div 
                            className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors rounded px-1 w-full flex items-center justify-start"
                            title={formatCellValue(tutor[column.key] ?? '-', column, programsLookup)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(
                                formatCellValue(tutor[column.key] ?? '-', column, programsLookup),
                                column.label,
                                tutor.namaLengkap
                              );
                            }}
                          >
                            <span 
                              className="flex-1 text-sm leading-relaxed" 
                              style={{ 
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word'
                              }}
                            >
                              {formatCellValueForDisplay(tutor[column.key] ?? '-', column, programsLookup)}
                            </span>
                            <Icon icon="ph:magnifying-glass-plus" className="ml-1 h-3 w-3 opacity-60 flex-shrink-0" />
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Empty State */}
                {sortedData.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={filteredColumns.length + 2} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Icon icon="ph:table" className="h-12 w-12 text-muted-foreground/50" />
                        <div className="text-lg font-medium text-muted-foreground">No tutor data found</div>
                        <div className="text-sm text-muted-foreground/80">
                          {searchTerm 
                            ? `No results for "${searchTerm}". Try adjusting your search.`
                            : 'No tutors in the database. Add some tutors to get started.'
                          }
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 🚀 PAGINATION CONTROLS - Moved below table */}
        <div className="bg-card rounded-lg shadow-sm border mt-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => handleItemsPerPageChange(parseInt(value))}
              >
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} entries
              </span>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || isLoading}
                  className="h-8 px-3 bg-slate-100 border-2 border-slate-300 text-slate-700 hover:bg-slate-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First page"
                >
                  <Icon icon="ph:arrow-line-left" className="h-4 w-4 text-slate-600 mr-1" />
                  <span className="text-xs font-medium">First</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="h-8 px-3 bg-slate-100 border-2 border-slate-300 text-slate-700 hover:bg-slate-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <Icon icon="ph:arrow-left" className="h-4 w-4 text-slate-600 mr-1" />
                  <span className="text-xs font-medium">Prev</span>
                </Button>
                
                <span className="px-3 py-1 text-sm bg-blue-50 border-2 border-blue-200 rounded font-bold text-blue-800">
                  {currentPage} / {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="h-8 px-3 bg-slate-100 border-2 border-slate-300 text-slate-700 hover:bg-slate-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <span className="text-xs font-medium">Next</span>
                  <Icon icon="ph:arrow-right" className="h-4 w-4 text-slate-600 ml-1" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || isLoading}
                  className="h-8 px-3 bg-slate-100 border-2 border-slate-300 text-slate-700 hover:bg-slate-200 hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last page"
                >
                  <span className="text-xs font-medium">Last</span>
                  <Icon icon="ph:arrow-line-right" className="h-4 w-4 text-slate-600 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="bg-card rounded-lg shadow-sm border mt-4 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>Total: {totalRecords} tutors</span>
              <span>Filtered: {sortedData.length} rows</span>
              <span>Columns: {filteredColumns.length} visible</span>
              {selectedRows.size > 0 && (
                <span className="text-primary font-medium">
                  {selectedRows.size} selected
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span>Real-time data from Supabase</span>
              <Icon icon="ph:database" className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>

        {/* File Preview Modal */}
        {previewModal.isOpen && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
          >
            <div 
              className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold">{previewModal.title}</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(previewModal.url, '_blank')}
                  >
                    <Icon icon="ph:arrow-square-out" className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewModal(prev => ({ ...prev, isOpen: false }))}
                  >
                    <Icon icon="ph:x" className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 max-h-[80vh] overflow-auto">
                {previewModal.type === 'fotoProfil' ? (
                  <img 
                    src={getProxyUrl(previewModal.url)} 
                    alt={previewModal.title}
                    className="max-w-full h-auto rounded-lg mx-auto"
                    style={{ maxHeight: '70vh' }}
                  />
                ) : (
                  <iframe
                    src={getProxyUrl(previewModal.url)}
                    className="w-full h-[70vh] border rounded-lg"
                    title={previewModal.title}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* 🚀 ENHANCED DELETE MODAL - With CASCADE preview as per documentation */}
        <TutorDeleteConfirmationDialog
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmDelete}
          tutor={deleteModal.tutor}
          isLoading={deleteModal.isLoading}
          cascadePreview={deleteModal.cascadePreview}
          previewError={deleteModal.previewError}
                />

        {/* 🚀 BULK DELETE MODAL - For multiple tutor deletion */}
        <TutorDeleteConfirmationDialog
          isOpen={bulkDeleteModal.isOpen}
          onClose={() => setBulkDeleteModal(prev => ({ ...prev, isOpen: false }))}
          onConfirm={confirmBulkDelete}
          tutor={{
            id: '',
            namaLengkap: `${selectedRows.size} tutor dipilih`,
            email: '',
            noTelepon: '',
            alamat: '',
            registration_current_status: 'menunggu',
            operations_current_status: 'inactive'
          } as any}
          isLoading={bulkDeleteModal.isLoading}
          cascadePreview={bulkDeleteModal.cascadePreview}
          previewError={bulkDeleteModal.previewError}
                />

        {/* 🚀 POPUP TABLE MODAL - REMOVED (now using full screen layout) */}
        </div>
      </div>

      {/* Pagination Controls at Bottom */}
      <div className="p-4 border-t bg-background flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalRecords)} of {totalRecords} tutors
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isLoading}
          >
            <Icon icon="ph:caret-left" className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isLoading}
          >
            Next
            <Icon icon="ph:caret-right" className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 🚀 CELL DETAIL POPUP MODAL - For viewing full cell content */}
      {cellDetailPopup.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <Icon icon="ph:magnifying-glass" className="h-5 w-5 text-gray-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">{cellDetailPopup.columnLabel}</h3>
                  {cellDetailPopup.tutorName && (
                    <p className="text-sm text-gray-600">Tutor: {cellDetailPopup.tutorName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={closeCellDetailPopup}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <Icon icon="ph:x" className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 leading-relaxed font-sans">
                  {cellDetailPopup.content}
                </pre>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t bg-gray-50">
              <div className="text-sm text-gray-600">
                Character count: {cellDetailPopup.content.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(cellDetailPopup.content)}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Icon icon="ph:copy" className="h-4 w-4" />
                  Copy
                </button>
                <button
                  onClick={closeCellDetailPopup}
                  className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}