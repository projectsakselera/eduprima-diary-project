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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useRouter } from "@/components/navigation";

// Complete Tutor Interface matching API response
interface TutorSpreadsheetData {
  // System & Status
  id: string;
  trn: string;
  status_tutor: string;
  approval_level: string;
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
  bahasaYangDikuasai: string[];
  
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
  
  // Education
  statusAkademik: string;
  namaUniversitas: string;
  fakultas: string;
  jurusan: string;
  akreditasiJurusan: string;
  ipk: number;
  tahunMasuk: string;
  tahunLulus: string;
  namaSMA: string;
  jurusanSMA: string;
  tahunLulusSMA: string;
  
  // Professional Profile
  keahlianSpesialisasi: string;
  keahlianLainnya: string;
  pengalamanMengajar: string;
  pengalamanLainRelevan: string;
  prestasiAkademik: string;
  prestasiNonAkademik: string;
  sertifikasiPelatihan: string;
  
  // Programs & Subjects
  selectedPrograms: string[];
  mataPelajaranLainnya: string;
  
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
  tutorPersonalityType: string;
  communicationStyle: string;
  teachingPatienceLevel: string;
  studentMotivationAbility: string;
  scheduleFlexibilityLevel: string;
  
  // Emergency Contact
  whatsappNumber: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  preferredCommunicationTime: string;
  communicationLanguagePreference: string[];
  
  // Documents
  dokumenIdentitas: string | null;
  dokumenPendidikan: string | null;
  dokumenSertifikat: string | null;
  
