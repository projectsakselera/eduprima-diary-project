'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  GraduationCap, 
  Calendar,
  Save,
  X,
  Plus,
  Eye,
  Award,
  Camera,
  BookOpen,
  Clock,
  Users,
  CreditCard,
  FileText,
  Phone,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "@/components/navigation";
import { useParams, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function EditTutorPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const tutorId = params?.id as string;

  const [formData, setFormData] = useState({
    fotoProfil: null as File | string | null,
    fotoProfilPreview: null as string | null,
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    gender: '',
    religion: '',
    namaPanggilan: '',
    noHp2: '',
    headline: '',
    motivasiMenjadiTutor: '',
    socialMedia1: '',
    socialMedia2: '',
    education: '',
    experience: '',
    subjects: [] as string[],
    skills: [] as string[],
    availability: [] as string[],
    bio: '',
    hourlyRate: '',
    status: 'active',
    alamatSamaDenganKTP: false,
    provinsiDomisili: '',
    kotaKabupatenDomisili: '',
    kecamatanDomisili: '',
    kelurahanDomisili: '',
    alamatLengkapDomisili: '',
    kodePosDomisili: '',
    provinsiKTP: '',
    kotaKabupatenKTP: '',
    kecamatanKTP: '',
    kelurahanKTP: '',
    alamatLengkapKTP: '',
    kodePosKTP: '',
    // Education fields
    statusAkademik: '',
    namaUniversitas: '',
    fakultas: '',
    jurusan: '',
    ipk: '',
    tahunMasuk: '',
    tahunLulus: '',
    namaUniversitasS1: '',
    fakultasS1: '',
    jurusanS1: '',
    namaSMA: '',
    jurusanSMA: '',
    jurusanSMKDetail: '',
    tahunLulusSMA: '',
    namaInstitusi: '',
    bidangKeahlian: '',
    pengalamanBelajar: '',
    // Professional fields
    keahlianSpesialisasi: '',
    keahlianLainnya: '',
    pengalamanMengajar: '',
    pengalamanLainRelevan: '',
    prestasiAkademik: '',
    prestasiNonAkademik: '',
    sertifikasiPelatihan: '',
    // Programs fields
    selectedPrograms: [] as string[],
    mataPelajaranLainnya: ''
  });

  const [newSubject, setNewSubject] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [programs, setPrograms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Location data states
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [ktpCities, setKtpCities] = useState<any[]>([]);
  
  // Raw location names from tutor data (before mapping to IDs)
  const [rawLocationData, setRawLocationData] = useState<any>(null);

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'English', 'Indonesian', 'History', 'Geography',
    'Economics', 'Accounting', 'Computer Science', 'Art'
  ];

  const skillOptions = [
    'Public Speaking', 'Problem Solving', 'Critical Thinking',
    'Communication', 'Leadership', 'Time Management',
    'Adaptability', 'Creativity', 'Teamwork', 'Analytical Skills'
  ];

  const availabilityOptions = [
    'Monday Morning', 'Monday Afternoon', 'Monday Evening',
    'Tuesday Morning', 'Tuesday Afternoon', 'Tuesday Evening',
    'Wednesday Morning', 'Wednesday Afternoon', 'Wednesday Evening',
    'Thursday Morning', 'Thursday Afternoon', 'Thursday Evening',
    'Friday Morning', 'Friday Afternoon', 'Friday Evening',
    'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening',
    'Sunday Morning', 'Sunday Afternoon', 'Sunday Evening'
  ];

  // Fetch categories and programs
  useEffect(() => {
    const fetchProgramsData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await fetch('/api/subjects/categories');
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.data || categoriesData.categories || []);
        }

        // Fetch programs from program_unit table
        const programsResponse = await fetch('/api/programs/lookup?limit=1000');
        if (programsResponse.ok) {
          const programsData = await programsResponse.json();
          setPrograms(programsData.data || programsData.programs || []);
        }
      } catch (error) {
        console.error('Failed to fetch programs data:', error);
      }
    };

    fetchProgramsData();
  }, []);

  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('/api/locations/provinces');
        if (response.ok) {
          const data = await response.json();
          setProvinces(data.provinces || []);
        }
      } catch (error) {
        console.error('Failed to fetch provinces:', error);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch cities when domicile province changes
  useEffect(() => {
    const fetchCities = async () => {
      if (formData.provinsiDomisili) {
        try {
          const response = await fetch(`/api/locations/cities?province_id=${formData.provinsiDomisili}`);
          if (response.ok) {
            const data = await response.json();
            setCities(data.cities || []);
          }
        } catch (error) {
          console.error('Failed to fetch cities:', error);
        }
      } else {
        setCities([]);
      }
    };

    fetchCities();
  }, [formData.provinsiDomisili]);

  // Fetch KTP cities when KTP province changes
  useEffect(() => {
    const fetchKtpCities = async () => {
      if (formData.provinsiKTP) {
        try {
          const response = await fetch(`/api/locations/cities?province_id=${formData.provinsiKTP}`);
          if (response.ok) {
            const data = await response.json();
            setKtpCities(data.cities || []);
          }
        } catch (error) {
          console.error('Failed to fetch KTP cities:', error);
        }
      } else {
        setKtpCities([]);
      }
    };

    fetchKtpCities();
  }, [formData.provinsiKTP]);

  useEffect(() => {
    const fetchTutorData = async () => {
      try {
      setIsLoading(true);
        if (!tutorId) return;

        // Fetch tutor data and profile photo from document_storage
        const [tutorResponse, profilePhotoResponse] = await Promise.all([
          fetch('/api/tutors/spreadsheet'),
          fetch(`/api/tutors/documents?userId=${tutorId}&documentType=profile_photo`)
        ]);
        
        const tutorResult = await tutorResponse.json();
        const photoResult = profilePhotoResponse.ok ? await profilePhotoResponse.json() : null;

        if (tutorResult?.success && Array.isArray(tutorResult.data)) {
          const tutor = tutorResult.data.find((t: any) => t.id === tutorId);
          if (tutor) {
            // Store raw location data for later mapping (only Province & City need mapping to IDs)
            setRawLocationData({
              provinsiDomisili: tutor.provinsiDomisili,
              kotaKabupatenDomisili: tutor.kotaKabupatenDomisili,
              provinsiKTP: tutor.provinsiKTP,
              kotaKabupatenKTP: tutor.kotaKabupatenKTP,
            });

            // Get profile photo URL from document_storage
            const rawProfilePhotoUrl = photoResult?.success && photoResult?.documents?.[0]?.file_url;
            const profilePhotoUrl = rawProfilePhotoUrl ? getProxiedImageUrl(rawProfilePhotoUrl) : null;
            
            console.log('📷 Loaded existing profile photo:', rawProfilePhotoUrl, '→', profilePhotoUrl);
            
            setFormData(prev => ({
              ...prev,
              fotoProfil: profilePhotoUrl || prev.fotoProfil,
              fotoProfilPreview: profilePhotoUrl || prev.fotoProfilPreview,
              name: tutor.namaLengkap || prev.name,
              email: tutor.email || prev.email,
              phone: tutor.noHp1 || prev.phone,
              address: tutor.alamatLengkapDomisili || prev.address,
              birthDate: tutor.tanggalLahir || prev.birthDate,
              gender: tutor.jenisKelamin || prev.gender,
              religion: tutor.agama || prev.religion,
              namaPanggilan: tutor.namaPanggilan || prev.namaPanggilan,
              noHp2: tutor.noHp2 || prev.noHp2,
              headline: tutor.headline || prev.headline,
              motivasiMenjadiTutor: tutor.motivasiMenjadiTutor || prev.motivasiMenjadiTutor,
              socialMedia1: tutor.socialMedia1 || prev.socialMedia1,
              socialMedia2: tutor.socialMedia2 || prev.socialMedia2,
              bio: tutor.deskripsiDiri || prev.bio,
              hourlyRate: tutor.hourly_rate ? String(tutor.hourly_rate) : prev.hourlyRate,
              status: tutor.status_tutor || prev.status,
              availability: Array.isArray(tutor.available_schedule) ? tutor.available_schedule : prev.availability,
              alamatSamaDenganKTP: Boolean(tutor.alamatSamaDenganKTP) || false,
              // Location fields - Province & City will be mapped to IDs, District & Village stay as text
              provinsiDomisili: prev.provinsiDomisili,
              kotaKabupatenDomisili: prev.kotaKabupatenDomisili,
              kecamatanDomisili: tutor.kecamatanDomisili || prev.kecamatanDomisili,
              kelurahanDomisili: tutor.kelurahanDomisili || prev.kelurahanDomisili,
              alamatLengkapDomisili: tutor.alamatLengkapDomisili || prev.alamatLengkapDomisili,
              kodePosDomisili: tutor.kodePosDomisili || prev.kodePosDomisili,
              provinsiKTP: prev.provinsiKTP,
              kotaKabupatenKTP: prev.kotaKabupatenKTP,
              kecamatanKTP: tutor.kecamatanKTP || prev.kecamatanKTP,
              kelurahanKTP: tutor.kelurahanKTP || prev.kelurahanKTP,
              alamatLengkapKTP: tutor.alamatLengkapKTP || prev.alamatLengkapKTP,
              kodePosKTP: tutor.kodePosKTP || prev.kodePosKTP,
              // Education fields
              statusAkademik: tutor.statusAkademik || prev.statusAkademik,
              namaUniversitas: tutor.namaUniversitas || prev.namaUniversitas,
              fakultas: tutor.fakultas || prev.fakultas,
              jurusan: tutor.jurusan || prev.jurusan,
              ipk: tutor.ipk || prev.ipk,
              tahunMasuk: tutor.tahunMasuk || prev.tahunMasuk,
              tahunLulus: tutor.tahunLulus || prev.tahunLulus,
              namaUniversitasS1: tutor.namaUniversitasS1 || prev.namaUniversitasS1,
              fakultasS1: tutor.fakultasS1 || prev.fakultasS1,
              jurusanS1: tutor.jurusanS1 || prev.jurusanS1,
              namaSMA: tutor.namaSMA || prev.namaSMA,
              jurusanSMA: tutor.jurusanSMA || prev.jurusanSMA,
              jurusanSMKDetail: tutor.jurusanSMKDetail || prev.jurusanSMKDetail,
              tahunLulusSMA: tutor.tahunLulusSMA || prev.tahunLulusSMA,
              namaInstitusi: tutor.namaInstitusi || prev.namaInstitusi,
              bidangKeahlian: tutor.bidangKeahlian || prev.bidangKeahlian,
              pengalamanBelajar: tutor.pengalamanBelajar || prev.pengalamanBelajar,
              // Professional fields
              keahlianSpesialisasi: tutor.keahlianSpesialisasi || prev.keahlianSpesialisasi,
              keahlianLainnya: tutor.keahlianLainnya || prev.keahlianLainnya,
              pengalamanMengajar: tutor.pengalamanMengajar || prev.pengalamanMengajar,
              pengalamanLainRelevan: tutor.pengalamanLainRelevan || prev.pengalamanLainRelevan,
              prestasiAkademik: tutor.prestasiAkademik || prev.prestasiAkademik,
              prestasiNonAkademik: tutor.prestasiNonAkademik || prev.prestasiNonAkademik,
              sertifikasiPelatihan: tutor.sertifikasiPelatihan || prev.sertifikasiPelatihan,
              selectedPrograms: Array.isArray(tutor.selectedPrograms) ? tutor.selectedPrograms : prev.selectedPrograms,
              mataPelajaranLainnya: tutor.mataPelajaranLainnya || prev.mataPelajaranLainnya,
            }));
          }
        }
      } catch (e) {
        console.error('Failed to fetch tutor for edit:', e);
      } finally {
        setIsLoading(false);
      }
    };

    if (tutorId) {
      fetchTutorData();
    }
  }, [tutorId]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (formData.fotoProfilPreview && formData.fotoProfilPreview.startsWith('blob:')) {
        URL.revokeObjectURL(formData.fotoProfilPreview);
      }
    };
  }, [formData.fotoProfilPreview]);

  // Helper function to convert R2 URL to proxy URL for SSL issues
  const getProxiedImageUrl = (url: string) => {
    if (!url) return url;
    
    // If it's an R2 URL with SSL issues, use our proxy
    if (url.includes('pub-10086fa546715dab7f29deb601272699.r2.dev')) {
      const proxiedUrl = `/api/images/proxy?url=${encodeURIComponent(url)}`;
      console.log('🔄 Converting R2 URL to proxy:', url, '→', proxiedUrl);
      return proxiedUrl;
    }
    
    return url;
  };

  // Helper function to find location ID by name
  const findLocationId = (locationArray: any[], locationName: string) => {
    if (!locationName || !Array.isArray(locationArray)) {
      console.log('❌ findLocationId: Invalid input', { locationName, arrayLength: locationArray?.length });
      return '';
    }
    
    console.log('🔍 Searching for location:', locationName, 'in', locationArray.length, 'items');
    
    const location = locationArray.find(item => {
      const matches = item.label === locationName || 
                     item.local_name === locationName ||
                     item.label?.toLowerCase() === locationName.toLowerCase() ||
                     item.local_name?.toLowerCase() === locationName.toLowerCase();
      
      if (matches) {
        console.log('✅ Found match:', { 
          searchName: locationName, 
          foundLabel: item.label, 
          foundLocalName: item.local_name,
          id: item.value 
        });
      }
      
      return matches;
    });
    
    if (!location) {
      console.log('❌ No match found for:', locationName);
      console.log('Available options:', locationArray.map(item => ({ label: item.label, local_name: item.local_name })).slice(0, 5));
    }
    
    return location?.value || '';
  };

  // Map location names to IDs when all location data is loaded
  useEffect(() => {
    const mapLocationData = async () => {
      if (!rawLocationData || provinces.length === 0) return;

      console.log('🗺️ Mapping location data:', rawLocationData);

      // Map province
      const provinsiDomisiliId = findLocationId(provinces, rawLocationData.provinsiDomisili);
      const provinsiKTPId = findLocationId(provinces, rawLocationData.provinsiKTP);

      console.log('📍 Province mapping:', {
        domisili: `${rawLocationData.provinsiDomisili} → ${provinsiDomisiliId}`,
        ktp: `${rawLocationData.provinsiKTP} → ${provinsiKTPId}`
      });

      // Update form data with province IDs
      setFormData(prev => ({
        ...prev,
        provinsiDomisili: provinsiDomisiliId,
        provinsiKTP: provinsiKTPId,
      }));

      // Fetch cities for both provinces if they exist
      if (provinsiDomisiliId) {
        try {
          const response = await fetch(`/api/locations/cities?province_id=${provinsiDomisiliId}`);
          if (response.ok) {
            const data = await response.json();
            const domicileCities = data.cities || [];
            setCities(domicileCities);

            // Map city for domisili
            const kotaDomisiliId = findLocationId(domicileCities, rawLocationData.kotaKabupatenDomisili);
            console.log('🏙️ Domisili city mapping:', `${rawLocationData.kotaKabupatenDomisili} → ${kotaDomisiliId}`);
            
            if (kotaDomisiliId) {
              setFormData(prev => ({ ...prev, kotaKabupatenDomisili: kotaDomisiliId }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch domisili location data:', error);
        }
      }

      // Do the same for KTP if different from domisili
      if (provinsiKTPId && provinsiKTPId !== provinsiDomisiliId) {
        try {
          const response = await fetch(`/api/locations/cities?province_id=${provinsiKTPId}`);
          if (response.ok) {
            const data = await response.json();
            const ktpCitiesData = data.cities || [];
            setKtpCities(ktpCitiesData);

            // Map city for KTP
            const kotaKTPId = findLocationId(ktpCitiesData, rawLocationData.kotaKabupatenKTP);
            console.log('🏙️ KTP city mapping:', `${rawLocationData.kotaKabupatenKTP} → ${kotaKTPId}`);
            
            if (kotaKTPId) {
              setFormData(prev => ({ ...prev, kotaKabupatenKTP: kotaKTPId }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch KTP location data:', error);
        }
      }
    };

    mapLocationData();
  }, [provinces, rawLocationData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear dependent location fields when parent changes (only for dropdowns)
      if (field === 'provinsiDomisili') {
        newData.kotaKabupatenDomisili = '';
      } else if (field === 'provinsiKTP') {
        newData.kotaKabupatenKTP = '';
      }
      
      return newData;
    });
  };

  const handleFileUpload = async (name: string, file: File | null) => {
    if (file && name === 'fotoProfil') {
      console.log('📁 File selected:', file.name, file.size, 'bytes');
      
      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      console.log('👀 Created local preview URL:', previewUrl);
      
      setFormData(prev => {
        console.log('🔄 Setting local preview in state');
        return {
          ...prev,
          [name]: file,
          [`${name}Preview`]: previewUrl
        };
      });

      // Upload to Cloudflare R2 via API
      try {
        setIsUploadingPhoto(true);
        console.log('📤 Uploading profile photo to R2...');
        
        const uploadFormData = new FormData();
        uploadFormData.append('files', file);
        uploadFormData.append('fileTypes', 'profile_photo');
        uploadFormData.append('userId', tutorId); // Use tutor ID as user ID
        
        const response = await fetch('/api/upload/tutor-files', {
          method: 'POST',
          body: uploadFormData
        });
        
        const result = await response.json();
        
        if (result.success && result.results?.[0]?.success) {
          const rawUploadedUrl = result.results[0].publicUrl;
          const uploadedUrl = getProxiedImageUrl(rawUploadedUrl);
          
          console.log('✅ Profile photo uploaded successfully:', rawUploadedUrl);
          console.log('📝 Updating form state with proxied URL:', uploadedUrl);
          
          // Update form data with the uploaded URL
          setFormData(prev => {
            console.log('🔄 Current fotoProfil state:', prev.fotoProfil);
            console.log('🔄 Current fotoProfilPreview state:', prev.fotoProfilPreview);
            
            const newState = {
              ...prev,
              fotoProfil: uploadedUrl, // Store the proxied URL
              fotoProfilPreview: uploadedUrl // Use proxied URL as preview too
            };
            
            console.log('✅ New fotoProfil state:', newState.fotoProfil);
            console.log('✅ New fotoProfilPreview state:', newState.fotoProfilPreview);
            return newState;
          });
          
          // Clean up local preview URL after a delay to ensure R2 URL is loaded
          setTimeout(() => {
            URL.revokeObjectURL(previewUrl);
            console.log('🧹 Cleaned up local preview URL');
          }, 2000);
        } else {
          console.error('❌ Upload failed:', result.error || result);
          console.error('❌ Full result:', JSON.stringify(result, null, 2));
          // Keep the local preview for now
        }
      } catch (error) {
        console.error('❌ Upload error:', error);
        // Keep the local preview for now
      } finally {
        setIsUploadingPhoto(false);
      }
    } else {
    setFormData(prev => ({
      ...prev,
        [name]: file,
        [`${name}Preview`]: null
    }));
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleAvailabilityToggle = (time: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(time)
        ? prev.availability.filter(t => t !== time)
        : [...prev.availability, time]
    }));
  };

  const addCustomSubject = () => {
    if (newSubject && !formData.subjects.includes(newSubject)) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject]
      }));
      setNewSubject('');
    }
  };

  const addCustomSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const removeSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }));
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Updated form data:', formData);
    // In real app, this would be: await updateTutor(tutorId, formData);
    // Navigate back to database tutor page
    router.push('/eduprima/main/ops/em/database-tutor');
  };

  const handleCancel = () => {
    router.push('/eduprima/main/ops/em/database-tutor');
  };

  const handleView = () => {
    router.push(`/eduprima/main/ops/em/database-tutor/view/${tutorId}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Tutor</h1>
            <p className="text-muted-foreground">Loading tutor data...</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Tutor</h1>
          <p className="text-muted-foreground">
            Update tutor information in the database
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleView}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            Update Tutor
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue={searchParams?.get('tab') ?? 'personal'} onValueChange={(v) => router.replace(`?tab=${v}`)}>
          <div className="relative">
            <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400">
              <TabsList className="flex gap-3 w-max min-w-full p-2">
                <TabsTrigger 
                  value="personal" 
                  title="Personal Information"
                  className="group relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg p-3 min-w-[90px] flex flex-col items-center gap-2 cursor-pointer hover:bg-muted transition-all shrink-0"
                >
                  <User className="h-6 w-6" />
                  <span className="text-xs font-medium whitespace-nowrap">Personal</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="education" 
                  title="Education Background"
                  className="group relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg p-3 min-w-[90px] flex flex-col items-center gap-2 cursor-pointer hover:bg-muted transition-all shrink-0"
                >
                  <GraduationCap className="h-6 w-6" />
                  <span className="text-xs font-medium whitespace-nowrap">Education</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="professional" 
                  title="Professional Experience"
                  className="group relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg p-3 min-w-[90px] flex flex-col items-center gap-2 cursor-pointer hover:bg-muted transition-all shrink-0"
                >
                  <Award className="h-6 w-6" />
                  <span className="text-xs font-medium whitespace-nowrap">Experience</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="programs" 
                  title="Programs & Subjects"
                  className="group relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg p-3 min-w-[90px] flex flex-col items-center gap-2 cursor-pointer hover:bg-muted transition-all shrink-0"
                >
                  <BookOpen className="h-6 w-6" />
                  <span className="text-xs font-medium whitespace-nowrap">Programs</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="availability" 
                  title="Schedule & Availability"
                  className="group relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg p-3 min-w-[90px] flex flex-col items-center gap-2 cursor-pointer hover:bg-muted transition-all shrink-0"
                >
                  <Clock className="h-6 w-6" />
                  <span className="text-xs font-medium whitespace-nowrap">Schedule</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences" 
                  title="Teaching Preferences"
                  className="group relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg p-3 min-w-[90px] flex flex-col items-center gap-2 cursor-pointer hover:bg-muted transition-all shrink-0"
                >
                  <Users className="h-6 w-6" />
                  <span className="text-xs font-medium whitespace-nowrap">Preferences</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="banking" 
                  title="Banking Information"
                  className="group relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg p-3 min-w-[90px] flex flex-col items-center gap-2 cursor-pointer hover:bg-muted transition-all shrink-0"
                >
                  <CreditCard className="h-6 w-6" />
                  <span className="text-xs font-medium whitespace-nowrap">Banking</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  title="Documents & Files"
                  className="group relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg p-3 min-w-[90px] flex flex-col items-center gap-2 cursor-pointer hover:bg-muted transition-all shrink-0"
                >
                  <FileText className="h-6 w-6" />
                  <span className="text-xs font-medium whitespace-nowrap">Documents</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="emergency" 
                  title="Emergency Contact"
                  className="group relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg p-3 min-w-[90px] flex flex-col items-center gap-2 cursor-pointer hover:bg-muted transition-all shrink-0"
                >
                  <Phone className="h-6 w-6" />
                  <span className="text-xs font-medium whitespace-nowrap">Emergency</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="system" 
                  title="System Management"
                  className="group relative data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg p-3 min-w-[90px] flex flex-col items-center gap-2 cursor-pointer hover:bg-muted transition-all shrink-0"
                >
                  <AlertCircle className="h-6 w-6" />
                  <span className="text-xs font-medium whitespace-nowrap">System</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="personal" className="space-y-6">
            {/* Profile Photo Section */}
        <Card>
          <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-purple-600" />
                  Profile Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-gray-200 overflow-hidden bg-gray-100">
                                          {(() => {
                      const rawPhotoUrl = formData.fotoProfilPreview || formData.fotoProfil;
                      const photoUrl = rawPhotoUrl && typeof rawPhotoUrl === 'string' ? getProxiedImageUrl(rawPhotoUrl) : null;
                      
                      console.log('🖼️ Raw photo URL:', rawPhotoUrl);
                      console.log('🖼️ Proxied photo URL:', photoUrl);
                      console.log('🖼️ fotoProfil type:', typeof formData.fotoProfil);
                      console.log('🖼️ fotoProfilPreview type:', typeof formData.fotoProfilPreview);
                      
                      if (photoUrl && typeof photoUrl === 'string') {
                        return (
                          <img
                            src={photoUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                            onLoad={() => console.log('✅ Photo loaded successfully via proxy:', photoUrl)}
                            onError={(e) => {
                              console.error('❌ Photo failed to load even via proxy:', photoUrl);
                              console.error('❌ Original URL:', rawPhotoUrl);
                              console.error('❌ Error event:', e);
                            }}
                            crossOrigin="anonymous"
                            referrerPolicy="no-referrer"
                          />
                        );
                      } else {
                        console.log('❌ No valid photo URL found');
                        return (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="h-16 w-16 text-gray-400" />
                          </div>
                        );
                      }
                    })()}
                    </div>
                                      <Button
                    type="button"
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full"
                    onClick={() => document.getElementById('fotoProfil')?.click()}
                    disabled={isUploadingPhoto}
                  >
                    {isUploadingPhoto ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </Button>
                  </div>
                  <div className="text-center">
                    <input
                      id="fotoProfil"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        handleFileUpload('fotoProfil', file);
                      }}
                    />
                    <p className="text-sm text-muted-foreground">
                      {isUploadingPhoto ? 'Uploading to Cloudflare R2...' : 'Upload tutor photo. JPG, PNG format maximum 2MB.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Personal Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Basic Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter full name as on ID card" required />
              </div>
              <div className="space-y-2">
                    <Label htmlFor="namaPanggilan">Nickname</Label>
                    <Input id="namaPanggilan" value={formData.namaPanggilan} onChange={(e) => handleInputChange('namaPanggilan', e.target.value)} placeholder="Nickname or preferred name" />
                    <p className="text-xs text-muted-foreground">Name that will be displayed to students and parents.</p>
              </div>
              <div className="space-y-2">
                    <Label htmlFor="birthDate">Date of Birth *</Label>
                    <Input id="birthDate" type="date" value={formData.birthDate} onChange={(e) => handleInputChange('birthDate', e.target.value)} required />
              </div>
              <div className="space-y-2">
                    <Label htmlFor="gender">Gender *</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
              </div>
                  <div className="space-y-2">
                    <Label htmlFor="religion">Religion</Label>
                    <Select value={formData.religion} onValueChange={(value) => handleInputChange('religion', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select religion..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="islam">Islam</SelectItem>
                        <SelectItem value="kristen_protestan">Kristen Protestan</SelectItem>
                        <SelectItem value="kristen_katolik">Kristen Katolik</SelectItem>
                        <SelectItem value="hindu">Hindu</SelectItem>
                        <SelectItem value="buddha">Buddha</SelectItem>
                        <SelectItem value="konghucu">Konghucu</SelectItem>
                        <SelectItem value="lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Religion choice for user demographics purposes.</p>
            </div>
            <div className="space-y-2">
                    <Label htmlFor="email">Active Email *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="name@gmail.com" required />
                    <p className="text-xs text-muted-foreground">(Must be Gmail / Google)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp Number *</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="811234567890" required />
                    <p className="text-xs text-muted-foreground">Active WhatsApp number. No spaces/dashes, don't start with 0. Example: 811234567890</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="noHp2">Alternative Phone (Optional)</Label>
                    <Input id="noHp2" value={formData.noHp2} onChange={(e) => handleInputChange('noHp2', e.target.value)} placeholder="811234567890" />
                    <p className="text-xs text-muted-foreground">Alternative number for emergency contact.</p>
                  </div>
            </div>
          </CardContent>
        </Card>

            {/* Address Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Domicile Address */}
        <Card>
          <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    Domicile Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                      <Label htmlFor="provinsiDomisili">Province</Label>
                      <Select value={formData.provinsiDomisili} onValueChange={(value) => handleInputChange('provinsiDomisili', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select province..." />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province.value} value={province.value}>
                              {province.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
              </div>
              <div className="space-y-2">
                      <Label htmlFor="kotaKabupatenDomisili">City/Regency</Label>
                      <Select value={formData.kotaKabupatenDomisili} onValueChange={(value) => handleInputChange('kotaKabupatenDomisili', value)} disabled={!formData.provinsiDomisili}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select city/regency..." />
                        </SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.value} value={city.value}>
                              {city.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
              </div>
                    <div className="space-y-2">
                      <Label htmlFor="kecamatanDomisili">District</Label>
                      <Input id="kecamatanDomisili" value={formData.kecamatanDomisili} onChange={(e) => handleInputChange('kecamatanDomisili', e.target.value)} placeholder="Enter district name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kelurahanDomisili">Village</Label>
                      <Input id="kelurahanDomisili" value={formData.kelurahanDomisili} onChange={(e) => handleInputChange('kelurahanDomisili', e.target.value)} placeholder="Enter village name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="alamatLengkapDomisili">Complete Address</Label>
                      <Textarea id="alamatLengkapDomisili" value={formData.alamatLengkapDomisili} onChange={(e) => handleInputChange('alamatLengkapDomisili', e.target.value)} rows={3} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kodePosDomisili">Postal Code</Label>
                      <Input id="kodePosDomisili" value={formData.kodePosDomisili} onChange={(e) => handleInputChange('kodePosDomisili', e.target.value)} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* KTP Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    ID Card Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="alamatSamaDenganKTP" checked={formData.alamatSamaDenganKTP} onCheckedChange={(checked) => handleInputChange('alamatSamaDenganKTP', Boolean(checked))} />
                    <Label htmlFor="alamatSamaDenganKTP">Same as domicile address</Label>
                  </div>
                  
                  {!formData.alamatSamaDenganKTP && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="provinsiKTP">Province</Label>
                          <Select value={formData.provinsiKTP} onValueChange={(value) => handleInputChange('provinsiKTP', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select province..." />
                            </SelectTrigger>
                            <SelectContent>
                              {provinces.map((province) => (
                                <SelectItem key={province.value} value={province.value}>
                                  {province.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kotaKabupatenKTP">City/Regency</Label>
                          <Select value={formData.kotaKabupatenKTP} onValueChange={(value) => handleInputChange('kotaKabupatenKTP', value)} disabled={!formData.provinsiKTP}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city/regency..." />
                            </SelectTrigger>
                            <SelectContent>
                              {ktpCities.map((city) => (
                                <SelectItem key={city.value} value={city.value}>
                                  {city.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kecamatanKTP">District</Label>
                          <Input id="kecamatanKTP" value={formData.kecamatanKTP} onChange={(e) => handleInputChange('kecamatanKTP', e.target.value)} placeholder="Enter district name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kelurahanKTP">Village</Label>
                          <Input id="kelurahanKTP" value={formData.kelurahanKTP} onChange={(e) => handleInputChange('kelurahanKTP', e.target.value)} placeholder="Enter village name" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="alamatLengkapKTP">Complete Address</Label>
                          <Textarea id="alamatLengkapKTP" value={formData.alamatLengkapKTP} onChange={(e) => handleInputChange('alamatLengkapKTP', e.target.value)} rows={3} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="kodePosKTP">Postal Code</Label>
                          <Input id="kodePosKTP" value={formData.kodePosKTP} onChange={(e) => handleInputChange('kodePosKTP', e.target.value)} />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile & Value Proposition */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Profile & Value Proposition
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline/Tagline Tutor</Label>
                  <Input id="headline" value={formData.headline} onChange={(e) => handleInputChange('headline', e.target.value)} placeholder="Experienced Math Teacher | UTBK & OSN Specialist | Fun Learning Method" />
                  <p className="text-xs text-muted-foreground">Short value proposition that attracts students and parents. Maximum 100 characters.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio/Description</Label>
                  <Textarea id="bio" value={formData.bio} onChange={(e) => handleInputChange('bio', e.target.value)} placeholder="I'm a Mathematics graduate from UI with 5 years of teaching experience. I've guided 200+ students into top universities. I use visual methods and games to make math enjoyable. My students average 30-point improvement in 3 months." rows={4} />
                  <p className="text-xs text-muted-foreground">Tell about your experience, unique methods, or achievements that make you different from other tutors.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motivasiMenjadiTutor">Motivation to Become a Tutor</Label>
                  <Textarea id="motivasiMenjadiTutor" value={formData.motivasiMenjadiTutor} onChange={(e) => handleInputChange('motivasiMenjadiTutor', e.target.value)} placeholder="Tell us why you're interested in teaching and your vision as an educator..." rows={6} />
                  <p className="text-xs text-muted-foreground">Tell us why you're interested in teaching and your vision as an educator. Your answer will be an important part of your public profile page to show your passion. (Recommended 300-1500 characters).</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="socialMedia1">Social Media Link 1 (Optional)</Label>
                    <Input id="socialMedia1" value={formData.socialMedia1} onChange={(e) => handleInputChange('socialMedia1', e.target.value)} placeholder="https://www.instagram.com/username or https://www.linkedin.com/in/username" />
                    <p className="text-xs text-muted-foreground">Instagram, LinkedIn, or other professional social media link to add credibility.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="socialMedia2">Social Media Link 2 (Optional)</Label>
                    <Input id="socialMedia2" value={formData.socialMedia2} onChange={(e) => handleInputChange('socialMedia2', e.target.value)} placeholder="https://www.youtube.com/channel/xxx or https://www.tiktok.com/@username" />
                    <p className="text-xs text-muted-foreground">Second social media link (YouTube, TikTok, Facebook, etc) to show online teaching activities.</p>
                  </div>
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="education" className="space-y-6">
            {/* Higher Education & High School */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                    Higher Education
                  </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="statusAkademik">Academic Status</Label>
                    <Select value={formData.statusAkademik} onValueChange={(value) => handleInputChange('statusAkademik', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your current academic status..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mahasiswa_s1">Active S1/D4 Student</SelectItem>
                        <SelectItem value="mahasiswa_s2">Active S2/S3 Student</SelectItem>
                        <SelectItem value="lulusan_s1">S1/D4 Graduate</SelectItem>
                        <SelectItem value="lulusan_s2">S2/S3 Graduate</SelectItem>
                        <SelectItem value="lulusan_d3">D3 Graduate</SelectItem>
                        <SelectItem value="lulusan_sma">High School Graduate</SelectItem>
                        <SelectItem value="lainnya">Others</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Choose the status that best describes your current situation.</p>
                </div>
                  {/* S1 Background (for S2/S3 students only) */}
                  {['mahasiswa_s2', 'lulusan_s2'].includes(formData.statusAkademik) && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">S1 BACKGROUND</Label>
                        <p className="text-xs text-muted-foreground">Required for S2/S3 students - your previous S1 education</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="namaUniversitasS1">S1 University Name *</Label>
                        <Input id="namaUniversitasS1" value={formData.namaUniversitasS1} onChange={(e) => handleInputChange('namaUniversitasS1', e.target.value)} placeholder="e.g., Universitas Gadjah Mada" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fakultasS1">S1 Faculty</Label>
                        <Input id="fakultasS1" value={formData.fakultasS1} onChange={(e) => handleInputChange('fakultasS1', e.target.value)} placeholder="e.g., Fakultas Teknik" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jurusanS1">S1 Major *</Label>
                        <Input id="jurusanS1" value={formData.jurusanS1} onChange={(e) => handleInputChange('jurusanS1', e.target.value)} placeholder="e.g., Teknik Informatika" />
                      </div>
                      <Separator className="my-4" />
                    </>
                  )}

                  {/* Current/Latest Higher Education */}
                  {['mahasiswa_s1', 'mahasiswa_s2', 'lulusan_s1', 'lulusan_s2', 'lulusan_d3'].includes(formData.statusAkademik) && (
                    <>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">CURRENT/LATEST HIGHER EDUCATION</Label>
                        <p className="text-xs text-muted-foreground">Your current or most recent higher education</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="namaUniversitas">University Name *</Label>
                        <Input id="namaUniversitas" value={formData.namaUniversitas} onChange={(e) => handleInputChange('namaUniversitas', e.target.value)} placeholder="e.g., Universitas Gadjah Mada" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fakultas">Faculty</Label>
                        <Input id="fakultas" value={formData.fakultas} onChange={(e) => handleInputChange('fakultas', e.target.value)} placeholder="e.g., Fakultas Teknik" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jurusan">Major *</Label>
                        <Input id="jurusan" value={formData.jurusan} onChange={(e) => handleInputChange('jurusan', e.target.value)} placeholder="e.g., Teknik Informatika" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ipk">GPA *</Label>
                          <Input id="ipk" value={formData.ipk} onChange={(e) => handleInputChange('ipk', e.target.value)} placeholder="e.g., 3.75" />
                          <p className="text-xs text-muted-foreground">Use dot (.) as decimal separator, e.g., 3.75</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tahunMasuk">Entry Year</Label>
                          <Select value={formData.tahunMasuk} onValueChange={(value) => handleInputChange('tahunMasuk', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 30}, (_, i) => new Date().getFullYear() - i).map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
            </div>
            </div>
                      {/* Graduation Year - Only for graduates */}
                      {['lulusan_s1', 'lulusan_s2', 'lulusan_d3'].includes(formData.statusAkademik) && (
                        <div className="space-y-2">
                          <Label htmlFor="tahunLulus">Graduation Year *</Label>
                          <Select value={formData.tahunLulus} onValueChange={(value) => handleInputChange('tahunLulus', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select graduation year" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({length: 35}, (_, i) => new Date().getFullYear() + 5 - i).map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
              </div>
                      )}
                    </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-green-600" />
                    High School Education
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="namaSMA">High School Name</Label>
                    <Input id="namaSMA" value={formData.namaSMA} onChange={(e) => handleInputChange('namaSMA', e.target.value)} placeholder="e.g., SMA Negeri 1 Jakarta" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jurusanSMA">High School Track</Label>
                    <Select value={formData.jurusanSMA} onValueChange={(value) => handleInputChange('jurusanSMA', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your high school track" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IPA">IPA (Natural Sciences)</SelectItem>
                        <SelectItem value="IPS">IPS (Social Sciences)</SelectItem>
                        <SelectItem value="Bahasa">Language</SelectItem>
                        <SelectItem value="SMK">SMK (Vocational)</SelectItem>
                        <SelectItem value="Lainnya">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.jurusanSMA === 'SMK' && (
                    <div className="space-y-2">
                      <Label htmlFor="jurusanSMKDetail">SMK Specialization *</Label>
                      <Input id="jurusanSMKDetail" value={formData.jurusanSMKDetail} onChange={(e) => handleInputChange('jurusanSMKDetail', e.target.value)} placeholder="e.g., Teknik Komputer dan Jaringan" />
                      <p className="text-xs text-muted-foreground">Specify your vocational specialization</p>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="tahunLulusSMA">Graduation Year</Label>
                    <Select value={formData.tahunLulusSMA} onValueChange={(value) => handleInputChange('tahunLulusSMA', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select graduation year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 40}, (_, i) => new Date().getFullYear() - i).map(year => (
                          <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>



            {/* Alternative Learning Background - Only for 'lainnya' status */}
            {formData.statusAkademik === 'lainnya' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Learning Background
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">ALTERNATIVE LEARNING BACKGROUND</Label>
                    <p className="text-xs text-muted-foreground">We value all forms of learning, both formal and non-formal.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="namaInstitusi">Institution/Learning Source *</Label>
                    <Input id="namaInstitusi" value={formData.namaInstitusi} onChange={(e) => handleInputChange('namaInstitusi', e.target.value)} placeholder="e.g., Online Course, Bootcamp, Self-Learning, etc." />
                    <p className="text-xs text-muted-foreground">Name of the last institution you studied or your main learning source.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bidangKeahlian">Field of Expertise/Specialization *</Label>
                    <Input id="bidangKeahlian" value={formData.bidangKeahlian} onChange={(e) => handleInputChange('bidangKeahlian', e.target.value)} placeholder="e.g., Web Development, Data Science, Digital Marketing, etc." />
                    <p className="text-xs text-muted-foreground">Main field that you master and will teach.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pengalamanBelajar">Learning Experience *</Label>
                    <Textarea id="pengalamanBelajar" value={formData.pengalamanBelajar} onChange={(e) => handleInputChange('pengalamanBelajar', e.target.value)} placeholder="Tell us about your learning journey, certificates you have, projects you've worked on, or other relevant experience..." rows={4} />
                    <p className="text-xs text-muted-foreground">Explain how you acquired skills and experience in the field you will teach.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teaching Experience */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Teaching Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Teaching Experience</Label>
                  <Textarea id="experience" value={formData.experience} onChange={(e) => handleInputChange('experience', e.target.value)} placeholder="Describe your teaching experience, years of experience, types of students taught, etc." rows={4} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="space-y-6">
            {/* Professional Skills & Teaching Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-600" />
                    Professional Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keahlianSpesialisasi">Specialization</Label>
                    <Textarea id="keahlianSpesialisasi" value={formData.keahlianSpesialisasi} onChange={(e) => handleInputChange('keahlianSpesialisasi', e.target.value)} placeholder="Describe your area of specialization" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="keahlianLainnya">Other Skills</Label>
                    <Textarea id="keahlianLainnya" value={formData.keahlianLainnya} onChange={(e) => handleInputChange('keahlianLainnya', e.target.value)} placeholder="List other relevant skills" rows={3} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Teaching Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pengalamanMengajar">Teaching Experience</Label>
                    <Textarea id="pengalamanMengajar" value={formData.pengalamanMengajar} onChange={(e) => handleInputChange('pengalamanMengajar', e.target.value)} placeholder="Describe your teaching experience in detail" rows={3} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pengalamanLainRelevan">Other Relevant Experience</Label>
                    <Textarea id="pengalamanLainRelevan" value={formData.pengalamanLainRelevan} onChange={(e) => handleInputChange('pengalamanLainRelevan', e.target.value)} placeholder="Other relevant professional experience" rows={3} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-600" />
                    Academic Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prestasiAkademik">Academic Achievements</Label>
                    <Textarea id="prestasiAkademik" value={formData.prestasiAkademik} onChange={(e) => handleInputChange('prestasiAkademik', e.target.value)} placeholder="List your academic achievements, awards, honors, etc." rows={4} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    Non-Academic Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prestasiNonAkademik">Non-Academic Achievements</Label>
                    <Textarea id="prestasiNonAkademik" value={formData.prestasiNonAkademik} onChange={(e) => handleInputChange('prestasiNonAkademik', e.target.value)} placeholder="List non-academic achievements, competitions, leadership roles, etc." rows={4} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Certifications & Training */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Certifications & Training
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sertifikasiPelatihan">Certifications & Training</Label>
                  <Textarea id="sertifikasiPelatihan" value={formData.sertifikasiPelatihan} onChange={(e) => handleInputChange('sertifikasiPelatihan', e.target.value)} placeholder="List your certifications, training programs, workshops, etc." rows={4} />
                </div>
              </CardContent>
            </Card>

            {/* Additional Skills (from original) */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-indigo-600" />
                  Additional Skills
                </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {skillOptions.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                      <Checkbox id={skill} checked={formData.skills.includes(skill)} onCheckedChange={() => handleSkillToggle(skill)} />
                  <Label htmlFor={skill} className="text-sm">{skill}</Label>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center space-x-2">
                  <Input placeholder="Add custom skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)} className="flex-1" />
              <Button type="button" variant="outline" size="sm" onClick={addCustomSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} className="flex items-center gap-1 bg-secondary text-secondary-foreground">
                    {skill}
                        <button type="button" onClick={() => removeSkill(skill)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
        <Card>
          <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Subject Selection Mode
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Choose the most convenient way for you to determine the subjects you will teach
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  📚 Choose Programs/Subjects to Teach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Click categories to see all available programs. Choose programs that match your expertise.
                </p>
                
                {/* Category Filter */}
              <div className="space-y-2">
                  <Label>Filter by Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.main_code || category.code}>
                          {category.main_name || category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Search */}
                <div className="space-y-2">
                  <Label>Search Programs</Label>
                <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search for programs or subjects..."
                  />
                </div>

                {/* Programs List */}
                <div className="space-y-2">
                  <Label>Available Programs</Label>
                  <div className="max-h-96 overflow-y-auto border rounded-md p-4 space-y-2">
                    {programs
                      .filter((program) => {
                        const matchesCategory = selectedCategory === 'all' || 
                          program.simple_category === selectedCategory ||
                          program.category_code === selectedCategory;
                        const matchesSearch = searchTerm === '' || 
                          program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          program.program_name?.toLowerCase().includes(searchTerm.toLowerCase());
                        return matchesCategory && matchesSearch;
                      })
                      .slice(0, 100)
                      .map((program) => (
                        <div key={program.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={program.id}
                            checked={formData.selectedPrograms.includes(program.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleInputChange('selectedPrograms', [...formData.selectedPrograms, program.id]);
                              } else {
                                handleInputChange('selectedPrograms', formData.selectedPrograms.filter(id => id !== program.id));
                              }
                            }}
                          />
                          <Label htmlFor={program.id} className="text-sm flex-1">
                            {program.name || program.program_name}
                            {program.simple_category && (
                              <span className="text-xs text-muted-foreground ml-2">
                                ({program.simple_category})
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    {programs.filter((program) => {
                      const matchesCategory = selectedCategory === 'all' || 
                        program.simple_category === selectedCategory ||
                        program.category_code === selectedCategory;
                      const matchesSearch = searchTerm === '' || 
                        program.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        program.program_name?.toLowerCase().includes(searchTerm.toLowerCase());
                      return matchesCategory && matchesSearch;
                    }).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No programs found matching your criteria
                      </p>
                    )}
                  </div>
                </div>

                {/* Selected Programs */}
                <div className="space-y-2">
                  <Label>Selected Programs ({formData.selectedPrograms.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedPrograms.map((programId) => {
                      const program = programs.find(p => p.id === programId);
                      return (
                        <Badge key={programId} className="flex items-center gap-1 bg-secondary text-secondary-foreground">
                          {program?.name || program?.program_name || programId}
                          <X 
                            className="h-3 w-3 cursor-pointer" 
                            onClick={() => handleInputChange('selectedPrograms', formData.selectedPrograms.filter(id => id !== programId))}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-5 w-5 text-orange-600" />
                  📝 Other Subjects (If Not Found)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    value={formData.mataPelajaranLainnya}
                    onChange={(e) => handleInputChange('mataPelajaranLainnya', e.target.value)}
                    placeholder="If you don't find the subjects you want to teach above, please write them here. Also explain your abilities and experience in teaching those subjects. Example:

• Subject: Korean for Beginners
• Ability: Korean Literature graduate, 3 years teaching experience
• Method: Using songs, drama, and daily conversation
• Target: High school students and adults who want to learn Korean from scratch

• Subject: Python Coding for Elementary Students
• Ability: Python certification, experience teaching coding for children
• Method: Game-based learning, simple projects
• Target: Elementary students grades 4-6 interested in technology"
                    rows={8}
                  />
                  <p className="text-xs text-muted-foreground">
                    Explain the subjects you want to teach, your abilities, teaching methods, and target students. This will help us understand your specific needs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Schedule & Availability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">Hourly Rate (IDR)</Label>
                    <Input id="hourlyRate" type="number" value={formData.hourlyRate} onChange={(e) => handleInputChange('hourlyRate', e.target.value)} placeholder="e.g., 150000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
                  <Label>Available Schedule</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availabilityOptions.map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                        <Checkbox id={time} checked={formData.availability.includes(time)} onCheckedChange={() => handleAvailabilityToggle(time)} />
                    <Label htmlFor={time} className="text-sm">{time}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Teaching Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Teaching preferences will be available in the next update.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Banking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Banking information will be available in the next update.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documents & Files
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Document management will be available in the next update.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Emergency contact information will be available in the next update.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  System Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">System management features will be available in the next update.</p>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Update Tutor
          </Button>
        </div>
      </form>
    </div>
  );
} 