'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  Plus,
  FileText,
  BarChart3,
  UserPlus,
  Loader2,
  RefreshCw,
  Database,
  CheckCircle,
  XCircle,
  Star
} from "lucide-react";
import { useRouter } from "@/components/navigation";
import { SupabaseTutorService, CombinedTutorData } from "@/lib/supabase-service";

export default function ViewAllTutorsPage() {
  const router = useRouter();
  
  // Supabase data state
  const [tutors, setTutors] = useState<CombinedTutorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataCount, setDataCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [onboardingFilter, setOnboardingFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof CombinedTutorData>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTutors, setSelectedTutors] = useState<Set<string>>(new Set());
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Fetch tutors from Supabase
  const fetchTutors = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const result = await SupabaseTutorService.getAllTutors();
      
      if (result.error) {
        setError(result.error);
        setTutors([]);
        setDataCount(0);
      } else {
        setTutors(result.data || []);
        setDataCount(result.count);
        setError(null);
      }
    } catch (err) {
      console.error('Error fetching tutors:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tutors');
      setTutors([]);
      setDataCount(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchTutors();
  }, []);

  // Filter and sort data
  const filteredAndSortedTutors = useMemo(() => {
    let filtered = tutors.filter(tutor => {
      const matchesSearch = 
        tutor.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tutor.phone?.includes(searchTerm) ||
        tutor.mobile_phone?.includes(searchTerm) ||
        tutor.teaching_subjects?.some(subject => 
          subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = statusFilter === 'all' || tutor.user_status === statusFilter;
      const matchesOnboarding = onboardingFilter === 'all' || tutor.onboarding_status === onboardingFilter;
      
      return matchesSearch && matchesStatus && matchesOnboarding;
    });

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aStr = aValue.toLowerCase();
        const bStr = bValue.toLowerCase();
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
      
      // Handle numeric and other types
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tutors, searchTerm, statusFilter, onboardingFilter, sortField, sortDirection]);

  const handleSort = (field: keyof CombinedTutorData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTutors(new Set(filteredAndSortedTutors.map(t => t.id)));
    } else {
      setSelectedTutors(new Set());
    }
  };

  const handleSelectTutor = (tutorId: string, checked: boolean) => {
    const newSelected = new Set(selectedTutors);
    if (checked) {
      newSelected.add(tutorId);
    } else {
      newSelected.delete(tutorId);
    }
    setSelectedTutors(newSelected);
  };

  const handleExport = () => {
    console.log('Exporting tutors...', filteredAndSortedTutors);
    // Implement export functionality here
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'inactive': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'pending_verification': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'suspended': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  const getOnboardingBadge = (status: string) => {
    const styles = {
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'pending_profile': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'pending_verification': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'rejected': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Tutor</h1>
          <p className="text-muted-foreground">
            Complete view and management of all tutors from Supabase database
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button 
            variant="outline" 
            onClick={() => fetchTutors(true)} 
            disabled={isRefreshing}
            className="gap-2"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => router.push('/eduprima/main/ops/em/matchmaking/database-tutor/add')} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Tutor
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      {error && (
        <Alert>
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">❌ Database Error</div>
              <div className="text-sm">{error}</div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => fetchTutors()}
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Analytics Cards - Show when analytics is enabled */}
      {showAnalytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dataCount}</div>
              <p className="text-xs text-muted-foreground">
                From Supabase database
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tutors.length > 0 
                  ? (tutors.reduce((acc, t) => acc + t.average_rating, 0) / tutors.length).toFixed(1)
                  : '0.0'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Average tutor rating
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tutors.reduce((acc, t) => acc + t.total_teaching_hours, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Hours taught
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tutors.filter(t => t.user_status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently active
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Advanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or teaching subjects..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending_verification">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={onboardingFilter} onValueChange={setOnboardingFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Onboarding" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Onboarding</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending_profile">Pending Profile</SelectItem>
                  <SelectItem value="pending_verification">Pending Verify</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedTutors.size > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedTutors.size} tutors selected
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-3 w-3" />
                Delete Selected
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tutors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Tutor Database ({filteredAndSortedTutors.length} found)
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mb-4" />
              <div className="text-xl font-medium text-muted-foreground mb-2">
                Loading tutors from Supabase...
              </div>
              <div className="text-sm text-muted-foreground">
                Fetching data from database tables
              </div>
            </div>
          ) : filteredAndSortedTutors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <UserPlus className="h-20 w-20 text-muted-foreground/30 mb-6" />
              <div className="text-xl font-medium text-muted-foreground mb-2">
                {tutors.length === 0 ? "No tutors in database" : "No tutors match your filters"}
              </div>
              <div className="text-sm text-muted-foreground text-center mb-8 max-w-md">
                {tutors.length === 0 
                  ? "No tutor data found in the database. Check if tutors have been added with role 'educator' or 'tutor'."
                  : "No tutors match your current search and filter criteria. Try adjusting your filters or search terms."
                }
              </div>
              {tutors.length === 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button onClick={() => router.push('/en/test/form-supabase')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Test Tutor
                  </Button>
                  <Button variant="outline" onClick={() => fetchTutors()} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Refresh Data
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox 
                        checked={
                          filteredAndSortedTutors.length > 0 && 
                          filteredAndSortedTutors.every(t => selectedTutors.has(t.id))
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('display_name')} className="h-8 p-0">
                        Name & Contact
                        {sortField === 'display_name' && (
                          sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortField !== 'display_name' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>Teaching Info</TableHead>
                    <TableHead>Education</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('average_rating')} className="h-8 p-0">
                        Performance
                        {sortField === 'average_rating' && (
                          sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortField !== 'average_rating' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('created_at')} className="h-8 p-0">
                        Joined
                        {sortField === 'created_at' && (
                          sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortField !== 'created_at' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTutors.map((tutor) => (
                    <TableRow key={tutor.id}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedTutors.has(tutor.id)}
                          onCheckedChange={(checked) => handleSelectTutor(tutor.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {tutor.display_name || `${tutor.first_name} ${tutor.last_name}`}
                            </span>
                            {tutor.is_top_educator && (
                              <Badge className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                ⭐ Top
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{tutor.email}</span>
                          <span className="text-xs text-muted-foreground">{tutor.mobile_phone || tutor.phone}</span>
                          <span className="text-xs text-blue-600 dark:text-blue-400">{tutor.user_code}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2 max-w-xs">
                          <div className="flex flex-wrap gap-1">
                            {tutor.teaching_subjects && tutor.teaching_subjects.length > 0 ? (
                              <>
                                {tutor.teaching_subjects.slice(0, 2).map((subject) => (
                                  <Badge key={subject} className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                    {subject}
                                  </Badge>
                                ))}
                                {tutor.teaching_subjects.length > 2 && (
                                  <Badge className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                    +{tutor.teaching_subjects.length - 2}
                                  </Badge>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No subjects listed</span>
                            )}
                          </div>
                          {tutor.teaching_service_options && tutor.teaching_service_options.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {tutor.teaching_service_options.slice(0, 2).map((service) => (
                                <Badge key={service} className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  {service}
                                </Badge>
                              ))}
                              {tutor.teaching_service_options.length > 2 && (
                                <Badge className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                  +{tutor.teaching_service_options.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1 max-w-xs">
                          {tutor.education_level && (
                            <div className="font-medium">{tutor.education_level}</div>
                          )}
                          {tutor.university && (
                            <div className="text-muted-foreground">{tutor.university}</div>
                          )}
                          {tutor.major && (
                            <div className="text-xs text-muted-foreground">{tutor.major}</div>
                          )}
                          {tutor.city && (
                            <div className="text-xs text-blue-600 dark:text-blue-400">📍 {tutor.city}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            <span className="font-medium">{tutor.average_rating.toFixed(1)}</span>
                          </div>
                          <div className="text-muted-foreground">
                            {tutor.total_teaching_hours}h taught
                          </div>
                          {tutor.cancellation_rate > 0 && (
                            <div className="text-xs text-orange-600">
                              {tutor.cancellation_rate.toFixed(1)}% cancel rate
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <Badge className={getStatusBadge(tutor.user_status)}>
                            {tutor.user_status}
                          </Badge>
                          <Badge className={getOnboardingBadge(tutor.onboarding_status)}>
                            {tutor.onboarding_status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(tutor.created_at).toLocaleDateString('id-ID')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => router.push(`/eduprima/main/ops/em/matchmaking/database-tutor/view/${tutor.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/eduprima/main/ops/em/matchmaking/database-tutor/edit/${tutor.id}`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 