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

// Utility function for converting R2 URLs to proxy URLs
const getProxyUrl = (url: string) => {
  if (!url) return '';
  const cleanUrl = url.replace(/^@?https?:\/\/[^\/]+\//, '');
  return `/api/files/${cleanUrl}`;
};

// Tutor status options used in inline editor - synchronized with add form
const TUTOR_STATUS_OPTIONS: Array<
  'registration' | 'learning_materials' | 'examination' | 'exam_verification' | 
  'data_completion' | 'waiting_students' | 'active' | 'inactive' | 'suspended' | 
  'blacklisted' | 'on_trial' | 'additional_screening' | 'pending' | 'verified' | 'unknown'
> = [
  // Recruitment Flow Stages
  'registration',
  'learning_materials', 
  'examination',
  'exam_verification',
  'data_completion',
  'waiting_students',
  
  // Active Status
  'active',
  
  // Management Status  
  'inactive',
  'suspended',
  'blacklisted',
  
  // Special Status
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

// Column Manager Component - Simple & User-Friendly
interface ColumnManagerProps {
  columns: Column[];
  visibleColumns: Set<keyof TutorSpreadsheetData>;
  onToggleColumn: (columnKey: keyof TutorSpreadsheetData) => void;
  categories: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onInvertSelection: () => void;
  onShowAllInCategory: (category: string) => void;
  onHideAllInCategory: (category: string) => void;
}

const ColumnManager: React.FC<ColumnManagerProps> = ({ 
  columns, 
  visibleColumns, 
  onToggleColumn, 
  categories,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  onShowAllInCategory,
  onHideAllInCategory
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Filter columns based on search and category
  const filteredColumns = useMemo(() => {
    let filtered = columns;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(col => col.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(col => 
        col.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        col.key.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [columns, selectedCategory, searchTerm]);



  const toggleAllInCategory = (category: string) => {
    const categoryColumns = columns.filter(col => col.category === category);
    const allVisible = categoryColumns.every(col => visibleColumns.has(col.key));
    
    categoryColumns.forEach(col => {
      if (allVisible && visibleColumns.has(col.key)) {
        onToggleColumn(col.key);
      } else if (!allVisible && !visibleColumns.has(col.key)) {
        onToggleColumn(col.key);
      }
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Gear Button - Icon Only */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 relative text-slate-700 dark:text-slate-300 hover:text-primary"
        title={`Manage columns (${visibleColumns.size}/${columns.length} visible)`}
      >
        <Icon icon="ph:gear" className="h-4 w-4" />
        {visibleColumns.size > 0 && (
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
            {visibleColumns.size}
          </div>
        )}
      </Button>

      {/* Dropdown Modal - Responsive */}
      {isOpen && (
        <div className="dark absolute top-10 right-0 z-[999] w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto isolate">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm text-white">Manage Columns</h3>
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <Icon icon="ph:x" className="h-4 w-4 text-slate-400" />
              </Button>
            </div>



            {/* Search */}
            <div className="relative mb-4">
              <Icon icon="ph:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-8 bg-slate-800 border-slate-700 placeholder:text-slate-400 text-slate-50"
              />
            </div>

            {/* Bulk Selection Controls */}
            <div className="mb-4 space-y-2">
              <div className="text-xs font-medium text-slate-300 mb-2">⚡ Bulk Actions:</div>
              
              {/* Main bulk actions */}
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSelectAll}
                  className="h-7 text-xs px-2 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Icon icon="ph:checks" className="h-3 w-3 mr-1" />
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDeselectAll}
                  className="h-7 text-xs px-2 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Icon icon="ph:square" className="h-3 w-3 mr-1" />
                  Deselect All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onInvertSelection}
                  className="h-7 text-xs px-2 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Icon icon="ph:arrows-clockwise" className="h-3 w-3 mr-1" />
                  Invert
                </Button>
              </div>

              {/* Category-specific bulk actions */}
              {selectedCategory !== 'all' && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onShowAllInCategory(selectedCategory)}
                    className="h-7 text-xs px-2 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Icon icon="ph:eye" className="h-3 w-3 mr-1" />
                    Show All in {selectedCategory}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onHideAllInCategory(selectedCategory)}
                    className="h-7 text-xs px-2 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Icon icon="ph:eye-slash" className="h-3 w-3 mr-1" />
                    Hide All in {selectedCategory}
                  </Button>
                </div>
              )}
            </div>

            {/* Category Filter - Cleaner */}
            <div className="mb-4">
              <div className="text-xs font-medium text-slate-300 mb-2">📁 Categories:</div>
              <div className="max-h-20 overflow-y-auto">
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs h-6 px-2"
                  >
                    All
                  </Button>
                  {categories.map(category => {
                    const categoryColumns = columns.filter(col => col.category === category);
                    const visibleCount = categoryColumns.filter(col => visibleColumns.has(col.key)).length;
                    return visibleCount > 0 ? (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="text-xs h-6 px-2"
                      >
                        {category}
                        <span className="ml-1 text-muted-foreground">({visibleCount})</span>
                      </Button>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            {/* Category Toggle All */}
            {selectedCategory !== 'all' && (
              <div className="mb-3">
                <Button
                  variant="outline"
                  onClick={() => toggleAllInCategory(selectedCategory)}
                  className="text-xs h-7"
                >
                  <Icon icon="ph:check-square" className="h-3 w-3 mr-1" />
                  Toggle All {selectedCategory}
                </Button>
              </div>
            )}

            {/* Columns List */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400">
              <div className="space-y-1">
                {filteredColumns.map(col => (
                  <div key={col.key} className="flex items-center space-x-2 p-1 hover:bg-slate-800/50 rounded">
                    <Checkbox
                      checked={visibleColumns.has(col.key)}
                      onCheckedChange={() => onToggleColumn(col.key)}
                      className="h-4 w-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate text-slate-100">{col.label}</div>
                      <div className="text-xs text-slate-400">
                        {col.category} • {col.type}
                        {col.required && <span className="text-red-500 ml-1">*</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredColumns.length === 0 && (
                <div className="text-center py-4 text-sm text-slate-400">
                  {searchTerm ? `No columns found for \"${searchTerm}\" ` : 'No columns in this category'}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{visibleColumns.size} of {columns.length} columns visible</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="text-xs h-6"
                >
                  Clear search
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// FileCell component for handling file display with links and previews
interface FileCellProps {
  value: string | null;
  filename: string;
  tutorName: string;
  onPreview: (url: string, title: string, type: string) => void;
}

const FileCell: React.FC<FileCellProps> = ({ value, filename, tutorName, onPreview }) => {
  if (!value) {
    return (
      <div className="text-muted-foreground text-xs">
        No file
      </div>
    );
  }

  const getFileIcon = (filename: string) => {
    if (filename === 'fotoProfil') return '🖼️';
    if (filename === 'dokumenIdentitas') return '🆔';
    if (filename === 'dokumenPendidikan') return '🎓';
    if (filename === 'dokumenSertifikat') return '📜';
    return '📎';
  };

  const getFileLabel = (filename: string) => {
    if (filename === 'fotoProfil') return 'Foto';
    if (filename === 'dokumenIdentitas') return 'ID';
    if (filename === 'dokumenPendidikan') return 'Edu';
    if (filename === 'dokumenSertifikat') return 'Cert';
    return 'File';
  };

  const getFileTitle = (filename: string, tutorName: string) => {
    if (filename === 'fotoProfil') return `Foto Profil - ${tutorName}`;
    if (filename === 'dokumenIdentitas') return `Dokumen Identitas - ${tutorName}`;
    if (filename === 'dokumenPendidikan') return `Dokumen Pendidikan - ${tutorName}`;
    if (filename === 'dokumenSertifikat') return `Dokumen Sertifikat - ${tutorName}`;
    return `File - ${tutorName}`;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent cell selection
    onPreview(value, getFileTitle(filename, tutorName), filename);
  };

  const handleDirectLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(value, '_blank');
  };

  // Special handling for profile photo - show thumbnail directly
  if (filename === 'fotoProfil') {
    return (
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative">
          <img 
            src={getProxyUrl(value)} 
            alt={`Foto profil ${tutorName}`}
            className="w-8 h-8 rounded-full object-cover border border-border cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleClick}
            onError={(e) => {
              // Log error for debugging
              const target = e.target as HTMLImageElement;
              console.error('❌ Image load failed:', {
                src: target.src,
                originalValue: value,
                proxyUrl: getProxyUrl(value)
              });
              
              // Fallback to icon if image fails to load
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-8 h-8 rounded-full bg-red-100 border border-red-300 flex items-center justify-center cursor-pointer hover:bg-red-200 transition-colors" title="Image failed to load">
                    <span class="text-xs">❌</span>
                  </div>
                `;
                parent.onclick = (e) => {
                  e.stopPropagation();
                  onPreview(value, getFileTitle(filename, tutorName), filename);
                };
              }
            }}
            title={`${tutorName} - Click to enlarge`}
          />
          {/* Small indicator for Cloudflare R2 */}
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-white" title="Cloudflare R2 Storage" />
        </div>
        <div className="flex flex-col min-w-0">
          <button
            onClick={handleClick}
            className="text-xs text-primary hover:text-primary/80 hover:underline text-left truncate max-w-[60px]"
            title={`Preview ${getFileLabel(filename)} - ${tutorName}`}
          >
            {getFileLabel(filename)}
          </button>
          <div className="text-[10px] text-muted-foreground">
            Click to enlarge
          </div>
        </div>
      </div>
    );
  }

  // For other file types, show the original layout
  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className="text-sm">{getFileIcon(filename)}</span>
      <div className="flex flex-col min-w-0">
        <button
          onClick={handleClick}
          className="text-xs text-primary hover:text-primary/80 hover:underline text-left truncate max-w-[80px]"
          title={`Preview ${getFileLabel(filename)} - ${tutorName}`}
        >
          {getFileLabel(filename)}
        </button>
        <div className="text-[10px] text-muted-foreground">
          Click to preview
        </div>
      </div>
    </div>
  );
};

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
  bank_id: string | null;
  is_verified: boolean;
  total_payouts: number;
  payout_count: number;

  // Emergency Contact
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;

  
  // Documents
  dokumenIdentitas: string | null;
  dokumenPendidikan: string | null;
  dokumenSertifikat: string | null;
  transkripNilai: string | null;
  sertifikatKeahlian: string | null;
  
  // ✅ ADDED: Document Preview Fields (missing from Form Add)
  fotoProfilPreview: string | null;
  dokumenIdentitasPreview: string | null;
  dokumenPendidikanPreview: string | null;
  dokumenSertifikatPreview: string | null;
  
  // Document Verification
  status_verifikasi_identitas: string;
  status_verifikasi_pendidikan: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Column definition interface
interface Column {
  key: keyof TutorSpreadsheetData;
  label: string;
  width: number;
  type: 'text' | 'number' | 'date' | 'array' | 'status' | 'select' | 'boolean' | 'file' | 'email' | 'phone';
  category?: string;
  sticky?: boolean;
  editable?: boolean;
  options?: string[]; // For select type
  sortable?: boolean;
  filterable?: boolean;
  frozen?: boolean;
  formatter?: (value: any) => string;
  required?: boolean;
  description?: string;
}

// Define columns with categories - matching form structure
const SPREADSHEET_COLUMNS: Column[] = [
  // System & Management (Status & Kontrol Sistem)
  { key: 'id', label: 'ID', width: 100, type: 'text', category: 'System & Management', sticky: true },
  { key: 'trn', label: 'TRN (Tutor Registration Number)', width: 120, type: 'text', category: 'System & Management', sticky: true, frozen: true },
  { key: 'status_tutor', label: 'Status Tutor', width: 140, type: 'select', category: 'System & Management' },
  { key: 'approval_level', label: 'Level Approval', width: 130, type: 'select', category: 'System & Management' },
  { key: 'staff_notes', label: 'Catatan Staff', width: 200, type: 'text', category: 'System & Management' },
  { key: 'additional_screening', label: 'Additional Screening Checklist', width: 200, type: 'array', category: 'System & Management' },
  { key: 'recruitment_stage_history', label: 'Riwayat Stage', width: 250, type: 'text', category: 'System & Management' },
  { key: 'last_status_change', label: 'Perubahan Status Terakhir', width: 180, type: 'date', category: 'System & Management' },
  { key: 'status_changed_by', label: 'Diubah Oleh', width: 150, type: 'text', category: 'System & Management' },
  { key: 'form_agreement_check', label: 'Persetujuan Form', width: 140, type: 'boolean', category: 'System & Management' },
  { key: 'created_at', label: 'Dibuat', width: 160, type: 'date', category: 'System & Management' },
  { key: 'updated_at', label: 'Diupdate', width: 160, type: 'date', category: 'System & Management' },
  
  // Identitas Dasar - Personal Information 
  { key: 'fotoProfil', label: 'Foto Profil', width: 100, type: 'file', category: 'Identitas Dasar' },
  { key: 'namaLengkap', label: 'Nama Lengkap', width: 220, type: 'text', category: 'Identitas Dasar', required: true },
  { key: 'namaPanggilan', label: 'Nama Panggilan', width: 140, type: 'text', category: 'Identitas Dasar' },
  { key: 'tanggalLahir', label: 'Tanggal Lahir', width: 130, type: 'date', category: 'Identitas Dasar' },
  { key: 'jenisKelamin', label: 'Jenis Kelamin', width: 120, type: 'select', category: 'Identitas Dasar' },
  { key: 'agama', label: 'Agama', width: 120, type: 'select', category: 'Identitas Dasar' },
  { key: 'email', label: 'Email Aktif', width: 250, type: 'email', category: 'Identitas Dasar', required: true },
  { key: 'noHp1', label: 'No. HP (WhatsApp)', width: 140, type: 'phone', category: 'Identitas Dasar' },
  { key: 'noHp2', label: 'No. HP Alternatif (Opsional)', width: 140, type: 'phone', category: 'Identitas Dasar' },
  
  // Profil & Value Proposition
  { key: 'headline', label: 'Headline/Tagline Tutor', width: 200, type: 'text', category: 'Profil & Motivasi' },
  { key: 'deskripsiDiri', label: 'Deskripsi Diri/Bio Tutor', width: 300, type: 'text', category: 'Profil & Motivasi' },
  { key: 'motivasiMenjadiTutor', label: 'Motivasi Menjadi Tutor', width: 300, type: 'text', category: 'Profil & Motivasi' },
  { key: 'socialMedia1', label: 'Link Media Sosial 1 (Opsional)', width: 200, type: 'text', category: 'Profil & Motivasi' },
  { key: 'socialMedia2', label: 'Link Media Sosial 2 (Opsional)', width: 200, type: 'text', category: 'Profil & Motivasi' },
  
  
  // Identitas Dasar - Alamat Domisili (Tempat Tinggal Saat Ini)
  { key: 'provinsiDomisili', label: 'Provinsi', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'kotaKabupatenDomisili', label: 'Kota/Kabupaten', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'kecamatanDomisili', label: 'Kecamatan', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'kelurahanDomisili', label: 'Kelurahan/Desa', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'alamatLengkapDomisili', label: 'Alamat Lengkap/Nama Jalan', width: 300, type: 'text', category: 'Identitas Dasar' },
  { key: 'kodePosDomisili', label: 'Kode Pos', width: 120, type: 'text', category: 'Identitas Dasar' },
  
  // Identitas Dasar - Alamat Sesuai KTP/KK (Opsional)
  { key: 'alamatSamaDenganKTP', label: 'Alamat domisili saya sama dengan alamat di KTP/KK', width: 150, type: 'boolean', category: 'Identitas Dasar' },
  { key: 'provinsiKTP', label: 'Provinsi KTP/KK', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'kotaKabupatenKTP', label: 'Kota/Kabupaten KTP/KK', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'kecamatanKTP', label: 'Kecamatan KTP/KK', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'kelurahanKTP', label: 'Kelurahan/Desa KTP/KK', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'alamatLengkapKTP', label: 'Alamat Lengkap/Nama Jalan KTP/KK', width: 300, type: 'text', category: 'Identitas Dasar' },
  { key: 'kodePosKTP', label: 'Kode Pos KTP/KK', width: 120, type: 'text', category: 'Identitas Dasar' },
  
  // Identitas Dasar - Informasi Perbankan
  { key: 'namaNasabah', label: 'Nama Pemilik Rekening', width: 180, type: 'text', category: 'Identitas Dasar' },
  { key: 'nomorRekening', label: 'Nomor Rekening', width: 160, type: 'text', category: 'Identitas Dasar' },
  { key: 'namaBank', label: 'Nama Bank', width: 160, type: 'text', category: 'Identitas Dasar' },
  { key: 'bank_id', label: 'Bank ID', width: 120, type: 'text', category: 'Identitas Dasar' },
  { key: 'is_verified', label: 'Bank Verified', width: 120, type: 'boolean', category: 'Identitas Dasar' },
  { key: 'total_payouts', label: 'Total Payouts', width: 120, type: 'number', category: 'Identitas Dasar' },
  { key: 'payout_count', label: 'Payout Count', width: 120, type: 'number', category: 'Identitas Dasar' },
  
  // Pendidikan & Pengalaman - Riwayat Pendidikan
  { key: 'statusAkademik', label: 'Status Akademik', width: 150, type: 'select', category: 'Pendidikan & Pengalaman' },
  { key: 'namaUniversitas', label: 'Universitas', width: 200, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'fakultas', label: 'Fakultas', width: 150, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'jurusan', label: 'Jurusan', width: 150, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'jurusanSMKDetail', label: 'Jurusan SMK Detail', width: 180, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'ipk', label: 'IPK', width: 80, type: 'number', category: 'Pendidikan & Pengalaman' },
  { key: 'tahunMasuk', label: 'Tahun Masuk', width: 120, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'tahunLulus', label: 'Tahun Lulus', width: 120, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'namaSMA', label: 'Nama SMA', width: 200, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'jurusanSMA', label: 'Jurusan SMA', width: 150, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'tahunLulusSMA', label: 'Tahun Lulus SMA', width: 140, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'namaUniversitasS1', label: 'Universitas S1 (untuk S2)', width: 200, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'fakultasS1', label: 'Fakultas S1', width: 150, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'jurusanS1', label: 'Jurusan S1', width: 150, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'namaInstitusi', label: 'Nama Institusi (Alternative)', width: 200, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'bidangKeahlian', label: 'Bidang Keahlian', width: 180, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'pengalamanBelajar', label: 'Pengalaman Belajar', width: 200, type: 'text', category: 'Pendidikan & Pengalaman' },
  
  // Pendidikan & Pengalaman - Profil & Keahlian
  { key: 'keahlianSpesialisasi', label: 'Keahlian Spesialisasi', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'keahlianLainnya', label: 'Keahlian Lainnya', width: 200, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'pengalamanMengajar', label: 'Pengalaman Mengajar', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'pengalamanLainRelevan', label: 'Pengalaman Lain', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'prestasiAkademik', label: 'Prestasi Akademik', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'prestasiNonAkademik', label: 'Prestasi Non-Akademik', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'sertifikasiPelatihan', label: 'Sertifikasi Pelatihan', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  
  // Mata Pelajaran & Program (dari Step 3 Form Add)
  { key: 'selectedPrograms', label: 'Program Dipilih', width: 300, type: 'array', category: 'Mata Pelajaran & Program' },
  { key: 'mataPelajaranLainnya', label: '📝 Mata Pelajaran Lainnya (Jika Tidak Ditemukan)', width: 300, type: 'text', category: 'Mata Pelajaran & Program' },
  
  // Ketersediaan & Preferensi Mengajar
  { key: 'statusMenerimaSiswa', label: 'Status Menerima Siswa', width: 180, type: 'select', category: 'Ketersediaan & Preferensi' },
  { key: 'available_schedule', label: 'Jadwal Tersedia', width: 200, type: 'array', category: 'Ketersediaan & Preferensi' },
  { key: 'teaching_methods', label: 'Metode Mengajar', width: 200, type: 'array', category: 'Ketersediaan & Preferensi' },
  { key: 'hourly_rate', label: 'Tarif per Jam', width: 120, type: 'number', category: 'Ketersediaan & Preferensi' },
  { key: 'maksimalSiswaBaru', label: 'Max Siswa Baru', width: 140, type: 'number', category: 'Ketersediaan & Preferensi' },
  { key: 'maksimalTotalSiswa', label: 'Max Total Siswa', width: 140, type: 'number', category: 'Ketersediaan & Preferensi' },
  { key: 'usiaTargetSiswa', label: 'Usia Target Siswa', width: 150, type: 'array', category: 'Ketersediaan & Preferensi' },
  { key: 'teaching_radius_km', label: 'Radius Mengajar (km)', width: 160, type: 'number', category: 'Ketersediaan & Preferensi' },
  { key: 'alamatTitikLokasi', label: 'Titik Lokasi', width: 300, type: 'text', category: 'Ketersediaan & Preferensi' },
  { key: 'location_notes', label: 'Catatan Lokasi', width: 200, type: 'text', category: 'Ketersediaan & Preferensi' },
  { key: 'catatanAvailability', label: 'Catatan Ketersediaan', width: 200, type: 'text', category: 'Ketersediaan & Preferensi' },
  { key: 'transportasiTutor', label: 'Transportasi Tutor', width: 180, type: 'array', category: 'Ketersediaan & Preferensi' },
  { key: 'titikLokasiLat', label: 'Titik Lokasi Lat', width: 120, type: 'number', category: 'Ketersediaan & Preferensi' },
  { key: 'titikLokasiLng', label: 'Titik Lokasi Lng', width: 120, type: 'number', category: 'Ketersediaan & Preferensi' },
  { key: 'transportation_method', label: 'Metode Transportasi', width: 180, type: 'text', category: 'Ketersediaan & Preferensi' },
  { key: 'teaching_center_lat', label: 'Koordinat Lat', width: 120, type: 'number', category: 'Ketersediaan & Preferensi' },
  { key: 'teaching_center_lng', label: 'Koordinat Lng', width: 120, type: 'number', category: 'Ketersediaan & Preferensi' },
  
  // Ketersediaan & Preferensi - Gaya Mengajar
  { key: 'teachingMethods', label: 'Gaya Pembelajaran', width: 200, type: 'array', category: 'Ketersediaan & Preferensi' },
  { key: 'studentLevelPreferences', label: 'Preferensi Level Siswa', width: 200, type: 'array', category: 'Ketersediaan & Preferensi' },
  { key: 'specialNeedsCapable', label: 'Mampu ABK', width: 120, type: 'select', category: 'Ketersediaan & Preferensi' },
  { key: 'groupClassWilling', label: 'Bersedia Grup', width: 120, type: 'select', category: 'Ketersediaan & Preferensi' },
  
  // Ketersediaan & Preferensi - Kemampuan Teknologi
  { key: 'onlineTeachingCapable', label: 'Mampu Online', width: 120, type: 'select', category: 'Ketersediaan & Preferensi' },
  { key: 'techSavviness', label: 'Tech Savviness', width: 120, type: 'select', category: 'Ketersediaan & Preferensi' },
  { key: 'gmeetExperience', label: 'Pengalaman GMeet', width: 150, type: 'select', category: 'Ketersediaan & Preferensi' },
  { key: 'presensiUpdateCapability', label: 'Update Presensi', width: 150, type: 'select', category: 'Ketersediaan & Preferensi' },
  
  // Ketersediaan & Preferensi - Karakter & Kepribadian
  { key: 'tutorPersonalityType', label: 'Tipe Kepribadian', width: 180, type: 'array', category: 'Ketersediaan & Preferensi' },
  { key: 'communicationStyle', label: 'Gaya Komunikasi', width: 150, type: 'array', category: 'Ketersediaan & Preferensi' },
  { key: 'teachingPatienceLevel', label: 'Level Kesabaran', width: 140, type: 'text', category: 'Ketersediaan & Preferensi' },
  { key: 'studentMotivationAbility', label: 'Kemampuan Motivasi', width: 170, type: 'text', category: 'Ketersediaan & Preferensi' },
  { key: 'scheduleFlexibilityLevel', label: 'Fleksibilitas Jadwal', width: 170, type: 'text', category: 'Ketersediaan & Preferensi' },
  
  // Kontak Darurat & Komunikasi (dari Step 4 Form Add)
  { key: 'emergencyContactName', label: 'Nama Lengkap Kontak Darurat', width: 180, type: 'text', category: 'Ketersediaan & Preferensi' },
  { key: 'emergencyContactRelationship', label: 'Hubungan dengan Kontak Darurat', width: 200, type: 'select', category: 'Ketersediaan & Preferensi' },
  { key: 'emergencyContactPhone', label: 'Nomor HP Kontak Darurat', width: 180, type: 'phone', category: 'Ketersediaan & Preferensi' },

  // Upload Dokumen
  { key: 'dokumenIdentitas', label: 'Dokumen Identitas', width: 150, type: 'file', category: 'Upload Dokumen' },
  { key: 'dokumenPendidikan', label: 'Dokumen Pendidikan', width: 150, type: 'file', category: 'Upload Dokumen' },
  { key: 'dokumenSertifikat', label: 'Dokumen Sertifikat', width: 150, type: 'file', category: 'Upload Dokumen' },
  { key: 'transkripNilai', label: 'Transkrip Nilai', width: 150, type: 'file', category: 'Upload Dokumen' },
  { key: 'sertifikatKeahlian', label: 'Sertifikat Keahlian', width: 150, type: 'file', category: 'Upload Dokumen' },
  
  // ✅ ADDED: Document Preview Fields (from Form Add)
  { key: 'fotoProfilPreview', label: 'Preview Foto Profil', width: 150, type: 'file', category: 'Upload Dokumen' },
  { key: 'dokumenIdentitasPreview', label: 'Preview Identitas', width: 150, type: 'file', category: 'Upload Dokumen' },
  { key: 'dokumenPendidikanPreview', label: 'Preview Pendidikan', width: 150, type: 'file', category: 'Upload Dokumen' },
  { key: 'dokumenSertifikatPreview', label: 'Preview Sertifikat', width: 150, type: 'file', category: 'Upload Dokumen' },
  
  // Upload Dokumen - Verifikasi
  { key: 'status_verifikasi_identitas', label: 'Verifikasi Identitas', width: 150, type: 'select', category: 'Upload Dokumen' },
  { key: 'status_verifikasi_pendidikan', label: 'Verifikasi Pendidikan', width: 150, type: 'select', category: 'Upload Dokumen' },
];

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

  // Inline saving state for status update
  const [savingStatusUserId, setSavingStatusUserId] = useState<string | null>(null);
  // Bulk status state
  const [bulkStatus, setBulkStatus] = useState<string>('');
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  // 🚀 PAGINATION STATE - Advanced pagination system
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    // Initialize itemsPerPage from localStorage or searchParams
    // Access searchParams directly here, it will be defined during client-side hydration
    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const rowsParam = urlParams?.get('rows');
    if (rowsParam) {
      return parseInt(rowsParam) || 25;
    }
    const savedRows = typeof window !== 'undefined' ? localStorage.getItem('tutorViewAll:rowsPerPage') : null;
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
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof TutorSpreadsheetData>>(new Set([
    // Essential columns - always visible by default
    'trn', 'namaLengkap', 'email', 'status_tutor', 'approval_level',
    'jenisKelamin', 'agama', 'statusAkademik', 'statusMenerimaSiswa',
    'hourly_rate', 'provinsiDomisili', 'kotaKabupatenDomisili',
    'fotoProfil', 'noHp1', 'created_at'
  ]));
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
    // Initialize zoom from localStorage or default to 100%
    if (typeof window !== 'undefined') {
      const savedZoom = localStorage.getItem('tutorViewAll:tableZoom');
      return savedZoom ? parseInt(savedZoom) : 100;
    }
    return 100;
  });
  
  // Separate state for input value to handle manual typing
  const [zoomInputValue, setZoomInputValue] = useState(tableZoom.toString());
  
  // 🚀 POPUP TABLE STATE - Modal for focused table view
  const [isTablePopupOpen, setIsTablePopupOpen] = useState(false);
  
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

    // Iterate through SPREADSHEET_COLUMNS to calculate offsets for other sticky columns
    for (const column of SPREADSHEET_COLUMNS) {
      if (column.sticky && visibleColumns.has(column.key)) {
        offsets[column.key] = currentLeftOffset;
        currentLeftOffset += (columnWidths[column.key] || column.width); // Use actual width or default
      }
    }
    return offsets;
  }, [visibleColumns, columnWidths]);
  
  // Flag: should the table body be scrollable?
  const isScrollable = totalRecords > itemsPerPage;

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
              const value = formatCellValue(tutor[column.key], column);
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
            const value = formatCellValue(tutor[column.key], column);
            dataToCopy.push([value || '']);
          }
        }
      } else if (selectedCell) {
        // Copy single cell
        const column = filteredColumns.find(col => col.key === selectedCell.col);
        const tutor = tutorData[selectedCell.row];
        if (tutor && column) {
          const value = formatCellValue(tutor[column.key], column);
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
        const response = await fetch('/api/programs/lookup');
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

  // Initialize visible columns (show essential columns by default)
  useEffect(() => {
    const essentialColumns: (keyof TutorSpreadsheetData)[] = [
      'trn', 'fotoProfil', 'namaLengkap', 'email', 'noHp1', 'status_tutor', 
      'statusAkademik', 'namaUniversitas', 'fakultas', 'jurusan', 'tahunMasuk', 'tahunLulus', 'ipk',
      'selectedPrograms', 'mataPelajaranLainnya', 'hourly_rate', 'statusMenerimaSiswa', 'dokumenIdentitas', 
      'dokumenPendidikan', 'dokumenSertifikat', 'transkripNilai', 'status_verifikasi_identitas', 'status_verifikasi_pendidikan', 'created_at'
    ];
    setVisibleColumns(new Set(essentialColumns));

    // Initialize column widths
    const initialWidths: Record<string, number> = {};
    SPREADSHEET_COLUMNS.forEach(col => {
      initialWidths[col.key] = col.width;
    });
    setColumnWidths(initialWidths);
  }, []);

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

      const response = await fetch(url.toString());
      
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

  // 🚀 ADVANCED SEARCH EFFECT - With pagination reset
  useEffect(() => {
    // Reset to page 1 when search changes
    const debounceTimer = setTimeout(() => {
      fetchTutorData(searchTerm, 1, itemsPerPage);
    }, 500);

    return () => {
      clearTimeout(debounceTimer);
    };
  }, [searchTerm, itemsPerPage, columnFilters]);

  // Load initial data on mount
  useEffect(() => {
    fetchTutorData('', 1, itemsPerPage);
  }, []);

  // 🚀 COLUMN FILTERS: Define which columns support filtering
  const filterableColumns = useMemo(() => {
    const filterable = new Set([
      // System & Status columns (visible in screenshot)
      'status_tutor', 'approval_level', 
      
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
      'status_verifikasi_identitas', 'status_verifikasi_pendidikan',
      
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
      const response = await fetch(`/api/tutors/column-values?column=${columnKey}`);
      
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
        const response = await fetch(`/api/tutors/column-values?column=${columnKey}`);
        
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

  // Handle search input change (for debouncing)
  const handleSearchInputChange = (value: string) => {
    setSearchInput(value);
    setSearchTerm(value);
  };

  // Handle explicit search button click
  const handleSearchClick = () => {
    setSearchTerm(searchInput);
    fetchTutorData(searchInput, 1, itemsPerPage);
  };

  // Handle clear search - reset pagination
  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
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
      localStorage.setItem('tutorViewAll:rowsPerPage', String(newLimit));
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
      const response = await fetch(`/api/tutors/delete-preview/${tutor.id}`);
      
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
      const response = await fetch(`/api/tutors/delete-preview/${firstTutorId}`);
      
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
  const formatHeaderLabel = (label: string) => {
    // Pattern 1: Break before parentheses (keep all characters including spaces)
    if (label.includes('(') && label.includes(')')) {
      return label.replace(/\s+(\([^)]+\))$/, '\n$1');
    }
    
    // Pattern 2: Break long text at word boundary (no character loss)
    if (label.length > 30) {
      const words = label.split(' ');
      let line1 = '';
      let line2 = '';
      
      for (const word of words) {
        if (line1.length + word.length + 1 <= 30) {
          line1 += (line1 ? ' ' : '') + word;
        } else {
          line2 += (line2 ? ' ' : '') + word;
        }
      }
      
      return line2 ? line1 + '\n' + line2 : label;
    }
    
    // Return exactly as-is for short text - NO CHANGES
    return label;
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

  // Get status color and style for tutor status
  const getStatusStyle = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    switch (statusLower) {
      // Recruitment Flow Stages (Blue tones)
      case 'registration':
        return {
          backgroundColor: '#3b82f6', // blue-500
          color: '#ffffff',
          text: 'REGISTRATION'
        };
      case 'learning_materials':
        return {
          backgroundColor: '#6366f1', // indigo-500
          color: '#ffffff',
          text: 'LEARNING'
        };
      case 'examination':
        return {
          backgroundColor: '#8b5cf6', // violet-500
          color: '#ffffff',
          text: 'EXAM'
        };
      case 'exam_verification':
        return {
          backgroundColor: '#a855f7', // purple-500
          color: '#ffffff',
          text: 'VERIFYING'
        };
      case 'data_completion':
        return {
          backgroundColor: '#0ea5e9', // sky-500
          color: '#ffffff',
          text: 'COMPLETING'
        };
      case 'waiting_students':
        return {
          backgroundColor: '#06b6d4', // cyan-500
          color: '#ffffff',
          text: 'WAITING'
        };
      
      // Active Status (Green)
      case 'active':
        return {
          backgroundColor: '#10b981', // green-500
          color: '#ffffff',
          text: 'ACTIVE'
        };
      
      // Management Status (Gray/Red)
      case 'inactive':
        return {
          backgroundColor: '#6b7280', // gray-500
          color: '#ffffff',
          text: 'INACTIVE'
        };
      case 'suspended':
        return {
          backgroundColor: '#ef4444', // red-500
          color: '#ffffff',
          text: 'SUSPENDED'
        };
      case 'blacklisted':
        return {
          backgroundColor: '#991b1b', // red-800
          color: '#ffffff',
          text: 'BLACKLISTED'
        };
      
      // Special Status (Yellow/Orange)
      case 'on_trial':
        return {
          backgroundColor: '#f59e0b', // amber-500
          color: '#ffffff',
          text: 'TRIAL'
        };
      case 'additional_screening':
        return {
          backgroundColor: '#d97706', // amber-600
          color: '#ffffff',
          text: 'SCREENING'
        };
      
      // Legacy statuses for compatibility
      case 'pending':
        return {
          backgroundColor: '#f59e0b', // amber-500
          color: '#ffffff',
          text: 'PENDING'
        };
      case 'verified':
        return {
          backgroundColor: '#059669', // emerald-600
          color: '#ffffff',
          text: 'VERIFIED'
        };
      case 'unknown':
        return {
          backgroundColor: '#9ca3af', // gray-400
          color: '#ffffff',
          text: 'UNKNOWN'
        };
      default:
        return {
          backgroundColor: '#9ca3af', // gray-400
          color: '#ffffff',
          text: status?.toUpperCase() || 'UNKNOWN'
        };
    }
  };

  // Save status_tutor change to API and update local state
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
              status_tutor: result.data?.status_tutor ?? newStatus,
              last_status_change: result.data?.last_status_change ?? t.last_status_change,
              status_changed_by: result.data?.status_changed_by ?? t.status_changed_by,
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
              status_tutor: bulkStatus,
              last_status_change: result.data?.last_status_change_map?.[t.id] ?? t.last_status_change,
              status_changed_by: result.data?.status_changed_by ?? t.status_changed_by,
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

  // Get availability status color and style for status menerima siswa
  const getAvailabilityStatusStyle = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    
    switch (statusLower) {
      case 'available':
        return {
          backgroundColor: '#10b981', // green-500
          color: '#ffffff',
          text: 'AVAILABLE'
        };
      case 'limited':
        return {
          backgroundColor: '#f59e0b', // amber-500
          color: '#ffffff',
          text: 'LIMITED'
        };
      case 'unavailable':
        return {
          backgroundColor: '#ef4444', // red-500
          color: '#ffffff',
          text: 'UNAVAILABLE'
        };
      case 'leave':
        return {
          backgroundColor: '#6b7280', // gray-500
          color: '#ffffff',
          text: 'LEAVE'
        };
      default:
        return {
          backgroundColor: '#9ca3af', // gray-400
          color: '#ffffff',
          text: status?.toUpperCase() || 'UNKNOWN'
        };
    }
  };

  // Format cell value based on column type
  const formatCellValue = (value: any, column: Column): string => {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    if (column.formatter) {
      return column.formatter(value);
    }

    switch (column.type) {
      case 'array':
        if (Array.isArray(value)) {
          // Special handling for selectedPrograms to show names instead of IDs
          if (column.key === 'selectedPrograms') {
            return value.map(id => programsLookup[id] || id).join(', ');
          }
          return value.join(', ');
        }
        return String(value);
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

  // Bulk column management functions
  const selectAllColumns = () => {
    const allColumnKeys = SPREADSHEET_COLUMNS.map(col => col.key);
    setVisibleColumns(new Set(allColumnKeys));
  };

  const deselectAllColumns = () => {
    setVisibleColumns(new Set());
  };

  const invertColumnSelection = () => {
    const allColumnKeys = SPREADSHEET_COLUMNS.map(col => col.key);
    setVisibleColumns(prev => {
      const newSet = new Set<keyof TutorSpreadsheetData>();
      allColumnKeys.forEach(key => {
        if (!prev.has(key)) {
          newSet.add(key);
        }
      });
      return newSet;
    });
  };

  const showAllInCategory = (category: string) => {
    const categoryColumns = SPREADSHEET_COLUMNS
      .filter(col => col.category === category)
      .map(col => col.key);
    
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      categoryColumns.forEach(key => newSet.add(key));
      return newSet;
    });
  };

  const hideAllInCategory = (category: string) => {
    const categoryColumns = SPREADSHEET_COLUMNS
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
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('tutorViewAll:tableZoom', newZoom.toString());
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
      
      // ESC key to close popup table
      if (e.key === 'Escape' && isTablePopupOpen) {
        e.preventDefault();
        setIsTablePopupOpen(false);
      }
      
      // ESC key to close cell detail popup
      if (e.key === 'Escape' && cellDetailPopup.isOpen) {
        e.preventDefault();
        closeCellDetailPopup();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomReset, isTablePopupOpen, cellDetailPopup.isOpen]);

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
    <div className="w-full max-w-none p-4">
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
        exportToCSV={exportToCSV}
        columnManager={ <ColumnManager 
              columns={SPREADSHEET_COLUMNS}
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
      />

      {/* Status Info Row - Left Aligned */}
      <div className="flex flex-wrap items-center gap-4 mb-4 w-full">

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
                      <SelectItem key={opt} value={opt} className="capitalize">
                        {opt}
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
              
              {/* Debug button - only show in development */}
              {process.env.NODE_ENV === 'development' && (
                <Button
                  onClick={testAllFilters}
                  variant="ghost"
                  className="h-6 px-2 text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                  title="Test all filters (development only)"
                >
                  <Icon icon="ph:bug" className="h-3 w-3 mr-1" />
                  Test Filters
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
      <div className="flex items-center justify-between mb-4 p-3 bg-card rounded-lg border border-border shadow-sm">
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
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTablePopupOpen(true)}
              className="h-8 px-3 text-xs border transition-colors bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
              title="Open table in popup window"
            >
              <Icon icon="ph:arrows-out" className="h-3 w-3 mr-1" />
              Popup
            </Button>
          </div>

        </div>
        

      </div>

      {/* Error State */}
      {error && (
        <div className="mb-4">
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

      {/* Cell Selection Info */}
      {(selectedCell || selectionRange.start || selectedCells.size > 0) && (
          <div className="bg-muted/50 border rounded-lg p-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {selectedCell && (
                  <span className="text-muted-foreground">
                    Selected: Row {selectedCell.row + 1}, Column {filteredColumns.find(col => col.key === selectedCell.col)?.label}
                  </span>
                )}
                {selectionRange.start && selectionRange.end && selectionMode === 'range' && (() => {
                  const start = selectionRange.start!;
                  const end = selectionRange.end!;
                  return (
                    <span className="text-muted-foreground">
                      Range: {Math.abs(end.row - start.row) + 1} × {Math.abs(getColumnIndex(end.col) - getColumnIndex(start.col)) + 1} cells
                    </span>
                  );
                })()}
                {selectedCells.size > 0 && selectionMode === 'multi' && (
                  <span className="text-muted-foreground">
                    Multi-selection: {selectedCells.size} cells
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copySelectedCells}
                  className="h-6 px-2 text-xs"
                >
                  <Icon icon="ph:copy" className="h-3 w-3 mr-1" />
                  Copy
                </Button>
                <span>•</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded border">Ctrl+C</kbd>
                <span>Copy</span>
                <span>•</span>
                <kbd className="px-1.5 py-0.5 bg-muted rounded border">Esc</kbd>
                <span>Clear</span>
                <span>•</span>
                <span>Drag to select range</span>
              </div>
            </div>
          </div>
        )}

        {/* Spreadsheet */}
        <div
          className={cn(
            "bg-card rounded-lg shadow-sm border",
            isScrollable ? "overflow-auto h-[78vh] md:h-[85vh]" : "overflow-x-auto overflow-y-visible h-auto"
          )}
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
                "w-full border-collapse",
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
                  <th className="w-20 h-10 border border-border bg-background sticky right-0 z-20 text-xs font-medium text-center text-muted-foreground uppercase tracking-wider">
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
                        width: '150px',
                        maxWidth: '150px',
                        minWidth: '100px'
                      }}
                      onClick={() => handleSort(column.key)}
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
                          width: '150px',
                          maxWidth: '150px',
                          minWidth: '100px'
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
                          // Inline editable status using dropdown menu styled as badge
                          (() => {
                            const current = String(tutor[column.key] || '');
                            const statusStyle = getStatusStyle(current);
                            return (
                              <div className="flex justify-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <button
                                      className="px-2 py-1 rounded-full text-xs font-semibold text-center min-w-[80px] focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                                        statusStyle.text
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
                                        <span className="capitalize">{opt}</span>
                                        {current === opt && (
                                          <Icon icon="ph:check" className="ml-auto h-4 w-4 text-primary" />
                                        )}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            );
                          })()
                        ) : column.key === 'statusMenerimaSiswa' ? (
                          // Special rendering for status menerima siswa with colored badges
                          (() => {
                            const statusStyle = getAvailabilityStatusStyle(tutor[column.key]);
                            return (
                              <div className="flex justify-center">
                                <span
                                  className="px-2 py-1 rounded-full text-xs font-semibold text-center min-w-[90px]"
                                  style={{
                                    backgroundColor: statusStyle.backgroundColor,
                                    color: statusStyle.color
                                  }}
                                  title={formatCellValue(tutor[column.key], column)}
                                >
                                  {statusStyle.text}
                                </span>
                              </div>
                            );
                          })()
                        ) : (
                          <div 
                            className="truncate whitespace-nowrap cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors rounded px-1"
                            title={formatCellValue(tutor[column.key], column)}
                            style={{ 
                              maxWidth: '130px',
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis' 
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(
                                formatCellValue(tutor[column.key], column),
                                column.label,
                                tutor.namaLengkap
                              );
                            }}
                          >
                            {formatCellValue(tutor[column.key], column)}
                            <Icon icon="ph:magnifying-glass-plus" className="inline-block ml-1 h-3 w-3 opacity-60" />
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
            status_tutor: 'menunggu'
          } as any}
          isLoading={bulkDeleteModal.isLoading}
          cascadePreview={bulkDeleteModal.cascadePreview}
          previewError={bulkDeleteModal.previewError}
                />

        {/* 🚀 POPUP TABLE MODAL - Complete Full Screen with All Features */}
        {isTablePopupOpen && (
          <div className="fixed inset-0 z-50 bg-background flex flex-col">
            {/* Full Screen Header with All Controls */}
            <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {/* Top Header */}
              <div className="h-16 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Icon icon="ph:table" className="h-5 w-5" />
                    Database Tutor - Full Screen View
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {sortedData.length} tutors • {filteredColumns.length} columns • Zoom: {tableZoom}%
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTablePopupOpen(false)}
                    className="h-8 px-3"
                  >
                    <Icon icon="ph:x" className="h-4 w-4 mr-1" />
                    Close (ESC)
                  </Button>
                </div>
              </div>
              
              {/* Zoom Controls */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border border-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">Table Zoom:</span>
                    <Button onClick={handleZoomOut} disabled={tableZoom <= ZOOM_MIN} size="sm" variant="outline" className="h-8 w-8 p-0">
                      -
                    </Button>
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={zoomInputValue}
                        onChange={(e) => {
                          const value = e.target.value;
                          setZoomInputValue(value);
                        }}
                        onBlur={(e) => {
                          const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, parseInt(e.target.value) || 100));
                          handleZoomChange(newZoom);
                          setZoomInputValue(newZoom.toString());
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        onWheel={(e) => {
                          e.preventDefault();
                          const delta = e.deltaY > 0 ? -1 : 1;
                          const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, tableZoom + (delta * 1)));
                          handleZoomChange(newZoom);
                          setZoomInputValue(newZoom.toString());
                        }}
                        min={ZOOM_MIN} max={ZOOM_MAX} step={1}
                        className="w-20 h-8 text-center" placeholder="100"
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    <Button onClick={handleZoomIn} disabled={tableZoom >= ZOOM_MAX} size="sm" variant="outline" className="h-8 w-8 p-0">
                      +
                    </Button>
                    <Button onClick={handleZoomReset} disabled={tableZoom === 100} size="sm" variant="outline" className="h-8 px-3">
                      <Icon icon="ph:arrows-clockwise" className="h-4 w-4 mr-1" /> Reset
                    </Button>
        </div>
                </div>
              </div>
            </div>
            
            {/* Full Screen Table with All Features */}
            <div className="flex-1 overflow-hidden p-6">
              <div className="w-full h-full overflow-auto border rounded-lg bg-background">
                <div className="relative overflow-auto w-full h-full">
                  <table 
                    className={cn(
                      "min-w-full border-collapse table-fixed",
                      isScrollable ? "min-h-[calc(100% + 1px)]" : ""
                    )}
                    style={zoomStyles}
                  >
                    {/* Table Header */}
                    <thead className="sticky top-0 bg-background border-b z-10">
                      <tr>
                        {filteredColumns.map((column) => (
                          <th
                            key={column.key}
                            className={cn(
                              "px-3 py-3 min-h-[60px] text-left text-xs font-medium text-muted-foreground uppercase tracking-wider border-r last:border-r-0",
                              column.sticky && "sticky left-0 bg-background z-20"
                            )}
                            style={{
                              width: '150px',
                              maxWidth: '150px',
                              minWidth: '100px'
                            }}
                          >
                            <div className="flex items-center justify-between h-full">
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
                              {column.sortable && (
                                <button
                                  onClick={() => handleSort(column.key)}
                                  className="ml-1 p-1 hover:bg-muted rounded"
                                >
                                  <Icon 
                                    icon={
                                      sortConfig?.key === column.key
                                        ? sortConfig?.direction === 'asc'
                                          ? 'ph:sort-ascending'
                                          : 'ph:sort-descending'
                                        : 'ph:sort'
                                    }
                                    className="h-3 w-3 text-muted-foreground"
                                  />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className="bg-background divide-y divide-border">
                      {sortedData.map((tutor, index) => (
                        <tr
                          key={tutor.id}
                          className={cn(
                            "hover:bg-muted/50 transition-colors",
                            selectedRows.has(tutor.id) && "bg-primary/5 border-l-4 border-l-primary"
                          )}
                        >
                          {filteredColumns.map((column) => (
                            <td
                              key={column.key}
                              className={cn(
                                "px-3 py-3 text-sm border-r last:border-r-0",
                                column.sticky && "sticky left-0 bg-background z-20"
                              )}
                              style={{
                                maxWidth: '150px',
                                minWidth: '100px'
                              }}
                            >
                              <div 
                                className="truncate whitespace-nowrap cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors rounded px-1"
                                title={formatCellValue(tutor[column.key], column)}
                                style={{ 
                                  maxWidth: '130px',
                                  overflow: 'hidden', 
                                  textOverflow: 'ellipsis' 
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCellClick(
                                    formatCellValue(tutor[column.key], column),
                                    column.label,
                                    tutor.namaLengkap
                                  );
                                }}
                              >
                                {formatCellValue(tutor[column.key], column)}
                                <Icon icon="ph:magnifying-glass-plus" className="inline-block ml-1 h-3 w-3 opacity-60" />
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

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