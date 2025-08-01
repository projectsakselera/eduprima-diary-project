// Helper function to generate year options
const generateYearOptions = (startYear: number, endYear: number) => {
  const options = [];
  for (let year = endYear; year >= startYear; year--) {
    options.push({ value: year.toString(), label: year.toString() });
  }
  return options;
};

// Helper function to generate month-year options
const generateMonthYearOptions = (startYear: number, endYear: number) => {
  const options = [];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  for (let year = endYear; year >= startYear; year--) {
    for (let month = 11; month >= 0; month--) {
      const value = `${year}-${String(month + 1).padStart(2, '0')}`;
      const label = `${months[month]} ${year}`;
      options.push({ value, label });
    }
  }
  return options;
};

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'tel_split' | 'date' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'switch' | 'category-program-selector';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  validation?: (value: any) => string | null;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
  apiEndpoint?: string; // for dynamic options from API
  accept?: string; // for file inputs
  multiple?: boolean; // for select/checkbox
  min?: number;
  max?: number;
  step?: number; // for number inputs
  rows?: number; // for textarea
  size?: 'sm' | 'default' | 'md' | 'lg';
  color?: 'default' | 'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'destructive';
  icon?: string; // iconify icon
  dependsOn?: string; // field dependency
  conditional?: (formData: any) => boolean; // conditional visibility
  className?: string; // for custom styling
  inputProps?: any; // for additional input properties
  // New AI-related properties
  maxCoreSelections?: number; // for ai-core-select
  aiCorrelationMap?: string; // reference to correlation matrix
  confidenceThreshold?: number; // minimum confidence for recommendations
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color?: 'default' | 'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'destructive';
  fields: FormField[];
  validation?: (formData: any) => string[];
}

export interface FormConfig {
  title: string;
  description?: string;
  steps: FormStep[];
  submitText?: string;
  cancelText?: string;
  backText?: string;
  nextText?: string;
}

// ===== AI RECOMMENDATION SYSTEM INTERFACES =====

export interface SubjectCorrelation {
  subject: string;
  correlation: number;
  reason: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  preparationTime: string;
  marketDemand?: 'high' | 'medium' | 'low';
}

export interface AIRecommendationTier {
  tier: 1 | 2 | 3;
  title: string;
  description: string;
  icon: string;
  color: string;
  subjects: SubjectCorrelation[];
}

export interface CoreSubjectProfile {
  value: string;
  label: string;
  category: string;
  level: string;
  relatedSubjects: SubjectCorrelation[];
}

export interface AIRecommendationEngine {
  generateRecommendations: (coreSubjects: string[], tutorProfile?: Partial<TutorFormData>) => AIRecommendationTier[];
  getSubjectCorrelations: (subject: string) => SubjectCorrelation[];
  calculateConfidence: (coreSubjects: string[], targetSubject: string) => number;
}

// Dynamic form data structure
export interface TutorFormData {
  // System & Status Information (Staff only)
  status_tutor?: string;
  approval_level?: string;
  staff_notes?: string;
  additionalScreening?: string[]; // Checklist for additional screening

  // Personal Information
  fotoProfil?: File | string | null;
  trn: string;
  namaLengkap: string; // Will be mapped to nama_lengkap in DB
  namaPanggilan?: string; // New field for nickname
  tanggalLahir: string;
  jenisKelamin: string;
  agama?: string; // Religion field for user demographics
  email: string;
  noHp1: string;
  noHp2?: string;
  
  // PROFIL & VALUE PROPOSITION
  headline?: string; // Headline/Tagline Tutor (max 100 chars)
  deskripsiDiri?: string; // Deskripsi Diri/Bio Tutor
  socialMedia1?: string; // Link Media Sosial 1 (Instagram/LinkedIn)
  socialMedia2?: string; // Link Media Sosial 2 (YouTube/TikTok)

  
  // Address Information - Domisili (New Structure)
  provinsiDomisili: string; // UUID from dropdown
  kotaKabupatenDomisili: string; // UUID from dropdown  
  kecamatanDomisili: string; // Manual input text
  kelurahanDomisili: string; // Manual input text
  alamatLengkapDomisili: string; // Manual input - street address
  kodePosDomisili?: string;
  
  // Address Information - KTP/KK (New Structure)
  alamatSamaDenganKTP?: boolean;
  provinsiKTP?: string; // UUID from dropdown
  kotaKabupatenKTP?: string; // UUID from dropdown
  kecamatanKTP?: string; // Manual input text
  kelurahanKTP?: string; // Manual input text
  alamatLengkapKTP?: string; // Manual input - street address
  kodePosKTP?: string;
  
  // Banking Information (Enhanced)
  namaNasabah: string; // Account holder name
  nomorRekening: string; // Account number
  namaBank: string; // Bank ID (UUID from dropdown)
  
  // Professional Information - Updated Education Fields
  statusAkademik?: string;
  namaUniversitasS1?: string;
  fakultasS1?: string;
  jurusanS1?: string;
  namaUniversitas?: string;
  fakultas?: string;
  jurusan?: string;

  ipk?: string;
  tahunMasuk?: string;
  tahunLulus?: string;
  transkripNilai?: File | string | null;
  namaSMA?: string;
  jurusanSMA?: string;
  jurusanSMKDetail?: string;
  tahunLulusSMA?: string;

  
  // Alternative Learning Background (for "Lainnya")
  namaInstitusi?: string;
  bidangKeahlian?: string;
  pengalamanBelajar?: string;
  sertifikatKeahlian?: File | string | null;
  
  // Professional Profile & Experience
  motivasiMenjadiTutor?: string;
  keahlianSpesialisasi?: string;
  keahlianLainnya?: string;
  
  // Teaching Experience - Simplified
  pengalamanMengajar?: string;
  pengalamanLainRelevan?: string;
  
  // Achievements & Credentials - Simplified
  prestasiAkademik?: string;
  prestasiNonAkademik?: string;
  sertifikasiPelatihan?: string;
  
  // Teaching Configuration (legacy)
  sertifikasi?: string;
  hourly_rate: number;
  teaching_methods: string[];
  available_schedule: string[];
  
  // New Availability Configuration
  statusMenerimaSiswa?: string;
  maksimalSiswaBaru?: number;
  maksimalTotalSiswa?: number;
  usiaTargetSiswa?: string[];
  catatanAvailability?: string;

  // Teaching Details
  teachingMethods?: string[];
  studentLevelPreferences?: string[];
  specialNeedsCapable?: string;
  groupClassWilling?: string;

  // Technology Capability
  onlineTeachingCapable?: string;
  techSavviness?: string;
  gmeetExperience?: string;
  presensiUpdateCapability?: string;

  // Personality & Character
  tutorPersonalityType?: string[];
  communicationStyle?: string[];
  teachingPatienceLevel?: string;
  studentMotivationAbility?: string;
  scheduleFlexibilityLevel?: string;

  // Emergency Contact & Communication
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  
  // Profile Information (legacy - kept for compatibility)
  motivasi: string;
  
  // Subject Information - Mata Pelajaran per Kategori
  mataPelajaran_SD_Kelas_1_6_: string[];
  mataPelajaran_SMP_Kelas_7_9_: string[];
  mataPelajaran_SMA_SMK_IPA: string[];
  mataPelajaran_SMA_SMK_IPS: string[];
  mataPelajaran_SMK_Teknik_Teknologi: string[];
  mataPelajaran_SMK_Bisnis_Manajemen: string[];
  mataPelajaran_SMK_Pariwisata_Perhotelan: string[];
  mataPelajaran_SMK_Kesehatan: string[];
  mataPelajaran_Bahasa_Asing: string[];
  mataPelajaran_Universitas_Perguruan_Tinggi: string[];
  mataPelajaran_Keterampilan_Khusus: string[];
  
  // Teaching Area Information
  teaching_radius_km?: number;
  location_notes?: string;
  
  // Location Coordinates
  titikLokasiLat?: number;
  titikLokasiLng?: number;
  alamatTitikLokasi?: string;
  
  // Documents
  dokumenIdentitas?: File | string | null;
  dokumenPendidikan?: File | string | null;
  dokumenSertifikat?: File | string | null;
  
  // Document preview fields (for tab switching persistence)
  fotoProfilPreview?: string | null;
  dokumenIdentitasPreview?: string | null;
  dokumenPendidikanPreview?: string | null;
  dokumenSertifikatPreview?: string | null;
  
  // Document Verification (Staff only)
  status_verifikasi_identitas?: string;
  status_verifikasi_pendidikan?: string;
  


  // Program Selection from Database
  selectedPrograms?: string[]; // Array of selected program IDs from Supabase
  mataPelajaranLainnya?: string; // Textarea for additional subjects not found in the selector
}

// Validation rules
const validationRules = {
  required: (value: any) => !value ? 'Field ini wajib diisi' : null,
  email: (value: string) => {
    if (!value) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Format email tidak valid' : null;
  },
  phone: (value: string) => {
    if (!value) return null;
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    return !phoneRegex.test(value.replace(/\s|-/g, '')) ? 'Format nomor HP tidak valid' : null;
  },
  trn: (value: string) => {
    if (!value) return null;
    if (!/^[A-Z0-9]+$/.test(value)) return 'TRN harus berupa huruf kapital dan angka tanpa spasi';
    if (value.length < 8) return 'TRN minimal 8 karakter';
    return null;
  },
  bankAccount: (value: string) => {
    if (!value) return null;
    if (!/^[0-9]+$/.test(value)) return 'Nomor rekening harus berupa angka';
    if (value.length < 10) return 'Nomor rekening minimal 10 digit';
    return null;
  },
  ipk: (value: string) => {
    if (!value) return null;
    
    // Check if contains comma instead of dot
    if (value.includes(',')) {
      return 'IPK harus menggunakan titik (.) sebagai pemisah desimal, bukan koma (,)';
    }
    
    // More flexible format validation - allow formats like: 4, 3.76, 2.7, 3.766
    if (!/^[0-4](\.[0-9]{1,3})?$/.test(value)) {
      return 'Format IPK tidak valid. Contoh: 4, 3.76, 2.7, atau 3.766';
    }
    
    const numValue = parseFloat(value);
    if (numValue < 2.0 || numValue > 4.0) {
      return 'IPK harus antara 2.0 - 4.0';
    }
    
    return null;
  },
  phone_split: (value: string) => {
    if (!value) return null;
    
    // Parse country code and number
    const match = value.match(/^(\d{1,4})(\d+)$/);
    if (!match) {
      return 'Format nomor HP tidak valid. Gunakan format: [kode negara][nomor]';
    }
    
    const [, countryCode, phoneNumber] = match;
    const totalLength = value.length;
    
    // Validate based on country code
    if (countryCode === '62') {
      // Indonesia: 62 + 9-12 digits
      if (phoneNumber.length < 9 || phoneNumber.length > 12) {
        return 'Nomor Indonesia harus 9-12 digit setelah kode negara 62';
      }
    } else if (countryCode === '1') {
      // US/Canada: 1 + 10 digits
      if (phoneNumber.length !== 10) {
        return 'Nomor US/Canada harus 10 digit setelah kode negara 1';
      }
    } else if (countryCode === '60') {
      // Malaysia: 60 + 9-10 digits
      if (phoneNumber.length < 9 || phoneNumber.length > 10) {
        return 'Nomor Malaysia harus 9-10 digit setelah kode negara 60';
      }
    } else if (countryCode === '65') {
      // Singapore: 65 + 8 digits
      if (phoneNumber.length !== 8) {
        return 'Nomor Singapore harus 8 digit setelah kode negara 65';
      }
    } else {
      // Generic validation for other countries
      if (totalLength < 8 || totalLength > 15) {
        return 'Nomor HP harus 8-15 digit total (termasuk kode negara)';
      }
    }
    
    return null;
  },
  tarif: (value: number) => {
    if (!value) return null;
    if (value < 50000) return 'Tarif minimal Rp 50.000';
    if (value > 1000000) return 'Tarif maksimal Rp 1.000.000';
    return null;
  },
  headline: (value: string) => {
    if (!value) return null;
    if (value.length > 100) return 'Headline maksimal 100 karakter';
    return null;
  },
  socialMedia: (value: string) => {
    if (!value) return null;
    const urlRegex = /^https?:\/\/(www\.)?(instagram|linkedin|youtube|tiktok|facebook|twitter)\.com\/.+$/i;
    return !urlRegex.test(value) ? 'URL media sosial tidak valid. Gunakan link Instagram, LinkedIn, YouTube, TikTok, Facebook, atau Twitter' : null;
  }
};

