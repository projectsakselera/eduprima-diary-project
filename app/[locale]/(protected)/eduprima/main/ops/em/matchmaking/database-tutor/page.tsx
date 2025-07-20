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
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Upload,
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
}

export default function DatabaseTutorPage() {
  const router = useRouter();
  
  // Empty array - in the future this would come from API/database
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Tutor>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const handleViewAll = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor/view-all');
  };

  const handleAddTutor = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor/add');
  };

  const handleImportExport = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor/import-export');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Tutor</h1>
          <p className="text-muted-foreground">
            Manage tutor database for matchmaking process
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleAddTutor} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Tutor
          </Button>
          <Button variant="outline" onClick={handleImportExport} className="gap-2">
            <Upload className="h-4 w-4" />
            Import/Export
          </Button>
          <Button variant="outline" onClick={handleViewAll} className="gap-2">
            <Eye className="h-4 w-4" />
            View All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tutors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tutors.length}</div>
            <p className="text-xs text-muted-foreground">
              Registered tutors in database
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
              {tutors.filter(t => t.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active and available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tutors.filter(t => t.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Tutors</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tutors.filter(t => t.status === 'inactive').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently not available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tutors by name, email, or phone..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
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
              <SelectTrigger className="w-full sm:w-[180px]">
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
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tutor Database ({filteredAndSortedTutors.length} tutors)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedTutors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <UserPlus className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <div className="text-lg font-medium text-muted-foreground mb-2">
                No tutors found
              </div>
              <div className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                {tutors.length === 0 
                  ? "Get started by adding your first tutor to the database."
                  : "No tutors match your current filters. Try adjusting your search criteria."
                }
              </div>
              {tutors.length === 0 && (
                <Button onClick={handleAddTutor} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add First Tutor
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort('name')} className="h-8 p-0">
                        Name
                        {sortField === 'name' && (
                          sortDirection === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                        )}
                        {sortField !== 'name' && <ArrowUpDown className="ml-2 h-4 w-4" />}
                      </Button>
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Subjects</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Status</TableHead>
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
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{tutor.name}</span>
                          <span className="text-sm text-muted-foreground">{tutor.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{tutor.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                                                 <div className="flex flex-wrap gap-1">
                           {tutor.subjects.slice(0, 2).map((subject) => (
                             <Badge key={subject} className="text-xs">
                               {subject}
                             </Badge>
                           ))}
                           {tutor.subjects.length > 2 && (
                             <Badge className="text-xs">
                               +{tutor.subjects.length - 2}
                             </Badge>
                           )}
                         </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          Rp {parseInt(tutor.hourlyRate).toLocaleString('id-ID')}/hr
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(tutor.status)}
                          <span className="capitalize">{getStatusText(tutor.status)}</span>
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