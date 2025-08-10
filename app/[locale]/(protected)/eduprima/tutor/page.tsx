'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "@/components/navigation";
import { cn } from "@/lib/utils";

// Mock data - replace with actual user data from API/database
interface TutorProfileStatus {
  completionPercentage: number;
  sections: ProfileSection[];
  tutorInfo: {
    namaLengkap: string;
    email: string;
    fotoProfil?: string;
    trn?: string;
  };
}

interface ProfileSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  isComplete: boolean;
  isRequired: boolean;
  fields: SectionField[];
  route?: string;
}

interface SectionField {
  name: string;
  label: string;
  isComplete: boolean;
  isRequired: boolean;
}

// Mock tutor profile status - replace with API call
const mockTutorStatus: TutorProfileStatus = {
  completionPercentage: 35,
  tutorInfo: {
    namaLengkap: "Ahmad Budi Santoso",
    email: "ahmad.budi@example.com",
    trn: "TRN001234",
  },
  sections: [
    {
      id: "personal",
      title: "Informasi Pribadi",
      description: "Data diri, kontak, dan alamat",
      icon: "heroicons:user",
      isComplete: false,
      isRequired: true,
      route: "/eduprima/main/ops/em/database-tutor/add",
      fields: [
        { name: "namaLengkap", label: "Nama Lengkap", isComplete: true, isRequired: true },
        { name: "email", label: "Email", isComplete: true, isRequired: true },
        { name: "noHp1", label: "Nomor HP", isComplete: true, isRequired: true },
        { name: "tanggalLahir", label: "Tanggal Lahir", isComplete: false, isRequired: true },
        { name: "jenisKelamin", label: "Jenis Kelamin", isComplete: false, isRequired: true },
        { name: "fotoProfil", label: "Foto Profil", isComplete: false, isRequired: true },
      ]
    },
    {
      id: "address",
      title: "Alamat & Lokasi",
      description: "Alamat domisili dan lokasi mengajar",
      icon: "heroicons:map-pin",
      isComplete: false,
      isRequired: true,
      fields: [
        { name: "provinsiDomisili", label: "Provinsi Domisili", isComplete: false, isRequired: true },
        { name: "kotaKabupatenDomisili", label: "Kota/Kabupaten", isComplete: false, isRequired: true },
        { name: "alamatLengkapDomisili", label: "Alamat Lengkap", isComplete: false, isRequired: true },
      ]
    },
    {
      id: "education",
      title: "Pendidikan",
      description: "Riwayat pendidikan dan akademik",
      icon: "heroicons:academic-cap",
      isComplete: false,
      isRequired: true,
      fields: [
        { name: "statusAkademik", label: "Status Akademik", isComplete: false, isRequired: true },
        { name: "namaUniversitas", label: "Nama Universitas", isComplete: false, isRequired: true },
        { name: "jurusan", label: "Jurusan", isComplete: false, isRequired: true },
        { name: "ipk", label: "IPK", isComplete: false, isRequired: false },
      ]
    },
    {
      id: "banking",
      title: "Informasi Bank",
      description: "Data rekening untuk pembayaran",
      icon: "heroicons:banknotes",
      isComplete: false,
      isRequired: true,
      fields: [
        { name: "namaNasabah", label: "Nama Nasabah", isComplete: false, isRequired: true },
        { name: "nomorRekening", label: "Nomor Rekening", isComplete: false, isRequired: true },
        { name: "namaBank", label: "Nama Bank", isComplete: false, isRequired: true },
      ]
    },
    {
      id: "subjects",
      title: "Mata Pelajaran",
      description: "Bidang keahlian dan mata pelajaran",
      icon: "heroicons:book-open",
      isComplete: false,
      isRequired: true,
      fields: [
        { name: "selectedPrograms", label: "Program/Mata Pelajaran", isComplete: false, isRequired: true },
        { name: "keahlianSpesialisasi", label: "Keahlian Spesialisasi", isComplete: false, isRequired: false },
      ]
    },
    {
      id: "experience",
      title: "Pengalaman Mengajar",
      description: "Riwayat dan pengalaman mengajar",
      icon: "heroicons:presentation-chart-line",
      isComplete: false,
      isRequired: false,
      fields: [
        { name: "pengalamanMengajar", label: "Pengalaman Mengajar", isComplete: false, isRequired: false },
        { name: "motivasiMenjadiTutor", label: "Motivasi", isComplete: false, isRequired: false },
      ]
    },
    {
      id: "documents",
      title: "Dokumen",
      description: "Upload dokumen pendukung",
      icon: "heroicons:document-text",
      isComplete: false,
      isRequired: true,
      fields: [
        { name: "dokumenIdentitas", label: "Dokumen Identitas", isComplete: false, isRequired: true },
        { name: "dokumenPendidikan", label: "Dokumen Pendidikan", isComplete: false, isRequired: true },
      ]
    }
  ]
};

