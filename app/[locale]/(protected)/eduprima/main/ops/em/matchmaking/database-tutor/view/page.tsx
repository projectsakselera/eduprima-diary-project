'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserX, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { useRouter } from "@/components/navigation";

interface TutorProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  specialization: string;
  experience: string;
  hourlyRate: string;
  status: 'active' | 'inactive' | 'pending';
  education: string;
  teachingExperience: string;
  certifications: string;
}

export default function ViewTutorPage() {
  const router = useRouter();
  
  // Empty state - in the future this would fetch data based on tutor ID from URL params
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock loading effect - in real app this would fetch data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleEdit = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor/edit');
  };

  const handleDelete = () => {
    // Mock delete functionality
    console.log('Delete tutor');
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor');
  };

  const handleBack = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Database
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-16">
          <UserX className="h-20 w-20 text-muted-foreground/30 mb-6" />
          <div className="text-xl font-medium text-muted-foreground mb-2">
            Tutor not found
          </div>
          <div className="text-sm text-muted-foreground text-center mb-8 max-w-md">
            The tutor you're looking for doesn't exist or may have been removed from the database.
          </div>
          <div className="flex gap-2">
            <Button onClick={handleBack} variant="outline">
              Back to Database
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{tutor.name}</h1>
              <p className="text-gray-600">Tutor Profile & Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit Tutor
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="gap-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-sm text-gray-900">{tutor.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-sm text-gray-900">{tutor.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-sm text-gray-900">{tutor.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Address</label>
                <p className="text-sm text-gray-900">{tutor.address}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Specialization</label>
                <p className="text-sm text-gray-900">{tutor.specialization}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Experience</label>
                <p className="text-sm text-gray-900">{tutor.experience} years</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Hourly Rate</label>
                <p className="text-sm text-gray-900">IDR {parseInt(tutor.hourlyRate).toLocaleString('id-ID')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Status</label>
                <Badge 
                  className={
                    tutor.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : tutor.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {tutor.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500">Education Background</label>
              <p className="text-sm text-gray-900">{tutor.education}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Teaching Experience</label>
              <p className="text-sm text-gray-900">{tutor.teachingExperience}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Certifications</label>
              <p className="text-sm text-gray-900">{tutor.certifications}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 