// Dynamic options - these would typically come from API/database
export const dynamicOptions = {
  jenisKelamin: [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' }
  ],

  agama: [
    { value: 'islam', label: 'Islam' },
    { value: 'kristen_protestan', label: 'Kristen Protestan' },
    { value: 'kristen_katolik', label: 'Kristen Katolik' },
    { value: 'hindu', label: 'Hindu' },
    { value: 'buddha', label: 'Buddha' },
    { value: 'konghucu', label: 'Konghucu' },
    { value: 'kepercayaan_lain', label: 'Kepercayaan Lain' },
    { value: 'lebih_tidak_menyebutkan', label: 'Lebih Tidak Menyebutkan' }
  ],
  
  bahasaYangDikuasai: [
    { value: 'bahasa_indonesia', label: 'Bahasa Indonesia' },
    { value: 'bahasa_inggris', label: 'Bahasa Inggris' },
    { value: 'bahasa_arab', label: 'Bahasa Arab' },
    { value: 'bahasa_mandarin', label: 'Bahasa Mandarin' },
    { value: 'bahasa_jepang', label: 'Bahasa Jepang' },
    { value: 'bahasa_korea', label: 'Bahasa Korea' },
    { value: 'bahasa_jawa', label: 'Bahasa Jawa' },
    { value: 'bahasa_sunda', label: 'Bahasa Sunda' },
    { value: 'bahasa_bali', label: 'Bahasa Bali' }
  ],
  
  provinsi: [
    { value: 'DKI Jakarta', label: 'DKI Jakarta' },
    { value: 'Jawa Barat', label: 'Jawa Barat' },
    { value: 'Jawa Tengah', label: 'Jawa Tengah' },
    { value: 'Jawa Timur', label: 'Jawa Timur' },
    { value: 'Yogyakarta', label: 'D.I. Yogyakarta' },
    { value: 'Banten', label: 'Banten' },
    { value: 'Sumatera Utara', label: 'Sumatera Utara' },
    { value: 'Sumatera Barat', label: 'Sumatera Barat' },
    { value: 'Bali', label: 'Bali' }
  ],
  
  namaBank: [
    // 4 Bank Utama (Gratis Transfer Antar Bank)
    { value: 'BCA', label: 'Bank Central Asia (BCA) - Gratis Transfer' },
    { value: 'BRI', label: 'Bank Rakyat Indonesia (BRI) - Gratis Transfer' },
    { value: 'BNI', label: 'Bank Negara Indonesia (BNI) - Gratis Transfer' },
    { value: 'Mandiri', label: 'Bank Mandiri - Gratis Transfer' },
    
    // Bank Umum Nasional
    { value: 'CIMB', label: 'CIMB Niaga' },
    { value: 'Danamon', label: 'Bank Danamon' },
    { value: 'Permata', label: 'Bank Permata' },
    { value: 'BSI', label: 'Bank Syariah Indonesia (BSI)' },
    { value: 'Panin', label: 'Bank Panin' },
    { value: 'OCBC', label: 'Bank OCBC NISP' },
    { value: 'UOB', label: 'Bank UOB Indonesia' },
    { value: 'Citibank', label: 'Citibank Indonesia' },
    { value: 'HSBC', label: 'HSBC Indonesia' },
    { value: 'Standard Chartered', label: 'Standard Chartered Bank' },
    { value: 'DBS', label: 'Bank DBS Indonesia' },
    { value: 'Maybank', label: 'Bank Maybank Indonesia' },
    { value: 'BTPN', label: 'Bank BTPN' },
    { value: 'BTPN Syariah', label: 'Bank BTPN Syariah' },
    { value: 'Bank Mega', label: 'Bank Mega' },
    { value: 'Bank Sinarmas', label: 'Bank Sinarmas' },
    { value: 'Bank Mestika', label: 'Bank Mestika Dharma' },
    { value: 'Bank Victoria', label: 'Bank Victoria International' },
    { value: 'Bank Jatim', label: 'Bank Jatim' },
    { value: 'Bank DKI', label: 'Bank DKI' },
    { value: 'Bank Jabar', label: 'Bank Jabar Banten' },
    { value: 'Bank Sumut', label: 'Bank Sumut' },
    { value: 'Bank Kalsel', label: 'Bank Kalsel' },
    { value: 'Bank Kaltim', label: 'Bank Kaltim' },
    { value: 'Bank Sulselbar', label: 'Bank Sulselbar' },
    { value: 'Bank Sultra', label: 'Bank Sultra' },
    { value: 'Bank Maluku', label: 'Bank Maluku' },
    { value: 'Bank Papua', label: 'Bank Papua' },
    { value: 'Bank Aceh', label: 'Bank Aceh' },
    { value: 'Bank Nagari', label: 'Bank Nagari' },
    { value: 'Bank Riau', label: 'Bank Riau Kepri' },
    { value: 'Bank Jambi', label: 'Bank Jambi' },
    { value: 'Bank Sumsel', label: 'Bank Sumsel Babel' },
    { value: 'Bank Bengkulu', label: 'Bank Bengkulu' },
    { value: 'Bank Lampung', label: 'Bank Lampung' },
    { value: 'Bank Banten', label: 'Bank Banten' },
    { value: 'Bank NTB', label: 'Bank NTB Syariah' },
    { value: 'Bank NTT', label: 'Bank NTT' },
    { value: 'Bank Kalbar', label: 'Bank Kalbar' },
    { value: 'Bank Kalteng', label: 'Bank Kalteng' },
    { value: 'Bank Kaltara', label: 'Bank Kaltara' },
    { value: 'Bank Sulut', label: 'Bank Sulut' },
    { value: 'Bank Sulteng', label: 'Bank Sulteng' },
    { value: 'Bank Gorontalo', label: 'Bank Gorontalo' },
    { value: 'Bank Malut', label: 'Bank Malut' },
    { value: 'Bank Maluku', label: 'Bank Maluku' },
    { value: 'Bank Papua', label: 'Bank Papua' },
    
    // Bank Syariah
    { value: 'Bank Muamalat', label: 'Bank Muamalat Indonesia' },
    { value: 'Bank Mega Syariah', label: 'Bank Mega Syariah' },
    { value: 'Bank Victoria Syariah', label: 'Bank Victoria Syariah' },
    { value: 'Bank Jabar Syariah', label: 'Bank Jabar Banten Syariah' },
    { value: 'Bank Sumut Syariah', label: 'Bank Sumut Syariah' },
    { value: 'Bank Kalsel Syariah', label: 'Bank Kalsel Syariah' },
    { value: 'Bank Sulselbar Syariah', label: 'Bank Sulselbar Syariah' },
    { value: 'Bank Aceh Syariah', label: 'Bank Aceh Syariah' },
    { value: 'Bank Nagari Syariah', label: 'Bank Nagari Syariah' },
    { value: 'Bank Riau Syariah', label: 'Bank Riau Kepri Syariah' },
    { value: 'Bank Jambi Syariah', label: 'Bank Jambi Syariah' },
    { value: 'Bank Sumsel Syariah', label: 'Bank Sumsel Babel Syariah' },
    { value: 'Bank Bengkulu Syariah', label: 'Bank Bengkulu Syariah' },
    { value: 'Bank Lampung Syariah', label: 'Bank Lampung Syariah' },
    { value: 'Bank Banten Syariah', label: 'Bank Banten Syariah' },
    { value: 'Bank NTB Syariah', label: 'Bank NTB Syariah' },
    { value: 'Bank NTT Syariah', label: 'Bank NTT Syariah' },
    { value: 'Bank Kalbar Syariah', label: 'Bank Kalbar Syariah' },
    { value: 'Bank Kalteng Syariah', label: 'Bank Kalteng Syariah' },
    { value: 'Bank Kaltara Syariah', label: 'Bank Kaltara Syariah' },
    { value: 'Bank Sulut Syariah', label: 'Bank Sulut Syariah' },
    { value: 'Bank Sulteng Syariah', label: 'Bank Sulteng Syariah' },
    { value: 'Bank Gorontalo Syariah', label: 'Bank Gorontalo Syariah' },
    { value: 'Bank Malut Syariah', label: 'Bank Malut Syariah' },
    { value: 'Bank Maluku Syariah', label: 'Bank Maluku Syariah' },
    { value: 'Bank Papua Syariah', label: 'Bank Papua Syariah' },
    
    // Bank Digital/Neo Bank
    { value: 'Bank Jago', label: 'Bank Jago' },
    { value: 'Bank Aladin', label: 'Bank Aladin Syariah' },
    { value: 'Bank Seabank', label: 'Bank Seabank Indonesia' },
    { value: 'Bank Line', label: 'Bank Line by Hana Bank' },
    { value: 'Bank Nobu', label: 'Bank Nobu Indonesia' },
    { value: 'Bank Sahabat Sampoerna', label: 'Bank Sahabat Sampoerna' },
    { value: 'Bank Ina Perdana', label: 'Bank Ina Perdana' },
    { value: 'Bank Maspion', label: 'Bank Maspion Indonesia' },
    { value: 'Bank Ganesha', label: 'Bank Ganesha' },
    { value: 'Bank ICB Bumiputera', label: 'Bank ICB Bumiputera' },
    { value: 'Bank Yudha Bhakti', label: 'Bank Yudha Bhakti' },
    { value: 'Bank Mitraniaga', label: 'Bank Mitraniaga' },
    { value: 'Bank Multi Arta Sentosa', label: 'Bank Multi Arta Sentosa' },
    { value: 'Bank Central Asia Tbk', label: 'Bank Central Asia Tbk' },
    { value: 'Bank Rakyat Indonesia Tbk', label: 'Bank Rakyat Indonesia Tbk' },
    { value: 'Bank Negara Indonesia Tbk', label: 'Bank Negara Indonesia Tbk' },
    { value: 'Bank Mandiri Tbk', label: 'Bank Mandiri Tbk' },
    { value: 'Bank CIMB Niaga Tbk', label: 'Bank CIMB Niaga Tbk' },
    { value: 'Bank Danamon Indonesia Tbk', label: 'Bank Danamon Indonesia Tbk' },
    { value: 'Bank Permata Tbk', label: 'Bank Permata Tbk' },
    { value: 'Bank Syariah Indonesia Tbk', label: 'Bank Syariah Indonesia Tbk' },
    { value: 'Bank Panin Tbk', label: 'Bank Panin Tbk' },
    { value: 'Bank OCBC NISP Tbk', label: 'Bank OCBC NISP Tbk' },
    { value: 'Bank UOB Indonesia Tbk', label: 'Bank UOB Indonesia Tbk' },
    { value: 'Bank Citibank Indonesia Tbk', label: 'Bank Citibank Indonesia Tbk' },
    { value: 'Bank HSBC Indonesia Tbk', label: 'Bank HSBC Indonesia Tbk' },
    { value: 'Bank Standard Chartered Indonesia Tbk', label: 'Bank Standard Chartered Indonesia Tbk' },
    { value: 'Bank DBS Indonesia Tbk', label: 'Bank DBS Indonesia Tbk' },
    { value: 'Bank Maybank Indonesia Tbk', label: 'Bank Maybank Indonesia Tbk' },
    { value: 'Bank BTPN Tbk', label: 'Bank BTPN Tbk' },
    { value: 'Bank BTPN Syariah Tbk', label: 'Bank BTPN Syariah Tbk' },
    { value: 'Bank Mega Tbk', label: 'Bank Mega Tbk' },
    { value: 'Bank Sinarmas Tbk', label: 'Bank Sinarmas Tbk' },
    { value: 'Bank Mestika Dharma Tbk', label: 'Bank Mestika Dharma Tbk' },
    { value: 'Bank Victoria International Tbk', label: 'Bank Victoria International Tbk' },
    { value: 'Bank Jatim Tbk', label: 'Bank Jatim Tbk' },
    { value: 'Bank DKI Tbk', label: 'Bank DKI Tbk' },
    { value: 'Bank Jabar Banten Tbk', label: 'Bank Jabar Banten Tbk' },
    { value: 'Bank Sumut Tbk', label: 'Bank Sumut Tbk' },
    { value: 'Bank Kalsel Tbk', label: 'Bank Kalsel Tbk' },
    { value: 'Bank Kaltim Tbk', label: 'Bank Kaltim Tbk' },
    { value: 'Bank Sulselbar Tbk', label: 'Bank Sulselbar Tbk' },
    { value: 'Bank Sultra Tbk', label: 'Bank Sultra Tbk' },
    { value: 'Bank Maluku Tbk', label: 'Bank Maluku Tbk' },
    { value: 'Bank Papua Tbk', label: 'Bank Papua Tbk' },
    { value: 'Bank Aceh Tbk', label: 'Bank Aceh Tbk' },
    { value: 'Bank Nagari Tbk', label: 'Bank Nagari Tbk' },
    { value: 'Bank Riau Kepri Tbk', label: 'Bank Riau Kepri Tbk' },
    { value: 'Bank Jambi Tbk', label: 'Bank Jambi Tbk' },
    { value: 'Bank Sumsel Babel Tbk', label: 'Bank Sumsel Babel Tbk' },
    { value: 'Bank Bengkulu Tbk', label: 'Bank Bengkulu Tbk' },
    { value: 'Bank Lampung Tbk', label: 'Bank Lampung Tbk' },
    { value: 'Bank Banten Tbk', label: 'Bank Banten Tbk' },
    { value: 'Bank NTB Syariah Tbk', label: 'Bank NTB Syariah Tbk' },
    { value: 'Bank NTT Tbk', label: 'Bank NTT Tbk' },
    { value: 'Bank Kalbar Tbk', label: 'Bank Kalbar Tbk' },
    { value: 'Bank Kalteng Tbk', label: 'Bank Kalteng Tbk' },
    { value: 'Bank Kaltara Tbk', label: 'Bank Kaltara Tbk' },
    { value: 'Bank Sulut Tbk', label: 'Bank Sulut Tbk' },
    { value: 'Bank Sulteng Tbk', label: 'Bank Sulteng Tbk' },
    { value: 'Bank Gorontalo Tbk', label: 'Bank Gorontalo Tbk' },
    { value: 'Bank Malut Tbk', label: 'Bank Malut Tbk' },
    { value: 'Bank Maluku Tbk', label: 'Bank Maluku Tbk' },
    { value: 'Bank Papua Tbk', label: 'Bank Papua Tbk' }
  ],
  

  
  // Mata Pelajaran berdasarkan kategori/tingkatan
  mataPelajaranKategori: {
    'SD (Kelas 1-6)': [
      { value: 'Matematika SD', label: 'Matematika' },
      { value: 'Bahasa Indonesia SD', label: 'Bahasa Indonesia' },
      { value: 'Bahasa Inggris SD', label: 'Bahasa Inggris' },
      { value: 'IPA SD', label: 'Ilmu Pengetahuan Alam (IPA)' },
      { value: 'IPS SD', label: 'Ilmu Pengetahuan Sosial (IPS)' },
      { value: 'PKn SD', label: 'Pendidikan Kewarganegaraan' },
      { value: 'Agama Islam SD', label: 'Pendidikan Agama Islam' },
      { value: 'Agama Kristen SD', label: 'Pendidikan Agama Kristen' },
      { value: 'Agama Katolik SD', label: 'Pendidikan Agama Katolik' },
      { value: 'Agama Hindu SD', label: 'Pendidikan Agama Hindu' },
      { value: 'Agama Buddha SD', label: 'Pendidikan Agama Buddha' },
      { value: 'Seni Budaya SD', label: 'Seni Budaya dan Prakarya' },
      { value: 'PJOK SD', label: 'Pendidikan Jasmani, Olahraga, dan Kesehatan' },
    ],
    
    'SMP (Kelas 7-9)': [
      { value: 'Matematika SMP', label: 'Matematika' },
      { value: 'Bahasa Indonesia SMP', label: 'Bahasa Indonesia' },
      { value: 'Bahasa Inggris SMP', label: 'Bahasa Inggris' },
      { value: 'IPA SMP', label: 'Ilmu Pengetahuan Alam (IPA)' },
      { value: 'IPS SMP', label: 'Ilmu Pengetahuan Sosial (IPS)' },
      { value: 'PKn SMP', label: 'Pendidikan Kewarganegaraan' },
      { value: 'Agama Islam SMP', label: 'Pendidikan Agama Islam' },
      { value: 'Agama Kristen SMP', label: 'Pendidikan Agama Kristen' },
      { value: 'Agama Katolik SMP', label: 'Pendidikan Agama Katolik' },
      { value: 'Agama Hindu SMP', label: 'Pendidikan Agama Hindu' },
      { value: 'Agama Buddha SMP', label: 'Pendidikan Agama Buddha' },
      { value: 'Seni Budaya SMP', label: 'Seni Budaya' },
      { value: 'PJOK SMP', label: 'Pendidikan Jasmani, Olahraga, dan Kesehatan' },
      { value: 'Prakarya SMP', label: 'Prakarya' },
      { value: 'Bahasa Daerah SMP', label: 'Bahasa Daerah' },
    ],
    
    'SMA/SMK IPA': [
      { value: 'Matematika SMA', label: 'Matematika' },
    { value: 'Fisika', label: 'Fisika' },
    { value: 'Kimia', label: 'Kimia' },
    { value: 'Biologi', label: 'Biologi' },
      { value: 'Bahasa Indonesia SMA', label: 'Bahasa Indonesia' },
      { value: 'Bahasa Inggris SMA', label: 'Bahasa Inggris' },
      { value: 'Sejarah SMA', label: 'Sejarah' },
      { value: 'Geografi SMA', label: 'Geografi' },
      { value: 'PKn SMA', label: 'Pendidikan Kewarganegaraan' },
      { value: 'Agama Islam SMA', label: 'Pendidikan Agama Islam' },
      { value: 'Agama Kristen SMA', label: 'Pendidikan Agama Kristen' },
      { value: 'Agama Katolik SMA', label: 'Pendidikan Agama Katolik' },
      { value: 'Agama Hindu SMA', label: 'Pendidikan Agama Hindu' },
      { value: 'Agama Buddha SMA', label: 'Pendidikan Agama Buddha' },
      { value: 'PJOK SMA', label: 'Pendidikan Jasmani, Olahraga, dan Kesehatan' },
      { value: 'Seni Budaya SMA', label: 'Seni Budaya' },
    ],
    
    'SMA/SMK IPS': [
      { value: 'Matematika SMA IPS', label: 'Matematika' },
      { value: 'Bahasa Indonesia SMA IPS', label: 'Bahasa Indonesia' },
      { value: 'Bahasa Inggris SMA IPS', label: 'Bahasa Inggris' },
      { value: 'Sejarah SMA IPS', label: 'Sejarah' },
      { value: 'Geografi SMA IPS', label: 'Geografi' },
    { value: 'Ekonomi', label: 'Ekonomi' },
    { value: 'Sosiologi', label: 'Sosiologi' },
      { value: 'Antropologi', label: 'Antropologi' },
      { value: 'PKn SMA IPS', label: 'Pendidikan Kewarganegaraan' },
      { value: 'Agama Islam SMA IPS', label: 'Pendidikan Agama Islam' },
      { value: 'Agama Kristen SMA IPS', label: 'Pendidikan Agama Kristen' },
      { value: 'Agama Katolik SMA IPS', label: 'Pendidikan Agama Katolik' },
      { value: 'Agama Hindu SMA IPS', label: 'Pendidikan Agama Hindu' },
      { value: 'Agama Buddha SMA IPS', label: 'Pendidikan Agama Buddha' },
      { value: 'PJOK SMA IPS', label: 'Pendidikan Jasmani, Olahraga, dan Kesehatan' },
      { value: 'Seni Budaya SMA IPS', label: 'Seni Budaya' },
    ],
    
    'SMK Teknik & Teknologi': [
      { value: 'Teknik Mesin', label: 'Teknik Mesin' },
      { value: 'Teknik Elektro', label: 'Teknik Elektro' },
      { value: 'Teknik Elektronika', label: 'Teknik Elektronika' },
      { value: 'Teknik Informatika', label: 'Teknik Informatika' },
      { value: 'Teknik Sipil', label: 'Teknik Sipil' },
      { value: 'Teknik Otomotif', label: 'Teknik Otomotif' },
      { value: 'Teknik Komputer Jaringan', label: 'Teknik Komputer dan Jaringan' },
      { value: 'Multimedia', label: 'Multimedia' },
      { value: 'Rekayasa Perangkat Lunak', label: 'Rekayasa Perangkat Lunak' },
      { value: 'Sistem Informasi', label: 'Sistem Informasi' },
      { value: 'Teknik Audio Video', label: 'Teknik Audio Video' },
      { value: 'Animasi', label: 'Animasi' },
    ],
    
    'SMK Bisnis & Manajemen': [
      { value: 'Akuntansi', label: 'Akuntansi dan Keuangan Lembaga' },
      { value: 'Administrasi Perkantoran', label: 'Otomatisasi dan Tata Kelola Perkantoran' },
      { value: 'Pemasaran', label: 'Bisnis Daring dan Pemasaran' },
      { value: 'Perbankan Syariah', label: 'Perbankan Syariah' },
      { value: 'Manajemen Logistik', label: 'Manajemen Logistik' },
    ],
    
    'SMK Pariwisata & Perhotelan': [
      { value: 'Perhotelan', label: 'Perhotelan dan Jasa Pariwisata' },
      { value: 'Tata Boga', label: 'Kuliner' },
      { value: 'Tata Busana', label: 'Tata Busana' },
      { value: 'Tata Kecantikan', label: 'Tata Kecantikan' },
      { value: 'Seni Rupa', label: 'Seni Rupa' },
      { value: 'Desain Komunikasi Visual', label: 'Desain Komunikasi Visual' },
    ],
    
    'SMK Kesehatan': [
      { value: 'Keperawatan', label: 'Asisten Keperawatan' },
      { value: 'Farmasi', label: 'Farmasi Klinis dan Komunitas' },
      { value: 'Analis Kesehatan', label: 'Teknologi Laboratorium Medik' },
      { value: 'Gigi', label: 'Dental Asisten' },
    ],
    
    'Bahasa Asing': [
      { value: 'Bahasa Arab', label: 'Bahasa Arab' },
      { value: 'Bahasa Mandarin', label: 'Bahasa Mandarin' },
      { value: 'Bahasa Jepang', label: 'Bahasa Jepang' },
      { value: 'Bahasa Korea', label: 'Bahasa Korea' },
      { value: 'Bahasa Prancis', label: 'Bahasa Prancis' },
      { value: 'Bahasa Jerman', label: 'Bahasa Jerman' },
    ],
    
    'Universitas & Perguruan Tinggi': [
      { value: 'Kalkulus', label: 'Kalkulus' },
      { value: 'Statistika', label: 'Statistika' },
      { value: 'Fisika Dasar', label: 'Fisika Dasar' },
      { value: 'Kimia Dasar', label: 'Kimia Dasar' },
      { value: 'Biologi Molekuler', label: 'Biologi Molekuler' },
      { value: 'Ekonomi Mikro', label: 'Ekonomi Mikro' },
      { value: 'Ekonomi Makro', label: 'Ekonomi Makro' },
      { value: 'Akuntansi Dasar', label: 'Akuntansi Dasar' },
      { value: 'Manajemen', label: 'Manajemen' },
      { value: 'Hukum Perdata', label: 'Hukum Perdata' },
      { value: 'Hukum Pidana', label: 'Hukum Pidana' },
      { value: 'Psikologi Umum', label: 'Psikologi Umum' },
      { value: 'Pemrograman', label: 'Pemrograman' },
      { value: 'Basis Data', label: 'Basis Data' },
      { value: 'Jaringan Komputer', label: 'Jaringan Komputer' },
    ],
    
    'Keterampilan Khusus': [
      { value: 'Music Piano', label: 'Piano' },
      { value: 'Music Guitar', label: 'Gitar' },
      { value: 'Music Violin', label: 'Biola' },
      { value: 'Music Drum', label: 'Drum' },
      { value: 'Vocal', label: 'Vocal/Menyanyi' },
      { value: 'Melukis', label: 'Melukis' },
      { value: 'Fotografi', label: 'Fotografi' },
      { value: 'Video Editing', label: 'Video Editing' },
      { value: 'Graphic Design', label: 'Desain Grafis' },
      { value: 'Web Design', label: 'Desain Web' },
      { value: 'Digital Marketing', label: 'Digital Marketing' },
      { value: 'Public Speaking', label: 'Public Speaking' },
      { value: 'Debate', label: 'Debat' },
      { value: 'Creative Writing', label: 'Creative Writing' },
      { value: 'Robotika', label: 'Robotika' },
      { value: 'Arduino', label: 'Arduino' },
      { value: 'Game Development', label: 'Game Development' },
    ]
  },
  
  metodePengajaran: [
    { value: 'Ceramah Interaktif', label: 'Ceramah Interaktif' },
    { value: 'Diskusi Kelompok', label: 'Diskusi Kelompok' },
    { value: 'Problem Based Learning', label: 'Problem Based Learning' },
    { value: 'Project Based Learning', label: 'Project Based Learning' },
    { value: 'Pembelajaran Visual', label: 'Pembelajaran Visual' },
    { value: 'Praktikum/Eksperimen', label: 'Praktikum/Eksperimen' },
    { value: 'Games Edukasi', label: 'Games Edukasi' },
    { value: 'Storytelling', label: 'Storytelling' }
  ],
  
  jadwalTersedia: [
    { value: 'Senin Pagi', label: 'Senin Pagi (08:00-12:00)' },
    { value: 'Senin Siang', label: 'Senin Siang (13:00-17:00)' },
    { value: 'Senin Malam', label: 'Senin Malam (18:00-21:00)' },
    { value: 'Selasa Pagi', label: 'Selasa Pagi (08:00-12:00)' },
    { value: 'Selasa Siang', label: 'Selasa Siang (13:00-17:00)' },
    { value: 'Selasa Malam', label: 'Selasa Malam (18:00-21:00)' },
    { value: 'Rabu Pagi', label: 'Rabu Pagi (08:00-12:00)' },
    { value: 'Rabu Siang', label: 'Rabu Siang (13:00-17:00)' },
    { value: 'Rabu Malam', label: 'Rabu Malam (18:00-21:00)' },
    { value: 'Kamis Pagi', label: 'Kamis Pagi (08:00-12:00)' },
    { value: 'Kamis Siang', label: 'Kamis Siang (13:00-17:00)' },
    { value: 'Kamis Malam', label: 'Kamis Malam (18:00-21:00)' },
    { value: 'Jumat Pagi', label: 'Jumat Pagi (08:00-12:00)' },
    { value: 'Jumat Siang', label: 'Jumat Siang (13:00-17:00)' },
    { value: 'Jumat Malam', label: 'Jumat Malam (18:00-21:00)' },
    { value: 'Sabtu Pagi', label: 'Sabtu Pagi (08:00-12:00)' },
    { value: 'Sabtu Siang', label: 'Sabtu Siang (13:00-17:00)' },
    { value: 'Sabtu Malam', label: 'Sabtu Malam (18:00-21:00)' },
    { value: 'Minggu Pagi', label: 'Minggu Pagi (08:00-12:00)' },
    { value: 'Minggu Siang', label: 'Minggu Siang (13:00-17:00)' },
    { value: 'Minggu Malam', label: 'Minggu Malam (18:00-21:00)' }
  ]
};