  // Document Verification
  status_verifikasi_identitas: string;
  status_verifikasi_pendidikan: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Column definition interface
interface SpreadsheetColumn {
  key: keyof TutorSpreadsheetData;
  label: string;
  width: number;
  type: 'text' | 'number' | 'date' | 'boolean' | 'array' | 'email' | 'phone' | 'file' | 'select';
  category: string;
  sticky?: boolean;
  formatter?: (value: any) => string;
  sortable?: boolean;
  filterable?: boolean;
  required?: boolean;
  description?: string;
}

// Define columns with categories - matching form structure
const SPREADSHEET_COLUMNS: SpreadsheetColumn[] = [
  // System & Status
  { key: 'id', label: 'ID', width: 100, type: 'text', category: 'System', sticky: true },
  { key: 'trn', label: 'TRN', width: 120, type: 'text', category: 'System', sticky: true },
  { key: 'status_tutor', label: 'Status Tutor', width: 140, type: 'select', category: 'System' },
  { key: 'approval_level', label: 'Level Approval', width: 130, type: 'select', category: 'System' },
  { key: 'staff_notes', label: 'Catatan Staff', width: 200, type: 'text', category: 'System' },
  
  // Personal Info
  { key: 'fotoProfil', label: 'Foto Profil', width: 120, type: 'file', category: 'Personal' },
  { key: 'namaLengkap', label: 'Nama Lengkap', width: 180, type: 'text', category: 'Personal', required: true },
  { key: 'namaPanggilan', label: 'Nama Panggilan', width: 140, type: 'text', category: 'Personal' },
  { key: 'tanggalLahir', label: 'Tanggal Lahir', width: 130, type: 'date', category: 'Personal' },
  { key: 'jenisKelamin', label: 'Jenis Kelamin', width: 120, type: 'select', category: 'Personal' },
  { key: 'agama', label: 'Agama', width: 120, type: 'select', category: 'Personal' },
  { key: 'email', label: 'Email', width: 200, type: 'email', category: 'Personal', required: true },
  { key: 'noHp1', label: 'No HP 1', width: 140, type: 'phone', category: 'Personal' },
  { key: 'noHp2', label: 'No HP 2', width: 140, type: 'phone', category: 'Personal' },
  
  // Profile & Value Proposition
  { key: 'headline', label: 'Headline', width: 200, type: 'text', category: 'Profile' },
  { key: 'deskripsiDiri', label: 'Deskripsi Diri', width: 300, type: 'text', category: 'Profile' },
  { key: 'motivasiMenjadiTutor', label: 'Motivasi', width: 300, type: 'text', category: 'Profile' },
  { key: 'socialMedia1', label: 'Social Media 1', width: 200, type: 'text', category: 'Profile' },
  { key: 'socialMedia2', label: 'Social Media 2', width: 200, type: 'text', category: 'Profile' },
  { key: 'bahasaYangDikuasai', label: 'Bahasa Dikuasai', width: 180, type: 'array', category: 'Profile' },
  
  // Address - Domisili
  { key: 'provinsiDomisili', label: 'Provinsi Domisili', width: 150, type: 'text', category: 'Address' },
  { key: 'kotaKabupatenDomisili', label: 'Kota Domisili', width: 150, type: 'text', category: 'Address' },
  { key: 'kecamatanDomisili', label: 'Kecamatan Domisili', width: 150, type: 'text', category: 'Address' },
  { key: 'kelurahanDomisili', label: 'Kelurahan Domisili', width: 150, type: 'text', category: 'Address' },
  { key: 'alamatLengkapDomisili', label: 'Alamat Lengkap Domisili', width: 300, type: 'text', category: 'Address' },
  { key: 'kodePosDomisili', label: 'Kode Pos Domisili', width: 120, type: 'text', category: 'Address' },
  
  // Address - KTP
  { key: 'alamatSamaDenganKTP', label: 'Alamat Sama KTP', width: 150, type: 'boolean', category: 'Address' },
  { key: 'provinsiKTP', label: 'Provinsi KTP', width: 150, type: 'text', category: 'Address' },
  { key: 'kotaKabupatenKTP', label: 'Kota KTP', width: 150, type: 'text', category: 'Address' },
  { key: 'kecamatanKTP', label: 'Kecamatan KTP', width: 150, type: 'text', category: 'Address' },
  { key: 'kelurahanKTP', label: 'Kelurahan KTP', width: 150, type: 'text', category: 'Address' },
  { key: 'alamatLengkapKTP', label: 'Alamat Lengkap KTP', width: 300, type: 'text', category: 'Address' },
  { key: 'kodePosKTP', label: 'Kode Pos KTP', width: 120, type: 'text', category: 'Address' },
  
  // Banking
  { key: 'namaNasabah', label: 'Nama Nasabah', width: 180, type: 'text', category: 'Banking' },
  { key: 'nomorRekening', label: 'Nomor Rekening', width: 160, type: 'text', category: 'Banking' },
  { key: 'namaBank', label: 'Nama Bank', width: 160, type: 'text', category: 'Banking' },
  
  // Education
  { key: 'statusAkademik', label: 'Status Akademik', width: 150, type: 'select', category: 'Education' },
  { key: 'namaUniversitas', label: 'Universitas', width: 200, type: 'text', category: 'Education' },
  { key: 'fakultas', label: 'Fakultas', width: 150, type: 'text', category: 'Education' },
  { key: 'jurusan', label: 'Jurusan', width: 150, type: 'text', category: 'Education' },
  { key: 'akreditasiJurusan', label: 'Akreditasi', width: 120, type: 'select', category: 'Education' },
  { key: 'ipk', label: 'IPK', width: 80, type: 'number', category: 'Education' },
  { key: 'tahunMasuk', label: 'Tahun Masuk', width: 120, type: 'text', category: 'Education' },
  { key: 'tahunLulus', label: 'Tahun Lulus', width: 120, type: 'text', category: 'Education' },
  { key: 'namaSMA', label: 'Nama SMA', width: 200, type: 'text', category: 'Education' },
  { key: 'jurusanSMA', label: 'Jurusan SMA', width: 150, type: 'text', category: 'Education' },
  { key: 'tahunLulusSMA', label: 'Tahun Lulus SMA', width: 140, type: 'text', category: 'Education' },
  
  // Professional Profile
  { key: 'keahlianSpesialisasi', label: 'Keahlian Spesialisasi', width: 300, type: 'text', category: 'Professional' },
  { key: 'keahlianLainnya', label: 'Keahlian Lainnya', width: 200, type: 'text', category: 'Professional' },
  { key: 'pengalamanMengajar', label: 'Pengalaman Mengajar', width: 300, type: 'text', category: 'Professional' },
  { key: 'pengalamanLainRelevan', label: 'Pengalaman Lain', width: 300, type: 'text', category: 'Professional' },
  { key: 'prestasiAkademik', label: 'Prestasi Akademik', width: 300, type: 'text', category: 'Professional' },
  { key: 'prestasiNonAkademik', label: 'Prestasi Non-Akademik', width: 300, type: 'text', category: 'Professional' },
  { key: 'sertifikasiPelatihan', label: 'Sertifikasi Pelatihan', width: 300, type: 'text', category: 'Professional' },
  
  // Programs & Subjects
  { key: 'selectedPrograms', label: 'Program Dipilih', width: 300, type: 'array', category: 'Subjects' },
  { key: 'mataPelajaranLainnya', label: 'Mata Pelajaran Lainnya', width: 300, type: 'text', category: 'Subjects' },
  
  // Availability
  { key: 'statusMenerimaSiswa', label: 'Status Menerima Siswa', width: 180, type: 'select', category: 'Availability' },
  { key: 'available_schedule', label: 'Jadwal Tersedia', width: 200, type: 'array', category: 'Availability' },
  { key: 'teaching_methods', label: 'Metode Mengajar', width: 200, type: 'array', category: 'Availability' },
  { key: 'hourly_rate', label: 'Tarif per Jam', width: 120, type: 'number', category: 'Availability' },
  { key: 'maksimalSiswaBaru', label: 'Max Siswa Baru', width: 140, type: 'number', category: 'Availability' },
  { key: 'maksimalTotalSiswa', label: 'Max Total Siswa', width: 140, type: 'number', category: 'Availability' },
  { key: 'usiaTargetSiswa', label: 'Usia Target Siswa', width: 150, type: 'array', category: 'Availability' },
  { key: 'teaching_radius_km', label: 'Radius Mengajar (km)', width: 160, type: 'number', category: 'Availability' },
  { key: 'alamatTitikLokasi', label: 'Titik Lokasi', width: 300, type: 'text', category: 'Availability' },
  { key: 'location_notes', label: 'Catatan Lokasi', width: 200, type: 'text', category: 'Availability' },
  
  // Teaching Preferences
  { key: 'teachingMethods', label: 'Gaya Pembelajaran', width: 200, type: 'array', category: 'Teaching' },
  { key: 'studentLevelPreferences', label: 'Preferensi Level Siswa', width: 200, type: 'array', category: 'Teaching' },
  { key: 'specialNeedsCapable', label: 'Mampu ABK', width: 120, type: 'select', category: 'Teaching' },
  { key: 'groupClassWilling', label: 'Bersedia Grup', width: 120, type: 'select', category: 'Teaching' },
  { key: 'onlineTeachingCapable', label: 'Mampu Online', width: 120, type: 'select', category: 'Teaching' },
  { key: 'techSavviness', label: 'Tech Savviness', width: 120, type: 'select', category: 'Teaching' },
  { key: 'gmeetExperience', label: 'Pengalaman GMeet', width: 150, type: 'select', category: 'Teaching' },
  { key: 'presensiUpdateCapability', label: 'Update Presensi', width: 150, type: 'select', category: 'Teaching' },
  
  // Personality
  { key: 'tutorPersonalityType', label: 'Tipe Kepribadian', width: 180, type: 'select', category: 'Personality' },
  { key: 'communicationStyle', label: 'Gaya Komunikasi', width: 150, type: 'select', category: 'Personality' },
  { key: 'teachingPatienceLevel', label: 'Level Kesabaran', width: 140, type: 'number', category: 'Personality' },
  { key: 'studentMotivationAbility', label: 'Kemampuan Motivasi', width: 170, type: 'number', category: 'Personality' },
  { key: 'scheduleFlexibilityLevel', label: 'Fleksibilitas Jadwal', width: 170, type: 'number', category: 'Personality' },
  
  // Emergency Contact
  { key: 'whatsappNumber', label: 'WhatsApp', width: 140, type: 'phone', category: 'Contact' },
  { key: 'emergencyContactName', label: 'Kontak Darurat Nama', width: 180, type: 'text', category: 'Contact' },
  { key: 'emergencyContactRelationship', label: 'Hubungan Kontak Darurat', width: 200, type: 'select', category: 'Contact' },
  { key: 'emergencyContactPhone', label: 'No HP Kontak Darurat', width: 180, type: 'phone', category: 'Contact' },
  { key: 'preferredCommunicationTime', label: 'Waktu Komunikasi', width: 160, type: 'select', category: 'Contact' },
  { key: 'communicationLanguagePreference', label: 'Bahasa Komunikasi', width: 180, type: 'array', category: 'Contact' },
  
  // Documents
  { key: 'dokumenIdentitas', label: 'Dokumen Identitas', width: 150, type: 'file', category: 'Documents' },
  { key: 'dokumenPendidikan', label: 'Dokumen Pendidikan', width: 150, type: 'file', category: 'Documents' },
  { key: 'dokumenSertifikat', label: 'Dokumen Sertifikat', width: 150, type: 'file', category: 'Documents' },
  
  // Document Verification
  { key: 'status_verifikasi_identitas', label: 'Verifikasi Identitas', width: 150, type: 'select', category: 'Verification' },
  { key: 'status_verifikasi_pendidikan', label: 'Verifikasi Pendidikan', width: 150, type: 'select', category: 'Verification' },
  
  // Timestamps
  { key: 'created_at', label: 'Dibuat', width: 160, type: 'date', category: 'System' },
  { key: 'updated_at', label: 'Diupdate', width: 160, type: 'date', category: 'System' },
];

export default function ViewAllTutorsPage() {
  const router = useRouter();
  
  // State
  const [tutorData, setTutorData] = useState<TutorSpreadsheetData[]>([]);
  const [allTutorData, setAllTutorData] = useState<TutorSpreadsheetData[]>([]); // Cache all data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Separate input state for debouncing
  const [isSearching, setIsSearching] = useState(false); // Loading state for search only
  const [hasInitialData, setHasInitialData] = useState(false); // Track if we have loaded initial data
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{key: keyof TutorSpreadsheetData; direction: 'asc' | 'desc'} | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof TutorSpreadsheetData>>(new Set());
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [isResizing, setIsResizing] = useState<{column: string; startX: number; startWidth: number} | null>(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [selectedCell, setSelectedCell] = useState<{row: number; col: string} | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [totalRecords, setTotalRecords] = useState(0);
  
  const spreadsheetRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Initialize visible columns (show essential columns by default)
  useEffect(() => {
    const essentialColumns: (keyof TutorSpreadsheetData)[] = [
      'trn', 'namaLengkap', 'email', 'noHp1', 'status_tutor', 
      'statusAkademik', 'namaUniversitas', 'selectedPrograms', 
      'hourly_rate', 'statusMenerimaSiswa', 'created_at'
    ];
    setVisibleColumns(new Set(essentialColumns));

    // Initialize column widths
    const initialWidths: Record<string, number> = {};
    SPREADSHEET_COLUMNS.forEach(col => {
      initialWidths[col.key] = col.width;
    });
    setColumnWidths(initialWidths);
  }, []);

  // Fetch data from API
  const fetchTutorData = async (search = '', isInitialLoad = false) => {
    try {
      // Smart loading states
      if (isInitialLoad || !hasInitialData) {
        setIsLoading(true);
      } else {
        setIsSearching(true);
      }
      setError(null);

      const url = new URL('/api/tutors/spreadsheet', window.location.origin);
      if (search && search.trim()) {
        url.searchParams.set('search', search.trim());
      }

      const response = await fetch(url.toString());
      const result = await response.json();

      if (result.success) {
        setTutorData(result.data);
        setTotalRecords(result.total);
        
        // Cache all data when no search term (this is complete dataset)
        if (!search || !search.trim()) {
          setAllTutorData(result.data);
          setHasInitialData(true);
        }
        
        console.log(`✅ Loaded ${result.data.length} tutors from Supabase${search ? ` (search: "${search}")` : ''}`);
      } else {
        setError(result.error || 'Failed to fetch data');
        setTutorData([]);
      }
    } catch (err) {
      console.error('❌ Error fetching tutor data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTutorData([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (searchTerm === '') {
      // If search is cleared, use cached data if available (no loading needed!)
      if (hasInitialData && allTutorData.length > 0) {
        setTutorData(allTutorData);
        setTotalRecords(allTutorData.length);
        console.log(`✅ Restored cached data: ${allTutorData.length} tutors (no loading needed)`);
        return;
      }
      // If no cached data, fetch from API
      fetchTutorData('');
      return;
    }

    // Debounce search - wait 500ms after user stops typing
    const debounceTimer = setTimeout(() => {
      fetchTutorData(searchTerm);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchTerm, hasInitialData, allTutorData]);

  // Load initial data on mount
  useEffect(() => {
    fetchTutorData('', true); // Mark as initial load
  }, []);

  // Handle search input change (for debouncing)
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    setSearchTerm(value);
  };

  // Handle explicit search button click
  const handleSearchClick = () => {
    setSearchTerm(searchInput);
    fetchTutorData(searchInput);
  };

  // Handle clear search (smooth UX - no loading!)
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    
    // Use cached data immediately if available
    if (hasInitialData && allTutorData.length > 0) {
      setTutorData(allTutorData);
      setTotalRecords(allTutorData.length);
      console.log(`✅ Clear search: restored ${allTutorData.length} cached tutors instantly`);
    } else {
      // Fallback to API call if no cache
      fetchTutorData('');
    }
  };

  // Filter columns by category
  const filteredColumns = useMemo(() => {
    if (categoryFilter === 'all') {
      return SPREADSHEET_COLUMNS.filter(col => visibleColumns.has(col.key));
    }
    return SPREADSHEET_COLUMNS.filter(col => 
      col.category === categoryFilter && visibleColumns.has(col.key)
    );
  }, [categoryFilter, visibleColumns]);

  // Format cell value based on column type
  const formatCellValue = (value: any, column: SpreadsheetColumn): string => {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    if (column.formatter) {
      return column.formatter(value);
    }

    switch (column.type) {
      case 'array':
        return Array.isArray(value) ? value.join(', ') : String(value);
      case 'boolean':
        return value ? '✓' : '✗';
      case 'date':
        return new Date(value).toLocaleDateString('id-ID');
      case 'number':
        if (column.key === 'hourly_rate') {
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(value);
        }
        return String(value);
      case 'file':
        return value ? '📎 File' : '';
      default:
        return String(value);
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
  const toggleColumnVisibility = (columnKey: keyof TutorSpreadsheetData) => {
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

  // Export to CSV
  const exportToCSV = () => {
    const headers = filteredColumns.map(col => col.label);
    const rows = sortedData.map(tutor => 
      filteredColumns.map(col => formatCellValue(tutor[col.key], col))
    );

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tutor-spreadsheet-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(SPREADSHEET_COLUMNS.map(col => col.category))];
    return cats.sort();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="text-lg font-medium">Memuat data tutor dari Supabase...</div>
          <div className="text-sm text-muted-foreground">Mengambil semua field dari database...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="p-4 space-y-4">
          {/* Title */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <Icon icon="ph:table" className="h-6 w-6 text-primary" />
                Tutor Database Spreadsheet
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete view of all tutor data from Supabase • {totalRecords} total records • Google Sheets style
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchTutorData(searchTerm, false)} // Don't force full screen loading
                disabled={isLoading || isSearching}
              >
                <Icon 
                  icon={isLoading ? "ph:spinner" : "ph:arrow-clockwise"} 
                  className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")}
                />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Icon icon="ph:download" className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button size="sm" onClick={() => router.push('/eduprima/main/ops/em/matchmaking/database-tutor/add')}>
                <Icon icon="ph:plus" className="h-4 w-4 mr-2" />
                Add Tutor
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-64">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Icon 
                    icon={isSearching ? "ph:spinner" : "ph:magnifying-glass"} 
                    className={cn(
                      "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground",
                      isSearching && "animate-spin"
                    )}
                  />
                  <Input
                    placeholder="Search by name, email, TRN, programs... (debounced 500ms)"
                    value={searchInput}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchClick();
                      }
                    }}
                    className="pl-10 pr-10"
                  />
                  {searchInput && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSearch}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                    >
                      <Icon icon="ph:x" className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSearchClick}
                  disabled={isSearching}
                  className="shrink-0"
                >
                  <Icon 
                    icon={isSearching ? "ph:spinner" : "ph:magnifying-glass"} 
                    className={cn("h-4 w-4", isSearching && "animate-spin")}
                  />
                </Button>
              </div>
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Selected rows indicator */}
            {selectedRows.size > 0 && (
              <Badge className="bg-primary/10 text-primary">
                {selectedRows.size} rows selected
              </Badge>
            )}

