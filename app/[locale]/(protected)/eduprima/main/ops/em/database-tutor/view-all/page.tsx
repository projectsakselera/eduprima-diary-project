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
import ColumnFilter from "@/components/ui/column-filter";
import TutorDeleteConfirmationDialog from "@/components/tutor-delete-confirmation-dialog";
import { toast } from "react-hot-toast";

// Column Manager Component - Simple & User-Friendly
interface ColumnManagerProps {
  columns: Column[];
  visibleColumns: Set<keyof TutorSpreadsheetData>;
  onToggleColumn: (columnKey: keyof TutorSpreadsheetData) => void;
  categories: string[];
}

const ColumnManager: React.FC<ColumnManagerProps> = ({ 
  columns, 
  visibleColumns, 
  onToggleColumn, 
  categories 
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
        <div className="absolute top-10 right-0 z-50 w-80 sm:w-96 bg-background border rounded-lg shadow-lg max-h-[70vh]">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm">Manage Columns</h3>
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <Icon icon="ph:x" className="h-4 w-4" />
              </Button>
            </div>



            {/* Search */}
            <div className="relative mb-4">
              <Icon icon="ph:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
              <Input
                placeholder="Search columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-8"
              />
            </div>

            {/* Category Filter - Cleaner */}
            <div className="mb-4">
              <div className="text-xs font-medium text-foreground mb-2">📁 Categories:</div>
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
                  <div key={col.key} className="flex items-center space-x-2 p-1 hover:bg-muted/50 rounded">
                    <Checkbox
                      checked={visibleColumns.has(col.key)}
                      onCheckedChange={() => onToggleColumn(col.key)}
                      className="h-4 w-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{col.label}</div>
                      <div className="text-xs text-muted-foreground">
                        {col.category} • {col.type}
                        {col.required && <span className="text-red-500 ml-1">*</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredColumns.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  {searchTerm ? `No columns found for "${searchTerm}"` : 'No columns in this category'}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
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
  
  // Education
  statusAkademik: string;
  namaUniversitas: string;
  fakultas: string;
  jurusan: string;

  ipk: string;
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
  other_experience: string | null;
  other_skills: string | null;
  reason_for_teaching: string | null;
  
  // Extended Education Fields
  namaUniversitasS1: string | null; // For S2 students
  fakultasS1: string | null;
  jurusanS1: string | null;
  namaInstitusi: string | null; // For alternative background
  bidangKeahlian: string | null;
  pengalamanBelajar: string | null;
  namaSMP: string | null; // Middle school
  tahunLulusSMP: string | null;
  
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
  { key: 'trn', label: 'TRN', width: 120, type: 'text', category: 'System & Management', sticky: true, frozen: true },
  { key: 'status_tutor', label: 'Status Tutor', width: 140, type: 'select', category: 'System & Management' },
  { key: 'approval_level', label: 'Level Approval', width: 130, type: 'select', category: 'System & Management' },
  { key: 'staff_notes', label: 'Catatan Staff', width: 200, type: 'text', category: 'System & Management' },
  { key: 'additional_screening', label: 'Screening Tambahan', width: 200, type: 'array', category: 'System & Management' },
  { key: 'recruitment_stage_history', label: 'Riwayat Stage', width: 250, type: 'text', category: 'System & Management' },
  { key: 'last_status_change', label: 'Perubahan Status Terakhir', width: 180, type: 'date', category: 'System & Management' },
  { key: 'status_changed_by', label: 'Diubah Oleh', width: 150, type: 'text', category: 'System & Management' },
  { key: 'form_agreement_check', label: 'Persetujuan Form', width: 140, type: 'boolean', category: 'System & Management' },
  { key: 'created_at', label: 'Dibuat', width: 160, type: 'date', category: 'System & Management' },
  { key: 'updated_at', label: 'Diupdate', width: 160, type: 'date', category: 'System & Management' },
  
  // Identitas Dasar - Personal Information 
  { key: 'fotoProfil', label: 'Foto Profil', width: 120, type: 'file', category: 'Identitas Dasar' },
  { key: 'namaLengkap', label: 'Nama Lengkap', width: 180, type: 'text', category: 'Identitas Dasar', required: true },
  { key: 'namaPanggilan', label: 'Nama Panggilan', width: 140, type: 'text', category: 'Identitas Dasar' },
  { key: 'tanggalLahir', label: 'Tanggal Lahir', width: 130, type: 'date', category: 'Identitas Dasar' },
  { key: 'jenisKelamin', label: 'Jenis Kelamin', width: 120, type: 'select', category: 'Identitas Dasar' },
  { key: 'agama', label: 'Agama', width: 120, type: 'select', category: 'Identitas Dasar' },
  { key: 'email', label: 'Email', width: 200, type: 'email', category: 'Identitas Dasar', required: true },
  { key: 'noHp1', label: 'No HP 1', width: 140, type: 'phone', category: 'Identitas Dasar' },
  { key: 'noHp2', label: 'No HP 2', width: 140, type: 'phone', category: 'Identitas Dasar' },
  
  // Profil & Value Proposition
  { key: 'headline', label: 'Headline', width: 200, type: 'text', category: 'Profil & Motivasi' },
  { key: 'deskripsiDiri', label: 'Deskripsi Diri', width: 300, type: 'text', category: 'Profil & Motivasi' },
  { key: 'motivasiMenjadiTutor', label: 'Motivasi', width: 300, type: 'text', category: 'Profil & Motivasi' },
  { key: 'socialMedia1', label: 'Social Media 1', width: 200, type: 'text', category: 'Profil & Motivasi' },
  { key: 'socialMedia2', label: 'Social Media 2', width: 200, type: 'text', category: 'Profil & Motivasi' },
  
  
  // Identitas Dasar - Alamat Domisili
  { key: 'provinsiDomisili', label: 'Provinsi Domisili', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'kotaKabupatenDomisili', label: 'Kota Domisili', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'kecamatanDomisili', label: 'Kecamatan Domisili', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'kelurahanDomisili', label: 'Kelurahan Domisili', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'alamatLengkapDomisili', label: 'Alamat Lengkap Domisili', width: 300, type: 'text', category: 'Identitas Dasar' },
  { key: 'kodePosDomisili', label: 'Kode Pos Domisili', width: 120, type: 'text', category: 'Identitas Dasar' },
  
  // Identitas Dasar - Alamat KTP
  { key: 'alamatSamaDenganKTP', label: 'Alamat Sama KTP', width: 150, type: 'boolean', category: 'Identitas Dasar' },
  { key: 'provinsiKTP', label: 'Provinsi KTP', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'kotaKabupatenKTP', label: 'Kota KTP', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'kecamatanKTP', label: 'Kecamatan KTP', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'kelurahanKTP', label: 'Kelurahan KTP', width: 150, type: 'text', category: 'Identitas Dasar' },
  { key: 'alamatLengkapKTP', label: 'Alamat Lengkap KTP', width: 300, type: 'text', category: 'Identitas Dasar' },
  { key: 'kodePosKTP', label: 'Kode Pos KTP', width: 120, type: 'text', category: 'Identitas Dasar' },
  
  // Identitas Dasar - Informasi Perbankan
  { key: 'namaNasabah', label: 'Nama Nasabah', width: 180, type: 'text', category: 'Identitas Dasar' },
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
  { key: 'ipk', label: 'IPK', width: 80, type: 'text', category: 'Pendidikan & Pengalaman' },
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
  { key: 'namaSMP', label: 'Nama SMP', width: 200, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'tahunLulusSMP', label: 'Tahun Lulus SMP', width: 140, type: 'text', category: 'Pendidikan & Pengalaman' },
  
  // Pendidikan & Pengalaman - Profil & Keahlian
  { key: 'keahlianSpesialisasi', label: 'Keahlian Spesialisasi', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'keahlianLainnya', label: 'Keahlian Lainnya', width: 200, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'pengalamanMengajar', label: 'Pengalaman Mengajar', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'pengalamanLainRelevan', label: 'Pengalaman Lain', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'prestasiAkademik', label: 'Prestasi Akademik', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'prestasiNonAkademik', label: 'Prestasi Non-Akademik', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'sertifikasiPelatihan', label: 'Sertifikasi Pelatihan', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'other_experience', label: 'Pengalaman Lain Relevan', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'other_skills', label: 'Keahlian Lainnya (Detail)', width: 250, type: 'text', category: 'Pendidikan & Pengalaman' },
  { key: 'reason_for_teaching', label: 'Motivasi Mengajar', width: 300, type: 'text', category: 'Pendidikan & Pengalaman' },
  
  // Mata Pelajaran & Program
  { key: 'selectedPrograms', label: 'Program Dipilih', width: 300, type: 'array', category: 'Mata Pelajaran & Program' },
  { key: 'mataPelajaranLainnya', label: 'Mata Pelajaran Lainnya', width: 300, type: 'text', category: 'Mata Pelajaran & Program' },
  
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
  
  // Kontak Darurat & Komunikasi
  { key: 'emergencyContactName', label: 'Kontak Darurat Nama', width: 180, type: 'text', category: 'Kontak Darurat & Komunikasi' },
  { key: 'emergencyContactRelationship', label: 'Hubungan Kontak Darurat', width: 200, type: 'select', category: 'Kontak Darurat & Komunikasi' },
  { key: 'emergencyContactPhone', label: 'No HP Kontak Darurat', width: 180, type: 'phone', category: 'Kontak Darurat & Komunikasi' },

  // Upload Dokumen
  { key: 'dokumenIdentitas', label: 'Dokumen Identitas', width: 150, type: 'file', category: 'Upload Dokumen' },
  { key: 'dokumenPendidikan', label: 'Dokumen Pendidikan', width: 150, type: 'file', category: 'Upload Dokumen' },
  { key: 'dokumenSertifikat', label: 'Dokumen Sertifikat', width: 150, type: 'file', category: 'Upload Dokumen' },
  
  // Upload Dokumen - Verifikasi
  { key: 'status_verifikasi_identitas', label: 'Verifikasi Identitas', width: 150, type: 'select', category: 'Upload Dokumen' },
  { key: 'status_verifikasi_pendidikan', label: 'Verifikasi Pendidikan', width: 150, type: 'select', category: 'Upload Dokumen' },
];

export default function ViewAllTutorsPage() {
  const router = useRouter();
  
  // State
  const [tutorData, setTutorData] = useState<TutorSpreadsheetData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Separate input state for debouncing
  const [isSearching, setIsSearching] = useState(false); // Loading state for search only

  // 🚀 PAGINATION STATE - Advanced pagination system
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
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
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof TutorSpreadsheetData>>(new Set());
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



  // Initialize visible columns (show essential columns by default)
  useEffect(() => {
    const essentialColumns: (keyof TutorSpreadsheetData)[] = [
      'trn', 'fotoProfil', 'namaLengkap', 'email', 'noHp1', 'status_tutor', 
      'statusAkademik', 'namaUniversitas', 'selectedPrograms', 
      'hourly_rate', 'statusMenerimaSiswa', 'dokumenIdentitas', 
      'dokumenPendidikan', 'status_verifikasi_identitas', 'created_at'
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
      
      // Add column filters
      if (Object.keys(columnFilters).length > 0) {
        url.searchParams.set('filters', JSON.stringify(columnFilters));
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
      'statusMenerimaSiswa',
      
      // Location columns  
      'provinsiDomisili', 'kotaKabupatenDomisili', 'provinsiKTP', 'kotaKabupatenKTP',
      
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
    fetchTutorData(searchTerm, 1, newLimit);
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

  // 🚀 FILE PREVIEW FUNCTIONALITY  
  const handleFilePreview = (url: string, title: string, type: string) => {
    setPreviewModal({
      isOpen: true,
      url,
      title,
      type
    });
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(SPREADSHEET_COLUMNS.map(col => col.category).filter(Boolean))] as string[];
    return cats.sort();
  }, []);

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
    <div className="max-w-full mx-auto p-4">
      {/* Header */}
      <div className="bg-card rounded-lg shadow-sm border mb-4 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Icon icon="ph:table" className="h-6 w-6 text-primary" />
              Tutor Database Spreadsheet
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Advanced pagination system • Page {currentPage} of {totalPages} • {totalRecords} total records
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Icon-only buttons */}
            {/* Icon-only buttons with proper size and text override */}
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => fetchTutorData(searchTerm, currentPage, itemsPerPage)}
              disabled={isLoading || isSearching}
              className="h-8 w-8 text-slate-700 dark:text-slate-300 hover:text-primary"
              title="Refresh data"
            >
              <Icon 
                icon={isLoading ? "ph:spinner" : "ph:arrow-clockwise"} 
                className={cn("h-4 w-4", isLoading && "animate-spin")}
              />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={exportToCSV}
              className="h-8 w-8 text-slate-700 dark:text-slate-300 hover:text-primary"
              title="Export to CSV"
            >
              <Icon icon="ph:download" className="h-4 w-4" />
            </Button>
            
            {/* Column Manager */}
            <ColumnManager 
              columns={SPREADSHEET_COLUMNS}
              visibleColumns={visibleColumns}
              onToggleColumn={toggleColumnVisibility}
              categories={categories}
            />
            
                        <Button
              size="icon"
              onClick={() => router.push('/eduprima/main/ops/em/database-tutor/add')}
              className="bg-primary hover:bg-primary/90 h-8 w-8 text-primary-foreground"
              title="Add new tutor"
            >
              <Icon icon="ph:plus" className="h-4 w-4" />
            </Button>
            </div>
          </div>

          {/* Controls - Left Aligned, 50% Width */}
          <div className="mb-4">
            <div className="w-1/2 flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
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
                        onClick={handleClearSearch}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                      >
                        <Icon icon="ph:x" className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline"
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
              <div className="w-64">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat!}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Status Info Row - Left Aligned */}
          <div className="flex flex-wrap items-center gap-4 mb-4 w-full">

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
                {selectionRange.start && selectionRange.end && selectionMode === 'range' && (
                  <span className="text-muted-foreground">
                    Range: {Math.abs(selectionRange.end.row - selectionRange.start.row) + 1} × {Math.abs(getColumnIndex(selectionRange.end.col) - getColumnIndex(selectionRange.start.col)) + 1} cells
                  </span>
                )}
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
        <div className="bg-card rounded-lg shadow-sm border overflow-hidden">
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
          
          <div className="relative overflow-hidden" style={{ height: 'calc(100vh - 480px)' }}>
            <div 
              ref={spreadsheetRef}
              className="overflow-auto h-full"
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
              <table className="min-w-full border-collapse">
                {/* Header */}
                <thead className="sticky top-0 z-10 bg-muted/50 border-b">
                  <tr>
                    {/* Select All Checkbox */}
                    <th className="w-12 h-10 border border-border bg-muted/50 sticky left-0 z-20 p-2">
                      <div className="flex items-center justify-center h-full">
                        <Checkbox
                          checked={selectedRows.size === tutorData.length && tutorData.length > 0}
                          onCheckedChange={toggleSelectAll}
                          className="h-4 w-4"
                        />
                      </div>
                    </th>
                    


                    {/* Actions Header */}
                    <th className="w-20 h-10 border border-border bg-muted/50 sticky right-0 z-20 text-xs font-medium text-center text-muted-foreground uppercase tracking-wider">
                      <Icon icon="ph:gear" className="h-4 w-4 mx-auto" />
                    </th>

                    {/* Column Headers */}
                    {filteredColumns.map((column, index) => (
                      <th
                        key={column.key}
                        className={cn(
                          "h-10 border border-border bg-muted/50 text-left px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider select-none cursor-pointer hover:bg-muted/70",
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

                {/* Body */}
                <tbody className="bg-card divide-y divide-border">
                  {sortedData.map((tutor, rowIndex) => (
                    <tr
                      key={tutor.id}
                      className={cn(
                        "hover:bg-muted/50 transition-colors",
                        selectedRows.has(tutor.id) && "bg-primary/10"
                      )}
                    >
                      {/* Select Checkbox */}
                      <td className="w-12 h-10 border border-border bg-card sticky left-0 z-10 p-2">
                        <div className="flex items-center justify-center h-full">
                          <Checkbox
                            checked={selectedRows.has(tutor.id)}
                            onCheckedChange={() => toggleRowSelection(tutor.id)}
                            className="h-4 w-4"
                          />
                        </div>
                      </td>
                      


                      {/* Actions Column */}
                      <td className="w-20 h-10 border border-border bg-card sticky right-0 z-10 p-2">
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
                            "h-10 border border-border px-3 text-sm cursor-pointer hover:bg-muted/50 text-foreground select-none",
                            column.sticky && "sticky bg-card z-10",
                            // Selection styling
                            isCellSelected(rowIndex, column.key) && "bg-primary/20 ring-1 ring-primary/30",
                            selectedCell?.row === rowIndex && selectedCell?.col === column.key && "bg-primary/30 ring-2 ring-primary",
                            // Special styling for range edges
                            selectionRange.start?.row === rowIndex && selectionRange.start?.col === column.key && "ring-2 ring-primary",
                            selectionRange.end?.row === rowIndex && selectionRange.end?.col === column.key && selectionMode === 'range' && "ring-2 ring-primary ring-dashed"
                          )}
                          style={{ 
                            width: columnWidths[column.key] || column.width,
                            left: column.sticky ? (12 + 16 + (colIndex * (columnWidths[column.key] || column.width))) : undefined
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
                          ) : (
                            <div className="truncate" title={formatCellValue(tutor[column.key], column)}>
                              {formatCellValue(tutor[column.key], column)}
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
                  className="h-8 w-8 p-0"
                >
                  <Icon icon="ph:caret-double-left" className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <Icon icon="ph:caret-left" className="h-4 w-4" />
                </Button>
                
                <span className="px-3 py-1 text-sm bg-muted rounded">
                  {currentPage} / {totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <Icon icon="ph:caret-right" className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || isLoading}
                  className="h-8 w-8 p-0"
                >
                  <Icon icon="ph:caret-double-right" className="h-4 w-4" />
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
                    src={previewModal.url} 
                    alt={previewModal.title}
                    className="max-w-full h-auto rounded-lg mx-auto"
                    style={{ maxHeight: '70vh' }}
                  />
                ) : (
                  <iframe
                    src={previewModal.url}
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
    </div>
  );
}