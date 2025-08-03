'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, X, UserX } from "lucide-react";
import { useRouter } from "@/components/navigation";

interface TutorFormData {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  address: string;
  experience: string;
  hourlyRate: string;
}

export default function EditTutorPage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [tutorExists, setTutorExists] = useState(false);
  const [formData, setFormData] = useState<TutorFormData>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    address: '',
    experience: '',
    hourlyRate: ''
  });

  useEffect(() => {
    // Mock loading effect - in real app this would fetch tutor data based on ID from URL params
    const timer = setTimeout(() => {
      setLoading(false);
      // Set tutorExists to false to show "tutor not found" state
      setTutorExists(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (field: keyof TutorFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock form submission
    console.log('Update tutor:', formData);
    router.push('/eduprima/main/ops/em/database-tutor');
  };

  const handleCancel = () => {
    router.push('/eduprima/main/ops/em/database-tutor');
  };

  const handleBack = () => {
    router.push('/eduprima/main/ops/em/database-tutor');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6 space-y-2">
          <div className="h-8 w-64 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        </div>
        
        <Card>
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
            <div className="flex gap-4 pt-6">
              <div className="h-10 w-24 bg-muted rounded animate-pulse" />
              <div className="h-10 w-20 bg-muted rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tutorExists) {
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
            The tutor you&apos;re trying to edit doesn&apos;t exist or may have been removed from the database.
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Tutor</h1>
            <p className="text-gray-600">Update tutor information in the database</p>
          </div>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Tutor Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter tutor's full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter tutor's email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter tutor's phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization *</Label>
                <Select 
                  value={formData.specialization} 
                  onValueChange={(value) => handleInputChange('specialization', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="physics">Physics</SelectItem>
                    <SelectItem value="chemistry">Chemistry</SelectItem>
                    <SelectItem value="biology">Biology</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="indonesian">Indonesian</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                    <SelectItem value="geography">Geography</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Experience (Years) *</Label>
                <Input
                  id="experience"
                  type="number"
                  min="0"
                  placeholder="Enter years of experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (IDR) *</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  min="0"
                  placeholder="Enter hourly rate"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                rows={3}
                placeholder="Enter tutor's address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="gap-2">
                <Save className="h-4 w-4" />
                Update Tutor
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} className="gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 