// ===== AI RECOMMENDATION SYSTEM DATA =====

// Core Subject Profiles - Curated list for initial selection
export const coreSubjectProfiles: CoreSubjectProfile[] = [
  // MATEMATIKA & SAINS
  {
    value: 'Matematika SMA',
    label: '🔢 Matematika SMA',
    category: 'Matematika & Sains',
    level: 'SMA',
    relatedSubjects: []
  },
  {
    value: 'Fisika',
    label: '⚡ Fisika',
    category: 'Matematika & Sains',
    level: 'SMA',
    relatedSubjects: []
  },
  {
    value: 'Kimia',
    label: '⚗️ Kimia',
    category: 'Matematika & Sains',
    level: 'SMA',
    relatedSubjects: []
  },
  {
    value: 'Biologi',
    label: '🧬 Biologi',
    category: 'Matematika & Sains',
    level: 'SMA',
    relatedSubjects: []
  },

  // BAHASA
  {
    value: 'Bahasa Inggris SMA',
    label: '🇬🇧 Bahasa Inggris',
    category: 'Bahasa',
    level: 'SMA',
    relatedSubjects: []
  },
  {
    value: 'Bahasa Indonesia SMA',
    label: '🇮🇩 Bahasa Indonesia',
    category: 'Bahasa',
    level: 'SMA',
    relatedSubjects: []
  },

  // SOSIAL
  {
    value: 'Ekonomi',
    label: '💰 Ekonomi',
    category: 'Ilmu Sosial',
    level: 'SMA',
    relatedSubjects: []
  },
  {
    value: 'Sejarah SMA',
    label: '📚 Sejarah',
    category: 'Ilmu Sosial',
    level: 'SMA',
    relatedSubjects: []
  },
  {
    value: 'Geografi SMA',
    label: '🗺️ Geografi',
    category: 'Ilmu Sosial',
    level: 'SMA',
    relatedSubjects: []
  },

  // TEKNIK & TEKNOLOGI
  {
    value: 'Teknik Informatika',
    label: '💻 Teknik Informatika',
    category: 'Teknik & Teknologi',
    level: 'SMK',
    relatedSubjects: []
  },
  {
    value: 'Pemrograman',
    label: '👨‍💻 Pemrograman',
    category: 'Teknik & Teknologi',
    level: 'Universitas',
    relatedSubjects: []
  },

  // KETERAMPILAN
  {
    value: 'Music Guitar',
    label: '🎸 Gitar',
    category: 'Keterampilan Kreatif',
    level: 'Skill',
    relatedSubjects: []
  },
  {
    value: 'Music Piano',
    label: '🎹 Piano',
    category: 'Keterampilan Kreatif',
    level: 'Skill',
    relatedSubjects: []
  },
  {
    value: 'Graphic Design',
    label: '🎨 Desain Grafis',
    category: 'Keterampilan Kreatif',
    level: 'Skill',
    relatedSubjects: []
  },

  // BISNIS & AKUNTANSI
  {
    value: 'Akuntansi',
    label: '📊 Akuntansi',
    category: 'Bisnis & Ekonomi',
    level: 'SMK',
    relatedSubjects: []
  },
  {
    value: 'Manajemen',
    label: '📈 Manajemen',
    category: 'Bisnis & Ekonomi',
    level: 'Universitas',
    relatedSubjects: []
  }
];

