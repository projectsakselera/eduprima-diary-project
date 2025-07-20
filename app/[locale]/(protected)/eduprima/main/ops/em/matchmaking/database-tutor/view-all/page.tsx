'use client';

import { useState, useMemo } from "react";
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
  UserPlus
} from "lucide-react";
import { useRouter } from "@/components/navigation";

interface Tutor {
  id: string;
  name: string;
  email: string;
  phone: string;
  subjects: string[];
  skills: string[];
  hourlyRate: string;
  status: 'active' | 'inactive' | 'pending';
  availability: string[];
  joinDate: string;
  totalSessions: number;
  rating: number;
}

export default function ViewAllTutorsPage() {
  const router = useRouter();
  
  // Empty array - in the future this would come from API/database
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Tutor>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedTutors, setSelectedTutors] = useState<Set<string>>(new Set());
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Filter and sort data
  const filteredAndSortedTutors = useMemo(() => {
    let filtered = tutors.filter(tutor => {
      const matchesSearch = tutor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tutor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tutor.phone.includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || tutor.status === statusFilter;
      const matchesSubject = subjectFilter === 'all' || tutor.subjects.includes(subjectFilter);
      
      return matchesSearch && matchesStatus && matchesSubject;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tutors, searchTerm, statusFilter, subjectFilter, sortField, sortDirection]);

  const handleSort = (field: keyof Tutor) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleDelete = (id: string) => {
    setTutors(prev => prev.filter(tutor => tutor.id !== id));
    setSelectedTutors(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
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

  const handleBulkDelete = () => {
    setTutors(prev => prev.filter(tutor => !selectedTutors.has(tutor.id)));
    setSelectedTutors(new Set());
  };

  const handleExport = () => {
    // Mock export functionality
    console.log('Exporting tutors...', filteredAndSortedTutors);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Tutors</h1>
          <p className="text-muted-foreground">
            Complete view and management of all tutors in the database
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

      {/* Analytics Cards - Show when analytics is enabled */}
      {showAnalytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tutors.length}</div>
              <p className="text-xs text-muted-foreground">
                All registered tutors
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tutors.length > 0 
                  ? (tutors.reduce((acc, t) => acc + t.rating, 0) / tutors.length).toFixed(1)
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
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tutors.reduce((acc, t) => acc + t.totalSessions, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Sessions conducted
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tutors</CardTitle>
              <Eye className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tutors.filter(t => t.status === 'active').length}
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
                placeholder="Search by name, email, phone, or skills..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Indonesian">Indonesian</SelectItem>
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
                 onClick={handleBulkDelete}
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
              <UserPlus className="h-5 w-5" />
              Tutors Database ({filteredAndSortedTutors.length} found)
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedTutors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <UserPlus className="h-20 w-20 text-muted-foreground/30 mb-6" />
              <div className="text-xl font-medium text-muted-foreground mb-2">
                No tutors found
              </div>
              <div className="text-sm text-muted-foreground text-center mb-8 max-w-md">
                {tutors.length === 0 
                  ? "The tutor database is empty. Start by adding tutors to build your database."
                  : "No tutors match your current search and filter criteria. Try adjusting your filters or search terms."
                }
              </div>
              {tutors.length === 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button onClick={() => router.push('/eduprima/main/ops/em/matchmaking/database-tutor/add')} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add First Tutor
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/eduprima/main/ops/em/matchmaking/database-tutor/import-export')} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Import Tutors
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
                      <Button variant="ghost" onClick={() => handleSort('name')} className="h-8 p-0">
                        Name & Contact
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortField !== 'name' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>Subjects & Skills</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('hourlyRate')} className="h-8 p-0">
                        Rate
                        {sortField === 'hourlyRate' && (
                          sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortField !== 'hourlyRate' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('rating')} className="h-8 p-0">
                        Rating
                        {sortField === 'rating' && (
                          sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortField !== 'rating' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('joinDate')} className="h-8 p-0">
                        Join Date
                        {sortField === 'joinDate' && (
                          sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortField !== 'joinDate' && <ArrowUpDown className="ml-2 h-4 w-4" />}
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
                          <span className="font-semibold">{tutor.name}</span>
                          <span className="text-sm text-muted-foreground">{tutor.email}</span>
                          <span className="text-xs text-muted-foreground">{tutor.phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1">
                            {tutor.subjects.slice(0, 2).map((subject) => (
                              <Badge key={subject} className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                {subject}
                              </Badge>
                            ))}
                            {tutor.subjects.length > 2 && (
                              <Badge className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                +{tutor.subjects.length - 2}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {tutor.skills.slice(0, 2).map((skill) => (
                              <Badge key={skill} className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                {skill}
                              </Badge>
                            ))}
                            {tutor.skills.length > 2 && (
                              <Badge className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                +{tutor.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-green-600">
                          Rp {parseInt(tutor.hourlyRate).toLocaleString('id-ID')}/hr
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-medium">{tutor.rating.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            tutor.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : tutor.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }
                        >
                          {tutor.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{tutor.totalSessions}</div>
                          <div className="text-muted-foreground">sessions</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(tutor.joinDate).toLocaleDateString('id-ID')}
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
                            <DropdownMenuItem 
                              onClick={() => handleDelete(tutor.id)}
                              className="text-destructive"
                            >
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