"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Database, Plug, UserPlus, Loader2, Save, CheckCircle, XCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { 
  educatorFormConfig, 
  defaultFormData, 
  validateField, 
  generateUserCode,
  type EducatorTestFormData 
} from './form-config';

// Supabase Configuration
const supabaseUrl = 'https://btnsfqhgrjdyxwjiomrj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bnNmcWhncmpkeXh3amlvbXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODAwOTEsImV4cCI6MjA2Nzk1NjA5MX0.AzC7DZEmzIs9paMsrPJKYdCH4J2pLKMcaPF_emVZH6Q';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ConnectionStatus {
  isConnected: boolean;
  tablesAccessible: string[];
  errorMessage?: string;
}

interface SubmissionResult {
  success: boolean;
  userData?: any;
  profileData?: any;
  errorMessage?: string;
}

export default function EducatorTestFormPage() {
  const [formData, setFormData] = useState<EducatorTestFormData>(defaultFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);

  // Test Supabase connection
  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus(null);
    
    try {
      const tablesAccessible: string[] = [];
      
      // Test connection to users_universal table
      const { data: usersTest, error: usersError } = await supabase
        .from('t_310_01_01_users_universal')
        .select('id')
        .limit(1);
        
      if (!usersError) {
        tablesAccessible.push('t_310_01_01_users_universal');
      }
      
      // Test connection to user_profiles table
      const { data: profilesTest, error: profilesError } = await supabase
        .from('t_310_01_02_user_profiles')
        .select('id')
        .limit(1);
        
      if (!profilesError) {
        tablesAccessible.push('t_310_01_02_user_profiles');
      }
      
      if (tablesAccessible.length === 2) {
        setConnectionStatus({
          isConnected: true,
          tablesAccessible,
        });
      } else {
        setConnectionStatus({
          isConnected: false,
          tablesAccessible,
          errorMessage: 'Some tables are not accessible. Check permissions.'
        });
      }
      
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        tablesAccessible: [],
        errorMessage: `Connection failed: ${error}`
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Handle form field changes
  const handleFieldChange = (fieldName: keyof EducatorTestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error for this field
    if (formErrors[fieldName]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    educatorFormConfig.forEach(field => {
      const value = formData[field.name];
      const error = validateField(field, value);
      if (error) {
        errors[field.name] = error;
      }
    });
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form data to both tables
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmissionResult(null);
    
    try {
      // Step 1: Insert to users_universal table
      const userData = {
        user_code: generateUserCode(),
        email: formData.email,
        phone: formData.phone,
        password_hash: 'temp_hash_' + Date.now(), // Temporary for testing
        primary_role: 'educator',
        user_status: 'active',
        account_type: 'individual'
      };
      
      console.log('Inserting to users_universal:', userData);
      
      const { data: insertedUser, error: userError } = await supabase
        .from('t_310_01_01_users_universal')
        .insert([userData])
        .select()
        .single();
      
      if (userError) {
        throw new Error(`Users table error: ${userError.message}`);
      }
      
      console.log('User inserted successfully:', insertedUser);
      
      // Step 2: Insert to user_profiles table with FK reference
      const profileData = {
        user_id: insertedUser.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        display_name: `${formData.first_name} ${formData.last_name}`,
        city: formData.city,
        mobile_phone: formData.phone
      };
      
      console.log('Inserting to user_profiles:', profileData);
      
      const { data: insertedProfile, error: profileError } = await supabase
        .from('t_310_01_02_user_profiles')
        .insert([profileData])
        .select()
        .single();
      
      if (profileError) {
        // If profile insert fails, we should cleanup the user record
        console.error('Profile insert failed:', profileError);
        throw new Error(`Profiles table error: ${profileError.message}`);
      }
      
      console.log('Profile inserted successfully:', insertedProfile);
      
      setSubmissionResult({
        success: true,
        userData: insertedUser,
        profileData: insertedProfile
      });
      
      // Reset form
      setFormData(defaultFormData);
      
    } catch (error) {
      console.error('Submission error:', error);
      setSubmissionResult({
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          🧪 Test Form: Educator Registration
        </h1>
        <p className="text-muted-foreground">
          Sample form untuk test koneksi Supabase dengan multi-table insert (5 field max)
        </p>
      </div>

      {/* Connection Test Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={testConnection} 
              disabled={isTestingConnection}
              variant="outline"
            >
              {isTestingConnection ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Plug className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
          </div>

          {connectionStatus && (
            <Alert>
              {connectionStatus.isConnected ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">
                    {connectionStatus.isConnected ? "✅ Connection Successful!" : "❌ Connection Failed"}
                  </div>
                  <div className="text-sm">
                    Accessible tables: {connectionStatus.tablesAccessible.length > 0 
                      ? connectionStatus.tablesAccessible.map(table => (
                          <Badge key={table} className="mx-1">{table}</Badge>
                        ))
                      : "None"
                    }
                  </div>
                  {connectionStatus.errorMessage && (
                    <div className="text-sm text-red-600 dark:text-red-400">
                      {connectionStatus.errorMessage}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Form Educator (5 Fields Test)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {educatorFormConfig.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name} className="flex items-center gap-2">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                    <Badge className="text-xs">
                      {field.table}
                    </Badge>
                  </Label>
                  <Input
                    id={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    className={formErrors[field.name] ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                  {formErrors[field.name] && (
                    <p className="text-sm text-red-500">{formErrors[field.name]}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                type="submit" 
                disabled={isSubmitting || !connectionStatus?.isConnected}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Test Data
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => {
                  setFormData(defaultFormData);
                  setFormErrors({});
                  setSubmissionResult(null);
                }}
              >
                Reset Form
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Submission Result */}
      {submissionResult && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {submissionResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              Submission Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            {submissionResult.success ? (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    ✅ Educator data berhasil disimpan ke kedua table!
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">👤 User Data (users_universal):</h4>
                    <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify({
                        id: submissionResult.userData?.id,
                        user_code: submissionResult.userData?.user_code,
                        email: submissionResult.userData?.email,
                        phone: submissionResult.userData?.phone,
                        primary_role: submissionResult.userData?.primary_role
                      }, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">📋 Profile Data (user_profiles):</h4>
                    <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                      {JSON.stringify({
                        id: submissionResult.profileData?.id,
                        user_id: submissionResult.profileData?.user_id,
                        first_name: submissionResult.profileData?.first_name,
                        last_name: submissionResult.profileData?.last_name,
                        city: submissionResult.profileData?.city
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  ❌ Submission failed: {submissionResult.errorMessage}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 