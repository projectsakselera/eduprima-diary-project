'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  GraduationCap, 
  Calendar,
  Edit,
  ArrowLeft,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "@/components/navigation";
import { useParams } from "next/navigation";

export default function ViewTutorPage() {
  const router = useRouter();
  const params = useParams();
  const tutorId = params?.id as string;

  const [tutorData, setTutorData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    education: '',
    experience: '',
    subjects: [] as string[],
    skills: [] as string[],
    availability: [] as string[],
    bio: '',
    hourlyRate: '',
    status: 'active'
  });

  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real app, this would be fetched from API
  const mockTutorData = {
    id: tutorId,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+62 812-3456-7890',
    address: 'Jl. Sudirman No. 123, Jakarta Pusat',
    birthDate: '1990-05-15',
    education: 'Bachelor of Mathematics, University of Indonesia',
    experience: '5 years teaching experience in high school mathematics',
    subjects: ['Mathematics', 'Physics'],
    skills: ['Problem Solving', 'Communication', 'Critical Thinking'],
    availability: ['Monday Morning', 'Tuesday Afternoon', 'Wednesday Evening'],
    bio: 'Experienced mathematics tutor with passion for helping students understand complex concepts.',
    hourlyRate: '150000',
    status: 'active'
  };

  useEffect(() => {
    // Simulate API call to fetch tutor data
    const fetchTutorData = async () => {
      setIsLoading(true);
      // In real app, this would be: const data = await fetchTutorById(tutorId);
      setTimeout(() => {
        setTutorData(mockTutorData);
        setIsLoading(false);
      }, 500);
    };

    if (tutorId) {
      fetchTutorData();
    }
  }, [tutorId, mockTutorData]);

  const handleEdit = () => {
    router.push(`/eduprima/main/ops/em/matchmaking/database-tutor/edit/${tutorId}`);
  };

  const handleBack = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor');
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">View Tutor</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">View Tutor</h1>
          <p className="text-muted-foreground">
            Tutor information and details
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Tutor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="text-lg font-semibold">{tutorData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-lg">{tutorData.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                  <p className="text-lg">{tutorData.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                  <p className="text-lg">{tutorData.birthDate}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="text-lg">{tutorData.address}</p>
              </div>
            </CardContent>
          </Card>

          {/* Education & Experience */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education & Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Education Background</label>
                  <p className="text-lg">{tutorData.education}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Teaching Experience</label>
                  <p className="text-lg">{tutorData.experience}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bio/Description</label>
                <p className="text-lg">{tutorData.bio}</p>
              </div>
            </CardContent>
          </Card>

          {/* Subjects */}
          <Card>
            <CardHeader>
              <CardTitle>Subjects Taught</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tutorData.subjects.map((subject) => (
                  <Badge key={subject} className="bg-primary text-primary-foreground">
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills & Competencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tutorData.skills.map((skill) => (
                  <Badge key={skill} className="bg-secondary text-secondary-foreground">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Availability Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {tutorData.availability.map((time) => (
                  <Badge key={time} className="justify-center border border-input bg-background">
                    {time}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(tutorData.status)}
                <span className="font-medium">{getStatusText(tutorData.status)}</span>
              </div>
              <Separator />
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                <span className="font-medium">IDR {parseInt(tutorData.hourlyRate).toLocaleString()}/hour</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subjects</span>
                <span className="font-medium">{tutorData.subjects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Skills</span>
                <span className="font-medium">{tutorData.skills.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Available Times</span>
                <span className="font-medium">{tutorData.availability.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button onClick={handleEdit} className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Edit Tutor
              </Button>
              <Button variant="outline" onClick={handleBack} className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to List
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 