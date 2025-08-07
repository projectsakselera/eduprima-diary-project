'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/ui/icon";
import { 
  User, 
  GraduationCap, 
  Calendar,
  Edit,
  ArrowLeft,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Star,
  BookOpen,
  Award,
  Clock,
  Users,
  CreditCard,
  FileText,
  Eye,
  Download,
  Search
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "@/components/navigation";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import TutorSearchAutocomplete from "@/components/tutor-search-autocomplete";

// Complete Tutor Interface matching API response
interface TutorData {
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
  
  // Education - Higher Education
  statusAkademik: string;
  namaUniversitas: string;
  fakultas: string;
  jurusan: string;
  ipk: string;
  tahunMasuk: string;
  tahunLulus: string;
  
  // Education - S1 Background (untuk yang S2)
  namaUniversitasS1: string;
  fakultasS1: string;
  jurusanS1: string;
  
  // Education - High School
  namaSMA: string;
  jurusanSMA: string;
  jurusanSMKDetail: string;
  tahunLulusSMA: string;
  
  // Education - Middle School
  namaSMP: string;
  tahunLulusSMP: string;
  
  // Education - Alternative Learning Background
  namaInstitusi: string;
  bidangKeahlian: string;
  pengalamanBelajar: string;
  
  // Education - File Documents
  transkripNilai: string | null;
  sertifikatKeahlian: string | null;
  
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
  
  // Subject Categories (per kategori mata pelajaran)
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
  
  // Transportation & Location Coordinates
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
  other_experience: string | null;
  other_skills: string | null;
  reason_for_teaching: string | null;
  
  // Documents
  dokumenIdentitas: string | null;
  dokumenPendidikan: string | null;
  dokumenSertifikat: string | null;
  
  // Document Verification
  status_verifikasi_identitas: string;
  status_verifikasi_pendidikan: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
  
  // System Management
  additionalScreening: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Utility function to get status badge color and style
const getStatusStyle = (status: string) => {
  const statusLower = status?.toLowerCase() || '';
  
  switch (statusLower) {
    case 'active':
      return {
        className: 'bg-green-500 text-white border-green-600',
        style: { backgroundColor: '#10b981', color: '#ffffff' },
        text: 'ACTIVE'
      };
    case 'inactive':
      return {
        className: 'bg-gray-500 text-white border-gray-600',
        style: { backgroundColor: '#6b7280', color: '#ffffff' },
        text: 'INACTIVE'
      };
    case 'pending':
      return {
        className: 'bg-amber-500 text-white border-amber-600',
        style: { backgroundColor: '#f59e0b', color: '#ffffff' },
        text: 'PENDING'
      };
    case 'registration':
      return {
        className: 'bg-blue-500 text-white border-blue-600',
        style: { backgroundColor: '#3b82f6', color: '#ffffff' },
        text: 'REGISTRATION'
      };
    case 'suspended':
      return {
        className: 'bg-red-500 text-white border-red-600',
        style: { backgroundColor: '#ef4444', color: '#ffffff' },
        text: 'SUSPENDED'
      };
    case 'verified':
      return {
        className: 'bg-emerald-600 text-white border-emerald-700',
        style: { backgroundColor: '#059669', color: '#ffffff' },
        text: 'VERIFIED'
      };
    default:
      return {
        className: 'bg-gray-400 text-white border-gray-500',
        style: { backgroundColor: '#9ca3af', color: '#ffffff' },
        text: status?.toUpperCase() || 'UNKNOWN'
      };
  }
};

// Legacy function for backward compatibility
const getStatusBadgeColor = (status: string) => {
  return getStatusStyle(status).className;
};

export default function ViewTutorPage() {
  const router = useRouter();
  const params = useParams();
  const tutorId = params?.id as string;

  const [tutorData, setTutorData] = useState<TutorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programsLookup, setProgramsLookup] = useState<Record<string, string>>({});



  // Fetch programs lookup data
  useEffect(() => {
    const fetchProgramsData = async () => {
      try {
        console.log('🔄 Fetching programs lookup data...');
        const response = await fetch('/api/programs/lookup');
        const result = await response.json();
        
        console.log('📚 Programs lookup API response:', result);
        
        if (result.success && result.lookup) {
          setProgramsLookup(result.lookup);
          console.log('✅ Programs lookup loaded:', Object.keys(result.lookup).length, 'programs');
        } else {
          console.error('❌ Failed to load programs lookup:', result.error || 'Unknown error');
          
          // Fallback: try the old API
          console.log('🔄 Trying fallback API...');
          const fallbackResponse = await fetch('/api/subjects/programs');
          const fallbackResult = await fallbackResponse.json();
          
          if (fallbackResult.programs && Array.isArray(fallbackResult.programs)) {
            const lookup: Record<string, string> = {};
            fallbackResult.programs.forEach((program: any) => {
              lookup[program.id] = program.program_name_local || program.program_name || program.id;
            });
            setProgramsLookup(lookup);
            console.log('✅ Fallback programs lookup created:', Object.keys(lookup).length, 'programs');
          }
        }
      } catch (err) {
        console.error('❌ Error fetching programs lookup:', err);
      }
    };

    fetchProgramsData();
  }, []);

  useEffect(() => {
    const fetchTutorData = async () => {
      if (!tutorId) return;
      
      try {
      setIsLoading(true);
        setError(null);

        // Fetch all tutors from spreadsheet API and find the one with matching ID
        const response = await fetch('/api/tutors/spreadsheet');
        const result = await response.json();

        if (result.success && result.data) {
          const tutor = result.data.find((t: TutorData) => t.id === tutorId);
          if (tutor) {
            console.log('🔍 TUTOR DETAIL - Raw data received:', tutor);
            console.log('🎯 PERSONALITY CHECK:', {
              teachingPatienceLevel: tutor.teachingPatienceLevel,
              studentMotivationAbility: tutor.studentMotivationAbility,
              scheduleFlexibilityLevel: tutor.scheduleFlexibilityLevel
            });
            console.log('🎯 PREFERENCES CHECK:', {
              specialNeedsCapable: tutor.specialNeedsCapable,
              groupClassWilling: tutor.groupClassWilling,
              onlineTeachingCapable: tutor.onlineTeachingCapable
            });
                    console.log('📅 AVAILABILITY CHECK:', {
          statusMenerimaSiswa: tutor.statusMenerimaSiswa,
          hourly_rate: tutor.hourly_rate,
          maksimalSiswaBaru: tutor.maksimalSiswaBaru,
          maksimalTotalSiswa: tutor.maksimalTotalSiswa,
          teaching_radius_km: tutor.teaching_radius_km,
          available_schedule: tutor.available_schedule,
          _debug_schedule: tutor._debug_schedule
        });
            setTutorData(tutor);
          } else {
            setError('Tutor not found');
          }
        } else {
          setError(result.error || 'Failed to fetch tutor data');
        }
      } catch (err) {
        console.error('❌ Error fetching tutor:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

      fetchTutorData();
  }, [tutorId]);

  const handleEdit = () => {
    router.push(`/eduprima/main/ops/em/database-tutor/edit/${tutorId}`);
  };

  const handleBack = () => {
    router.push('/eduprima/main/ops/em/database-tutor');
  };

  const handleViewDocuments = () => {
    // Navigate to documents tab
    const documentsSection = document.getElementById('documents-tab');
    if (documentsSection) {
      documentsSection.scrollIntoView({ behavior: 'smooth' });
    }
    // Or navigate to separate documents page
    // router.push(`/eduprima/main/ops/em/database-tutor/documents/${tutorId}`);
  };

  const handleExportProfile = () => {
    // Export profile as PDF or print
    window.print();
    // Or implement PDF export functionality
  };

  // Calculate profile completion percentage based on filled fields
  const calculateProfileCompletion = (data: TutorData): number => {
    const requiredFields = [
      'namaLengkap', 'email', 'noHp1', 'statusAkademik', 'namaUniversitas',
      'hourly_rate', 'status_tutor', 'provinsiDomisili', 'kotaKabupatenDomisili'
    ];
    
    const optionalFields = [
      'namaPanggilan', 'tanggalLahir', 'jenisKelamin', 'agama', 'headline',
      'deskripsiDiri', 'motivasiMenjadiTutor', 'keahlianSpesialisasi',
      'pengalamanMengajar', 'selectedPrograms', 'available_schedule'
    ];
    
    const allFields = [...requiredFields, ...optionalFields];
    const filledFields = allFields.filter(field => {
      const value = data[field as keyof TutorData];
      return value && 
             value !== '' && 
             value !== null && 
             value !== undefined &&
             (Array.isArray(value) ? value.length > 0 : true);
    });
    
    return Math.round((filledFields.length / allFields.length) * 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  // Helper functions
  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        {/* Loading Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Icon icon="ph:user-circle" className="h-8 w-8 text-primary animate-pulse" />
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        
        {/* Loading Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Hero Card Loading */}
            <Card className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                </div>
              </div>
            </Card>
            
            {/* Tabs Loading */}
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
                  ))}
                </div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
          
          {/* Sidebar Loading */}
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
  return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Icon icon="ph:user-circle" className="h-8 w-8 text-primary" />
              View Tutor
            </h1>
            <p className="text-muted-foreground">Tutor details and information</p>
        </div>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <Alert className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!tutorData) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Icon icon="ph:user-circle" className="h-8 w-8 text-primary" />
              View Tutor
            </h1>
            <p className="text-muted-foreground">Tutor details and information</p>
          </div>
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        
        <Alert className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No tutor data available. Please try again or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-3">
                <Icon icon="ph:user-circle" className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                View Tutor Profile
              </h1>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">
                Complete tutor information and management • ID: {tutorData.trn || tutorData.id}
              </p>
            </div>
            
            {/* Inline Search Bar */}
            <div className="flex-shrink-0 md:mt-1">
              <TutorSearchAutocomplete 
                placeholder="Search other tutors..."
                className="w-full sm:w-64 md:w-72"
                compact={true}
                size="sm"
                maxResults={6}
                variant="compact"
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          <Button 
            variant="outline" 
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
          <Button 
            onClick={handleEdit}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Tutor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Hero Summary Card */}
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                {/* Profile Photo */}
                <div className="relative">
                  <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                    <AvatarImage 
                      src={tutorData.fotoProfil || undefined} 
                      alt={tutorData.namaLengkap}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-semibold">
                      {tutorData.namaLengkap?.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
                    </AvatarFallback>
                  </Avatar>
                  {tutorData.status_tutor === 'active' && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success border-2 border-background rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-success-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Basic Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-default-900 mb-1">
                        {tutorData.namaLengkap || 'No Name'}
                      </h2>
                      {tutorData.namaPanggilan && (
                        <p className="text-sm text-default-600 mb-2">
                          "{tutorData.namaPanggilan}"
                        </p>
                      )}
                      {tutorData.headline && (
                        <p className="text-lg text-default-700 mb-3 font-medium">
                          {tutorData.headline}
                        </p>
                      )}
                    </div>
                    
                    {/* Status Badge */}
                    {(() => {
                      const statusStyle = getStatusStyle(tutorData.status_tutor);
                      return (
                        <span
                          className="px-3 py-1 rounded-full text-sm font-semibold text-center min-w-[100px] border"
                          style={statusStyle.style}
                        >
                          {statusStyle.text}
                        </span>
                      );
                    })()}
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center p-3 bg-card rounded-lg border border-border">
                      <Icon icon="ph:graduation-cap" className="h-6 w-6 text-primary mx-auto mb-1" />
                      <div className="text-lg font-semibold text-default-900">
                        {tutorData.selectedPrograms?.length || 0}
                      </div>
                      <div className="text-xs text-default-600">Programs</div>
                    </div>
                    <div className="text-center p-3 bg-card rounded-lg border border-border">
                      <Icon icon="ph:money" className="h-6 w-6 text-success mx-auto mb-1" />
                      <div className="text-lg font-semibold text-default-900">
                        {formatCurrency(tutorData.hourly_rate)}
                      </div>
                      <div className="text-xs text-default-600">Hourly Rate</div>
                    </div>
                    <div className="text-center p-3 bg-card rounded-lg border border-border">
                      <Icon icon="ph:clock" className="h-6 w-6 text-warning mx-auto mb-1" />
                      <div className="text-lg font-semibold text-default-900">
                        {tutorData.available_schedule?.length || 0}
                      </div>
                      <div className="text-xs text-default-600">Time Slots</div>
                    </div>
                    <div className="text-center p-3 bg-card rounded-lg border border-border">
                      <Icon icon="ph:users" className="h-6 w-6 text-info mx-auto mb-1" />
                      <div className="text-lg font-semibold text-default-900">
                        {tutorData.maksimalTotalSiswa || '-'}
                      </div>
                      <div className="text-xs text-default-600">Max Students</div>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    {tutorData.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{tutorData.email}</span>
                      </div>
                    )}
                    {tutorData.noHp1 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{tutorData.noHp1}</span>
                      </div>
                    )}
                    {(tutorData.provinsiDomisili || tutorData.kotaKabupatenDomisili) && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {[tutorData.kotaKabupatenDomisili, tutorData.provinsiDomisili]
                            .filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="personal" className="w-full">
                {/* Horizontal Navigation */}
                <div className="mb-6">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <Icon icon="ph:list-bullets" className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">Information Categories</h3>
                      </div>
                      
                      {/* Scrollable Horizontal Tabs */}
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
                              id="documents-tab" 
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
                        
                        {/* Scroll Indicators */}
                        <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 text-default-400 opacity-60">
                          <Icon icon="ph:caret-right" className="h-4 w-4" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Main Content Area */}
                <div className="w-full">

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Personal Info */}
          <Card>
            <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:user" className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-500">Full Name</span>
                            <span className="text-sm font-semibold text-right">{tutorData.namaLengkap || '-'}</span>
                </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-500">Nickname</span>
                            <span className="text-sm text-right">{tutorData.namaPanggilan || '-'}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-500">Birth Date</span>
                            <span className="text-sm text-right">{formatDate(tutorData.tanggalLahir)}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-500">Gender</span>
                            <span className="text-sm text-right">{tutorData.jenisKelamin || '-'}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-500">Religion</span>
                            <span className="text-sm text-right">{tutorData.agama || '-'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Contact Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:phone" className="h-5 w-5 text-green-600" />
                          Contact Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-500">Email</span>
                            <span className="text-sm text-right font-mono">{tutorData.email || '-'}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-500">Phone 1</span>
                            <span className="text-sm text-right font-mono">{tutorData.noHp1 || '-'}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-500">Phone 2</span>
                            <span className="text-sm text-right font-mono">{tutorData.noHp2 || '-'}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-500">Social Media 1</span>
                            <span className="text-sm text-right">{tutorData.socialMedia1 || '-'}</span>
                          </div>
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-500">Social Media 2</span>
                            <span className="text-sm text-right">{tutorData.socialMedia2 || '-'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Address Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Domicile Address */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:house" className="h-5 w-5 text-purple-600" />
                          Domicile Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{tutorData.alamatLengkapDomisili || '-'}</div>
                          <div className="text-gray-600 mt-1">
                            {[
                              tutorData.kelurahanDomisili,
                              tutorData.kecamatanDomisili,
                              tutorData.kotaKabupatenDomisili,
                              tutorData.provinsiDomisili,
                              tutorData.kodePosDomisili
                            ].filter(Boolean).join(', ')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* KTP Address */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:identification-card" className="h-5 w-5 text-orange-600" />
                          KTP Address
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {tutorData.alamatSamaDenganKTP ? (
                          <div className="text-sm text-gray-600 italic">
                            Same as domicile address
                          </div>
                        ) : (
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{tutorData.alamatLengkapKTP || '-'}</div>
                            <div className="text-gray-600 mt-1">
                              {[
                                tutorData.kelurahanKTP,
                                tutorData.kecamatanKTP,
                                tutorData.kotaKabupatenKTP,
                                tutorData.provinsiKTP,
                                tutorData.kodePosKTP
                              ].filter(Boolean).join(', ')}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Profile & Motivation */}
                  {(tutorData.headline || tutorData.deskripsiDiri || tutorData.motivasiMenjadiTutor) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:chat-circle-text" className="h-5 w-5 text-indigo-600" />
                          Profile & Motivation
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {tutorData.headline && (
                <div>
                            <label className="text-sm font-medium text-gray-500">Headline</label>
                            <p className="text-sm text-gray-900 mt-1">{tutorData.headline}</p>
                </div>
                        )}
                        {tutorData.deskripsiDiri && (
                <div>
                            <label className="text-sm font-medium text-gray-500">Self Description</label>
                            <p className="text-sm text-gray-900 mt-1">{tutorData.deskripsiDiri}</p>
                </div>
                        )}
                        {tutorData.motivasiMenjadiTutor && (
                <div>
                            <label className="text-sm font-medium text-gray-500">Motivation to Become Tutor</label>
                            <p className="text-sm text-gray-900 mt-1">{tutorData.motivasiMenjadiTutor}</p>
                </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:graduation-cap" className="h-5 w-5 text-blue-600" />
                          Higher Education
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Academic Status</span>
                          <span className="text-sm">{tutorData.statusAkademik || '-'}</span>
              </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">University</span>
                          <span className="text-sm">{tutorData.namaUniversitas || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Faculty</span>
                          <span className="text-sm">{tutorData.fakultas || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Major</span>
                          <span className="text-sm">{tutorData.jurusan || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">GPA</span>
                          <span className="text-sm font-semibold">{tutorData.ipk || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Entry Year</span>
                          <span className="text-sm">{tutorData.tahunMasuk || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Graduation Year</span>
                          <span className="text-sm">{tutorData.tahunLulus || '-'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:student" className="h-5 w-5 text-green-600" />
                          High School
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">School Name</span>
                          <span className="text-sm">{tutorData.namaSMA || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Major</span>
                          <span className="text-sm">{tutorData.jurusanSMA || '-'}</span>
                        </div>
                        {tutorData.jurusanSMKDetail && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">SMK Detail</span>
                            <span className="text-sm">{tutorData.jurusanSMKDetail}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Graduation Year</span>
                          <span className="text-sm">{tutorData.tahunLulusSMA || '-'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Additional Education Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* S1 Background (for S2 students) */}
                    {(tutorData.namaUniversitasS1 || tutorData.fakultasS1 || tutorData.jurusanS1) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:graduation-cap" className="h-5 w-5 text-indigo-600" />
                            S1 Background
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">S1 University</span>
                            <span className="text-sm">{tutorData.namaUniversitasS1 || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">S1 Faculty</span>
                            <span className="text-sm">{tutorData.fakultasS1 || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">S1 Major</span>
                            <span className="text-sm">{tutorData.jurusanS1 || '-'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Middle School */}
                    {(tutorData.namaSMP || tutorData.tahunLulusSMP) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:books" className="h-5 w-5 text-orange-600" />
                            Middle School
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">SMP Name</span>
                            <span className="text-sm">{tutorData.namaSMP || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Graduation Year</span>
                            <span className="text-sm">{tutorData.tahunLulusSMP || '-'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Alternative Learning Background */}
                  {(tutorData.namaInstitusi || tutorData.bidangKeahlian || tutorData.pengalamanBelajar) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:lightbulb" className="h-5 w-5 text-purple-600" />
                          Alternative Learning Background
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {tutorData.namaInstitusi && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Institution Name</span>
                            <span className="text-sm">{tutorData.namaInstitusi}</span>
                          </div>
                        )}
                        {tutorData.bidangKeahlian && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Field of Expertise</span>
                            <span className="text-sm">{tutorData.bidangKeahlian}</span>
                          </div>
                        )}
                        {tutorData.pengalamanBelajar && (
              <div>
                            <label className="text-sm font-medium text-gray-500">Learning Experience</label>
                            <p className="text-sm text-gray-900 mt-1">{tutorData.pengalamanBelajar}</p>
              </div>
                        )}
            </CardContent>
          </Card>
                  )}
                </TabsContent>

                {/* Professional Tab */}
                <TabsContent value="professional" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Professional Skills */}
          <Card>
            <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:star" className="h-5 w-5 text-yellow-600" />
                          Professional Skills
              </CardTitle>
            </CardHeader>
                      <CardContent className="space-y-3">
                <div>
                          <label className="text-sm font-medium text-gray-500">Specialization</label>
                          <p className="text-sm text-gray-900 mt-1">{tutorData.keahlianSpesialisasi || '-'}</p>
                </div>
                <div>
                          <label className="text-sm font-medium text-gray-500">Other Skills</label>
                          <p className="text-sm text-gray-900 mt-1">{tutorData.keahlianLainnya || '-'}</p>
                </div>
                      </CardContent>
                    </Card>

                    {/* Teaching Experience */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:chalkboard-teacher" className="h-5 w-5 text-green-600" />
                          Teaching Experience
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Teaching Experience</label>
                          <p className="text-sm text-gray-900 mt-1">{tutorData.pengalamanMengajar || '-'}</p>
              </div>
              <div>
                          <label className="text-sm font-medium text-gray-500">Other Relevant Experience</label>
                          <p className="text-sm text-gray-900 mt-1">{tutorData.pengalamanLainRelevan || '-'}</p>
              </div>
            </CardContent>
          </Card>
                  </div>

                  {/* Achievements */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:trophy" className="h-5 w-5 text-amber-600" />
                          Academic Achievements
                        </CardTitle>
            </CardHeader>
            <CardContent>
                        <p className="text-sm text-gray-900">{tutorData.prestasiAkademik || 'No achievements recorded'}</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:medal" className="h-5 w-5 text-purple-600" />
                          Non-Academic Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-900">{tutorData.prestasiNonAkademik || 'No achievements recorded'}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Certifications */}
                  {tutorData.sertifikasiPelatihan && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:certificate" className="h-5 w-5 text-blue-600" />
                          Certifications & Training
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-900">{tutorData.sertifikasiPelatihan}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Programs Tab */}
                <TabsContent value="programs" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Icon icon="ph:books" className="h-5 w-5 text-purple-600" />
                        Teaching Programs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {tutorData.selectedPrograms && Array.isArray(tutorData.selectedPrograms) && tutorData.selectedPrograms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                          {tutorData.selectedPrograms.map((programId, index) => {
                            const displayName = programsLookup[programId] || programId;
                            console.log(`🎯 Displaying program ${index + 1}:`, { programId, displayName, hasLookup: !!programsLookup[programId] });
                            return (
                              <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-200">
                                {displayName}
                              </Badge>
                            );
                          })}
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-gray-500">No programs selected</p>
                          {tutorData.selectedPrograms && (
                            <p className="text-xs text-gray-400 mt-1">
                              Debug: selectedPrograms = {JSON.stringify(tutorData.selectedPrograms)}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {tutorData.mataPelajaranLainnya && (
                        <div className="mt-4">
                          <label className="text-sm font-medium text-gray-500">Other Subjects</label>
                          <p className="text-sm text-gray-900 mt-1">{tutorData.mataPelajaranLainnya}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Subject Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SD Subjects */}
                    {tutorData.mataPelajaran_SD_Kelas_1_6_ && Array.isArray(tutorData.mataPelajaran_SD_Kelas_1_6_) && tutorData.mataPelajaran_SD_Kelas_1_6_.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:student" className="h-5 w-5 text-yellow-600" />
                            SD (Kelas 1-6)
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {tutorData.mataPelajaran_SD_Kelas_1_6_.map((subject, index) => (
                              <Badge key={index} className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
                    )}

                    {/* SMP Subjects */}
                    {tutorData.mataPelajaran_SMP_Kelas_7_9_ && Array.isArray(tutorData.mataPelajaran_SMP_Kelas_7_9_) && tutorData.mataPelajaran_SMP_Kelas_7_9_.length > 0 && (
          <Card>
            <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:books" className="h-5 w-5 text-orange-600" />
                            SMP (Kelas 7-9)
                          </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                            {tutorData.mataPelajaran_SMP_Kelas_7_9_.map((subject, index) => (
                              <Badge key={index} className="bg-orange-100 text-orange-800 border-orange-200">
                                {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
                    )}

                    {/* SMA IPA Subjects */}
                    {tutorData.mataPelajaran_SMA_SMK_IPA && Array.isArray(tutorData.mataPelajaran_SMA_SMK_IPA) && tutorData.mataPelajaran_SMA_SMK_IPA.length > 0 && (
          <Card>
            <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:flask" className="h-5 w-5 text-blue-600" />
                            SMA/SMK IPA
              </CardTitle>
            </CardHeader>
            <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {tutorData.mataPelajaran_SMA_SMK_IPA.map((subject, index) => (
                              <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200">
                                {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
                    )}

                    {/* SMA IPS Subjects */}
                    {tutorData.mataPelajaran_SMA_SMK_IPS && Array.isArray(tutorData.mataPelajaran_SMA_SMK_IPS) && tutorData.mataPelajaran_SMA_SMK_IPS.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:globe" className="h-5 w-5 text-green-600" />
                            SMA/SMK IPS
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {tutorData.mataPelajaran_SMA_SMK_IPS.map((subject, index) => (
                              <Badge key={index} className="bg-green-100 text-green-800 border-green-200">
                                {subject}
                              </Badge>
                            ))}
        </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* University Subjects */}
                    {tutorData.mataPelajaran_Universitas_Perguruan_Tinggi && Array.isArray(tutorData.mataPelajaran_Universitas_Perguruan_Tinggi) && tutorData.mataPelajaran_Universitas_Perguruan_Tinggi.length > 0 && (
          <Card>
            <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:graduation-cap" className="h-5 w-5 text-purple-600" />
                            Universitas & Perguruan Tinggi
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {tutorData.mataPelajaran_Universitas_Perguruan_Tinggi.map((subject, index) => (
                              <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-200">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Special Skills */}
                    {tutorData.mataPelajaran_Keterampilan_Khusus && Array.isArray(tutorData.mataPelajaran_Keterampilan_Khusus) && tutorData.mataPelajaran_Keterampilan_Khusus.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:star" className="h-5 w-5 text-pink-600" />
                            Keterampilan Khusus
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {tutorData.mataPelajaran_Keterampilan_Khusus.map((subject, index) => (
                              <Badge key={index} className="bg-pink-100 text-pink-800 border-pink-200">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Additional SMK Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* SMK Teknik & Teknologi */}
                    {tutorData.mataPelajaran_SMK_Teknik_Teknologi && Array.isArray(tutorData.mataPelajaran_SMK_Teknik_Teknologi) && tutorData.mataPelajaran_SMK_Teknik_Teknologi.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:gear" className="h-5 w-5 text-slate-600" />
                            SMK Teknik & Teknologi
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {tutorData.mataPelajaran_SMK_Teknik_Teknologi.map((subject, index) => (
                              <Badge key={index} className="bg-slate-100 text-slate-800 border-slate-200">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* SMK Bisnis & Manajemen */}
                    {tutorData.mataPelajaran_SMK_Bisnis_Manajemen && Array.isArray(tutorData.mataPelajaran_SMK_Bisnis_Manajemen) && tutorData.mataPelajaran_SMK_Bisnis_Manajemen.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:briefcase" className="h-5 w-5 text-amber-600" />
                            SMK Bisnis & Manajemen
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {tutorData.mataPelajaran_SMK_Bisnis_Manajemen.map((subject, index) => (
                              <Badge key={index} className="bg-amber-100 text-amber-800 border-amber-200">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* SMK Pariwisata & Perhotelan */}
                    {tutorData.mataPelajaran_SMK_Pariwisata_Perhotelan && Array.isArray(tutorData.mataPelajaran_SMK_Pariwisata_Perhotelan) && tutorData.mataPelajaran_SMK_Pariwisata_Perhotelan.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:airplane" className="h-5 w-5 text-cyan-600" />
                            SMK Pariwisata & Perhotelan
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {tutorData.mataPelajaran_SMK_Pariwisata_Perhotelan.map((subject, index) => (
                              <Badge key={index} className="bg-cyan-100 text-cyan-800 border-cyan-200">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* SMK Kesehatan */}
                    {tutorData.mataPelajaran_SMK_Kesehatan && Array.isArray(tutorData.mataPelajaran_SMK_Kesehatan) && tutorData.mataPelajaran_SMK_Kesehatan.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:heart" className="h-5 w-5 text-emerald-600" />
                            SMK Kesehatan
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {tutorData.mataPelajaran_SMK_Kesehatan.map((subject, index) => (
                              <Badge key={index} className="bg-emerald-100 text-emerald-800 border-emerald-200">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Bahasa Asing */}
                    {tutorData.mataPelajaran_Bahasa_Asing && Array.isArray(tutorData.mataPelajaran_Bahasa_Asing) && tutorData.mataPelajaran_Bahasa_Asing.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:translate" className="h-5 w-5 text-violet-600" />
                            Bahasa Asing
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {tutorData.mataPelajaran_Bahasa_Asing.map((subject, index) => (
                              <Badge key={index} className="bg-violet-100 text-violet-800 border-violet-200">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Availability Tab */}
                <TabsContent value="availability" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:calendar" className="h-5 w-5 text-green-600" />
                          Schedule & Pricing
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Accepting Students</span>
                          {(() => {
                            const status = tutorData.statusMenerimaSiswa?.toLowerCase();
                            
                            switch (status) {
                              case 'available':
                                return (
                                  <Badge className="bg-green-100 text-green-800">
                                    Available
                                  </Badge>
                                );
                              case 'limited':
                                return (
                                  <Badge className="bg-amber-100 text-amber-800">
                                    Limited
                                  </Badge>
                                );
                              case 'unavailable':
                                return (
                                  <Badge className="bg-red-100 text-red-800">
                                    Unavailable
                                  </Badge>
                                );
                              case 'leave':
                                return (
                                  <Badge className="bg-gray-100 text-gray-800">
                                    On Leave
                                  </Badge>
                                );
                              default:
                                return (
                                  <Badge className="bg-gray-100 text-gray-800">
                                    Unknown
                                  </Badge>
                                );
                            }
                          })()}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Hourly Rate</span>
                          <span className="text-sm font-semibold text-green-600">
                            {formatCurrency(tutorData.hourly_rate)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Max New Students</span>
                          <span className="text-sm">{tutorData.maksimalSiswaBaru || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Max Total Students</span>
                          <span className="text-sm">{tutorData.maksimalTotalSiswa || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Teaching Radius</span>
                          <span className="text-sm">{tutorData.teaching_radius_km ? `${tutorData.teaching_radius_km} km` : '-'}</span>
                        </div>
                        {tutorData.usiaTargetSiswa && Array.isArray(tutorData.usiaTargetSiswa) && tutorData.usiaTargetSiswa.length > 0 && (
                          <div>
                            <label className="text-sm font-medium text-gray-500 block mb-2">Target Student Age</label>
                            <div className="flex flex-wrap gap-2">
                              {tutorData.usiaTargetSiswa.map((age, index) => (
                                <Badge key={index} className="bg-indigo-100 text-indigo-800 border-indigo-200">
                                  {age}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:clock" className="h-5 w-5 text-orange-600" />
                          Available Schedule
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {tutorData.available_schedule && Array.isArray(tutorData.available_schedule) && tutorData.available_schedule.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {tutorData.available_schedule.map((slot, index) => (
                              <Badge key={index} className="justify-center bg-orange-100 text-orange-800 border-orange-200">
                                {slot}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No schedule set</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Transportation & Location */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Transportation Methods - HIDDEN per user request */}
                    {false && tutorData.transportasiTutor && Array.isArray(tutorData.transportasiTutor) && tutorData.transportasiTutor.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:car" className="h-5 w-5 text-blue-600" />
                            Transportation Methods
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {tutorData.transportasiTutor.map((method, index) => (
                              <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200">
                                {method}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Location Coordinates */}
                    {(tutorData.titikLokasiLat || tutorData.titikLokasiLng) && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:map-pin" className="h-5 w-5 text-red-600" />
                            Location Coordinates
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Latitude</span>
                            <span className="text-sm font-mono">{tutorData.titikLokasiLat || '-'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-500">Longitude</span>
                            <span className="text-sm font-mono">{tutorData.titikLokasiLng || '-'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Teaching Location & Preferences */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Teaching Location */}
                    {tutorData.alamatTitikLokasi && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:map-pin-line" className="h-5 w-5 text-purple-600" />
                            Teaching Location
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-900">{tutorData.alamatTitikLokasi}</p>
                        </CardContent>
                      </Card>
                    )}

                    {/* Location Preferences */}
                    {tutorData.location_notes && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:compass" className="h-5 w-5 text-teal-600" />
                            Location Preferences
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-900">{tutorData.location_notes}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Availability Notes */}
                  {tutorData.catatanAvailability && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:note" className="h-5 w-5 text-gray-600" />
                          Availability Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-900">{tutorData.catatanAvailability}</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Teaching Preferences Tab */}
                <TabsContent value="preferences" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Teaching Methods */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:chalkboard" className="h-5 w-5 text-blue-600" />
                          Teaching Methods
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {tutorData.teachingMethods && Array.isArray(tutorData.teachingMethods) && tutorData.teachingMethods.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {tutorData.teachingMethods.map((method, index) => (
                              <Badge key={index} className="bg-blue-100 text-blue-800 border-blue-200">
                                {method}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No teaching methods specified</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Student Preferences */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:users-three" className="h-5 w-5 text-green-600" />
                          Student Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {tutorData.studentLevelPreferences && Array.isArray(tutorData.studentLevelPreferences) && tutorData.studentLevelPreferences.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {tutorData.studentLevelPreferences.map((level, index) => (
                              <Badge key={index} className="bg-green-100 text-green-800 border-green-200">
                                {level}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No student level preferences</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Communication Style */}
                  {tutorData.communicationStyle && Array.isArray(tutorData.communicationStyle) && tutorData.communicationStyle.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:chat-circle" className="h-5 w-5 text-indigo-600" />
                          Communication Style
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {tutorData.communicationStyle.map((style, index) => (
                            <Badge key={index} className="bg-indigo-100 text-indigo-800 border-indigo-200">
                              {style}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}




                </TabsContent>

                {/* Banking Tab */}
                <TabsContent value="banking" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Icon icon="ph:bank" className="h-5 w-5 text-green-600" />
                        Banking Information
                      </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-500">Account Holder Name</span>
                          <span className="text-sm font-semibold text-right">{tutorData.namaNasabah || '-'}</span>
              </div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-500">Account Number</span>
                          <span className="text-sm font-mono text-right">{tutorData.nomorRekening || '-'}</span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-500">Bank Name</span>
                          <span className="text-sm text-right">{tutorData.namaBank || '-'}</span>
                        </div>
              </div>
            </CardContent>
          </Card>
                </TabsContent>

                {/* Documents Tab */}
                <TabsContent value="documents" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Document Files */}
          <Card>
            <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:files" className="h-5 w-5 text-blue-600" />
                          Document Files
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Identity Document</span>
                          {tutorData.dokumenIdentitas ? (
                            <Badge className="bg-green-100 text-green-800">
                              Available
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              Missing
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Education Document</span>
                          {tutorData.dokumenPendidikan ? (
                            <Badge className="bg-green-100 text-green-800">
                              Available
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              Missing
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Certificate Document</span>
                          {tutorData.dokumenSertifikat ? (
                            <Badge className="bg-green-100 text-green-800">
                              Available
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              Optional
                            </Badge>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Transcript Document</span>
                          {tutorData.transkripNilai ? (
                            <Badge className="bg-green-100 text-green-800">
                              Available
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              Optional
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Verification Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:shield-check" className="h-5 w-5 text-purple-600" />
                          Verification Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Identity Verification</span>
                          <Badge className={cn("text-xs", getStatusBadgeColor(tutorData.status_verifikasi_identitas))}>
                            {tutorData.status_verifikasi_identitas || 'Pending'}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Education Verification</span>
                          <Badge className={cn("text-xs", getStatusBadgeColor(tutorData.status_verifikasi_pendidikan))}>
                            {tutorData.status_verifikasi_pendidikan || 'Pending'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Emergency Contact Tab */}
                <TabsContent value="emergency" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Icon icon="ph:phone-call" className="h-5 w-5 text-red-600" />
                        Emergency Contact Information
                      </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-500">Contact Name</span>
                          <span className="text-sm font-semibold text-right">{tutorData.emergencyContactName || '-'}</span>
              </div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-500">Relationship</span>
                          <span className="text-sm text-right">{tutorData.emergencyContactRelationship || '-'}</span>
              </div>
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-medium text-gray-500">Phone Number</span>
                          <span className="text-sm font-mono text-right">{tutorData.emergencyContactPhone || '-'}</span>
                        </div>
              </div>
            </CardContent>
          </Card>
                </TabsContent>

                {/* System Management Tab */}
                <TabsContent value="system" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* System Status */}
          <Card>
            <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:gear-six" className="h-5 w-5 text-gray-600" />
                          System Status
                        </CardTitle>
            </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Tutor ID</span>
                          <span className="text-sm font-mono">{tutorData.id}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">TRN</span>
                          <span className="text-sm font-mono">{tutorData.trn || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-500">Approval Level</span>
                          <Badge className={cn("text-xs", getStatusBadgeColor(tutorData.approval_level))}>
                            {tutorData.approval_level || 'Not Set'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Additional Screening */}
                    {tutorData.additionalScreening && Array.isArray(tutorData.additionalScreening) && tutorData.additionalScreening.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Icon icon="ph:shield-check" className="h-5 w-5 text-purple-600" />
                            Additional Screening
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {tutorData.additionalScreening.map((screening, index) => (
                              <Badge key={index} className="bg-purple-100 text-purple-800 border-purple-200">
                                {screening}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Staff Notes */}
                  {tutorData.staff_notes && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:note-pencil" className="h-5 w-5 text-yellow-600" />
                          Staff Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm text-gray-900">{tutorData.staff_notes}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Preferences Tab */}
                <TabsContent value="preferences" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Technology & Online Teaching */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:computer-tower" className="h-5 w-5 text-purple-600" />
                          Technology & Online Teaching
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Online Teaching</span>
                          <Badge className={cn(
                            tutorData.onlineTeachingCapable === 'yes' 
                              ? 'bg-green-100 text-green-800' 
                              : tutorData.onlineTeachingCapable === 'basic'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          )}>
                            {tutorData.onlineTeachingCapable === 'yes' ? 'Capable' : 
                             tutorData.onlineTeachingCapable === 'basic' ? 'Basic' : 'Not Capable'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Tech Savviness</span>
                          <span className="text-sm">{tutorData.techSavviness || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Google Meet Experience</span>
                          <span className="text-sm">{tutorData.gmeetExperience || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Attendance Update Capability</span>
                          <span className="text-sm">{tutorData.presensiUpdateCapability || '-'}</span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Teaching Personality */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:smiley" className="h-5 w-5 text-orange-600" />
                          Teaching Personality
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Patience Level</span>
                          <span className="text-sm">{tutorData.teachingPatienceLevel || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Motivation Ability</span>
                          <span className="text-sm">{tutorData.studentMotivationAbility || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Schedule Flexibility</span>
                          <span className="text-sm">{tutorData.scheduleFlexibilityLevel || '-'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Special Needs & Group Classes */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Icon icon="ph:heart" className="h-5 w-5 text-pink-600" />
                        Special Needs & Group Classes
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Special Needs Capable</span>
                          <Badge className={cn(
                            tutorData.specialNeedsCapable === 'yes' 
                              ? 'bg-green-100 text-green-800' 
                              : tutorData.specialNeedsCapable === 'tidak' || tutorData.specialNeedsCapable === 'no'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          )}>
                            {tutorData.specialNeedsCapable === 'yes' ? 'Yes' : 
                             tutorData.specialNeedsCapable === 'tidak' || tutorData.specialNeedsCapable === 'no' ? 'No' : 'Not Specified'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-500">Group Class Willing</span>
                          <Badge className={cn(
                            tutorData.groupClassWilling === 'yes' 
                              ? 'bg-green-100 text-green-800' 
                              : tutorData.groupClassWilling === 'tidak' || tutorData.groupClassWilling === 'no'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          )}>
                            {tutorData.groupClassWilling === 'yes' ? 'Yes' : 
                             tutorData.groupClassWilling === 'tidak' || tutorData.groupClassWilling === 'no' ? 'No' : 'Not Specified'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Closing tabs and cards */}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon icon="ph:phone" className="h-5 w-5 text-green-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Email</span>
                <span className="text-sm text-right max-w-[200px] truncate" title={tutorData.email}>
                  {tutorData.email || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Phone 1</span>
                <span className="text-sm">{tutorData.noHp1 || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Phone 2</span>
                <span className="text-sm">{tutorData.noHp2 || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Social Media 1</span>
                <span className="text-sm text-right max-w-[200px] truncate" title={tutorData.socialMedia1}>
                  {tutorData.socialMedia1 || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Social Media 2</span>
                <span className="text-sm text-right max-w-[200px] truncate" title={tutorData.socialMedia2}>
                  {tutorData.socialMedia2 || '-'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon icon="ph:lightning" className="h-5 w-5 text-yellow-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={handleEdit} 
                className="w-full flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Tutor
              </Button>
              <Button 
                variant="outline" 
                onClick={handleBack} 
                className="w-full flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to List
              </Button>
              <Button 
                variant="outline" 
                onClick={handleViewDocuments}
                className="w-full flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Documents
              </Button>
              <Button 
                variant="outline" 
                onClick={handleExportProfile}
                className="w-full flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Profile
              </Button>
            </CardContent>
          </Card>

          {/* Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon icon="ph:chart-bar" className="h-5 w-5 text-blue-600" />
                Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tutor Status</span>
                  <Badge className={cn("text-xs", getStatusBadgeColor(tutorData.status_tutor))}>
                    {tutorData.status_tutor}
                  </Badge>
        </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Identity Verification</span>
                  <Badge className={cn("text-xs", getStatusBadgeColor(tutorData.status_verifikasi_identitas))}>
                    {tutorData.status_verifikasi_identitas || 'Pending'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Education Verification</span>
                  <Badge className={cn("text-xs", getStatusBadgeColor(tutorData.status_verifikasi_pendidikan))}>
                    {tutorData.status_verifikasi_pendidikan || 'Pending'}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Profile Completion</span>
                  <span className="font-medium">{calculateProfileCompletion(tutorData)}%</span>
                </div>
                <Progress value={calculateProfileCompletion(tutorData)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon icon="ph:clock-clockwise" className="h-5 w-5 text-gray-600" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{formatDate(tutorData.created_at)}</span>
                </div>
              </div>
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">{formatDate(tutorData.updated_at)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