// Subject Correlation Matrix - AI Brain
export const subjectCorrelationMatrix: Record<string, SubjectCorrelation[]> = {
  // MATEMATIKA CORRELATIONS
  'Matematika SMA': [
    {
      subject: 'Fisika',
      correlation: 0.92,
      reason: 'Heavy mathematical foundation required',
      category: 'SMA/SMK IPA',
      difficulty: 'medium',
      preparationTime: '1-2 minggu',
      marketDemand: 'high'
    },
    {
      subject: 'Matematika SMP',
      correlation: 0.95,
      reason: 'Progressive curriculum, same core concepts',
      category: 'SMP (Kelas 7-9)',
      difficulty: 'easy',
      preparationTime: '3-5 hari',
      marketDemand: 'high'
    },
    {
      subject: 'Kalkulus',
      correlation: 0.88,
      reason: 'Advanced mathematics progression',
      category: 'Universitas & Perguruan Tinggi',
      difficulty: 'medium',
      preparationTime: '2-3 minggu',
      marketDemand: 'medium'
    },
    {
      subject: 'Kimia',
      correlation: 0.75,
      reason: 'Calculation and formula-based problems',
      category: 'SMA/SMK IPA',
      difficulty: 'medium',
      preparationTime: '2-3 minggu',
      marketDemand: 'high'
    }
  ],

  // FISIKA CORRELATIONS
  'Fisika': [
    {
      subject: 'Matematika SMA',
      correlation: 0.92,
      reason: 'Physics requires strong math foundation',
      category: 'SMA/SMK IPA',
      difficulty: 'easy',
      preparationTime: '1 minggu',
      marketDemand: 'high'
    },
    {
      subject: 'Kimia',
      correlation: 0.80,
      reason: 'Shared scientific methodology and calculations',
      category: 'SMA/SMK IPA',
      difficulty: 'medium',
      preparationTime: '2-3 minggu',
      marketDemand: 'high'
    },
    {
      subject: 'Teknik Elektro',
      correlation: 0.85,
      reason: 'Applied physics principles',
      category: 'SMK Teknik & Teknologi',
      difficulty: 'medium',
      preparationTime: '3-4 minggu',
      marketDemand: 'medium'
    }
  ],

  // GITAR CORRELATIONS
  'Music Guitar': [
    {
      subject: 'Music Piano',
      correlation: 0.90,
      reason: 'Music theory and chord progressions overlap',
      category: 'Keterampilan Khusus',
      difficulty: 'medium',
      preparationTime: '2-3 minggu',
      marketDemand: 'high'
    },
    {
      subject: 'Vocal',
      correlation: 0.75,
      reason: 'Musical accompaniment and performance skills',
      category: 'Keterampilan Khusus',
      difficulty: 'easy',
      preparationTime: '1-2 minggu',
      marketDemand: 'high'
    },
    {
      subject: 'Music Violin',
      correlation: 0.70,
      reason: 'String instrument techniques and music theory',
      category: 'Keterampilan Khusus',
      difficulty: 'hard',
      preparationTime: '2-3 bulan',
      marketDemand: 'low'
    }
  ],

  // BAHASA INGGRIS CORRELATIONS
  'Bahasa Inggris SMA': [
    {
      subject: 'Bahasa Inggris SMP',
      correlation: 0.95,
      reason: 'Same language, progressive difficulty',
      category: 'SMP (Kelas 7-9)',
      difficulty: 'easy',
      preparationTime: '3-5 hari',
      marketDemand: 'high'
    },
    {
      subject: 'Bahasa Inggris SD',
      correlation: 0.90,
      reason: 'Basic English foundation teaching',
      category: 'SD (Kelas 1-6)',
      difficulty: 'easy',
      preparationTime: '1 minggu',
      marketDemand: 'high'
    },
    {
      subject: 'Public Speaking',
      correlation: 0.80,
      reason: 'Communication and presentation skills',
      category: 'Keterampilan Khusus',
      difficulty: 'medium',
      preparationTime: '2-3 minggu',
      marketDemand: 'medium'
    }
  ],

  // PROGRAMMING CORRELATIONS
  'Pemrograman': [
    {
      subject: 'Teknik Informatika',
      correlation: 0.95,
      reason: 'Programming is core part of computer science',
      category: 'SMK Teknik & Teknologi',
      difficulty: 'easy',
      preparationTime: '1 minggu',
      marketDemand: 'high'
    },
    {
      subject: 'Web Design',
      correlation: 0.85,
      reason: 'Frontend development overlap',
      category: 'Keterampilan Khusus',
      difficulty: 'medium',
      preparationTime: '2-3 minggu',
      marketDemand: 'high'
    },
    {
      subject: 'Basis Data',
      correlation: 0.90,
      reason: 'Database programming and management',
      category: 'Universitas & Perguruan Tinggi',
      difficulty: 'medium',
      preparationTime: '2-3 minggu',
      marketDemand: 'high'
    }
  ]
};

// AI Recommendation Engine
export const aiRecommendationEngine: AIRecommendationEngine = {
  generateRecommendations: (coreSubjects: string[], tutorProfile?: Partial<TutorFormData>): AIRecommendationTier[] => {
    const allRecommendations: SubjectCorrelation[] = [];
    
    // Generate recommendations from each core subject
    coreSubjects.forEach(coreSubject => {
      const correlations = subjectCorrelationMatrix[coreSubject] || [];
      allRecommendations.push(...correlations);
    });

    // Remove duplicates and sort by correlation
    const uniqueRecommendations = allRecommendations.reduce((acc, current) => {
      const existing = acc.find(item => item.subject === current.subject);
      if (!existing || existing.correlation < current.correlation) {
        return acc.filter(item => item.subject !== current.subject).concat(current);
      }
      return acc;
    }, [] as SubjectCorrelation[]);

    // Sort by correlation score
    uniqueRecommendations.sort((a, b) => b.correlation - a.correlation);

    // Group into tiers
    const tier1 = uniqueRecommendations.filter(r => r.correlation >= 0.85);
    const tier2 = uniqueRecommendations.filter(r => r.correlation >= 0.70 && r.correlation < 0.85);
    const tier3 = uniqueRecommendations.filter(r => r.correlation >= 0.50 && r.correlation < 0.70);

    return [
      {
        tier: 1,
        title: '🥇 MULAI HARI INI',
        description: 'Anda sudah siap mengajar mata pelajaran ini',
        icon: 'ph:rocket',
        color: 'success',
        subjects: tier1.slice(0, 6)
      },
      {
        tier: 2,
        title: '🥈 PERSIAPAN 1-3 MINGGU',
        description: 'Dengan sedikit persiapan, Anda bisa menguasai ini',
        icon: 'ph:clock',
        color: 'warning',
        subjects: tier2.slice(0, 8)
      },
      {
        tier: 3,
        title: '🥉 EKSPANSI STRATEGIS',
        description: 'Target jangka menengah untuk diversifikasi',
        icon: 'ph:target',
        color: 'info',
        subjects: tier3.slice(0, 10)
      }
    ];
  },

  getSubjectCorrelations: (subject: string): SubjectCorrelation[] => {
    return subjectCorrelationMatrix[subject] || [];
  },

  calculateConfidence: (coreSubjects: string[], targetSubject: string): number => {
    let maxConfidence = 0;
    
    coreSubjects.forEach(coreSubject => {
      const correlations = subjectCorrelationMatrix[coreSubject] || [];
      const targetCorrelation = correlations.find(c => c.subject === targetSubject);
      if (targetCorrelation && targetCorrelation.correlation > maxConfidence) {
        maxConfidence = targetCorrelation.correlation;
      }
    });
    
    return maxConfidence;
  }
};

