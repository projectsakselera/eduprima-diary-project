'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "@/components/navigation";

export default function TutorDemoPage() {
  const router = useRouter();

  const mockData = {
    tutorName: "Ahmad Budi Santoso",
    completionPercentage: 35,
    nextPriority: "Informasi Pribadi"
  };

  return (
    <div className="space-y-6 p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Demo Tutor Profile Page</h1>
        <p className="text-muted-foreground">
          Halaman mobile-friendly untuk tutor melengkapi data profile
        </p>
      </div>

      {/* Demo Feature Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon="heroicons:device-phone-mobile" className="h-5 w-5" />
              <span>Mobile Optimized</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Desain responsif yang dioptimalkan untuk penggunaan smartphone
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon="heroicons:chart-bar" className="h-5 w-5" />
              <span>Progress Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Progress bar dan checklist untuk tracking kelengkapan data
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon="heroicons:list-bullet" className="h-5 w-5" />
              <span>Field Prioritization</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Sistem prioritas yang menunjukkan field mana yang harus diisi dulu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Icon icon="heroicons:heart" className="h-5 w-5" />
              <span>User Friendly</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Interface yang mudah dipahami dan encouraging untuk tutor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={() => router.push('/eduprima/tutor')}
          className="w-full"
          size="lg"
        >
          <Icon icon="heroicons:arrow-right" className="h-5 w-5 mr-2" />
          Lihat Halaman Tutor Profile
        </Button>
        
        <Button 
          onClick={() => router.push('/eduprima/main/ops/em/database-tutor/add')}
          variant="outline"
          className="w-full"
          size="lg"
        >
          <Icon icon="heroicons:plus" className="h-5 w-5 mr-2" />
          Lihat Form Lengkap Tutor
        </Button>
      </div>

      {/* Features List */}
      <Card>
        <CardHeader>
          <CardTitle>Fitur Yang Diimplementasikan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Badge className="shrink-0 bg-green-100 text-green-800">✓</Badge>
              <span className="text-sm">Mobile-first responsive design</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="shrink-0 bg-green-100 text-green-800">✓</Badge>
              <span className="text-sm">Progress tracking dengan percentage</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="shrink-0 bg-green-100 text-green-800">✓</Badge>
              <span className="text-sm">Section-based field organization</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="shrink-0 bg-green-100 text-green-800">✓</Badge>
              <span className="text-sm">Priority-based completion guidance</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="shrink-0 bg-green-100 text-green-800">✓</Badge>
              <span className="text-sm">Interactive cards dengan status indicators</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="shrink-0 bg-green-100 text-green-800">✓</Badge>
              <span className="text-sm">Support section untuk bantuan</span>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="shrink-0 bg-green-100 text-green-800">✓</Badge>
              <span className="text-sm">Integration dengan navigation menu</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}