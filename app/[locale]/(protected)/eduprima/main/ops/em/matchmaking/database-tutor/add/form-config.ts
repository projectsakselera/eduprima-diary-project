export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'switch';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  validation?: (value: any) => string | null;
  options?: Array<{ value: string | number; label: string; disabled?: boolean }>;
  accept?: string; // for file inputs
  multiple?: boolean; // for select/checkbox
  min?: number;
  max?: number;
  rows?: number; // for textarea
  size?: 'sm' | 'default' | 'md' | 'lg';
  color?: 'default' | 'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'destructive';
  icon?: string; // iconify icon
  dependsOn?: string; // field dependency
  conditional?: (formData: any) => boolean; // conditional visibility
  className?: string; // for custom styling
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

// Dynamic form data structure
export interface TutorFormData {
  // System & Status Information (Staff only)
  status_tutor?: string;
  approval_level?: string;
  staff_notes?: string;

  // Personal Information
  fotoProfil?: File | string | null;
  trn: string;
  namaLengkap: string;
  tanggalLahir: string;
  jenisKelamin: string;
  email: string;
  noHp1: string;
  noHp2?: string;
  
  // Address Information
  alamat: string;
  kelurahan: string;
  kecamatan: string;
  kotaKabupaten: string;
  provinsi: string;
  kodePos?: string;
  
  // Banking Information
  namaNasabah: string;
  nomorRekening: string;
  namaBank: string;
  cabangBank?: string;
  
  // Professional Information
  pendidikanTerakhir: string;
  universitas?: string;
  jurusan?: string;
  ipk?: number;
  pengalamanMengajar: number;
  sertifikasi?: string;
  tariffPerJam: number;
  metodePengajaran: string[];
  jadwalTersedia: string[];
  
  // Profile Information
  motivasi: string;
  pengalamanLain?: string;
  prestasiAkademik?: string;
  bahasaYangDikuasai: string[];
  
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
  wilayahKota?: string;
  wilayahKecamatan?: string[];
  radiusMengajar?: number;
  catatan_lokasi?: string;
  
  // Documents
  dokumenIdentitas?: File | string | null;
  dokumenPendidikan?: File | string | null;
  dokumenSertifikat?: File | string | null;
  
  // Document Verification (Staff only)
  status_verifikasi_identitas?: string;
  status_verifikasi_pendidikan?: string;
  
  // System Settings (Staff only)
  generate_password?: boolean;
  password_manual?: string;
  send_welcome_email?: boolean;
  send_whatsapp_notification?: boolean;
  tanggal_bergabung?: string;
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
  ipk: (value: number) => {
    if (!value) return null;
    if (value < 2.0 || value > 4.0) return 'IPK harus antara 2.0 - 4.0';
    return null;
  },
  tarif: (value: number) => {
    if (!value) return null;
    if (value < 50000) return 'Tarif minimal Rp 50.000';
    if (value > 1000000) return 'Tarif maksimal Rp 1.000.000';
    return null;
  }
};