// Form Configuration
export const tutorFormConfig: FormConfig = {
  title: 'Entry Data Tutor Baru',
  description: 'Input data tutor untuk registrasi ke sistem EduPrima',
  submitText: 'Simpan Data Tutor',
  cancelText: 'Batal',
  backText: 'Kembali',
  nextText: 'Lanjut',
  
  steps: [
    {
      id: 'identity-basic',
      title: 'Identitas Dasar',
      description: 'Data pribadi, alamat, dan informasi perbankan',
      icon: 'ph:user-circle',
      color: 'primary',
      fields: [
        // === STATUS & KONTROL ===
        {
          name: 'section_status',
          label: 'STATUS & KONTROL SISTEM',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:gear-six'
        },
        {
          name: 'status_tutor',
          label: 'Status Tutor',
          type: 'select',
          placeholder: 'Pilih status...',
          options: [
            // Recruitment Flow Stages
            { value: 'registration', label: '📝 Registrasi - Upload berkas & data' },
            { value: 'learning_materials', label: '📚 Belajar Materi & SOP' },
            { value: 'examination', label: '📋 Ujian Tutor Online' },
            { value: 'exam_verification', label: '🔍 Verifikasi Hasil Ujian' },
            { value: 'data_completion', label: '📄 Melengkapi Data Tutor' },
            { value: 'waiting_students', label: '⏳ Menunggu Siswa Pertama' },
            
            // Active Status
            { value: 'active', label: '✅ Aktif - Mengajar' },
            
            // Management Status  
            { value: 'inactive', label: '⏸️ Tidak Aktif' },
            { value: 'suspended', label: '🚫 Ditangguhkan' },
            { value: 'blacklisted', label: '❌ Blacklist' },
            
            // Special Status
            { value: 'on_trial', label: '🧪 Masa Percobaan' },
            { value: 'additional_screening', label: '🔬 Additional Screening' }
          ],
          helperText: 'Status tutor dalam sistem.',
          icon: 'ph:shield-check',
          size: 'lg'
        },
        {
          name: 'approval_level',
          label: 'Level Approval',
          type: 'select',
          placeholder: 'Pilih level...',
          options: [
            { value: 'junior', label: 'Junior Tutor' },
            { value: 'senior', label: 'Senior Tutor' },
            { value: 'expert', label: 'Expert Tutor' },
            { value: 'master', label: 'Master Tutor' }
          ],
          helperText: 'Level kemampuan tutor.',
          icon: 'ph:star',
          size: 'lg'
        },
        {
          name: 'staff_notes',
          label: 'Catatan Staff',
          type: 'textarea',
          placeholder: 'Catatan internal untuk tutor ini...',
          rows: 2,
          helperText: 'Catatan internal staff (tidak terlihat oleh tutor).',
          icon: 'ph:note',
          size: 'lg'
        },
        {
          name: 'additionalScreening',
          label: 'Additional Screening Checklist',
          type: 'checkbox',
          multiple: true,
          options: [
            { value: 'psikotes', label: '🧠 Tes Psikotes' },
            { value: 'sharing_session', label: '💬 Sharing Session dengan Staff' },
            { value: 'background_check', label: '🔍 Background Check' },
            { value: 'teaching_demo', label: '🎭 Teaching Demo/Mock Session' },
            { value: 'reference_check', label: '📞 Reference Check' },
            { value: 'continuous_assessment', label: '📊 Continuous Assessment' }
          ],
          helperText: 'Checklist tambahan untuk memperkuat profil tutor.',
          icon: 'ph:checklist',
          size: 'lg'
        },

        // === IDENTITAS PROFIL ===
        {
          name: 'section_identitas',
          label: 'IDENTITAS PROFIL',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:user-circle'
        },
        {
          name: 'fotoProfil',
          label: 'Foto Profil',
          type: 'file',
          accept: 'image/*',
          helperText: 'Unggah foto diri tutor. Format JPG, PNG maksimal 2MB.',
          icon: 'ph:camera',
          size: 'lg',
          className: 'full-width-field'
        },
        {
          name: 'trn',
          label: 'TRN (Tutor Registration Number)',
          type: 'text',
          placeholder: 'Otomatis generate atau input manual: WRS2913293',
          helperText: 'Akan di-generate otomatis jika kosong. Format: 3 huruf + 7 angka.',
          icon: 'ph:identification-card',
          size: 'lg'
        },
        {
          name: 'namaLengkap',
          label: 'Nama Lengkap',
          type: 'text',
          placeholder: 'Masukkan nama lengkap sesuai KTP',
          icon: 'ph:user',
          size: 'lg'
        },
        {
          name: 'namaPanggilan',
          label: 'Nama Panggilan',
          type: 'text',
          placeholder: 'Nama panggilan atau nama yang biasa digunakan',
          icon: 'ph:smiley',
          size: 'lg',
          helperText: 'Nama yang akan ditampilkan kepada siswa dan orang tua.'
        },
        {
          name: 'tanggalLahir',
          label: 'Tanggal Lahir',
          type: 'date',
          icon: 'ph:calendar',
          size: 'lg'
        },
        {
          name: 'jenisKelamin',
          label: 'Jenis Kelamin',
          type: 'select',
          placeholder: 'Pilih jenis kelamin...',
          options: dynamicOptions.jenisKelamin,
          icon: 'ph:gender-intersex',
          size: 'lg'
        },
        {
          name: 'agama',
          label: 'Agama',
          type: 'select',
          placeholder: 'Pilih agama...',
          options: dynamicOptions.agama,
          icon: 'ph:mosque',
          size: 'lg',
          helperText: 'Pilihan agama untuk keperluan demografi pengguna.'
        },
        {
          name: 'email',
          label: 'Email Aktif',
          type: 'email',
          placeholder: 'nama@gmail.com',
          helperText: '(Wajib Gmail / Google)',
          icon: 'ph:envelope',
          size: 'lg'
        },
        {
          name: 'noHp1',
          label: 'No. HP (WhatsApp)',
          type: 'tel_split',
          placeholder: '811234567890',
          helperText: 'Nomor WhatsApp aktif untuk komunikasi utama. Kode Area + Ekstensi. jangan pakai spasi/strip/tanda minus, dan Jangan mulai dengan 0. Contoh BENAR: 811234567890',
          icon: 'ph:phone',
          size: 'lg'
        },
        {
          name: 'noHp2',
          label: 'No. HP Alternatif (Opsional)',
          type: 'tel_split',
          placeholder: '811234567890',
          helperText: 'Nomor alternatif untuk kontak darurat. Kode Area + Ekstensi. jangan pakai spasi/strip/tanda minus, dan Jangan mulai dengan 0. Contoh BENAR: 811234567890',
          icon: 'ph:phone-plus',
          size: 'lg'
        },

        // === PROFIL & VALUE PROPOSITION ===
        {
          name: 'section_profil_value',
          label: 'PROFIL & VALUE PROPOSITION',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:star'
        },
        {
          name: 'headline',
          label: 'Headline/Tagline Tutor',
          type: 'text',
          placeholder: 'Guru Matematika Berpengalaman | Spesialis UTBK & OSN | Metode Fun Learning',
          helperText: 'Value proposition singkat yang menarik perhatian siswa dan orang tua. Maksimal 100 karakter.',
          icon: 'ph:megaphone',
          size: 'lg'
        },
        {
          name: 'deskripsiDiri',
          label: 'Deskripsi Diri/Bio Tutor',
          type: 'textarea',
          placeholder: 'Saya lulusan Matematika UI dengan pengalaman 5 tahun mengajar. Sudah membimbing 200+ siswa masuk PTN favorit. Menggunakan metode visual dan games untuk membuat matematika jadi menyenangkan. Siswa saya rata-rata naik 30 poin dalam 3 bulan.',
          rows: 4,
          helperText: 'Ceritakan pengalaman, metode unik, atau pencapaian yang membuat Anda berbeda dari tutor lain.',
          icon: 'ph:user-circle-plus',
          size: 'lg'
        },
        {
          name: 'motivasiMenjadiTutor',
          label: 'Motivasi Menjadi Tutor',
          type: 'textarea',
          required: true,
          rows: 6,
          placeholder: 'Ceritakan mengapa Anda tertarik mengajar serta visi Anda sebagai seorang pendidik...',
          helperText: 'Ceritakan mengapa Anda tertarik mengajar serta visi Anda sebagai seorang pendidik. Jawaban Anda akan menjadi bagian penting di halaman profil publik Anda untuk menunjukkan passion Anda. (Disarankan 300-1500 karakter).',
          icon: 'ph:heart',
          size: 'lg'
        },
        {
          name: 'socialMedia1',
          label: 'Link Media Sosial 1 (Opsional)',
          type: 'text',
          placeholder: 'https://www.instagram.com/username atau https://www.linkedin.com/in/username',
          helperText: 'Link Instagram, LinkedIn, atau media sosial profesional lainnya untuk menambah kredibilitas.',
          icon: 'ph:link',
          size: 'lg'
        },
        {
          name: 'socialMedia2',
          label: 'Link Media Sosial 2 (Opsional)',
          type: 'text',
          placeholder: 'https://www.youtube.com/channel/xxx atau https://www.tiktok.com/@username',
          helperText: 'Link media sosial kedua (YouTube, TikTok, Facebook, dll) untuk menunjukkan aktivitas mengajar online.',
          icon: 'ph:link',
          size: 'lg'
        },


        // === ALAMAT DOMISILI SAAT INI ===
        {
          name: 'section_alamat_domisili',
          label: 'ALAMAT DOMISILI (TEMPAT TINGGAL SAAT INI)',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:house'
        },
        {
          name: 'provinsiDomisili',
          label: 'Provinsi',
          type: 'select',
          placeholder: 'Pilih provinsi...',
          apiEndpoint: '/api/locations/provinces',
          icon: 'ph:map-trifold',
          size: 'lg',
          required: true,
          helperText: 'Pilih provinsi terlebih dahulu untuk memuat daftar kota.'
        },
        {
          name: 'kotaKabupatenDomisili',
          label: 'Kota/Kabupaten',
          type: 'select',
          placeholder: 'Pilih kota/kabupaten...',
          apiEndpoint: '/api/locations/cities',
          dependsOn: 'provinsiDomisili',
          icon: 'ph:city',
          size: 'lg',
          required: true,
          helperText: 'Pilih kota/kabupaten setelah memilih provinsi.'
        },
        {
          name: 'kecamatanDomisili',
          label: 'Kecamatan',
          type: 'text',
          placeholder: 'Nama kecamatan',
          icon: 'ph:buildings',
          size: 'lg',
          required: true,
          helperText: 'Masukkan nama kecamatan secara manual.'
        },
        {
          name: 'kelurahanDomisili',
          label: 'Kelurahan/Desa',
          type: 'text',
          placeholder: 'Nama kelurahan atau desa',
          icon: 'ph:buildings',
          size: 'lg',
          required: true,
          helperText: 'Masukkan nama kelurahan atau desa secara manual.'
        },
        {
          name: 'alamatLengkapDomisili',
          label: 'Alamat Lengkap/Nama Jalan',
          type: 'textarea',
          placeholder: 'Masukkan alamat lengkap (Jalan, RT/RW, Komplek, Nomor Rumah, dll)',
          rows: 3,
          icon: 'ph:house',
          size: 'lg',
          required: true,
          helperText: 'Alamat detail termasuk nama jalan, RT/RW, komplek, nomor rumah.'
        },
        {
          name: 'kodePosDomisili',
          label: 'Kode Pos',
          type: 'text',
          placeholder: '12345',
          helperText: 'Kode pos wilayah tempat tinggal.',
          icon: 'ph:envelope',
          size: 'lg'
        },
        
        // === CHECKBOX ALAMAT SAMA ===
        {
          name: 'alamatSamaDenganKTP',
          label: 'Alamat domisili saya sama dengan alamat di KTP/KK',
          type: 'checkbox',
          helperText: 'Centang jika alamat domisili sama dengan alamat di KTP/KK untuk mengisi otomatis.',
          icon: 'ph:check-square'
        },
        
        // === ALAMAT SESUAI KTP/KK ===
        {
          name: 'section_alamat_ktp',
          label: 'ALAMAT SESUAI KTP/KK (OPSIONAL)',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:identification-card'
        },
        {
          name: 'provinsiKTP',
          label: 'Provinsi KTP/KK',
          type: 'select',
          placeholder: 'Pilih provinsi...',
          apiEndpoint: '/api/locations/provinces',
          icon: 'ph:map-trifold',
          size: 'lg',
          conditional: (data) => !data.alamatSamaDenganKTP,
          helperText: 'Pilih provinsi sesuai KTP/KK.'
        },
        {
          name: 'kotaKabupatenKTP',
          label: 'Kota/Kabupaten KTP/KK',
          type: 'select',
          placeholder: 'Pilih kota/kabupaten...',
          apiEndpoint: '/api/locations/cities',
          dependsOn: 'provinsiKTP',
          icon: 'ph:city',
          size: 'lg',
          conditional: (data) => !data.alamatSamaDenganKTP,
          helperText: 'Pilih kota/kabupaten sesuai KTP/KK.'
        },
        {
          name: 'kecamatanKTP',
          label: 'Kecamatan KTP/KK',
          type: 'text',
          placeholder: 'Nama kecamatan sesuai KTP/KK',
          icon: 'ph:buildings',
          size: 'lg',
          conditional: (data) => !data.alamatSamaDenganKTP,
          helperText: 'Masukkan nama kecamatan sesuai KTP/KK.'
        },
        {
          name: 'kelurahanKTP',
          label: 'Kelurahan/Desa KTP/KK',
          type: 'text',
          placeholder: 'Nama kelurahan atau desa sesuai KTP/KK',
          icon: 'ph:buildings',
          size: 'lg',
          conditional: (data) => !data.alamatSamaDenganKTP,
          helperText: 'Masukkan nama kelurahan/desa sesuai KTP/KK.'
        },
        {
          name: 'alamatLengkapKTP',
          label: 'Alamat Lengkap/Nama Jalan KTP/KK',
          type: 'textarea',
          placeholder: 'Masukkan alamat lengkap sesuai KTP/KK (Jalan, RT/RW, Komplek, Nomor, dll)',
          rows: 3,
          icon: 'ph:identification-card',
          size: 'lg',
          conditional: (data) => !data.alamatSamaDenganKTP,
          helperText: 'Alamat detail sesuai KTP/KK termasuk nama jalan, RT/RW, komplek.'
        },
        {
          name: 'kodePosKTP',
          label: 'Kode Pos KTP/KK',
          type: 'text',
          placeholder: '12345',
          helperText: 'Kode pos wilayah sesuai KTP/KK.',
          icon: 'ph:envelope',
          size: 'lg',
          conditional: (data) => !data.alamatSamaDenganKTP
        },

        // === INFORMASI BANK ===
        {
          name: 'section_bank',
          label: 'INFORMASI PERBANKAN',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:bank'
        },
        {
          name: 'namaNasabah',
          label: 'Nama Pemilik Rekening',
          type: 'text',
          placeholder: 'Nama sesuai buku tabungan/kartu ATM',
          helperText: 'Harus sesuai dengan nama di rekening bank.',
          icon: 'ph:user-circle',
          size: 'lg'
        },
        {
          name: 'nomorRekening',
          label: 'Nomor Rekening',
          type: 'text',
          placeholder: '1234567890123',
          helperText: 'Nomor rekening tanpa spasi atau strip. Contoh: 1234567890123',
          icon: 'ph:credit-card',
          size: 'lg'
        },
        {
          name: 'namaBank',
          label: 'Nama Bank',
          type: 'select',
          placeholder: 'Pilih bank...',
          apiEndpoint: '/api/banks/indonesia',
          icon: 'ph:bank',
          size: 'lg',
          required: true,
          helperText: 'Selain BNI, BRI, Mandiri, dan BCA dikenakan biaya transfer antar bank.'
        }
      ]
    },
    
    {
      id: 'education-experience',
      title: 'Pendidikan & Pengalaman',
      description: 'Latar belakang pendidikan, pengalaman, dan profil mengajar',
      icon: 'ph:graduation-cap',
      color: 'warning',
      fields: [
        // === RIWAYAT PENDIDIKAN ===
        {
          name: 'section_pendidikan',
          label: 'A. RIWAYAT PENDIDIKAN',
          type: 'text',
          disabled: true,
          helperText: 'Informasi ini akan kami verifikasi dengan dokumen yang Anda unggah.',
          className: 'section-divider',
          icon: 'ph:graduation-cap'
        },
        {
          name: 'statusAkademik',
          label: 'Status Akademik Saat Ini',
          type: 'select',
          required: true,
          placeholder: 'Pilih status Anda yang paling sesuai saat ini...',
          options: [
            { value: 'mahasiswa_s1', label: 'Mahasiswa Aktif S1/D4' },
            { value: 'mahasiswa_s2', label: 'Mahasiswa Aktif S2/S3' },
            { value: 'lulusan_s1', label: 'Lulusan S1/D4' },
            { value: 'lulusan_s2', label: 'Lulusan S2/S3' },
            { value: 'lulusan_d3', label: 'Lulusan D3' },
            { value: 'lulusan_sma', label: 'Lulusan SMA/Sederajat' },
            { value: 'lainnya', label: 'Lainnya' }
          ],
          helperText: 'Pilih status Anda yang paling sesuai saat ini.',
          icon: 'ph:user-circle',
          size: 'lg'
        },
        {
          name: 'section_pendidikan_tinggi',
          label: 'PENDIDIKAN TINGGI',
          type: 'text',
          disabled: true,
          helperText: '(Bagian di bawah ini akan muncul jika status yang dipilih adalah Mahasiswa atau Lulusan Perguruan Tinggi)',
          className: 'section-divider',
          icon: 'ph:building',
          conditional: (data) => ['mahasiswa_s1', 'mahasiswa_s2', 'lulusan_s1', 'lulusan_s2', 'lulusan_d3'].includes(data.statusAkademik)
        },
        {
          name: 'namaUniversitasS1',
          label: 'Nama Universitas / Institusi S1',
          type: 'text',
          required: true,
          placeholder: 'Contoh: Universitas Gadjah Mada',
          helperText: 'Nama lengkap universitas atau institusi S1 sebelumnya.',
          conditional: (data) => ['mahasiswa_s2', 'lulusan_s2'].includes(data.statusAkademik),
          icon: 'ph:building',
          size: 'lg'
        },
        {
          name: 'fakultasS1',
          label: 'Fakultas S1',
          type: 'text',
          placeholder: 'Contoh: Fakultas Teknik',
          helperText: 'Nama fakultas S1 (opsional).',
          conditional: (data) => ['mahasiswa_s2', 'lulusan_s2'].includes(data.statusAkademik),
          icon: 'ph:buildings',
          size: 'lg'
        },
        {
          name: 'jurusanS1',
          label: 'Jurusan / Program Studi S1',
          type: 'text',
          required: true,
          placeholder: 'Contoh: Teknik Informatika',
          helperText: 'Nama jurusan atau program studi S1.',
          conditional: (data) => ['mahasiswa_s2', 'lulusan_s2'].includes(data.statusAkademik),
          icon: 'ph:books',
          size: 'lg'
        },
        {
          name: 'namaUniversitas',
          label: 'Nama Universitas / Institusi',
          type: 'text',
          required: true,
          placeholder: 'Contoh: Universitas Gadjah Mada',
          helperText: 'Nama lengkap universitas atau institusi pendidikan tinggi terakhir.',
          conditional: (data) => ['mahasiswa_s1', 'mahasiswa_s2', 'lulusan_s1', 'lulusan_s2', 'lulusan_d3'].includes(data.statusAkademik),
          icon: 'ph:building',
          size: 'lg'
        },
        {
          name: 'fakultas',
          label: 'Fakultas',
          type: 'text',
          placeholder: 'Contoh: Fakultas Teknik',
          helperText: 'Nama fakultas (opsional).',
          conditional: (data) => ['mahasiswa_s1', 'mahasiswa_s2', 'lulusan_s1', 'lulusan_s2', 'lulusan_d3'].includes(data.statusAkademik),
          icon: 'ph:buildings',
          size: 'lg'
        },
        {
          name: 'jurusan',
          label: 'Jurusan / Program Studi',
          type: 'text',
          required: true,
          placeholder: 'Contoh: Teknik Informatika',
          helperText: 'Nama jurusan atau program studi yang diambil.',
          conditional: (data) => ['mahasiswa_s1', 'mahasiswa_s2', 'lulusan_s1', 'lulusan_s2', 'lulusan_d3'].includes(data.statusAkademik),
          icon: 'ph:books',
          size: 'lg'
        },

        {
          name: 'ipk',
          label: 'IPK Terakhir',
          type: 'text',
          required: true,
          placeholder: '3.76',
          helperText: 'WAJIB gunakan titik (.) sebagai pemisah desimal. Format boleh: 4, 3.76, 2.7, atau 3.766 (BUKAN 3,75)',
          conditional: (data) => ['mahasiswa_s1', 'mahasiswa_s2', 'lulusan_s1', 'lulusan_s2', 'lulusan_d3'].includes(data.statusAkademik),
          icon: 'ph:trophy',
          size: 'lg',
          inputProps: {
            onInput: (e: any) => {
              // Replace comma with dot automatically
              let value = e.target.value.replace(',', '.');
              // Only allow numbers and single dot
              value = value.replace(/[^0-9.]/g, '');
              // Prevent multiple dots
              const dots = value.split('.').length - 1;
              if (dots > 1) {
                value = value.substring(0, value.lastIndexOf('.'));
              }
              e.target.value = value;
            }
          }
        },
        {
          name: 'section_periode_studi',
          label: 'PERIODE STUDI',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:calendar',
          conditional: (data) => ['mahasiswa_s1', 'mahasiswa_s2', 'lulusan_s1', 'lulusan_s2', 'lulusan_d3'].includes(data.statusAkademik)
        },
        {
          name: 'tahunMasuk',
          label: 'Tahun Masuk',
          type: 'select',
          required: true,
          placeholder: 'Pilih tahun masuk...',
          options: generateYearOptions(1990, new Date().getFullYear()),
          helperText: 'Tahun mulai kuliah.',
          conditional: (data) => ['mahasiswa_s1', 'mahasiswa_s2', 'lulusan_s1', 'lulusan_s2', 'lulusan_d3'].includes(data.statusAkademik),
          icon: 'ph:calendar',
          size: 'lg'
        },
        {
          name: 'tahunLulus',
          label: 'Tahun Lulus',
          type: 'select',
          placeholder: 'Pilih tahun lulus...',
          options: generateYearOptions(1990, new Date().getFullYear() + 5),
          helperText: 'Kosongkan jika Anda masih mahasiswa aktif.',
          conditional: (data) => ['lulusan_s1', 'lulusan_s2', 'lulusan_d3'].includes(data.statusAkademik),
          icon: 'ph:calendar-check',
          size: 'lg'
        },
        {
          name: 'transkripNilai',
          label: 'Transkrip Nilai Terakhir',
          type: 'file',
          required: true,
          accept: 'image/*,.pdf',
          helperText: 'Unggah transkrip nilai terakhir Anda. Format: PDF, JPG, PNG. Maksimal 5MB.',
          conditional: (data) => ['mahasiswa_s1', 'mahasiswa_s2', 'lulusan_s1', 'lulusan_s2', 'lulusan_d3'].includes(data.statusAkademik),
          icon: 'ph:file-text',
          size: 'lg'
        },
        {
          name: 'section_pendidikan_menengah',
          label: 'PENDIDIKAN MENENGAH ATAS',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:school',
          conditional: (data) => data.statusAkademik && data.statusAkademik !== 'lainnya'
        },
        {
          name: 'namaSMA',
          label: 'Nama SMA / SMK / Sederajat',
          type: 'text',
          required: true,
          placeholder: 'Contoh: SMAN 8 Yogyakarta',
          helperText: 'Nama lengkap sekolah menengah atas.',
          conditional: (data) => data.statusAkademik && data.statusAkademik !== 'lainnya',
          icon: 'ph:school',
          size: 'lg'
        },
        {
          name: 'jurusanSMA',
          label: 'Jurusan',
          type: 'select',
          required: true,
          placeholder: 'Pilih jurusan yang diambil...',
          options: [
            { value: 'IPA', label: 'IPA' },
            { value: 'IPS', label: 'IPS' },
            { value: 'Bahasa', label: 'Bahasa' },
            { value: 'SMK', label: 'SMK, sebutkan jurusan' }
          ],
          helperText: 'Pilih jurusan yang diambil.',
          conditional: (data) => data.statusAkademik && data.statusAkademik !== 'lainnya',
          icon: 'ph:book-open',
          size: 'lg'
        },
        {
          name: 'jurusanSMKDetail',
          label: 'Jurusan SMK',
          type: 'text',
          required: true,
          placeholder: 'Contoh: Teknik Komputer dan Jaringan',
          helperText: 'Sebutkan jurusan SMK yang diambil.',
          conditional: (data) => data.statusAkademik && data.statusAkademik !== 'lainnya' && data.jurusanSMA === 'SMK',
          icon: 'ph:gear',
          size: 'lg'
        },
        {
          name: 'tahunLulusSMA',
          label: 'Tahun Lulus',
          type: 'select',
          required: true,
          placeholder: 'Pilih tahun lulus...',
          options: generateYearOptions(1990, new Date().getFullYear()),
          helperText: 'Tahun lulus dari SMA/SMK.',
          conditional: (data) => data.statusAkademik && data.statusAkademik !== 'lainnya',
          icon: 'ph:calendar-check',
          size: 'lg'
        },


        // === LATAR BELAKANG LAINNYA ===
        {
          name: 'section_latar_belakang_lainnya',
          label: 'LATAR BELAKANG PEMBELAJARAN',
          type: 'text',
          disabled: true,
          helperText: 'Kami menghargai semua bentuk pembelajaran, baik formal maupun non-formal.',
          className: 'section-divider',
          icon: 'ph:lightbulb',
          conditional: (data) => data.statusAkademik === 'lainnya'
        },
        {
          name: 'namaInstitusi',
          label: 'Nama Lembaga / Institusi',
          type: 'text',
          required: true,
          placeholder: 'Contoh: Kursus Online, Bootcamp, Self-Learning, dll.',
          helperText: 'Tuliskan nama institusi terakhir Anda belajar atau sumber pembelajaran utama.',
          conditional: (data) => data.statusAkademik === 'lainnya',
          icon: 'ph:graduation-cap',
          size: 'lg'
        },
        {
          name: 'bidangKeahlian',
          label: 'Bidang Keahlian / Spesialisasi',
          type: 'text',
          required: true,
          placeholder: 'Contoh: Web Development, Data Science, Digital Marketing, dll.',
          helperText: 'Bidang utama yang Anda kuasai dan akan diajarkan.',
          conditional: (data) => data.statusAkademik === 'lainnya',
          icon: 'ph:target',
          size: 'lg'
        },
        {
          name: 'pengalamanBelajar',
          label: 'Pengalaman Pembelajaran',
          type: 'textarea',
          required: true,
          rows: 4,
          placeholder: 'Ceritakan perjalanan pembelajaran Anda, sertifikat yang dimiliki, proyek yang pernah dikerjakan, atau pengalaman relevan lainnya...',
          helperText: 'Jelaskan bagaimana Anda memperoleh keahlian dan pengalaman di bidang yang akan Anda ajarkan.',
          conditional: (data) => data.statusAkademik === 'lainnya',
          icon: 'ph:book-open',
          size: 'lg'
        },
        {
          name: 'sertifikatKeahlian',
          label: 'Sertifikat / Portofolio Keahlian',
          type: 'file',
          accept: 'image/*,.pdf',
          helperText: 'Unggah sertifikat, portofolio, atau dokumen yang menunjukkan keahlian Anda. Format: PDF, JPG, PNG. Maksimal 5MB.',
          conditional: (data) => data.statusAkademik === 'lainnya',
          icon: 'ph:certificate',
          size: 'lg'
        },

        // === PROFIL PROFESIONAL & PENGALAMAN ===
        {
          name: 'section_profil_profesional',
          label: 'PROFIL PROFESIONAL & PENGALAMAN',
          type: 'text',
          disabled: true,
          helperText: 'Bagian ini adalah inti dari profil Anda. Isilah dengan lengkap dan jujur untuk membangun kepercayaan calon siswa dan orang tua.',
          className: 'section-divider',
          icon: 'ph:briefcase'
        },
        
        // === A. KEAHLIAN ===
        {
          name: 'section_keahlian',
          label: 'A. KEAHLIAN',
          type: 'text',
          disabled: true,
          helperText: 'Tuliskan keahlian dan spesialisasi Anda secara detail.',
          className: 'section-divider',
          icon: 'ph:star'
        },
        {
          name: 'keahlianSpesialisasi',
          label: 'Keahlian & Spesialisasi',
          type: 'textarea',
          required: true,
          rows: 5,
          placeholder: 'Contoh:\n• Spesialis Persiapan UTBK/SNBT - Matematika & Fisika\n• Kurikulum Internasional (Cambridge A-Level)\n• Metode Mengajar Interaktif (Fun Learning)\n• Persiapan Tes Bahasa (TOEFL/IELTS)\n• Coding & Pemrograman (Python, JavaScript)',
          helperText: 'Tuliskan semua keahlian yang Anda kuasai (minimal 3). Gunakan bullet points (•) atau numbering. Ini akan menjadi filter utama bagi siswa untuk menemukan Anda.',
          icon: 'ph:star',
          size: 'lg'
        },
        {
          name: 'keahlianLainnya',
          label: 'Keahlian Lainnya (jika ada)',
          type: 'textarea',
          rows: 5,
          placeholder: 'Contoh:\n• Public Speaking - Pengalaman sebagai MC acara kampus dan seminar\n• Penulisan Kreatif - Menulis artikel blog dan cerpen sejak 2020\n• Desain Grafis - Mahir Adobe Photoshop dan Canva untuk materi pembelajaran\n• Video Editing - Bisa membuat video pembelajaran dengan software editing dasar',
          helperText: 'Tuliskan keahlian lain yang Anda miliki yang bisa mendukung proses mengajar. Jelaskan singkat pengalaman atau tingkat kemahiran Anda.',
          icon: 'ph:plus-circle',
          size: 'lg'
        },

        // === B. PENGALAMAN ===
        {
          name: 'section_pengalaman',
          label: 'B. PENGALAMAN',
          type: 'text',
          disabled: true,
          helperText: 'Jelaskan pengalaman Anda secara terstruktur dengan detail yang lengkap.',
          className: 'section-divider',
          icon: 'ph:briefcase'
        },

        {
          name: 'pengalamanMengajar',
          label: 'Pengalaman Mengajar',
          type: 'textarea',
          required: true,
          rows: 8,
          placeholder: 'Contoh:\n\n1. Guru Privat Matematika & Fisika (2020 - Sekarang)\n   • Ruangguru & Privat Mandiri\n   • Mengajar siswa SMA kelas 10-12 persiapan UTBK\n   • Berhasil meningkatkan rata-rata skor matematika siswa 40 poin\n   • 50+ siswa berhasil masuk PTN favorit\n\n2. Asisten Dosen Fisika Dasar (2019-2021)\n   • Laboratorium Fisika ITB\n   • Membimbing praktikum mahasiswa S1 Teknik\n   • Menyusun modul praktikum dan soal ujian\n\n3. Tentor Online Kimia (2018-2020)\n   • Platform Zenius & Quipper\n   • Membuat video pembelajaran untuk siswa SMA\n   • Total 100+ video dengan 500K+ views',
          helperText: 'Tuliskan semua pengalaman mengajar Anda secara kronologis. Sertakan nama institusi, periode, jenjang siswa, mata pelajaran, dan pencapaian spesifik.',
          icon: 'ph:chalkboard-teacher',
          size: 'lg'
        },
        {
          name: 'pengalamanLainRelevan',
          label: 'Pengalaman Lain yang Relevan',
          type: 'textarea',
          rows: 6,
          placeholder: 'Contoh:\n\n1. Ketua Himpunan Mahasiswa Matematika (2019-2020)\n   • Mengorganisir seminar dan workshop untuk 500+ mahasiswa\n   • Melatih kemampuan public speaking dan leadership\n   • Mengelola tim 30 orang\n\n2. Penulis Artikel Edukasi (2018-Sekarang)\n   • Blog "BelajarMatematika.id" dengan 50K+ pembaca bulanan\n   • Menulis 200+ artikel tentang tips belajar matematika\n   • Meningkatkan kemampuan komunikasi tertulis\n\n3. Volunteer Pengajar Daerah 3T (2019)\n   • Program Indonesia Mengajar di Kalimantan\n   • Mengajar matematika & fisika di daerah terpencil\n   • Mengembangkan empati dan adaptabilitas dalam mengajar',
          helperText: 'Opsional: Pengalaman kerja, organisasi, atau aktivitas lain yang menunjang kemampuan mengajar dan komunikasi Anda.',
          icon: 'ph:lightbulb',
          size: 'lg'
        },

        // === C. PRESTASI & SERTIFIKASI ===
        {
          name: 'section_prestasi_sertifikasi',
          label: 'C. PRESTASI & SERTIFIKASI',
          type: 'text',
          disabled: true,
          helperText: 'Tunjukkan pencapaian dan sertifikasi untuk membangun kredibilitas.',
          className: 'section-divider',
          icon: 'ph:trophy'
        },

        {
          name: 'prestasiAkademik',
          label: 'Prestasi Akademik',
          type: 'textarea',
          rows: 5,
          placeholder: 'Contoh:\n\n• Juara 1 Olimpiade Sains Nasional (OSN) Matematika 2024 - Tingkat Nasional\n• Mahasiswa Berprestasi Tingkat Fakultas MIPA UGM 2023\n• Summa Cum Laude dengan IPK 3.95/4.00 dari Program Studi Matematika\n• Best Paper Award pada Seminar Nasional Matematika dan Aplikasinya 2023\n• Penerima Beasiswa Unggulan Kemendikbud 2020-2024',
          helperText: 'Opsional: Prestasi akademik seperti olimpiade, penghargaan kampus, beasiswa, atau pencapaian akademis lainnya.',
          icon: 'ph:trophy',
          size: 'lg'
        },
        {
          name: 'prestasiNonAkademik',
          label: 'Prestasi Non-Akademik',
          type: 'textarea',
          rows: 5,
          placeholder: 'Contoh:\n\n• Juara 2 Kompetisi Debat Nasional "Indonesia Berkiprah" 2023\n• Best Speaker pada Model United Nations Jakarta 2022\n• Finalis Lomba Karya Tulis Ilmiah Nasional 2023\n• Ketua Terpilih Organisasi Kemahasiswaan dengan 2000+ anggota\n• Koordinator Program Pengabdian Masyarakat yang melayani 500+ peserta',
          helperText: 'Opsional: Prestasi non-akademik seperti lomba debat, karya tulis, kepemimpinan, atau pencapaian lainnya yang menunjang kemampuan komunikasi dan mengajar.',
          icon: 'ph:medal',
          size: 'lg'
        },
        {
          name: 'sertifikasiPelatihan',
          label: 'Sertifikasi & Pelatihan',
          type: 'textarea',
          rows: 6,
          placeholder: 'Contoh:\n\n• TOEFL iBT Score 110/120 - ETS (Valid until 2026)\n• Microsoft Certified: Azure Fundamentals - Microsoft (2023)\n• Google Analytics Individual Qualification (IQ) - Google (2024)\n• Sertifikat Pendidik Profesional - Kemendikbud Ristek (2023)\n• Advanced Python Programming - Coursera Stanford University (2022)\n• Digital Marketing Specialist - HubSpot Academy (2023)\n• Public Speaking & Presentation Skills - Dale Carnegie (2024)',
          helperText: 'Opsional: Sertifikat profesional, pelatihan, kursus online, atau kredensial lain yang mendukung kemampuan mengajar dan keahlian Anda.',
          icon: 'ph:certificate',
          size: 'lg'
        },



      ]
    },

    {
      id: 'subjects-areas',
      title: 'Mata Pelajaran',
      description: 'Pilihan mata pelajaran yang dapat diajarkan - Manual atau AI Assisted',
      icon: 'ph:book-open',
      color: 'info',
      fields: [
        // === PILIHAN MODE SELEKSI ===
        {
          name: 'section_mode_selection',
          label: '🎯 PILIHAN MODE SELEKSI MATA PELAJARAN',
          type: 'text',
          disabled: true,
          helperText: 'Pilih cara yang paling nyaman untuk Anda menentukan mata pelajaran yang akan diajarkan',
          className: 'section-divider',
          icon: 'ph:lightbulb'
        },
        {
          name: 'selectedPrograms',
          label: '📚 Pilih Program/Mata Pelajaran yang Diajarkan',
          type: 'category-program-selector',
          required: true,
          helperText: 'Klik kategori untuk melihat semua program yang tersedia. Pilih program yang sesuai dengan keahlian Anda.',
          icon: 'ph:books',
          size: 'lg'
        },
        {
          name: 'mataPelajaranLainnya',
          label: '📝 Mata Pelajaran Lainnya (Jika Tidak Ditemukan)',
          type: 'textarea',
          placeholder: 'Jika Anda tidak menemukan mata pelajaran yang ingin Anda ajarkan di atas, silakan tuliskan di sini. Jelaskan juga kemampuan dan pengalaman Anda dalam mengajar mata pelajaran tersebut. Contoh:\n\n• Mata Pelajaran: Bahasa Korea untuk Pemula\n• Kemampuan: Lulusan S1 Sastra Korea, pengalaman 3 tahun mengajar\n• Metode: Menggunakan lagu, drama, dan percakapan sehari-hari\n• Target: Siswa SMA dan dewasa yang ingin belajar bahasa Korea dari nol\n\n• Mata Pelajaran: Coding Python untuk Anak SD\n• Kemampuan: Sertifikasi Python, pengalaman mengajar coding untuk anak-anak\n• Metode: Game-based learning, project sederhana\n• Target: Anak SD kelas 4-6 yang tertarik teknologi',
          rows: 8,
          helperText: 'Jelaskan mata pelajaran yang ingin Anda ajarkan, kemampuan Anda, metode mengajar, dan target siswa. Ini akan membantu kami memahami kebutuhan khusus Anda.',
          icon: 'ph:note-pencil',
          size: 'lg'
        }
      ]
    },
    
    {
      id: 'availability-location',
      title: 'Availability & Wilayah',
      description: 'Ketersediaan waktu dan jangkauan wilayah mengajar',
      icon: 'ph:calendar-clock',
      color: 'success',
      fields: [
        // === JANGKAUAN WILAYAH ===
        {
          name: 'section_wilayah',
          label: 'TARGET AREA MENGAJAR & JANGKAUAN',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:target'
        },

        {
          name: 'teaching_radius_km',
          label: 'Radius Area Mengajar (KM)',
          type: 'number',
          placeholder: '25',
          min: 1,
          max: 100,
          helperText: '📏 Jarak maksimal dari titik pusat di atas yang Anda bersedia jangkau untuk mengajar. Contoh: "Monas Jakarta Pusat" + 25km = cover seluruh Jakarta. "Jl. Kaliurang Sleman" + 15km = cover area Sleman-Yogya Utara.',
          icon: 'ph:circle',
          size: 'lg'
        },
        {
          name: 'alamatTitikLokasi',
          label: 'Titik Pusat Area Target Mengajar',
          type: 'textarea',
          placeholder: 'Contoh: "Monas Jakarta Pusat" atau "Jl. Kaliurang KM 5 Sleman" atau "Alun-alun Surabaya"...',
          helperText: '🎯 PENTING: Ini BUKAN alamat rumah Anda, tapi titik pusat area dimana Anda mau ngajar siswa. Contoh: tinggal di Tangerang tapi mau ngajar seluruh Jakarta → tulis "Monas Jakarta Pusat" + radius 25km. Atau tinggal di Bantul tapi fokus area Sleman → tulis "Jl. Kaliurang Sleman" + radius 15km.',
          icon: 'ph:map-pin-line',
          size: 'lg',
          rows: 3,
          className: 'map-picker-field'
        },
        {
          name: 'location_notes',
          label: 'Preferensi Area Mengajar (Opsional)',
          type: 'textarea',
          placeholder: 'Contoh: "Prefer Jakarta Pusat-Selatan, hindari Utara karena macet" atau "Area Sleman-Yogya OK, Bantul Selatan gak bisa malem" atau "Surabaya Barat-Timur prefer, Utara jauh dari rumah"',
          rows: 3,
          helperText: '💬 Opsional: Jelaskan preferensi area khusus, area yang dihindari, atau pertimbangan akses jalan/transportasi untuk membantu EM dalam matching siswa.',
          icon: 'ph:note',
          size: 'lg'
        },

        // === KETERSEDIAAN WAKTU & METODE ===
        {
          name: 'section_availability',
          label: 'KETERSEDIAAN WAKTU & METODE MENGAJAR',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:calendar-clock'
        },
        {
          name: 'statusMenerimaSiswa',
          label: 'Status Availability',
          type: 'select',
          required: true,
          placeholder: 'Pilih status ketersediaan...',
          options: [
            { value: 'aktif', label: '🟢 AKTIF - Menerima siswa baru' },
            { value: 'terbatas', label: '🟡 TERBATAS - Hanya menerima 1-2 siswa baru' },
            { value: 'tidak_aktif', label: '🔴 TIDAK AKTIF - Tidak menerima siswa baru sementara' }
          ],
          helperText: 'Status ini akan menentukan apakah tutor bisa menerima siswa baru atau tidak.',
          icon: 'ph:toggle-left',
          size: 'lg'
        },
        {
          name: 'available_schedule',
          label: 'Jadwal Mingguan Tersedia',
          type: 'checkbox',
          required: true,
          options: dynamicOptions.jadwalTersedia,
          multiple: true,
          helperText: 'Pilih hari dan jam ketika tutor tersedia untuk mengajar siswa baru.',
          icon: 'ph:calendar'
        },
        {
          name: 'teaching_methods',
          label: 'Metode Pengajaran',
          type: 'checkbox',
          required: true,
          options: [
            { value: 'offline_datang_ke_siswa', label: '🏠 Offline - Datang ke rumah siswa' },
            { value: 'offline_di_tempat_tutor', label: '🏢 Offline - Di tempat tutor' },
            { value: 'online_zoom_gmeet', label: '💻 Online - Zoom/Google Meet' },
            { value: 'hybrid', label: '🔄 Hybrid - Kombinasi online & offline' }
          ],
          multiple: true,
          helperText: 'Pilih metode pengajaran yang bisa dilakukan tutor.',
          icon: 'ph:chalkboard-teacher'
        },
        {
          name: 'hourly_rate',
          label: 'Ekspektasi Fee Minimal Per Jam',
          type: 'number',
          required: true,
          placeholder: '75000',
          min: 25000,
          max: 1000000,
          step: 5000,
          helperText: 'Ekspektasi fee minimal mengajar per jam dalam Rupiah. Minimal Rp 25.000, maksimal Rp 1.000.000.',
          icon: 'ph:money',
          size: 'lg'
        },
        {
          name: 'maksimalSiswaBaru',
          label: 'Maksimal Siswa Baru per Minggu',
          type: 'number',
          placeholder: '3',
          min: 1,
          max: 20,
          helperText: 'Berapa siswa baru maksimal yang bisa diterima per minggu? Kosongkan jika tidak ada batasan.',
          icon: 'ph:users',
          size: 'lg'
        },
        {
          name: 'maksimalTotalSiswa',
          label: 'Maksimal Total Siswa',
          type: 'number',
          placeholder: '15',
          min: 1,
          max: 50,
          helperText: 'Total maksimal siswa yang bisa diajar (termasuk yang sudah aktif). Kosongkan jika tidak ada batasan.',
          icon: 'ph:user-list',
          size: 'lg'
        },
        {
          name: 'usiaTargetSiswa',
          label: 'Usia Target Siswa',
          type: 'checkbox',
          options: [
            { value: '2-5', label: '👶 2-5 tahun (Balita/PAUD)' },
            { value: '6-12', label: '🧒 6-12 tahun (SD)' },
            { value: '13-15', label: '👦 13-15 tahun (SMP)' },
            { value: '16-18', label: '👨‍🎓 16-18 tahun (SMA/SMK)' },
            { value: '19-25', label: '👨‍🎓 19-25 tahun (Kuliah)' },
            { value: '26-40', label: '👨‍💼 26-40 tahun (Profesional Muda)' },
            { value: '40+', label: '👨‍🦳 40+ tahun (Dewasa/Senior)' }
          ],
          multiple: true,
          helperText: 'Range usia siswa yang lebih nyaman untuk diajar. Kosongkan jika bersedia mengajar semua usia.',
          icon: 'ph:users-three'
        },
        {
          name: 'catatanAvailability',
          label: 'Catatan Availability',
          type: 'textarea',
          placeholder: 'Contoh: "Lebih suka mengajar sore hari karena pagi kuliah. Bisa fleksibel untuk weekend..."',
          rows: 3,
          helperText: 'Opsional: Informasi tambahan tentang availability dan preferensi waktu mengajar.',
          icon: 'ph:note',
          size: 'lg'
        },

        // === DETAIL METODE MENGAJAR ===
        {
          name: 'section_teaching_details',
          label: 'DETAIL METODE & PREFERENSI MENGAJAR',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:chalkboard-teacher'
        },
        {
          name: 'teachingMethods',
          label: 'Gaya Pembelajaran yang Dikuasai',
          type: 'checkbox',
          options: [
            { value: 'visual', label: '👁️ Visual - Menggunakan gambar, diagram, mind map' },
            { value: 'auditory', label: '🎵 Auditori - Menjelaskan dengan suara, diskusi' },
            { value: 'kinesthetic', label: '✋ Kinestetik - Praktik langsung, hands-on' },
            { value: 'reading_writing', label: '📝 Baca-Tulis - Catatan, rangkuman, latihan tulis' }
          ],
          multiple: true,
          helperText: 'Pilih gaya pembelajaran yang bisa diterapkan tutor.',
          icon: 'ph:brain'
        },
        {
          name: 'studentLevelPreferences',
          label: 'Preferensi Level Kemampuan Siswa',
          type: 'checkbox',
          options: [
            { value: 'beginner', label: '🌱 Pemula - Siswa yang baru mulai belajar' },
            { value: 'intermediate', label: '🌿 Menengah - Siswa dengan dasar yang cukup' },
            { value: 'advanced', label: '🌳 Mahir - Siswa dengan kemampuan tinggi' },
            { value: 'remedial', label: '🔧 Remedial - Siswa yang perlu bantuan khusus' }
          ],
          multiple: true,
          helperText: 'Level kemampuan siswa yang lebih nyaman diajar.',
          icon: 'ph:trending-up'
        },

        {
          name: 'specialNeedsCapable',
          label: 'Mampu Mengajar Siswa Berkebutuhan Khusus',
          type: 'select',
          placeholder: 'Pilih kemampuan...',
          options: [
            { value: 'tidak', label: '❌ Tidak Mampu' },
            { value: 'basic', label: '🟡 Mampu Level Dasar' },
            { value: 'experienced', label: '✅ Berpengalaman' },
            { value: 'certified', label: '🏆 Memiliki Sertifikasi Khusus' }
          ],
          helperText: 'Kemampuan mengajar siswa dengan kebutuhan khusus (ABK).',
          icon: 'ph:heart',
          size: 'lg'
        },
        {
          name: 'groupClassWilling',
          label: 'Bersedia Mengajar Kelas Grup',
          type: 'select',
          placeholder: 'Pilih kesediaan...',
          options: [
            { value: 'tidak', label: '❌ Tidak Bersedia' },
            { value: 'ya_small', label: '✅ Ya - Grup Kecil (2-4 siswa)' },
            { value: 'ya_medium', label: '✅ Ya - Grup Menengah (5-8 siswa)' },
            { value: 'ya_large', label: '✅ Ya - Grup Besar (9+ siswa)' }
          ],
          helperText: 'Kesediaan mengajar dalam bentuk grup/kelompok.',
          icon: 'ph:users-three',
          size: 'lg'
        },

        // === KEMAMPUAN TEKNOLOGI ===
        {
          name: 'section_tech_capability',
          label: 'KEMAMPUAN TEKNOLOGI & ONLINE TEACHING',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:laptop'
        },
        {
          name: 'onlineTeachingCapable',
          label: 'Kemampuan Mengajar Online',
          type: 'select',
          required: true,
          placeholder: 'Pilih kemampuan...',
          options: [
            { value: 'tidak_bisa', label: '❌ Tidak Bisa Mengajar Online' },
            { value: 'basic', label: '🟡 Bisa Dasar - Zoom/GMeet saja' },
            { value: 'intermediate', label: '✅ Mahir - Dengan tools tambahan' },
            { value: 'advanced', label: '🏆 Expert - Interactive tools, whiteboard, dll' }
          ],
          helperText: 'Level kemampuan mengajar secara online.',
          icon: 'ph:video-camera',
          size: 'lg'
        },
        {
          name: 'techSavviness',
          label: 'Tingkat Melek Teknologi',
          type: 'select',
          placeholder: 'Pilih level...',
          options: [
            { value: 'low', label: '🔴 Rendah - Hanya aplikasi dasar' },
            { value: 'medium', label: '🟡 Menengah - Bisa belajar tools baru' },
            { value: 'high', label: '🟢 Tinggi - Mahir berbagai aplikasi' },
            { value: 'expert', label: '🏆 Expert - Bisa troubleshoot sendiri' }
          ],
          helperText: 'Seberapa familiar dengan teknologi dan aplikasi digital.',
          icon: 'ph:devices',
          size: 'lg'
        },
        {
          name: 'gmeetExperience',
          label: 'Pengalaman Google Meet/Zoom',
          type: 'select',
          placeholder: 'Pilih pengalaman...',
          options: [
            { value: 'belum_pernah', label: '❌ Belum Pernah Menggunakan' },
            { value: 'pemula', label: '🔰 Pemula - Bisa join meeting saja' },
            { value: 'menengah', label: '🟢 Menengah - Bisa host dan share screen' },
            { value: 'mahir', label: '🏆 Mahir - Advanced features (breakout, whiteboard)' }
          ],
          helperText: 'Level pengalaman menggunakan platform video meeting.',
          icon: 'ph:video',
          size: 'lg'
        },
        {
          name: 'presensiUpdateCapability',
          label: 'Kemampuan Update Presensi Online',
          type: 'select',
          placeholder: 'Pilih kemampuan...',
          options: [
            { value: 'tidak_bisa', label: '❌ Tidak Bisa - Perlu dibantu' },
            { value: 'bisa_dilatih', label: '🟡 Bisa Dilatih' },
            { value: 'bisa', label: '✅ Bisa - Mandiri' },
            { value: 'mahir', label: '🏆 Mahir - Bisa real-time update' }
          ],
          helperText: 'Kemampuan mengupdate presensi dan laporan online.',
          icon: 'ph:check-circle',
          size: 'lg'
        },

        // === KARAKTER & KEPRIBADIAN ===
        {
          name: 'section_personality',
          label: 'KARAKTER & KEPRIBADIAN TUTOR',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:smiley'
        },
        {
          name: 'tutorPersonalityType',
          label: 'Tipe Kepribadian Tutor',
          type: 'checkbox',
          required: true,
          multiple: true,
          options: [
            { value: 'sabar_lembut', label: '🤗 Sabar & Lembut - Pendekatan halus, tidak terburu-buru' },
            { value: 'energik_motivator', label: '⚡ Energik & Motivator - Semangat tinggi, inspiring' },
            { value: 'serius_disiplin', label: '🎯 Serius & Disiplin - Tegas, target-oriented' },
            { value: 'santai_friendly', label: '😊 Santai & Friendly - Rileks, seperti teman' },
            { value: 'kreatif_fun', label: '🎨 Kreatif & Fun - Inovatif, pembelajaran menyenangkan' },
            { value: 'analitis_detail', label: '🔍 Analitis & Detail - Teliti, sistematis' },
            { value: 'adaptif_fleksibel', label: '🔄 Adaptif & Fleksibel - Menyesuaikan dengan siswa' },
            { value: 'caring_empathetic', label: '💝 Caring & Empathetic - Perhatian, memahami perasaan' }
          ],
          helperText: 'Pilih tipe kepribadian yang menggambarkan diri Anda sebagai tutor (bisa pilih lebih dari satu).',
          icon: 'ph:user-circle',
          size: 'lg'
        },
        {
          name: 'communicationStyle',
          label: 'Gaya Komunikasi',
          type: 'checkbox',
          required: true,
          multiple: true,
          options: [
            { value: 'formal_sopan', label: '🎩 Formal & Sopan - Bahasa baku, hormat' },
            { value: 'kasual_santai', label: '😎 Kasual & Santai - Bahasa sehari-hari' },
            { value: 'antusiaslik_ekspresif', label: '🎭 Antusias & Ekspresif - Gestur banyak, dramatis' },
            { value: 'tenang_clear', label: '🧘 Tenang & Jelas - Pelan, artikulasi bagus' },
            { value: 'interaktif_tanya_jawab', label: '💬 Interaktif & Tanya Jawab - Dialog aktif' },
            { value: 'storytelling', label: '📚 Storytelling - Suka bercerita, analogi' }
          ],
          helperText: 'Gaya komunikasi yang biasa digunakan saat mengajar (bisa pilih lebih dari satu).',
          icon: 'ph:chat-circle',
          size: 'lg'
        },
        {
          name: 'teachingPatienceLevel',
          label: 'Level Kesabaran Mengajar (1-10)',
          type: 'select',
          required: true,
          placeholder: 'Pilih level kesabaran...',
          options: [
            { value: '1', label: '1 - Cepat, Efisien & Dinamis - Membantu siswa berpikir cepat' },
            { value: '2', label: '2 - Tegas & Efektif - Memberikan dorongan motivasi yang kuat' },
            { value: '3', label: '3 - Aktif & Responsif - Membuat siswa tetap fokus dan engaged' },
            { value: '4', label: '4 - Antusias & Energik - Mendorong semangat belajar siswa' },
            { value: '5', label: '5 - Seimbang & Adaptif - Menyesuaikan dengan kebutuhan siswa' },
            { value: '6', label: '6 - Sabar & Supportive - Memberikan dukungan yang konsisten' },
            { value: '7', label: '7 - Sangat Sabar & Teliti - Memastikan pemahaman mendalam' },
            { value: '8', label: '8 - Extra Sabar & Caring - Perhatian detail pada setiap siswa' },
            { value: '9', label: '9 - Extremely Patient & Empathetic - Memahami keunikan setiap siswa' },
            { value: '10', label: '10 - Master of Patience 😇 - Mampu mengajar dengan ketenangan sempurna' }
          ],
          helperText: 'Bagaimana gaya mengajar Anda? Dari yang energik-dinamis (1) hingga yang sangat sabar-tenang (10). Semua memiliki nilai positif!',
          icon: 'ph:clock-clockwise',
          size: 'lg'
        },
        {
          name: 'studentMotivationAbility',
          label: 'Kemampuan Memotivasi Siswa (1-10)',
          type: 'select',
          required: true,
          placeholder: 'Pilih kemampuan motivasi...',
          options: [
            { value: '1', label: '1 - Pendekatan Praktis - Fokus pada hasil nyata dan aplikasi langsung' },
            { value: '2', label: '2 - Motivasi Teknis - Menjelaskan manfaat konkret dari materi' },
            { value: '3', label: '3 - Encourager - Memberikan dorongan positif secara konsisten' },
            { value: '4', label: '4 - Supportive Coach - Membimbing dengan dukungan yang solid' },
            { value: '5', label: '5 - Active Motivator - Aktif membangun semangat belajar siswa' },
            { value: '6', label: '6 - Inspiring Teacher - Mampu menginspirasi dengan contoh positif' },
            { value: '7', label: '7 - Energetic Motivator - Membawa energi positif ke dalam pembelajaran' },
            { value: '8', label: '8 - Passion Builder - Membantu siswa menemukan passion mereka' },
            { value: '9', label: '9 - Life Changer - Mampu mengubah mindset siswa secara fundamental' },
            { value: '10', label: '10 - Inspirational Leader 🔥 - Guru yang mengubah hidup siswa' }
          ],
          helperText: 'Seberapa baik Anda memotivasi siswa yang malas atau putus asa? Semua level memiliki value unik!',
          icon: 'ph:trending-up',
          size: 'lg'
        },
        {
          name: 'scheduleFlexibilityLevel',
          label: 'Level Fleksibilitas Jadwal (1-10)',
          type: 'select',
          placeholder: 'Pilih level fleksibilitas...',
          options: [
            { value: '3', label: '3 - Kaku - Jadwal harus fixed' },
            { value: '4', label: '4 - Agak Kaku' },
            { value: '5', label: '5 - Normal' },
            { value: '6', label: '6 - Cukup Fleksibel' },
            { value: '7', label: '7 - Fleksibel' },
            { value: '8', label: '8 - Sangat Fleksibel' },
            { value: '9', label: '9 - Extremely Fleksibel' },
            { value: '10', label: '10 - Super Adaptable 🦎' }
          ],
          helperText: 'Seberapa fleksibel dengan perubahan jadwal mendadak? (Scale 1-10)',
          icon: 'ph:calendar-x',
          size: 'lg'
        },

        // === KONTAK DARURAT ===
        {
          name: 'section_emergency_contact',
          label: 'KONTAK DARURAT & KOMUNIKASI',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:phone-call'
        },

        {
          name: 'emergencyContactName',
          label: 'Nama Kontak Darurat',
          type: 'text',
          required: true,
          placeholder: 'Nama orang terdekat...',
          helperText: 'Nama orang yang bisa dihubungi jika tutor tidak bisa dihubungi.',
          icon: 'ph:user',
          size: 'lg'
        },
        {
          name: 'emergencyContactRelationship',
          label: 'Hubungan dengan Kontak Darurat',
          type: 'select',
          required: true,
          placeholder: 'Pilih hubungan...',
          options: [
            { value: 'orang_tua', label: '👨‍👩‍👧‍👦 Orang Tua' },
            { value: 'saudara', label: '👫 Saudara Kandung' },
            { value: 'pasangan', label: '💑 Pasangan/Suami/Istri' },
            { value: 'sahabat', label: '👬 Sahabat Dekat' },
            { value: 'kerabat', label: '👪 Kerabat Dekat' },
            { value: 'lainnya', label: '🤝 Lainnya' }
          ],
          helperText: 'Hubungan Anda dengan kontak darurat.',
          icon: 'ph:users',
          size: 'lg'
        },
        {
          name: 'emergencyContactPhone',
          label: 'Nomor HP Kontak Darurat',
          type: 'tel_split',
          required: true,
          placeholder: '812987654321',
          helperText: 'Nomor HP kontak darurat. Kode Area + Ekstensi. jangan pakai spasi/strip/tanda minus, dan Jangan mulai dengan 0. Contoh BENAR: 812345678901',
          icon: 'ph:phone',
          size: 'lg'
        },


      ]
    },
    
    {
      id: 'documents',
      title: 'Dokumen',
      description: 'Dokumen pendukung dan verifikasi',
      icon: 'ph:file-text',
      color: 'secondary',
      fields: [
        {
          name: 'section_dokumen',
          label: 'DOKUMEN PENDUKUNG',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:file-text'
        },
        {
          name: 'dokumenIdentitas',
          label: 'Dokumen Identitas (KTP/Paspor)',
          type: 'file',
          accept: 'image/*,.pdf',
          helperText: 'Unggah foto/scan KTP atau Paspor. Format JPG, PNG, PDF maksimal 5MB.',
          icon: 'ph:identification-card',
          size: 'lg'
        },
        {
          name: 'dokumenPendidikan',
          label: 'Dokumen Pendidikan (Ijazah/Transkrip)',
          type: 'file',
          accept: 'image/*,.pdf',
          helperText: 'Unggah foto/scan ijazah atau transkrip nilai terakhir.',
          icon: 'ph:certificate',
          size: 'lg'
        },
        {
          name: 'dokumenSertifikat',
          label: 'Sertifikat/Dokumen Pendukung Lain',
          type: 'file',
          accept: 'image/*,.pdf',
          helperText: 'Opsional: Sertifikat pelatihan, kursus, atau dokumen pendukung lainnya.',
          icon: 'ph:medal',
          size: 'lg'
        },
        
        {
          name: 'section_verifikasi',
          label: 'VERIFIKASI DOKUMEN',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider',
          icon: 'ph:shield-check'
        },
        {
          name: 'status_verifikasi_identitas',
          label: 'Status Verifikasi Identitas',
          type: 'select',
          placeholder: 'Pilih status...',
          options: [
            { value: 'pending', label: 'Menunggu Verifikasi' },
            { value: 'verified', label: 'Terverifikasi' },
            { value: 'rejected', label: 'Ditolak' },
            { value: 'incomplete', label: 'Tidak Lengkap' }
          ],
          helperText: 'Status verifikasi dokumen identitas.',
          icon: 'ph:shield-check',
          size: 'lg'
        },
        {
          name: 'status_verifikasi_pendidikan',
          label: 'Status Verifikasi Pendidikan',
          type: 'select',
          placeholder: 'Pilih status...',
          options: [
            { value: 'pending', label: 'Menunggu Verifikasi' },
            { value: 'verified', label: 'Terverifikasi' },
            { value: 'rejected', label: 'Ditolak' },
            { value: 'incomplete', label: 'Tidak Lengkap' }
          ],
          helperText: 'Status verifikasi dokumen pendidikan.',
          icon: 'ph:shield-check',
          size: 'lg'
        }
      ]
    },
    

  ]
};