const ProfileCompletionCard = ({ section }: { section: ProfileSection }) => {
  const router = useRouter();
  const completedFields = section.fields.filter(field => field.isComplete).length;
  const totalFields = section.fields.length;
  const requiredFields = section.fields.filter(field => field.isRequired).length;
  const completedRequiredFields = section.fields.filter(field => field.isComplete && field.isRequired).length;

  const handleEdit = () => {
    if (section.route) {
      router.push(section.route);
    }
  };

  return (
    <Card className="h-full transition-all duration-200 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              section.isComplete 
                ? "bg-success/10 text-success" 
                : section.isRequired 
                  ? "bg-warning/10 text-warning"
                  : "bg-muted text-muted-foreground"
            )}>
              <Icon icon={section.icon} className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold leading-none">
                {section.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            </div>
          </div>
          <Badge 
            className={`text-xs px-2 py-1 ${section.isComplete ? "bg-green-100 text-green-800" : section.isRequired ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}
          >
            {section.isComplete ? "Lengkap" : section.isRequired ? "Wajib" : "Opsional"}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {completedFields}/{totalFields} field
            </span>
          </div>
          <Progress 
            value={(completedFields / totalFields) * 100} 
            className="h-2"
          />
        </div>

        {/* Required fields status */}
        {requiredFields > 0 && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{completedRequiredFields}/{requiredFields}</span> field wajib telah diisi
          </div>
        )}

        {/* Action button */}
        <Button 
          onClick={handleEdit}
          variant={section.isComplete ? "outline" : "default"}
          size="sm" 
          className="w-full"
        >
          <Icon 
            icon={section.isComplete ? "heroicons:pencil" : "heroicons:plus"} 
            className="h-4 w-4 mr-2" 
          />
          {section.isComplete ? "Edit Data" : "Lengkapi Data"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default function TutorProfilePage() {
  const [tutorStatus, setTutorStatus] = useState<TutorProfileStatus>(mockTutorStatus);
  const router = useRouter();

  // Calculate overall completion
  const totalRequiredSections = tutorStatus.sections.filter(s => s.isRequired).length;
  const completedRequiredSections = tutorStatus.sections.filter(s => s.isRequired && s.isComplete).length;

  // Get next priority section to complete
  const nextSection = tutorStatus.sections.find(s => s.isRequired && !s.isComplete);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section - Mobile Optimized */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Icon icon="heroicons:user-circle" className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-xl font-bold">
                  Hi, {tutorStatus.tutorInfo.namaLengkap}!
                </h1>
                <p className="text-primary-foreground/80 text-sm">
                  {tutorStatus.tutorInfo.trn || "TRN akan segera diberikan"}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="bg-primary-foreground/10 border-primary-foreground/20">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Kelengkapan Profile</span>
                  <Badge className="bg-primary-foreground/20 text-primary-foreground">
                    {tutorStatus.completionPercentage}%
                  </Badge>
                </div>
                <Progress 
                  value={tutorStatus.completionPercentage} 
                  className="h-3 bg-primary-foreground/20"
                />
                <div className="flex justify-between text-sm text-primary-foreground/80">
                  <span>{completedRequiredSections}/{totalRequiredSections} bagian wajib selesai</span>
                  <span>{tutorStatus.completionPercentage < 100 ? "Belum lengkap" : "Lengkap!"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 space-y-6">
        
        {/* Quick Action - Next Priority */}
        {nextSection && (
          <Card className="border-warning/20 bg-warning/5">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3 mb-3">
                <Icon icon="heroicons:exclamation-triangle" className="h-5 w-5 text-warning" />
                <h3 className="font-semibold text-foreground">Prioritas Selanjutnya</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Lengkapi <strong>{nextSection.title}</strong> untuk melanjutkan proses verifikasi sebagai tutor.
              </p>
              <Button 
                onClick={() => nextSection.route && router.push(nextSection.route)}
                size="sm" 
                className="w-full"
              >
                <Icon icon="heroicons:arrow-right" className="h-4 w-4 mr-2" />
                Lengkapi Sekarang
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Completion Status Message */}
        {tutorStatus.completionPercentage >= 100 ? (
          <Card className="border-success/20 bg-success/5">
            <CardContent className="p-4 text-center">
              <Icon icon="heroicons:check-circle" className="h-12 w-12 text-success mx-auto mb-3" />
              <h3 className="font-semibold text-success mb-2">Profile Lengkap!</h3>
              <p className="text-sm text-muted-foreground">
                Profile Anda sudah lengkap dan sedang dalam proses verifikasi tim Eduprima.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-info/20 bg-info/5">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Icon icon="heroicons:information-circle" className="h-5 w-5 text-info mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Lengkapi Profile Anda</h3>
                  <p className="text-sm text-muted-foreground">
                    Pastikan semua data wajib sudah terisi untuk memulai mengajar di Eduprima. 
                    Data yang lengkap akan mempercepat proses verifikasi.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Sections Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Bagian Profile</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tutorStatus.sections.map((section) => (
              <ProfileCompletionCard key={section.id} section={section} />
            ))}
          </div>
        </div>

        {/* Support Section */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Icon icon="heroicons:chat-bubble-left-ellipsis" className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1">Butuh Bantuan?</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Tim support Eduprima siap membantu Anda melengkapi profile tutor.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm">
                    <Icon icon="heroicons:chat-bubble-left" className="h-4 w-4 mr-2" />
                    Chat Support
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icon icon="heroicons:phone" className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}