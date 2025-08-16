
// Complete Tutor Interface matching API response
export interface TutorSpreadsheetData {
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
  
  // Document Verification
  status_verifikasi_identitas: string;
  status_verifikasi_pendidikan: string;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Column definition interface
export interface Column {
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
export const SPREADSHEET_COLUMNS: Column[] = [
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
  
  // ✅ ADDED: Document Preview Fields (from Form Add)
  
  // Upload Dokumen - Verifikasi
  { key: 'status_verifikasi_identitas', label: 'Verifikasi Identitas', width: 150, type: 'select', category: 'Upload Dokumen' },
  { key: 'status_verifikasi_pendidikan', label: 'Verifikasi Pendidikan', width: 150, type: 'select', category: 'Upload Dokumen' },
];
