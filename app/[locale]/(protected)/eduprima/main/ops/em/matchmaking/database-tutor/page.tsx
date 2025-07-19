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
  Upload
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
  
  // Mock data
  const mockTutors: Tutor[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+62 812-3456-7890',
      subjects: ['Mathematics', 'Physics'],
      skills: ['Problem Solving', 'Communication'],
      hourlyRate: '150000',
      status: 'active',
      availability: ['Monday Morning', 'Tuesday Afternoon'],
      joinDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Ahmad Rahman',
      email: 'ahmad.rahman@example.com',
      phone: '+62 813-4567-8901',
      subjects: ['English', 'Indonesian'],
      skills: ['Public Speaking', 'Leadership'],
      hourlyRate: '120000',
      status: 'active',
      availability: ['Wednesday Evening', 'Thursday Morning'],
      joinDate: '2024-02-20'
    },
    {
      id: '3',
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      phone: '+62 814-5678-9012',
      subjects: ['Chemistry', 'Biology'],
      skills: ['Critical Thinking', 'Analytical Skills'],
      hourlyRate: '180000',
      status: 'pending',
      availability: ['Friday Afternoon', 'Saturday Morning'],
      joinDate: '2024-03-10'
    },
    {
      id: '4',
      name: 'David Chen',
      email: 'david.chen@example.com',
      phone: '+62 815-6789-0123',
      subjects: ['Computer Science', 'Mathematics'],
      skills: ['Problem Solving', 'Creativity'],
      hourlyRate: '200000',
      status: 'inactive',
      availability: ['Sunday Morning', 'Sunday Afternoon'],
      joinDate: '2024-01-05'
    },
    {
      id: '5',
      name: 'Lisa Wong',
      email: 'lisa.wong@example.com',
      phone: '+62 816-7890-1234',
      subjects: ['Economics', 'Accounting'],
      skills: ['Analytical Skills', 'Time Management'],
      hourlyRate: '160000',
      status: 'active',
      availability: ['Monday Evening', 'Tuesday Morning'],
      joinDate: '2024-02-28'
    }
  ];

  const [tutors, setTutors] = useState<Tutor[]>(mockTutors);
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const allSubjects = Array.from(new Set(tutors.flatMap(tutor => tutor.subjects)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Database Tutor</h1>
          <p className="text-muted-foreground">
            Manage and view all tutors in the database
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => router.push('/eduprima/main/ops/em/matchmaking/database-tutor/import-export')}>
            <Upload className="mr-2 h-4 w-4" />
            Import/Export
          </Button>
          <Button onClick={() => router.push('/eduprima/main/ops/em/matchmaking/database-tutor/add')}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Tutor
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tutors</p>
                <p className="text-2xl font-bold">{tutors.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{tutors.filter(t => t.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{tutors.filter(t => t.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive</p>
                <p className="text-2xl font-bold">{tutors.filter(t => t.status === 'inactive').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tutors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {allSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center justify-end">
              <p className="text-sm text-muted-foreground">
                {filteredAndSortedTutors.length} of {tutors.length} tutors
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Tutors List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('name')}
                      className="h-auto p-0 font-semibold"
                    >
                      Name
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-1 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Subjects</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('hourlyRate')}
                      className="h-auto p-0 font-semibold"
                    >
                      Rate
                      {sortField === 'hourlyRate' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-1 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('status')}
                      className="h-auto p-0 font-semibold"
                    >
                      Status
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-1 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('joinDate')}
                      className="h-auto p-0 font-semibold"
                    >
                      Join Date
                      {sortField === 'joinDate' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="ml-1 h-4 w-4" />
                        ) : (
                          <ArrowDown className="ml-1 h-4 w-4" />
                        )
                      ) : (
                        <ArrowUpDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTutors.map((tutor) => (
                  <TableRow key={tutor.id}>
                    <TableCell className="font-medium">{tutor.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm">{tutor.email}</p>
                        <p className="text-xs text-muted-foreground">{tutor.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                                                 {tutor.subjects.slice(0, 2).map((subject) => (
                           <Badge key={subject} className="text-xs bg-secondary text-secondary-foreground">
                             {subject}
                           </Badge>
                         ))}
                         {tutor.subjects.length > 2 && (
                           <Badge className="text-xs bg-secondary text-secondary-foreground">
                             +{tutor.subjects.length - 2} more
                           </Badge>
                         )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        IDR {parseInt(tutor.hourlyRate).toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tutor.status)}
                        <Badge className={getStatusBadgeVariant(tutor.status)}>
                          {getStatusText(tutor.status)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(tutor.joinDate).toLocaleDateString()}
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/eduprima/main/ops/em/matchmaking/database-tutor/view/${tutor.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(`/eduprima/main/ops/em/matchmaking/database-tutor/edit/${tutor.id}`)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleDelete(tutor.id)}
                            className="text-red-600"
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
        </CardContent>
      </Card>
    </div>
  );
} 