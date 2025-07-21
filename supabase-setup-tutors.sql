-- =====================================================
-- SUPABASE SETUP FOR TUTORS SYSTEM
-- =====================================================

-- Create tutors table
CREATE TABLE IF NOT EXISTS public.tutors (
    -- Primary Key
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- System & Status Information (Staff only)
    status_tutor VARCHAR(20) DEFAULT 'pending' CHECK (status_tutor IN ('active', 'inactive', 'pending', 'suspended', 'blacklisted')),
    approval_level VARCHAR(20) DEFAULT 'junior' CHECK (approval_level IN ('junior', 'senior', 'expert', 'master')),
    staff_notes TEXT,
    
    -- Personal Information
    trn VARCHAR(20) UNIQUE NOT NULL,
    nama_lengkap VARCHAR(255) NOT NULL,
    tanggal_lahir DATE,
    jenis_kelamin VARCHAR(10) CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
    email VARCHAR(255) UNIQUE,
    no_hp_1 VARCHAR(20),
    no_hp_2 VARCHAR(20),
    
    -- Address Information
    alamat TEXT,
    kelurahan VARCHAR(100),
    kecamatan VARCHAR(100),
    kota_kabupaten VARCHAR(100),
    provinsi VARCHAR(100),
    kode_pos VARCHAR(10),
    
    -- Banking Information
    nama_nasabah VARCHAR(255),
    nomor_rekening VARCHAR(50),
    nama_bank VARCHAR(100),
    cabang_bank VARCHAR(100),
    
    -- Professional Information
    pendidikan_terakhir VARCHAR(50),
    universitas VARCHAR(255),
    jurusan VARCHAR(255),
    ipk DECIMAL(3,2) CHECK (ipk BETWEEN 0 AND 4.0),
    pengalaman_mengajar INTEGER DEFAULT 0,
    sertifikasi TEXT,
    tarif_per_jam INTEGER DEFAULT 0,
    metode_pengajaran TEXT[], -- Array of strings
    jadwal_tersedia TEXT[], -- Array of strings
    
    -- Profile Information
    motivasi TEXT,
    pengalaman_lain TEXT,
    prestasi_akademik TEXT,
    bahasa_yang_dikuasai TEXT[], -- Array of strings
    
    -- Subject Information - Mata Pelajaran per Kategori
    mata_pelajaran_sd TEXT[],
    mata_pelajaran_smp TEXT[],
    mata_pelajaran_sma_ipa TEXT[],
    mata_pelajaran_sma_ips TEXT[],
    mata_pelajaran_smk_teknik TEXT[],
    mata_pelajaran_smk_bisnis TEXT[],
    mata_pelajaran_smk_pariwisata TEXT[],
    mata_pelajaran_smk_kesehatan TEXT[],
    mata_pelajaran_bahasa_asing TEXT[],
    mata_pelajaran_universitas TEXT[],
    mata_pelajaran_keterampilan TEXT[],
    
    -- Teaching Area Information
    wilayah_kota VARCHAR(100),
    wilayah_kecamatan TEXT[], -- Array of strings
    radius_mengajar INTEGER,
    catatan_lokasi TEXT,
    
    -- Document Verification (Staff only)
    status_verifikasi_identitas VARCHAR(20) DEFAULT 'pending' CHECK (status_verifikasi_identitas IN ('pending', 'verified', 'rejected', 'incomplete')),
    status_verifikasi_pendidikan VARCHAR(20) DEFAULT 'pending' CHECK (status_verifikasi_pendidikan IN ('pending', 'verified', 'rejected', 'incomplete')),
    
    -- System Settings (Staff only)
    tanggal_bergabung DATE DEFAULT CURRENT_DATE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tutors_trn ON public.tutors(trn);
CREATE INDEX IF NOT EXISTS idx_tutors_email ON public.tutors(email);
CREATE INDEX IF NOT EXISTS idx_tutors_status ON public.tutors(status_tutor);
CREATE INDEX IF NOT EXISTS idx_tutors_approval_level ON public.tutors(approval_level);
CREATE INDEX IF NOT EXISTS idx_tutors_kota ON public.tutors(wilayah_kota);
CREATE INDEX IF NOT EXISTS idx_tutors_created_at ON public.tutors(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON public.tutors
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =====================================================
-- STORAGE SETUP
-- =====================================================

-- Create storage bucket for tutor documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tutor-documents', 'tutor-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for tutor documents
CREATE POLICY "Allow authenticated users to upload tutor documents" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'tutor-documents' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to view tutor documents" ON storage.objects
FOR SELECT USING (
    bucket_id = 'tutor-documents' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to update tutor documents" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'tutor-documents' 
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to delete tutor documents" ON storage.objects
FOR DELETE USING (
    bucket_id = 'tutor-documents' 
    AND auth.role() = 'authenticated'
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on tutors table
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read all tutors
CREATE POLICY "Allow authenticated users to read tutors" ON public.tutors
FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to insert tutors
CREATE POLICY "Allow authenticated users to insert tutors" ON public.tutors
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to update tutors
CREATE POLICY "Allow authenticated users to update tutors" ON public.tutors
FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy: Allow authenticated users to delete tutors (admin only recommended)
CREATE POLICY "Allow authenticated users to delete tutors" ON public.tutors
FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Insert sample tutor data for testing
INSERT INTO public.tutors (
    trn,
    nama_lengkap,
    email,
    no_hp_1,
    status_tutor,
    approval_level,
    alamat,
    kota_kabupaten,
    provinsi,
    pendidikan_terakhir,
    pengalaman_mengajar,
    tarif_per_jam,
    mata_pelajaran_sma_ipa,
    wilayah_kota,
    motivasi
) VALUES (
    'EDU2024001',
    'John Doe',
    'john.doe@example.com',
    '+62812345678',
    'active',
    'senior',
    'Jl. Sudirman No. 123',
    'Jakarta Selatan',
    'DKI Jakarta',
    'S1',
    5,
    150000,
    ARRAY['Matematika', 'Fisika', 'Kimia'],
    'Jakarta Selatan',
    'Saya ingin membantu siswa memahami konsep matematika dan sains dengan cara yang menyenangkan dan mudah dipahami.'
) ON CONFLICT (trn) DO NOTHING;

-- =====================================================
-- FUNCTIONS FOR BUSINESS LOGIC
-- =====================================================

-- Function to generate TRN automatically
CREATE OR REPLACE FUNCTION generate_trn()
RETURNS TEXT AS $$
DECLARE
    new_trn TEXT;
    trn_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate TRN format: EDU + 7 digit timestamp
        new_trn := 'EDU' || LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 7, '0');
        
        -- Check if TRN already exists
        SELECT EXISTS(SELECT 1 FROM public.tutors WHERE trn = new_trn) INTO trn_exists;
        
        -- If TRN doesn't exist, return it
        IF NOT trn_exists THEN
            RETURN new_trn;
        END IF;
        
        -- Wait a moment before generating next TRN to ensure uniqueness
        PERFORM pg_sleep(0.001);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get tutor statistics
CREATE OR REPLACE FUNCTION get_tutor_stats()
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_tutors', COUNT(*),
        'active_tutors', COUNT(*) FILTER (WHERE status_tutor = 'active'),
        'pending_tutors', COUNT(*) FILTER (WHERE status_tutor = 'pending'),
        'verified_identity', COUNT(*) FILTER (WHERE status_verifikasi_identitas = 'verified'),
        'verified_education', COUNT(*) FILTER (WHERE status_verifikasi_pendidikan = 'verified'),
        'junior_level', COUNT(*) FILTER (WHERE approval_level = 'junior'),
        'senior_level', COUNT(*) FILTER (WHERE approval_level = 'senior'),
        'expert_level', COUNT(*) FILTER (WHERE approval_level = 'expert'),
        'master_level', COUNT(*) FILTER (WHERE approval_level = 'master')
    ) INTO stats
    FROM public.tutors;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEWS FOR REPORTING
-- =====================================================

-- View for tutor summary
CREATE OR REPLACE VIEW tutor_summary AS
SELECT 
    id,
    trn,
    nama_lengkap,
    email,
    no_hp_1,
    status_tutor,
    approval_level,
    kota_kabupaten,
    provinsi,
    pendidikan_terakhir,
    pengalaman_mengajar,
    tarif_per_jam,
    status_verifikasi_identitas,
    status_verifikasi_pendidikan,
    tanggal_bergabung,
    created_at
FROM public.tutors
ORDER BY created_at DESC;

-- View for active tutors with subjects
CREATE OR REPLACE VIEW active_tutors_with_subjects AS
SELECT 
    t.id,
    t.trn,
    t.nama_lengkap,
    t.email,
    t.no_hp_1,
    t.kota_kabupaten,
    t.tarif_per_jam,
    t.pengalaman_mengajar,
    -- Combine all subject arrays into one
    ARRAY_CAT(
        ARRAY_CAT(
            ARRAY_CAT(
                ARRAY_CAT(t.mata_pelajaran_sd, t.mata_pelajaran_smp),
                ARRAY_CAT(t.mata_pelajaran_sma_ipa, t.mata_pelajaran_sma_ips)
            ),
            ARRAY_CAT(
                ARRAY_CAT(t.mata_pelajaran_smk_teknik, t.mata_pelajaran_smk_bisnis),
                ARRAY_CAT(t.mata_pelajaran_smk_pariwisata, t.mata_pelajaran_smk_kesehatan)
            )
        ),
        ARRAY_CAT(
            ARRAY_CAT(t.mata_pelajaran_bahasa_asing, t.mata_pelajaran_universitas),
            t.mata_pelajaran_keterampilan
        )
    ) AS all_subjects,
    t.wilayah_kecamatan,
    t.radius_mengajar,
    t.created_at
FROM public.tutors t
WHERE t.status_tutor = 'active'
  AND t.status_verifikasi_identitas = 'verified'
ORDER BY t.created_at DESC;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'SUPABASE SETUP COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Tables created: tutors';
    RAISE NOTICE 'Storage bucket: tutor-documents';
    RAISE NOTICE 'Views created: tutor_summary, active_tutors_with_subjects';
    RAISE NOTICE 'Functions created: generate_trn(), get_tutor_stats()';
    RAISE NOTICE 'RLS policies: Enabled with authentication required';
    RAISE NOTICE '===========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test the form submission';
    RAISE NOTICE '2. Verify file uploads to storage';
    RAISE NOTICE '3. Configure authentication if needed';
    RAISE NOTICE '4. Set up email/WhatsApp notifications';
    RAISE NOTICE '===========================================';
END $$; 