            {/* Search status & Results count */}
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              {isSearching && (
                <div className="flex items-center gap-1 text-primary">
                  <Icon icon="ph:spinner" className="h-3 w-3 animate-spin" />
                  <span>Searching...</span>
                </div>
              )}
              {searchTerm && !isSearching && (
                <div className="flex items-center gap-1 text-green-600">
                  <Icon icon="ph:check-circle" className="h-3 w-3" />
                  <span>Search results for "{searchTerm}"</span>
                </div>
              )}
              {!searchTerm && hasInitialData && !isLoading && !isSearching && (
                <div className="flex items-center gap-1 text-blue-600">
                  <Icon icon="ph:database" className="h-3 w-3" />
                  <span>All data (cached)</span>
                </div>
              )}
              <span>Showing {filteredColumns.length} columns • {sortedData.length} rows</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4">
          <Alert className="border-destructive bg-destructive/10">
            <Icon icon="ph:warning" className="h-4 w-4 text-destructive" />
            <AlertDescription>
              <div className="font-medium text-destructive">Failed to load tutor data</div>
              <div className="text-sm mt-1 text-destructive">{error}</div>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => fetchTutorData('')}>
                <Icon icon="ph:arrow-clockwise" className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Column Visibility Controls */}
      <div className="border-b bg-muted/30 p-4">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium">Visible Columns:</div>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <DropdownMenu key={category}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {category} ({SPREADSHEET_COLUMNS.filter(col => col.category === category && visibleColumns.has(col.key)).length})
                    <Icon icon="ph:caret-down" className="h-3 w-3 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 max-h-96 overflow-y-auto">
                  <DropdownMenuLabel>{category} Columns</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {SPREADSHEET_COLUMNS
                    .filter(col => col.category === category)
                    .map(col => (
                    <DropdownMenuItem 
                      key={col.key}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <div className="flex items-center w-full">
                        <Checkbox
                          checked={visibleColumns.has(col.key)}
                          onCheckedChange={() => toggleColumnVisibility(col.key)}
                          className="mr-2"
                        />
                        <span className="flex-1 text-sm">{col.label}</span>
                        {col.required && (
                          <Badge className="text-xs bg-secondary text-secondary-foreground">Required</Badge>
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}
          </div>
        </div>
      </div>

      {/* Spreadsheet */}
      <div className="relative overflow-hidden" style={{ height: 'calc(100vh - 280px)' }}>
        <div 
          ref={spreadsheetRef}
          className="overflow-auto h-full"
          onScroll={(e) => {
            const target = e.target as HTMLDivElement;
            setScrollPosition({ x: target.scrollLeft, y: target.scrollTop });
          }}
        >
          <table className="min-w-full border-collapse bg-background">
            {/* Header */}
            <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
              <tr>
                {/* Select All Checkbox */}
                <th className="w-12 h-10 border border-border bg-muted sticky left-0 z-20">
                  <Checkbox
                    checked={selectedRows.size === tutorData.length && tutorData.length > 0}
                    onCheckedChange={toggleSelectAll}
                    className="mx-auto"
                  />
                </th>
                
                {/* Row Number */}
                <th className="w-16 h-10 border border-border bg-muted sticky left-12 z-20 text-xs font-medium text-center">
                  #
                </th>

                {/* Column Headers */}
                {filteredColumns.map((column, index) => (
                  <th
                    key={column.key}
                    className={cn(
                      "h-10 border border-border bg-muted/90 text-left px-3 select-none cursor-pointer hover:bg-muted",
                      column.sticky && "sticky z-20"
                    )}
                    style={{ 
                      width: columnWidths[column.key] || column.width,
                      left: column.sticky ? (12 + 16 + (index * (columnWidths[column.key] || column.width))) : undefined
                    }}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-medium truncate">{column.label}</span>
                        {column.required && (
                          <span className="text-destructive text-xs">*</span>
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

            {/* Body */}
            <tbody>
              {sortedData.map((tutor, rowIndex) => (
                <tr
                  key={tutor.id}
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    selectedRows.has(tutor.id) && "bg-primary/5"
                  )}
                >
                  {/* Select Checkbox */}
                  <td className="w-12 h-10 border border-border bg-background sticky left-0 z-10">
                    <Checkbox
                      checked={selectedRows.has(tutor.id)}
                      onCheckedChange={() => toggleRowSelection(tutor.id)}
                      className="mx-auto"
                    />
                  </td>
                  
                  {/* Row Number */}
                  <td className="w-16 h-10 border border-border bg-background sticky left-12 z-10 text-xs text-center text-muted-foreground">
                    {rowIndex + 1}
                  </td>

                  {/* Data Cells */}
                  {filteredColumns.map((column, colIndex) => (
                    <td
                      key={column.key}
                      className={cn(
                        "h-10 border border-border px-3 text-sm cursor-pointer hover:bg-muted/30",
                        column.sticky && "sticky bg-background z-10",
                        selectedCell?.row === rowIndex && selectedCell?.col === column.key && "bg-primary/10 ring-1 ring-primary"
                      )}
                      style={{ 
                        width: columnWidths[column.key] || column.width,
                        left: column.sticky ? (12 + 16 + (colIndex * (columnWidths[column.key] || column.width))) : undefined
                      }}
                      onClick={() => setSelectedCell({ row: rowIndex, col: column.key })}
                    >
                      <div className="truncate" title={formatCellValue(tutor[column.key], column)}>
                        {formatCellValue(tutor[column.key], column)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}

              {/* Empty State */}
              {sortedData.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={filteredColumns.length + 2} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Icon icon="ph:table" className="h-12 w-12 text-muted-foreground/30" />
                      <div className="text-lg font-medium text-muted-foreground">No tutor data found</div>
                      <div className="text-sm text-muted-foreground">
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

      {/* Footer Stats */}
      <div className="border-t bg-muted/30 p-4">
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
    </div>
  );
}