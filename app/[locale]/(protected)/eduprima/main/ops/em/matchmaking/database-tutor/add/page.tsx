'use client';

import React, { useState } from 'react';
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
import { ArrowLeft, Save, X, UserPlus } from "lucide-react";
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

export default function AddTutorPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState<TutorFormData>({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    address: '',
    experience: '',
    hourlyRate: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof TutorFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Mock form submission - in real app this would be API call
      console.log('Adding tutor:', formData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate back to database page
      router.push('/eduprima/main/ops/em/matchmaking/database-tutor');
    } catch (error) {
      console.error('Error adding tutor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor');
  };

  const handleBack = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor');
  };

  const isFormValid = formData.name && formData.email && formData.phone && formData.specialization && formData.experience && formData.hourlyRate && formData.address;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Tutor</h1>
          <p className="text-muted-foreground">
            Add a new tutor to the database
          </p>
        </div>
      </div>
      
      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Tutor Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
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
                  <Label htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
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
                  <Label htmlFor="phone">
                    Phone Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g. +62 812-3456-7890"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="specialization">
                    Specialization <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.specialization} 
                    onValueChange={(value) => handleInputChange('specialization', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mathematics">Mathematics</SelectItem>
                      <SelectItem value="physics">Physics</SelectItem>
                      <SelectItem value="chemistry">Chemistry</SelectItem>
                      <SelectItem value="biology">Biology</SelectItem>
                      <SelectItem value="english">English Language</SelectItem>
                      <SelectItem value="indonesian">Indonesian Language</SelectItem>
                      <SelectItem value="history">History</SelectItem>
                      <SelectItem value="geography">Geography</SelectItem>
                      <SelectItem value="economics">Economics</SelectItem>
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">
                  Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  rows={3}
                  placeholder="Enter tutor's complete address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Professional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="experience">
                      Teaching Experience (Years) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      max="50"
                      placeholder="e.g. 5"
                      value={formData.experience}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="hourlyRate">
                      Hourly Rate (IDR) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="e.g. 150000"
                      value={formData.hourlyRate}
                      onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                      required
                    />
                    {formData.hourlyRate && (
                      <p className="text-sm text-muted-foreground">
                        Rate: Rp {parseInt(formData.hourlyRate).toLocaleString('id-ID')}/hour
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
              <Button 
                type="submit" 
                className="gap-2 flex-1 sm:flex-none" 
                disabled={!isFormValid || isSubmitting}
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Adding Tutor...' : 'Add Tutor'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancel} 
                className="gap-2 flex-1 sm:flex-none"
                disabled={isSubmitting}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>

            {/* Required fields note */}
            <div className="text-sm text-muted-foreground">
              <span className="text-destructive">*</span> indicates required fields
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 