// Default form data
export const defaultFormData: Partial<TutorFormData> = {
  trn: '',
  namaLengkap: '',
  namaPanggilan: '',
  tanggalLahir: '',
  jenisKelamin: '',
  agama: '',
  email: '',
  noHp1: '',
  noHp2: '',
  
  // New Profile Identity Fields
  headline: undefined,
  deskripsiDiri: undefined,
  socialMedia1: undefined,
  socialMedia2: undefined,
  // Address Information - Domisili (New Structure)
  provinsiDomisili: '',
  kotaKabupatenDomisili: '',
  kecamatanDomisili: '',
  kelurahanDomisili: '',
  alamatLengkapDomisili: '',
  kodePosDomisili: '',
  
  // Address Information - KTP/KK (New Structure)
  alamatSamaDenganKTP: false,
  provinsiKTP: '',
  kotaKabupatenKTP: '',
  kecamatanKTP: '',
  kelurahanKTP: '',
  alamatLengkapKTP: '',
  kodePosKTP: '',
  // Banking Information (Enhanced)
  namaNasabah: '',
  nomorRekening: '',
  namaBank: '', // Bank UUID
  statusAkademik: '',
  namaUniversitasS1: '',
  fakultasS1: '',
  jurusanS1: '',
  namaUniversitas: '',
  fakultas: '',
  jurusan: '',
  ipk: '',
  tahunMasuk: '',
  tahunLulus: '',
  transkripNilai: null,
  namaSMA: '',
  jurusanSMA: '',
  jurusanSMKDetail: '',
  tahunLulusSMA: '',

  
  // Alternative Learning Background
  namaInstitusi: '',
  bidangKeahlian: '',
  pengalamanBelajar: '',
  sertifikatKeahlian: null,
  
  // Professional Profile & Experience
  motivasiMenjadiTutor: '',
  keahlianSpesialisasi: '',
  keahlianLainnya: '',
  
  // Teaching Experience - Simplified
  pengalamanMengajar: '',
  pengalamanLainRelevan: '',
  
  // Achievements & Credentials - Simplified
  prestasiAkademik: '',
  prestasiNonAkademik: '',
  sertifikasiPelatihan: '',
  sertifikasi: undefined,
  hourly_rate: 0,
  teaching_methods: [],
  available_schedule: [],
  motivasi: '',
  
  // New Availability Configuration
  statusMenerimaSiswa: '',
  maksimalSiswaBaru: undefined,
  maksimalTotalSiswa: undefined,  
  usiaTargetSiswa: [],
  catatanAvailability: '',

  // Teaching Details
  teachingMethods: [],
  studentLevelPreferences: [],
  specialNeedsCapable: '',
  groupClassWilling: '',

  // Technology Capability
  onlineTeachingCapable: '',
  techSavviness: '',
  gmeetExperience: '',
  presensiUpdateCapability: '',

  // Personality & Character
  tutorPersonalityType: [],
  communicationStyle: [],
  teachingPatienceLevel: '',
  studentMotivationAbility: '',
  scheduleFlexibilityLevel: '',

  // Emergency Contact & Communication
  emergencyContactName: '',
  emergencyContactRelationship: '',
  emergencyContactPhone: '',
  
  // Subject Information - Mata Pelajaran per Kategori
  mataPelajaran_SD_Kelas_1_6_: [],
  mataPelajaran_SMP_Kelas_7_9_: [],
  mataPelajaran_SMA_SMK_IPA: [],
  mataPelajaran_SMA_SMK_IPS: [],
  mataPelajaran_SMK_Teknik_Teknologi: [],
  mataPelajaran_SMK_Bisnis_Manajemen: [],
  mataPelajaran_SMK_Pariwisata_Perhotelan: [],
  mataPelajaran_SMK_Kesehatan: [],
  mataPelajaran_Bahasa_Asing: [],
  mataPelajaran_Universitas_Perguruan_Tinggi: [],
  mataPelajaran_Keterampilan_Khusus: [],
  
  // Program Selection Defaults
  selectedPrograms: [],
  mataPelajaranLainnya: '',
  
  // Teaching Area Information

  teaching_radius_km: undefined,
  location_notes: undefined,
  
  // Location Coordinates
  titikLokasiLat: undefined,
  titikLokasiLng: undefined,
  alamatTitikLokasi: '',
  fotoProfil: null,
  dokumenIdentitas: null,
  dokumenPendidikan: null,
  dokumenSertifikat: null,
  
  // System & Status Information (Staff only)
  status_tutor: '',
  approval_level: '',
  staff_notes: '',
  additionalScreening: [],
  
  // Document Verification (Staff only)
  status_verifikasi_identitas: '',
  status_verifikasi_pendidikan: '',

};

// Utility functions
export const validateStep = (step: FormStep, formData: Partial<TutorFormData>): string[] => {
  // No validation required - all fields are optional
  return [];
};

export const canProceedToNextStep = (step: FormStep, formData: Partial<TutorFormData>): boolean => {
  // Allow free navigation between steps - no validation required
  return true;
};

export const getStepProgress = (currentStep: number, totalSteps: number): number => {
  return ((currentStep + 1) / totalSteps) * 100;
};

export const isFieldVisible = (field: FormField, formData: Partial<TutorFormData>): boolean => {
  if (!field.conditional) return true;
  return field.conditional(formData);
};