// Dynamic options - these would typically come from API/database
export const dynamicOptions = {
  jenisKelamin: [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' }
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
    { value: 'BCA', label: 'Bank Central Asia (BCA)' },
    { value: 'BRI', label: 'Bank Rakyat Indonesia (BRI)' },
    { value: 'BNI', label: 'Bank Negara Indonesia (BNI)' },
    { value: 'Mandiri', label: 'Bank Mandiri' },
    { value: 'CIMB', label: 'CIMB Niaga' },
    { value: 'Danamon', label: 'Bank Danamon' },
    { value: 'Permata', label: 'Bank Permata' },
    { value: 'BSI', label: 'Bank Syariah Indonesia (BSI)' }
  ],
  
  pendidikanTerakhir: [
    { value: 'SMA/SMK', label: 'SMA/SMK' },
    { value: 'D3', label: 'Diploma 3 (D3)' },
    { value: 'S1', label: 'Sarjana (S1)' },
    { value: 'S2', label: 'Magister (S2)' },
    { value: 'S3', label: 'Doktor (S3)' }
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
  ],
  
  bahasaYangDikuasai: [
    { value: 'Indonesia', label: 'Bahasa Indonesia' },
    { value: 'Inggris', label: 'Bahasa Inggris' },
    { value: 'Arab', label: 'Bahasa Arab' },
    { value: 'Mandarin', label: 'Bahasa Mandarin' },
    { value: 'Jepang', label: 'Bahasa Jepang' },
    { value: 'Korea', label: 'Bahasa Korea' },
    { value: 'Jawa', label: 'Bahasa Jawa' },
    { value: 'Sunda', label: 'Bahasa Sunda' },
    { value: 'Bali', label: 'Bahasa Bali' }
  ]
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
          className: 'section-divider'
        },
        {
          name: 'status_tutor',
          label: 'Status Tutor',
          type: 'select',
          placeholder: 'Pilih status...',
          options: [
            { value: 'active', label: 'Aktif' },
            { value: 'inactive', label: 'Tidak Aktif' },
            { value: 'pending', label: 'Menunggu Verifikasi' },
            { value: 'suspended', label: 'Ditangguhkan' },
            { value: 'blacklisted', label: 'Blacklist' }
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

        // === IDENTITAS PROFIL ===
        {
          name: 'section_identitas',
          label: 'IDENTITAS PROFIL',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider'
        },
        {
          name: 'fotoProfil',
          label: 'Foto Profil',
          type: 'file',
          accept: 'image/*',
          helperText: 'Unggah foto diri tutor. Format JPG, PNG maksimal 2MB.',
          icon: 'ph:camera',
          size: 'lg'
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
          name: 'email',
          label: 'Email Aktif',
          type: 'email',
          placeholder: 'contoh@eduprima.id',
          helperText: 'Email untuk login sistem dan komunikasi.',
          icon: 'ph:envelope',
          size: 'lg'
        },
        {
          name: 'noHp1',
          label: 'No. HP (WhatsApp)',
          type: 'tel',
          placeholder: '+62 812-3456-7890',
          helperText: 'Nomor WhatsApp aktif untuk komunikasi.',
          icon: 'ph:phone',
          size: 'lg'
        },
        {
          name: 'noHp2',
          label: 'No. HP Alternatif (Opsional)',
          type: 'tel',
          placeholder: '+62 812-3456-7890',
          helperText: 'Nomor alternatif untuk kontak darurat.',
          icon: 'ph:phone-plus',
          size: 'lg'
        },

        // === INFORMASI ALAMAT ===
        {
          name: 'section_alamat',
          label: 'INFORMASI ALAMAT',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider'
        },
        {
          name: 'alamat',
          label: 'Alamat Lengkap',
          type: 'textarea',
          placeholder: 'Masukkan alamat lengkap (Jalan, RT/RW, Komplek, dll)',
          rows: 3,
          icon: 'ph:house',
          size: 'lg'
        },
        {
          name: 'kelurahan',
          label: 'Kelurahan/Desa',
          type: 'text',
          placeholder: 'Nama kelurahan atau desa',
          icon: 'ph:buildings',
          size: 'lg'
        },
        {
          name: 'kecamatan',
          label: 'Kecamatan',
          type: 'text',
          placeholder: 'Nama kecamatan',
          icon: 'ph:buildings',
          size: 'lg'
        },
        {
          name: 'kotaKabupaten',
          label: 'Kota/Kabupaten',
          type: 'text',
          placeholder: 'Nama kota atau kabupaten',
          icon: 'ph:city',
          size: 'lg'
        },
        {
          name: 'provinsi',
          label: 'Provinsi',
          type: 'select',
          placeholder: 'Pilih provinsi...',
          options: dynamicOptions.provinsi,
          icon: 'ph:map-trifold',
          size: 'lg'
        },
        {
          name: 'kodePos',
          label: 'Kode Pos (Opsional)',
          type: 'text',
          placeholder: '12345',
          helperText: 'Kode pos wilayah tempat tinggal.',
          icon: 'ph:envelope',
          size: 'lg'
        },

        // === INFORMASI BANK ===
        {
          name: 'section_bank',
          label: 'INFORMASI PERBANKAN',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider'
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
          helperText: 'Nomor rekening tabungan aktif.',
          icon: 'ph:credit-card',
          size: 'lg'
        },
        {
          name: 'namaBank',
          label: 'Nama Bank',
          type: 'select',
          placeholder: 'Pilih bank...',
          options: dynamicOptions.namaBank,
          icon: 'ph:bank',
          size: 'lg'
        },
        {
          name: 'cabangBank',
          label: 'Cabang Bank (Opsional)',
          type: 'text',
          placeholder: 'Nama cabang bank',
          helperText: 'Cabang bank tempat rekening dibuka.',
          icon: 'ph:buildings',
          size: 'lg'
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
        // === LATAR BELAKANG PENDIDIKAN ===
        {
          name: 'section_pendidikan',
          label: 'LATAR BELAKANG PENDIDIKAN',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider'
        },
        {
          name: 'pendidikanTerakhir',
          label: 'Pendidikan Terakhir',
          type: 'select',
          placeholder: 'Pilih pendidikan terakhir...',
          options: dynamicOptions.pendidikanTerakhir,
          icon: 'ph:certificate',
          size: 'lg'
        },
        {
          name: 'universitas',
          label: 'Nama Universitas/Institusi',
          type: 'text',
          placeholder: 'Nama universitas atau institusi pendidikan',
          helperText: 'Tempat menempuh pendidikan terakhir.',
          conditional: (data) => ['S1', 'S2', 'S3', 'D3'].includes(data.pendidikanTerakhir),
          icon: 'ph:building',
          size: 'lg'
        },
        {
          name: 'jurusan',
          label: 'Program Studi/Jurusan',
          type: 'text',
          placeholder: 'Nama program studi atau jurusan',
          conditional: (data) => ['S1', 'S2', 'S3', 'D3'].includes(data.pendidikanTerakhir),
          icon: 'ph:books',
          size: 'lg'
        },
        {
          name: 'ipk',
          label: 'IPK/Rata-rata Nilai',
          type: 'number',
          placeholder: '3.50',
          min: 2.0,
          max: 4.0,
          helperText: 'IPK dalam skala 4.0 atau rata-rata nilai.',
          conditional: (data) => ['S1', 'S2', 'S3', 'D3'].includes(data.pendidikanTerakhir),
          icon: 'ph:trophy',
          size: 'lg'
        },

        // === PENGALAMAN & KEAHLIAN ===
        {
          name: 'section_keahlian',
          label: 'PENGALAMAN & KEAHLIAN',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider'
        },
        {
          name: 'pengalamanMengajar',
          label: 'Pengalaman Mengajar (Tahun)',
          type: 'number',
          placeholder: '2',
          min: 0,
          max: 50,
          helperText: 'Total pengalaman mengajar dalam tahun (0 jika baru).',
          icon: 'ph:clock',
          size: 'lg'
        },
        {
          name: 'sertifikasi',
          label: 'Sertifikasi/Kualifikasi Khusus',
          type: 'textarea',
          placeholder: 'Sebutkan sertifikat, pelatihan, atau kualifikasi khusus yang dimiliki',
          rows: 3,
          helperText: 'Opsional: Sertifikat pendidik, kursus, atau kualifikasi lainnya.',
          icon: 'ph:medal',
          size: 'lg'
        },
        {
          name: 'tariffPerJam',
          label: 'Tarif per Jam (IDR)',
          type: 'number',
          placeholder: '150000',
          min: 50000,
          max: 1000000,
          helperText: 'Tarif mengajar per jam dalam Rupiah (Rp 50.000 - Rp 1.000.000).',
          icon: 'ph:money',
          size: 'lg'
        },
        {
          name: 'metodePengajaran',
          label: 'Metode Pengajaran',
          type: 'checkbox',
          options: dynamicOptions.metodePengajaran,
          multiple: true,
          helperText: 'Pilih metode pengajaran yang dikuasai tutor.',
          icon: 'ph:chalkboard-teacher'
        },
        {
          name: 'jadwalTersedia',
          label: 'Jadwal Tersedia',
          type: 'checkbox',
          options: dynamicOptions.jadwalTersedia,
          multiple: true,
          helperText: 'Pilih waktu-waktu tutor tersedia untuk mengajar.',
          icon: 'ph:calendar-check'
        },

        // === PROFIL & MOTIVASI ===
        {
          name: 'section_profil',
          label: 'PROFIL & MOTIVASI',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider'
        },
        {
          name: 'motivasi',
          label: 'Motivasi Menjadi Tutor',
          type: 'textarea',
          placeholder: 'Motivasi dan visi tutor sebagai educator...',
          rows: 4,
          helperText: 'Motivasi dan visi sebagai educator.',
          icon: 'ph:heart',
          size: 'lg'
        },
        {
          name: 'pengalamanLain',
          label: 'Pengalaman Lain yang Relevan',
          type: 'textarea',
          placeholder: 'Pengalaman kerja, organisasi, atau aktivitas lain yang mendukung profesi sebagai tutor...',
          rows: 3,
          helperText: 'Opsional: Pengalaman yang menunjang kemampuan mengajar.',
          icon: 'ph:briefcase',
          size: 'lg'
        },
        {
          name: 'prestasiAkademik',
          label: 'Prestasi Akademik/Non-Akademik',
          type: 'textarea',
          placeholder: 'Prestasi, penghargaan, atau pencapaian yang pernah diraih...',
          rows: 3,
          helperText: 'Opsional: Prestasi yang dapat menunjang kredibilitas sebagai tutor.',
          icon: 'ph:trophy',
          size: 'lg'
        },
        {
          name: 'bahasaYangDikuasai',
          label: 'Bahasa yang Dikuasai',
          type: 'checkbox',
          options: dynamicOptions.bahasaYangDikuasai,
          multiple: true,
          helperText: 'Pilih bahasa yang bisa digunakan tutor dalam mengajar.',
          icon: 'ph:translate'
        }
      ]
    },

    {
      id: 'subjects-areas',
      title: 'Mata Pelajaran & Wilayah',
      description: 'Pilihan mata pelajaran dan jangkauan wilayah mengajar',
      icon: 'ph:book-open',
      color: 'info',
      fields: [
        // === MATA PELAJARAN ===
        {
          name: 'section_mapel',
          label: 'MATA PELAJARAN YANG DIAJARKAN',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider'
        },
        // SD (Kelas 1-6)
        {
          name: 'mataPelajaran_SD_Kelas_1_6_',
          label: 'SD (Kelas 1-6)',
          type: 'checkbox',
          options: dynamicOptions.mataPelajaranKategori['SD (Kelas 1-6)'],
          multiple: true,
          helperText: 'Pilih mata pelajaran SD (Kelas 1-6) yang dapat diajarkan tutor.',
          icon: 'ph:graduation-cap'
        },
        // SMP (Kelas 7-9)
        {
          name: 'mataPelajaran_SMP_Kelas_7_9_',
          label: 'SMP (Kelas 7-9)',
          type: 'checkbox',
          options: dynamicOptions.mataPelajaranKategori['SMP (Kelas 7-9)'],
          multiple: true,
          helperText: 'Pilih mata pelajaran SMP (Kelas 7-9) yang dapat diajarkan tutor.',
          icon: 'ph:graduation-cap'
        },
        // SMA/SMK IPA
        {
          name: 'mataPelajaran_SMA_SMK_IPA',
          label: 'SMA/SMK IPA',
          type: 'checkbox',
          options: dynamicOptions.mataPelajaranKategori['SMA/SMK IPA'],
          multiple: true,
          helperText: 'Pilih mata pelajaran SMA/SMK IPA yang dapat diajarkan tutor.',
          icon: 'ph:graduation-cap'
        },
        // SMA/SMK IPS
        {
          name: 'mataPelajaran_SMA_SMK_IPS',
          label: 'SMA/SMK IPS',
          type: 'checkbox',
          options: dynamicOptions.mataPelajaranKategori['SMA/SMK IPS'],
          multiple: true,
          helperText: 'Pilih mata pelajaran SMA/SMK IPS yang dapat diajarkan tutor.',
          icon: 'ph:graduation-cap'
        },
        // SMK Teknik & Teknologi
        {
          name: 'mataPelajaran_SMK_Teknik_Teknologi',
          label: 'SMK Teknik & Teknologi',
          type: 'checkbox',
          options: dynamicOptions.mataPelajaranKategori['SMK Teknik & Teknologi'],
          multiple: true,
          helperText: 'Pilih mata pelajaran SMK Teknik & Teknologi yang dapat diajarkan tutor.',
          icon: 'ph:graduation-cap'
        },
        // SMK Bisnis & Manajemen
        {
          name: 'mataPelajaran_SMK_Bisnis_Manajemen',
          label: 'SMK Bisnis & Manajemen',
          type: 'checkbox',
          options: dynamicOptions.mataPelajaranKategori['SMK Bisnis & Manajemen'],
          multiple: true,
          helperText: 'Pilih mata pelajaran SMK Bisnis & Manajemen yang dapat diajarkan tutor.',
          icon: 'ph:graduation-cap'
        },
        // SMK Pariwisata & Perhotelan
        {
          name: 'mataPelajaran_SMK_Pariwisata_Perhotelan',
          label: 'SMK Pariwisata & Perhotelan',
          type: 'checkbox',
          options: dynamicOptions.mataPelajaranKategori['SMK Pariwisata & Perhotelan'],
          multiple: true,
          helperText: 'Pilih mata pelajaran SMK Pariwisata & Perhotelan yang dapat diajarkan tutor.',
          icon: 'ph:graduation-cap'
        },
        // SMK Kesehatan
        {
          name: 'mataPelajaran_SMK_Kesehatan',
          label: 'SMK Kesehatan',
          type: 'checkbox',
          options: dynamicOptions.mataPelajaranKategori['SMK Kesehatan'],
          multiple: true,
          helperText: 'Pilih mata pelajaran SMK Kesehatan yang dapat diajarkan tutor.',
          icon: 'ph:graduation-cap'
        },
        // Bahasa Asing
        {
          name: 'mataPelajaran_Bahasa_Asing',
          label: 'Bahasa Asing',
          type: 'checkbox',
          options: dynamicOptions.mataPelajaranKategori['Bahasa Asing'],
          multiple: true,
          helperText: 'Pilih mata pelajaran Bahasa Asing yang dapat diajarkan tutor.',
          icon: 'ph:graduation-cap'
        },
        // Universitas & Perguruan Tinggi
        {
          name: 'mataPelajaran_Universitas_Perguruan_Tinggi',
          label: 'Universitas & Perguruan Tinggi',
          type: 'checkbox',
          options: dynamicOptions.mataPelajaranKategori['Universitas & Perguruan Tinggi'],
          multiple: true,
          helperText: 'Pilih mata pelajaran Universitas & Perguruan Tinggi yang dapat diajarkan tutor.',
          icon: 'ph:graduation-cap'
        },
        // Keterampilan Khusus
        {
          name: 'mataPelajaran_Keterampilan_Khusus',
          label: 'Keterampilan Khusus',
          type: 'checkbox',
          options: dynamicOptions.mataPelajaranKategori['Keterampilan Khusus'],
          multiple: true,
          helperText: 'Pilih mata pelajaran Keterampilan Khusus yang dapat diajarkan tutor.',
          icon: 'ph:graduation-cap'
        },

        // === JANGKAUAN WILAYAH ===
        {
          name: 'section_wilayah',
          label: 'JANGKAUAN WILAYAH MENGAJAR',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider'
        },
        {
          name: 'wilayahKota',
          label: 'Kota/Kabupaten Mengajar',
          type: 'select',
          placeholder: 'Pilih kota/kabupaten tempat mengajar...',
          options: dynamicOptions.provinsi, // TODO: akan diganti dengan data kota dari Supabase
          helperText: 'Pilih kota atau kabupaten tempat tutor bersedia mengajar.',
          icon: 'ph:map-pin',
          size: 'lg'
        },
        {
          name: 'wilayahKecamatan',
          label: 'Kecamatan Mengajar',
          type: 'checkbox',
          options: [], // TODO: akan diisi dinamis berdasarkan pilihan kota dari Supabase
          multiple: true,
          helperText: 'Pilih kecamatan-kecamatan tempat tutor bersedia mengajar.',
          icon: 'ph:buildings',
          conditional: (data) => !!data.wilayahKota
        },
        {
          name: 'radiusMengajar',
          label: 'Radius Mengajar (KM)',
          type: 'number',
          placeholder: '10',
          min: 1,
          max: 100,
          helperText: 'Jarak maksimal yang bersedia ditempuh tutor untuk mengajar (dalam kilometer).',
          icon: 'ph:circle',
          size: 'lg'
        },
        {
          name: 'catatan_lokasi',
          label: 'Catatan Lokasi Khusus',
          type: 'textarea',
          placeholder: 'Misalnya: "Bersedia mengajar di area Jakarta Selatan dan sekitarnya, khususnya daerah Kebayoran..."',
          rows: 3,
          helperText: 'Opsional: Informasi tambahan mengenai preferensi lokasi mengajar.',
          icon: 'ph:note',
          size: 'lg'
        }
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
          className: 'section-divider'
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
          className: 'section-divider'
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
    
    {
      id: 'system',
      title: 'Sistem',
      description: 'Pengaturan akses dan sistem',
      icon: 'ph:gear',
      color: 'success',
      fields: [
        {
          name: 'section_sistem',
          label: 'PENGATURAN SISTEM',
          type: 'text',
          disabled: true,
          helperText: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
          className: 'section-divider'
        },
        {
          name: 'generate_password',
          label: 'Generate Password Otomatis',
          type: 'checkbox',
          helperText: 'Centang untuk generate password otomatis dan kirim ke email tutor.'
        },
        {
          name: 'password_manual',
          label: 'Password Manual',
          type: 'text',
          placeholder: 'Kosongkan jika ingin auto-generate',
          helperText: 'Password login untuk tutor (minimal 8 karakter).',
          conditional: (data) => !data.generate_password,
          icon: 'ph:key',
          size: 'lg'
        },
        {
          name: 'send_welcome_email',
          label: 'Kirim Email Welcome',
          type: 'checkbox',
          helperText: 'Kirim email selamat datang ke tutor setelah data tersimpan.'
        },
        {
          name: 'send_whatsapp_notification',
          label: 'Kirim Notifikasi WhatsApp',
          type: 'checkbox',
          helperText: 'Kirim notifikasi WhatsApp ke tutor setelah data tersimpan.'
        },
        {
          name: 'tanggal_bergabung',
          label: 'Tanggal Bergabung',
          type: 'date',
          helperText: 'Tanggal tutor bergabung dengan sistem (default: hari ini).',
          icon: 'ph:calendar-plus',
          size: 'lg'
        }
      ]
    }
  ]
};

// Default form data
export const defaultFormData: Partial<TutorFormData> = {
  trn: '',
  namaLengkap: '',
  tanggalLahir: '',
  jenisKelamin: '',
  email: '',
  noHp1: '',
  noHp2: '',
  alamat: '',
  kelurahan: '',
  kecamatan: '',
  kotaKabupaten: '',
  provinsi: '',
  kodePos: '',
  namaNasabah: '',
  nomorRekening: '',
  namaBank: '',
  cabangBank: '',
  pendidikanTerakhir: '',
  universitas: '',
  jurusan: '',
  ipk: undefined,
  pengalamanMengajar: 0,
  sertifikasi: '',
  tariffPerJam: 0,
  metodePengajaran: [],
  jadwalTersedia: [],
  motivasi: '',
  pengalamanLain: '',
  prestasiAkademik: '',
  bahasaYangDikuasai: [],
  
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
  
  // Teaching Area Information
  wilayahKota: '',
  wilayahKecamatan: [],
  radiusMengajar: undefined,
  catatan_lokasi: '',
  fotoProfil: null,
  dokumenIdentitas: null,
  dokumenPendidikan: null,
  dokumenSertifikat: null,
  
  // System & Status Information (Staff only)
  status_tutor: '',
  approval_level: '',
  staff_notes: '',
  
  // Document Verification (Staff only)
  status_verifikasi_identitas: '',
  status_verifikasi_pendidikan: '',
  
  // System Settings (Staff only)
  generate_password: true,
  password_manual: '',
  send_welcome_email: true,
  send_whatsapp_notification: true,
  tanggal_bergabung: ''
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