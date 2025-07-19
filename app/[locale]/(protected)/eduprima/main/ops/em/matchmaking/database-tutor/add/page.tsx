'use client';

import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Calendar,
  Save,
  X,
  Plus,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "@/components/navigation";

export default function AddTutorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    education: '',
    experience: '',
    subjects: [],
    skills: [],
    availability: [],
    bio: '',
    hourlyRate: '',
    status: 'active'
  });

  const [newSubject, setNewSubject] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const subjectOptions = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 
    'English', 'Indonesian', 'History', 'Geography',
    'Economics', 'Accounting', 'Computer Science', 'Art'
  ];

  const skillOptions = [
    'Public Speaking', 'Problem Solving', 'Critical Thinking',
    'Communication', 'Leadership', 'Time Management',
    'Adaptability', 'Creativity', 'Teamwork', 'Analytical Skills'
  ];

  const availabilityOptions = [
    'Monday Morning', 'Monday Afternoon', 'Monday Evening',
    'Tuesday Morning', 'Tuesday Afternoon', 'Tuesday Evening',
    'Wednesday Morning', 'Wednesday Afternoon', 'Wednesday Evening',
    'Thursday Morning', 'Thursday Afternoon', 'Thursday Evening',
    'Friday Morning', 'Friday Afternoon', 'Friday Evening',
    'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening',
    'Sunday Morning', 'Sunday Afternoon', 'Sunday Evening'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleAvailabilityToggle = (time: string) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(time)
        ? prev.availability.filter(t => t !== time)
        : [...prev.availability, time]
    }));
  };

  const addCustomSubject = () => {
    if (newSubject && !formData.subjects.includes(newSubject)) {
      setFormData(prev => ({
        ...prev,
        subjects: [...prev.subjects, newSubject]
      }));
      setNewSubject('');
    }
  };

  const addCustomSkill = () => {
    if (newSkill && !formData.skills.includes(newSkill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const removeSubject = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s !== subject)
    }));
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form data:', formData);
    // Navigate back to database tutor page
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor');
  };

  const handleCancel = () => {
    router.push('/eduprima/main/ops/em/matchmaking/database-tutor');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Tutor</h1>
          <p className="text-muted-foreground">
            Add a new tutor to the database
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            <Save className="mr-2 h-4 w-4" />
            Save Tutor
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Date of Birth</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Enter full address"
                rows={3}
              />
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
              <div className="space-y-2">
                <Label htmlFor="education">Education Background</Label>
                <Textarea
                  id="education"
                  value={formData.education}
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  placeholder="Enter education background"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Teaching Experience</Label>
                <Textarea
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="Enter teaching experience"
                  rows={3}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio/Description</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Enter tutor bio and description"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <Card>
          <CardHeader>
            <CardTitle>Subjects Taught</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {subjectOptions.map((subject) => (
                <div key={subject} className="flex items-center space-x-2">
                  <Checkbox
                    id={subject}
                    checked={formData.subjects.includes(subject)}
                    onCheckedChange={() => handleSubjectToggle(subject)}
                  />
                  <Label htmlFor={subject} className="text-sm">{subject}</Label>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add custom subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addCustomSubject}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary" className="flex items-center gap-1">
                    {subject}
                    <button
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills & Competencies</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {skillOptions.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={skill}
                    checked={formData.skills.includes(skill)}
                    onCheckedChange={() => handleSkillToggle(skill)}
                  />
                  <Label htmlFor={skill} className="text-sm">{skill}</Label>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center space-x-2">
              <Input
                placeholder="Add custom skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addCustomSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Availability & Pricing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Availability & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (IDR)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  placeholder="Enter hourly rate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Availability Schedule</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availabilityOptions.map((time) => (
                  <div key={time} className="flex items-center space-x-2">
                    <Checkbox
                      id={time}
                      checked={formData.availability.includes(time)}
                      onCheckedChange={() => handleAvailabilityToggle(time)}
                    />
                    <Label htmlFor={time} className="text-sm">{time}</Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit">
            <Save className="mr-2 h-4 w-4" />
            Save Tutor
          </Button>
        </div>
      </form>
    </div>
  );
} 