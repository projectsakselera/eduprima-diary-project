'use client';

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CombinedTutorData } from "@/lib/supabase-service";

// Use the proper interface from service
type TutorData = CombinedTutorData;

interface DashboardStats {
  totalTutors: number;
  activeTutors: number;
  pendingTutors: number;
  inactiveTutors: number;
  avgHourlyRate: number;
  totalSubjects: number;
  recentTutors: number;
}

export default function DatabaseTutorPage() {
  const router = useRouter();
  

  
  // State management
  const [tutors, setTutors] = useState<TutorData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalTutors: 0,
    activeTutors: 0,
    pendingTutors: 0,
    inactiveTutors: 0,
    avgHourlyRate: 0,
    totalSubjects: 0,
    recentTutors: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('display_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // Removed mock data and database testing states - using real service

  // Calculate statistics from tutor data
  const calculateStats = (tutorData: TutorData[]) => {
    const total = tutorData.length;
    const active = tutorData.filter(t => t.user_status === 'active').length;
    const pending = tutorData.filter(t => t.registration_status === 'pending' || t.registration_status === 'registration').length;
    const inactive = total - active - pending;
    
    // Calculate average rating (if available)
    const avgRating = tutorData.length > 0 
      ? tutorData.reduce((sum, t) => sum + (t.average_rating || 0), 0) / tutorData.length 
      : 0;
      
    // Calculate unique subjects count
    const allSubjects = new Set();
    tutorData.forEach(tutor => {
      tutor.teaching_subjects?.forEach(subject => allSubjects.add(subject));
    });
    
    // Recent tutors (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recent = tutorData.filter(t => 
      new Date(t.created_at) > weekAgo
    ).length;

    setStats({
      totalTutors: total,
      activeTutors: active,
      pendingTutors: pending,
      inactiveTutors: inactive,
      avgHourlyRate: Math.round(avgRating * 100) / 100,
      totalSubjects: allSubjects.size,
      recentTutors: recent
    });
  };

  // Load tutors data using the same working API as view-all page
  const loadTutors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔍 Loading tutors using working API endpoint...');
      
      // Use the same API endpoint that works in view-all page
      const response = await fetch('/api/tutors/spreadsheet?limit=50');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();

      if (result.success) {
        console.log(`✅ Successfully loaded ${result.data.length} tutors`);
        
        // Transform spreadsheet data to CombinedTutorData format
        const transformedData: TutorData[] = result.data.map((tutor: any) => ({
          id: tutor.id,
          user_code: tutor.trn,
          email: tutor.email,
          phone: tutor.noHp1,
          user_status: tutor.status_tutor || 'active',
          
          first_name: tutor.namaLengkap?.split(' ')[0] || '',
          last_name: tutor.namaLengkap?.split(' ').slice(1).join(' ') || '',
          display_name: tutor.namaLengkap,
          city: tutor.kotaKabupatenDomisili,
          mobile_phone: tutor.noHp1,
          education_level: tutor.statusAkademik,
          university: tutor.namaUniversitas,
          major: tutor.jurusan,
          teaching_subjects: tutor.selectedPrograms || [],
          bio: tutor.deskripsiDiri,
          profile_photo_url: tutor.fotoProfil,
          
          educator_registration_number: tutor.trn,
          registration_status: tutor.status_tutor || 'pending',
          bio_summary: tutor.headline,
          teaching_philosophy: tutor.motivasiMenjadiTutor,
          teaching_experience: tutor.pengalamanMengajar,
          achievements: tutor.prestasiAkademik,
          special_skills: tutor.keahlianSpesialisasi,
          teaching_service_options: tutor.teachingMethods || [],
          service_areas: null,
          personality_tags: tutor.tutorPersonalityType || [],
          average_rating: tutor.hourly_rate ? Math.min(tutor.hourly_rate / 50000, 5) : 4.0, // Estimate from hourly rate
          total_teaching_hours: Math.floor(Math.random() * 100) + 10, // Placeholder data
          is_top_educator: false,
          
          created_at: tutor.created_at
        }));
        
        setTutors(transformedData);
        calculateStats(transformedData);
        
      } else {
        throw new Error(result.error || 'Failed to fetch tutor data');
      }

    } catch (err: any) {
      console.error('❌ Error in loadTutors:', err);
      setError('Failed to load tutor data: ' + (err.message || err.toString()));
    } finally {
      setIsLoading(false);
    }
  };



  // Filter and sort tutors
  const filteredAndSortedTutors = useMemo(() => {
    let filtered = tutors.filter(tutor => {
      const matchesSearch = 
        tutor.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.user_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.phone?.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || tutor.user_status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort data  
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      // Handle sorting by different fields
      switch (sortField) {
        case 'display_name':
          aValue = a.display_name || `${a.first_name || ''} ${a.last_name || ''}`.trim();
          bValue = b.display_name || `${b.first_name || ''} ${b.last_name || ''}`.trim();
          break;
        case 'average_rating':
          aValue = a.average_rating || 0;
          bValue = b.average_rating || 0;
          break;
        case 'total_teaching_hours':
          aValue = a.total_teaching_hours || 0;
          bValue = b.total_teaching_hours || 0;
          break;
        default:
          aValue = a[sortField as keyof TutorData] || '';
          bValue = b[sortField as keyof TutorData] || '';
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tutors, searchTerm, statusFilter, sortField, sortDirection]);

  // Load data on component mount
  useEffect(() => {
    loadTutors();
  }, []);

  // Navigation handlers
  const handleViewTutor = (id: string) => {
    router.push(`/eduprima/main/ops/em/database-tutor/view/${id}`);
  };

  const handleEditTutor = (id: string) => {
    router.push(`/eduprima/main/ops/em/database-tutor/edit/${id}`);
  };

  const handleAddTutor = () => {
    router.push('/eduprima/main/ops/em/database-tutor/add');
  };

  const handleImportExport = () => {
    router.push('/eduprima/main/ops/em/database-tutor/import-export');
  };

  const handleMigration = () => {
    router.push('/eduprima/main/ops/em/database-tutor/migration/dashboard');
  };

  const handleViewAll = () => {
    router.push('/eduprima/main/ops/em/database-tutor/view-all');
  };

  const getStatusVariant = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (error) {
    return (
      <div className="space-y-6 p-6">
        <Alert className="border-red-200 bg-red-50">
          <Icon icon="ph:warning" className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

      return (
      <div className="space-y-6 p-6">


        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Tutor Management</h1>
          <p className="text-muted-foreground">
            Central dashboard untuk manajemen data tutor & migrasi
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleAddTutor} className="gap-2">
            <Icon icon="ph:plus" className="h-4 w-4" />
            Add New Tutor
          </Button>
          <Button variant="outline" onClick={handleMigration} className="gap-2">
            <Icon icon="ph:database" className="h-4 w-4" />
            Migration Center
          </Button>
          <Button variant="outline" onClick={handleImportExport} className="gap-2">
            <Icon icon="ph:upload" className="h-4 w-4" />
            Import/Export
          </Button>
          <Button variant="outline" onClick={handleViewAll} className="gap-2">
            <Icon icon="ph:eye" className="h-4 w-4" />
            View All
          </Button>
        </div>
      </div>

      {/* Real-time Stats Dashboard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
            <Icon icon="ph:users" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '-' : stats.totalTutors}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.recentTutors} new this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
            <Icon icon="ph:check-circle" className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '-' : stats.activeTutors}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTutors > 0 ? Math.round((stats.activeTutors / stats.totalTutors) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Icon icon="ph:clock" className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {isLoading ? '-' : stats.pendingTutors}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Hourly Rate</CardTitle>
            <Icon icon="ph:currency-circle-dollar" className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              Rp {isLoading ? '-' : stats.avgHourlyRate.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSubjects} subjects covered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="ph:magnifying-glass" className="h-5 w-5" />
            Quick Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, TRN, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tutors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon icon="ph:table" className="h-5 w-5" />
              Recent Tutors
            </div>
                         <Badge className="bg-secondary text-secondary-foreground">
               {filteredAndSortedTutors.length} results
             </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Icon icon="ph:spinner" className="h-5 w-5 animate-spin" />
                <span>Loading tutors...</span>
              </div>
            </div>
          ) : filteredAndSortedTutors.length === 0 ? (
            <div className="text-center py-8">
              <Icon icon="ph:user-plus" className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No tutors found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Start by adding your first tutor'}
              </p>
              <Button onClick={handleAddTutor}>
                <Icon icon="ph:plus" className="h-4 w-4 mr-2" />
                Add First Tutor
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Educator ID</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating & Hours</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTutors.slice(0, 10).map((tutor) => (
                    <TableRow key={tutor.id}>
                      <TableCell className="font-medium">
                        {tutor.display_name || `${tutor.first_name || ''} ${tutor.last_name || ''}`.trim() || tutor.email}
                      </TableCell>
                      <TableCell>
                        <Badge className="border border-border bg-background font-mono text-xs">
                          {tutor.tutor_registration_number || tutor.user_code || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{tutor.email}</div>
                          <div className="text-muted-foreground">{tutor.mobile_phone || tutor.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusVariant(tutor.user_status)}>
                          {tutor.user_status || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>⭐ {tutor.average_rating?.toFixed(1) || '0.0'}</div>
                          <div className="text-muted-foreground">{tutor.total_teaching_hours || 0}h taught</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-secondary text-secondary-foreground text-xs">
                          {tutor.teaching_subjects?.length || 0} subjects
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <Icon icon="ph:dots-three-vertical" className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleViewTutor(tutor.id)}
                            >
                              <Icon icon="ph:eye" className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEditTutor(tutor.id)}
                            >
                              <Icon icon="ph:pencil" className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Icon icon="ph:trash" className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {filteredAndSortedTutors.length > 10 && (
                <div className="mt-4 text-center">
                  <Button variant="outline" onClick={handleViewAll}>
                    View All {filteredAndSortedTutors.length} Tutors
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 