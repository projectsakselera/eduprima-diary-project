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
import { createClient } from '@supabase/supabase-js';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

// Supabase Configuration
const supabaseUrl = 'https://btnsfqhgrjdyxwjiomrj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bnNmcWhncmpkeXh3amlvbXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODAwOTEsImV4cCI6MjA2Nzk1NjA5MX0.AzC7DZEmzIs9paMsrPJKYdCH4J2pLKMcaPF_emVZH6Q';
const supabase = createClient(supabaseUrl, supabaseKey);

interface TutorData {
  id: string;
  trn?: string;
  nama_lengkap: string;
  email: string;
  no_hp_1?: string;
  status_tutor?: string;
  mata_pelajaran_sd?: string[];
  mata_pelajaran_smp?: string[];
  mata_pelajaran_sma_ipa?: string[];
  mata_pelajaran_sma_ips?: string[];
  mata_pelajaran_smk_teknik?: string[];
  mata_pelajaran_smk_bisnis?: string[];
  mata_pelajaran_smk_pariwisata?: string[];
  mata_pelajaran_smk_kesehatan?: string[];
  mata_pelajaran_bahasa_asing?: string[];
  mata_pelajaran_universitas?: string[];
  mata_pelajaran_keterampilan?: string[];
  tarif_per_jam?: number;
  created_at?: string;
  updated_at?: string;
}

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
  const [sortField, setSortField] = useState<string>('nama_lengkap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [tutorTableName, setTutorTableName] = useState<string>('tutors');

  // Check database connection and available tables
  const checkDatabaseConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      
      // First try with API route
      try {
        const apiResponse = await fetch('/api/supabase/check-tables');
        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          console.log('Available tables (via API):', apiData.tables);
          
          // Check if any tutor-related table exists
          const tutorTables = apiData.tables?.filter((table: string) => 
            table.toLowerCase().includes('tutor') || 
            table.toLowerCase().includes('teacher') ||
            table.toLowerCase().includes('user')
          );
          console.log('Tutor-related tables found:', tutorTables);
          
          if (tutorTables && tutorTables.length > 0) {
            // Try the most likely candidate
            setTutorTableName(tutorTables[0]);
            console.log('Using table:', tutorTables[0]);
          }
          
          return true;
        }
      } catch (apiError) {
        console.warn('API route failed, trying direct connection');
      }
      
      // Fallback: Test basic connection directly
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      if (error) {
        console.error('Connection test failed:', error);
        return false;
      }

      console.log('Available tables:', data?.map(t => t.table_name));
      
      // Look for tutor-related tables
      const tutorTables = data?.filter(t => 
        t.table_name.toLowerCase().includes('tutor') || 
        t.table_name.toLowerCase().includes('teacher') ||
        t.table_name.toLowerCase().includes('user')
      );
      
      if (tutorTables && tutorTables.length > 0) {
        setTutorTableName(tutorTables[0].table_name);
        console.log('Using table:', tutorTables[0].table_name);
      }
      
      return true;
    } catch (err) {
      console.error('Database connection error:', err);
      return false;
    }
  };

  // Load tutors data from Supabase
  const loadTutors = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // First check database connection
      const isConnected = await checkDatabaseConnection();
      if (!isConnected) {
        throw new Error('Failed to connect to database');
      }

      console.log('Attempting to query tutors table...');
      
      // Try simple query first
      let data, error;
      
      try {
        console.log('Trying table:', tutorTableName);
        const result = await supabase
          .from(tutorTableName)
          .select('*')
          .limit(10);
        
        data = result.data;
        error = result.error;
        
        if (error) {
          console.error('Simple query failed:', error);
          throw error;
        }
        
        console.log('Simple query successful, sample data:', data?.[0]);
        
        // If simple query works, try the full query
        if (data && data.length > 0) {
          console.log('Attempting full query with specific columns...');
          const fullResult = await supabase
            .from(tutorTableName)
            .select(`
              id,
              trn,
              nama_lengkap,
              email,
              no_hp_1,
              status_tutor,
              mata_pelajaran_sd,
              mata_pelajaran_smp,
              mata_pelajaran_sma_ipa,
              mata_pelajaran_sma_ips,
              mata_pelajaran_smk_teknik,
              mata_pelajaran_smk_bisnis,
              mata_pelajaran_smk_pariwisata,
              mata_pelajaran_smk_kesehatan,
              mata_pelajaran_bahasa_asing,
              mata_pelajaran_universitas,
              mata_pelajaran_keterampilan,
              tarif_per_jam,
              created_at,
              updated_at
            `)
            .order('created_at', { ascending: false })
            .limit(100);
          
          if (fullResult.error) {
            console.warn('Full query failed, using simple query data:', fullResult.error);
            // Keep using the simple query data
          } else {
            data = fullResult.data;
            console.log('Full query successful');
          }
        }
        
      } catch (queryError) {
        console.error('Query failed:', queryError);
        throw queryError;
      }

      if (error) throw error;

      setTutors(data || []);
      calculateStats(data || []);
      
    } catch (err) {
      console.error('Error loading tutors:', err);
      console.error('Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        error: err,
        errorString: JSON.stringify(err, null, 2)
      });
      
      let errorMessage = 'Failed to load tutor data';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err);
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate dashboard statistics
  const calculateStats = (tutorData: TutorData[]) => {
    const total = tutorData.length;
    const active = tutorData.filter(t => t.status_tutor === 'active').length;
    const pending = tutorData.filter(t => t.status_tutor === 'pending').length;
    const inactive = tutorData.filter(t => t.status_tutor === 'inactive').length;
    
    // Calculate average hourly rate
    const validRates = tutorData
      .map(t => t.tarif_per_jam)
      .filter((rate): rate is number => rate !== null && rate !== undefined);
    const avgRate = validRates.length > 0 
      ? validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length 
      : 0;

    // Count total subjects taught
    const allSubjects = new Set<string>();
    tutorData.forEach(tutor => {
      [
        ...(tutor.mata_pelajaran_sd || []),
        ...(tutor.mata_pelajaran_smp || []),
        ...(tutor.mata_pelajaran_sma_ipa || []),
        ...(tutor.mata_pelajaran_sma_ips || []),
        ...(tutor.mata_pelajaran_smk_teknik || []),
        ...(tutor.mata_pelajaran_smk_bisnis || []),
        ...(tutor.mata_pelajaran_smk_pariwisata || []),
        ...(tutor.mata_pelajaran_smk_kesehatan || []),
        ...(tutor.mata_pelajaran_bahasa_asing || []),
        ...(tutor.mata_pelajaran_universitas || []),
        ...(tutor.mata_pelajaran_keterampilan || [])
      ].forEach(subject => allSubjects.add(subject));
    });

    // Count recent tutors (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recent = tutorData.filter(t => 
      t.created_at && new Date(t.created_at) > sevenDaysAgo
    ).length;

    setStats({
      totalTutors: total,
      activeTutors: active,
      pendingTutors: pending,
      inactiveTutors: inactive,
      avgHourlyRate: Math.round(avgRate),
      totalSubjects: allSubjects.size,
      recentTutors: recent
    });
  };

  // Filter and sort tutors
  const filteredAndSortedTutors = useMemo(() => {
    let filtered = tutors.filter(tutor => {
      const matchesSearch = 
        tutor.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.trn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.no_hp_1?.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || tutor.status_tutor === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof TutorData] || '';
      let bValue = b[sortField as keyof TutorData] || '';
      
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
    router.push(`/eduprima/main/ops/em/matchmaking/database-tutor/view/${id}`);
  };

  const handleEditTutor = (id: string) => {
    router.push(`/eduprima/main/ops/em/matchmaking/database-tutor/edit/${id}`);
  };

  const handleAddTutor = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor/add');
  };

  const handleImportExport = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor/import-export');
  };

  const handleMigration = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor/migration/dashboard');
  };

  const handleViewAll = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor/view-all');
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
                    <TableHead>TRN</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rate/Hour</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTutors.slice(0, 10).map((tutor) => (
                    <TableRow key={tutor.id}>
                      <TableCell className="font-medium">
                        {tutor.nama_lengkap}
                      </TableCell>
                      <TableCell>
                                                 <Badge className="border border-border bg-background font-mono text-xs">
                           {tutor.trn || 'N/A'}
                         </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{tutor.email}</div>
                          <div className="text-muted-foreground">{tutor.no_hp_1}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusVariant(tutor.status_tutor)}>
                          {tutor.status_tutor || 'Unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tutor.tarif_per_jam 
                          ? `Rp ${tutor.tarif_per_jam.toLocaleString()}`
                          : 'Not set'
                        }
                      </TableCell>
                      <TableCell>
                                                 <Badge className="bg-secondary text-secondary-foreground text-xs">
                           {[
                             ...(tutor.mata_pelajaran_sd || []),
                             ...(tutor.mata_pelajaran_smp || []),
                             ...(tutor.mata_pelajaran_sma_ipa || []),
                             ...(tutor.mata_pelajaran_sma_ips || []),
                           ].length} subjects
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