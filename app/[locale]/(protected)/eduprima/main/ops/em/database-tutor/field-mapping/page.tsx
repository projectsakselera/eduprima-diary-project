'use client';

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// Database schema interface
interface DatabaseSchema {
  table: string;
  columns: {
    name: string;
    type: string;
    nullable: boolean;
    default?: string;
  }[];
}

// Complete field mapping data structure
interface FieldMapping {
  id: string;
  category: string;
  dbColumn: string;
  dbTable: string;
  formField: string;
  dataType: string;
  required: boolean;
  validation: string;
  description: string;
  status: 'mapped' | 'unmapped' | 'partial';
  transformationRule?: string;
  dbColumnExists?: boolean; // Real-time check result
  // Usage in different pages/components
  usageMap: {
    formAdd: boolean;
    viewAll: boolean;
    viewSingle: boolean;
    edit: boolean;
    dashboard: boolean;
    analytics: boolean;
  };
}

// Complete mapping dataset based on REAL form add page analysis
const FIELD_MAPPINGS: FieldMapping[] = [
  // System & Status
  { 
    id: '1', category: 'System', 
    dbColumn: 'id', dbTable: 't_310_01_01_users_universal', 
    formField: 'id', dataType: 'uuid', required: true, validation: 'UUID', 
    description: 'Primary identifier', status: 'mapped',
    usageMap: { formAdd: false, viewAll: true, viewSingle: true, edit: true, dashboard: true, analytics: false }
  },
  { 
    id: '2', category: 'System', 
    dbColumn: 'educator_registration_number', dbTable: 't_315_01_01_educator_details', 
    formField: 'trn', dataType: 'string', required: true, validation: 'TRN format', 
    description: 'Tutor Registration Number (auto-generated)', status: 'mapped',
    usageMap: { formAdd: false, viewAll: true, viewSingle: true, edit: false, dashboard: true, analytics: false }
  },
  { 
    id: '3', category: 'System', 
    dbColumn: 'status_tutor', dbTable: 't_315_02_01_tutor_management', 
    formField: 'status_tutor', dataType: 'string', required: true, validation: 'enum', 
    description: 'Tutor status in management table', status: 'mapped',
    usageMap: { formAdd: true, viewAll: true, viewSingle: true, edit: true, dashboard: true, analytics: true }
  },
  { 
    id: '4', category: 'System', 
    dbColumn: 'approval_level', dbTable: 't_315_02_01_tutor_management', 
    formField: 'approval_level', dataType: 'string', required: true, validation: 'enum', 
    description: 'Approval level in management table', status: 'mapped',
    usageMap: { formAdd: true, viewAll: true, viewSingle: true, edit: true, dashboard: true, analytics: false }
  },
  
  // Personal Information
  { 
    id: '5', category: 'Personal', 
    dbColumn: 'email', dbTable: 't_310_01_01_users_universal', 
    formField: 'email', dataType: 'string', required: true, validation: 'email', 
    description: 'Email address (users_universal)', status: 'mapped',
    usageMap: { formAdd: true, viewAll: true, viewSingle: true, edit: true, dashboard: true, analytics: false }
  },
  { 
    id: '6', category: 'Personal', 
    dbColumn: 'phone', dbTable: 't_310_01_01_users_universal', 
    formField: 'noHp1', dataType: 'string', required: true, validation: 'phone', 
    description: 'Primary phone (formatPhoneNumber)', status: 'mapped', transformationRule: 'formatPhoneNumber() applied',
    usageMap: { formAdd: true, viewAll: true, viewSingle: true, edit: true, dashboard: false, analytics: false }
  },
  { 
    id: '7', category: 'Personal', 
    dbColumn: 'full_name', dbTable: 't_310_01_02_user_profiles', 
    formField: 'namaLengkap', dataType: 'string', required: true, validation: 'min:2', 
    description: 'Full name in profiles table', status: 'mapped',
    usageMap: { formAdd: true, viewAll: true, viewSingle: true, edit: true, dashboard: true, analytics: false }
  },
  { 
    id: '8', category: 'Personal', 
    dbColumn: 'nick_name', dbTable: 't_310_01_02_user_profiles', 
    formField: 'namaPanggilan', dataType: 'string', required: false, validation: '', 
    description: 'Nickname in profiles', status: 'mapped',
    usageMap: { formAdd: true, viewAll: false, viewSingle: true, edit: true, dashboard: false, analytics: false }
  },
  { 
    id: '9', category: 'Personal', 
    dbColumn: 'date_of_birth', dbTable: 't_310_01_02_user_profiles', 
    formField: 'tanggalLahir', dataType: 'date', required: true, validation: 'date', 
    description: 'Birth date (used for password generation)', status: 'mapped', transformationRule: 'generatePasswordFromBirthDate()',
    usageMap: { formAdd: true, viewAll: false, viewSingle: true, edit: true, dashboard: false, analytics: true }
  },
  { 
    id: '10', category: 'Personal', 
    dbColumn: 'gender', dbTable: 't_310_01_02_user_profiles', 
    formField: 'jenisKelamin', dataType: 'string', required: true, validation: 'enum', 
    description: 'Gender in profiles', status: 'mapped',
    usageMap: { formAdd: true, viewAll: false, viewSingle: true, edit: true, dashboard: false, analytics: true }
  },
  { 
    id: '11', category: 'Personal', 
    dbColumn: 'religion', dbTable: 't_380_01_01_user_demographics', 
    formField: 'agama', dataType: 'string', required: false, validation: 'enum', 
    description: 'Religion in demographics table', status: 'mapped',
    usageMap: { formAdd: true, viewAll: false, viewSingle: true, edit: true, dashboard: false, analytics: true }
  },
  
  // Profile & Bio
  { 
    id: '12', category: 'Profile', 
    dbColumn: 'headline', dbTable: 't_310_01_02_user_profiles', 
    formField: 'headline', dataType: 'string', required: false, validation: 'max:200', 
    description: 'Profile headline', status: 'mapped',
    usageMap: { formAdd: true, viewAll: false, viewSingle: true, edit: true, dashboard: false, analytics: false }
  },
  { 
    id: '13', category: 'Profile', 
    dbColumn: 'bio', dbTable: 't_310_01_02_user_profiles', 
    formField: 'deskripsiDiri', dataType: 'text', required: false, validation: 'max:1000', 
    description: 'Self description', status: 'mapped',
    usageMap: { formAdd: true, viewAll: false, viewSingle: true, edit: true, dashboard: false, analytics: false }
  },
  { 
    id: '14', category: 'Profile', 
    dbColumn: 'motivation_as_tutor', dbTable: 't_310_01_02_user_profiles', 
    formField: 'motivasiMenjadiTutor', dataType: 'text', required: false, validation: 'max:500', 
    description: 'Teaching motivation', status: 'mapped',
    usageMap: { formAdd: true, viewAll: false, viewSingle: true, edit: false, dashboard: false, analytics: false }
  },
  
  // Education
  { 
    id: '15', category: 'Education', 
    dbColumn: 'education_level', dbTable: 't_310_01_02_user_profiles', 
    formField: 'statusAkademik', dataType: 'string', required: true, validation: 'enum', 
    description: 'Academic status (mapped to profiles)', status: 'mapped',
    usageMap: { formAdd: true, viewAll: true, viewSingle: true, edit: true, dashboard: true, analytics: true }
  },
  { 
    id: '16', category: 'Education', 
    dbColumn: 'university', dbTable: 't_310_01_02_user_profiles', 
    formField: 'namaUniversitas', dataType: 'string', required: false, validation: '', 
    description: 'University name (mapped to profiles)', status: 'mapped',
    usageMap: { formAdd: true, viewAll: true, viewSingle: true, edit: true, dashboard: false, analytics: false }
  },
  { 
    id: '17', category: 'Education', 
    dbColumn: 'major', dbTable: 't_310_01_02_user_profiles', 
    formField: 'jurusan', dataType: 'string', required: false, validation: '', 
    description: 'Major/Department (mapped to profiles)', status: 'mapped',
    usageMap: { formAdd: true, viewAll: true, viewSingle: true, edit: true, dashboard: false, analytics: false }
  },
  
  // Address/Location
  { 
    id: '18', category: 'Location', 
    dbColumn: 'street_address', dbTable: 't_310_01_03_user_addresses', 
    formField: 'alamatLengkapDomisili', dataType: 'text', required: true, validation: 'required', 
    description: 'Full domicile address (separate table)', status: 'mapped',
    usageMap: { formAdd: true, viewAll: false, viewSingle: true, edit: true, dashboard: false, analytics: false }
  },
  { 
    id: '19', category: 'Location', 
    dbColumn: 'city_id', dbTable: 't_310_01_03_user_addresses', 
    formField: 'kotaKabupatenDomisili', dataType: 'integer', required: true, validation: 'required', 
    description: 'City/Regency ID (address table)', status: 'mapped',
    usageMap: { formAdd: true, viewAll: true, viewSingle: true, edit: true, dashboard: false, analytics: true }
  },
];

const PAGE_DEFINITIONS = [
  { id: 'Dashboard', path: '/database-tutor', description: 'Main overview with stats', fields: 15 },  
  { id: 'ViewAll', path: '/database-tutor/view-all', description: 'Complete data table view', fields: 25 },
  { id: 'SingleView', path: '/database-tutor/view/[id]', description: 'Individual tutor details', fields: 35 },
  { id: 'Add', path: '/database-tutor/add', description: 'Add new tutor form', fields: 50 },
  { id: 'Edit', path: '/database-tutor/edit/[id]', description: 'Edit tutor form', fields: 45 },
  { id: 'Analytics', path: '/database-tutor/analytics', description: 'Data analysis & reports', fields: 12 },
  { id: 'Import', path: '/database-tutor/import-export', description: 'Bulk operations', fields: 8 },
];

export default function FieldMappingPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageFilter, setPageFilter] = useState('all');
  const [showOnlyIssues, setShowOnlyIssues] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<FieldMapping | null>(null);
  
  // Database schema state
  const [databaseSchema, setDatabaseSchema] = useState<DatabaseSchema[]>([]);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [schemaError, setSchemaError] = useState<string | null>(null);

  // Fetch database schema from Supabase
  const fetchDatabaseSchema = async () => {
    try {
      setIsLoadingSchema(true);
      setSchemaError(null);
      
      console.log('🔍 Fetching database schema from Supabase...');
      
      // Call API to get database schema - using health API instead
      const response = await fetch('/api/health');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Database schema loaded successfully');
        
        // Transform API response to our schema format
        const schema: DatabaseSchema[] = result.tables.map((table: any) => ({
          table: table.name,
          columns: table.columns.map((col: any) => ({
            name: col.column_name,
            type: col.data_type,
            nullable: col.is_nullable === 'YES',
            default: col.column_default
          }))
        }));
        
        setDatabaseSchema(schema);
        
        // Update field mappings with real database info
        updateFieldMappingsWithSchema(schema);
        
      } else {
        throw new Error(result.error || 'Failed to fetch database schema');
      }
      
    } catch (err: any) {
      console.error('❌ Error fetching database schema:', err);
      setSchemaError('Failed to load database schema: ' + (err.message || err.toString()));
      
      // Use fallback schema if API fails
      console.log('🔄 Using fallback schema...');
      setDatabaseSchema(fallbackSchema);
      updateFieldMappingsWithSchema(fallbackSchema);
    } finally {
      setIsLoadingSchema(false);
    }
  };

  // Update field mappings with real database schema
  const updateFieldMappingsWithSchema = (schema: DatabaseSchema[]) => {
    const updatedMappings = FIELD_MAPPINGS.map(mapping => {
      // Check if column exists in database
      let columnExists = false;
      let foundTable = '';
      let foundColumn = null;
      
      for (const table of schema) {
        const column = table.columns.find(col => col.name === mapping.dbColumn);
        if (column) {
          columnExists = true;
          foundTable = table.table;
          foundColumn = column;
          break;
        }
      }
      
      // Update status based on real database check
      let newStatus = mapping.status;
      if (mapping.dbColumn && !columnExists) {
        newStatus = 'unmapped';
      } else if (mapping.dbColumn && columnExists) {
        newStatus = 'mapped';
      }
      
      return {
        ...mapping,
        dbColumnExists: columnExists,
        dbTable: foundTable,
        status: newStatus
      };
    });
    
    // Update the mappings (in real app, this would be state)
    console.log('📊 Updated field mappings with real database schema');
    console.log('Found columns:', updatedMappings.filter(m => m.dbColumnExists).length);
    console.log('Missing columns:', updatedMappings.filter(m => !m.dbColumnExists && m.dbColumn).length);
  };

  // Load database schema on component mount
  useEffect(() => {
    fetchDatabaseSchema();
  }, []);

  // Add fallback schema if API fails - Comprehensive schema based on CASCADE documentation
  const fallbackSchema: DatabaseSchema[] = [
    {
      table: 't_310_01_01_users_universal',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'email', type: 'text', nullable: false },
        { name: 'user_code', type: 'text', nullable: true },
        { name: 'user_status', type: 'text', nullable: true },
        { name: 'phone', type: 'text', nullable: true },
        { name: 'phone_verified', type: 'boolean', nullable: true },
        { name: 'email_verified', type: 'boolean', nullable: true },
        { name: 'account_type', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: true },
        { name: 'updated_at', type: 'timestamp', nullable: true }
      ]
    },
    {
      table: 't_310_01_02_user_profiles',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'user_id', type: 'uuid', nullable: false },
        { name: 'full_name', type: 'text', nullable: true },
        { name: 'nick_name', type: 'text', nullable: true },
        { name: 'headline', type: 'text', nullable: true },
        { name: 'bio', type: 'text', nullable: true },
        { name: 'profile_photo_url', type: 'text', nullable: true },
        { name: 'date_of_birth', type: 'date', nullable: true },
        { name: 'gender', type: 'text', nullable: true },
        { name: 'nationality', type: 'text', nullable: true },
        { name: 'education_level', type: 'text', nullable: true },
        { name: 'university', type: 'text', nullable: true },
        { name: 'major', type: 'text', nullable: true },
        { name: 'graduation_year', type: 'integer', nullable: true },
        { name: 'gpa', type: 'numeric', nullable: true },
        { name: 'mobile_phone', type: 'text', nullable: true },
        { name: 'mobile_phone_2', type: 'text', nullable: true },
        { name: 'whatsapp_number', type: 'text', nullable: true },
        { name: 'emergency_contact_name', type: 'text', nullable: true },
        { name: 'emergency_contact_phone', type: 'text', nullable: true },
        { name: 'emergency_contact_relationship', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: true },
        { name: 'updated_at', type: 'timestamp', nullable: true }
      ]
    },
    {
      table: 'user_addresses',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'user_id', type: 'uuid', nullable: false },
        { name: 'address_type', type: 'character varying', nullable: false },
        { name: 'province_id', type: 'uuid', nullable: true },
        { name: 'city_id', type: 'uuid', nullable: true },
        { name: 'district_name', type: 'character varying', nullable: true },
        { name: 'village_name', type: 'character varying', nullable: true },
        { name: 'street_address', type: 'text', nullable: false },
        { name: 'postal_code', type: 'character varying', nullable: true },
        { name: 'notes', type: 'text', nullable: true },
        { name: 'is_primary', type: 'boolean', nullable: true },
        { name: 'is_verified', type: 'boolean', nullable: true },
        { name: 'verified_at', type: 'timestamp with time zone', nullable: true },
        { name: 'verified_by', type: 'uuid', nullable: true },
        { name: 'created_at', type: 'timestamp with time zone', nullable: true },
        { name: 'updated_at', type: 'timestamp with time zone', nullable: true },
        { name: 'is_same_as_domicile', type: 'boolean', nullable: true }
      ]
    },
    {
      table: 't_315_01_01_educator_details',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'user_id', type: 'uuid', nullable: false },
        { name: 'educator_registration_number', type: 'text', nullable: true },
        { name: 'form_submission_timestamp', type: 'timestamp', nullable: true },
        { name: 'onboarding_status', type: 'text', nullable: true },
        { name: 'background_check_status', type: 'text', nullable: true },
        { name: 'bio_summary', type: 'text', nullable: true },
        { name: 'teaching_experience', type: 'text', nullable: true },
        { name: 'special_skills', type: 'text', nullable: true },
        { name: 'achievements', type: 'text', nullable: true },
        { name: 'teaching_service_options', type: 'text[]', nullable: true },
        { name: 'teaching_philosophy', type: 'text', nullable: true },
        { name: 'average_rating', type: 'numeric', nullable: true },
        { name: 'total_teaching_hours', type: 'numeric', nullable: true },
        { name: 'cancellation_rate', type: 'numeric', nullable: true },
        { name: 'form_agreement_check', type: 'boolean', nullable: true },
        { name: 'is_top_educator', type: 'boolean', nullable: true },
        { name: 'academic_status', type: 'text', nullable: true },
        { name: 'university_s1_name', type: 'text', nullable: true },
        { name: 'faculty_s1', type: 'text', nullable: true },
        { name: 'major_s1', type: 'text', nullable: true },
        { name: 'current_faculty', type: 'text', nullable: true },
        { name: 'entry_year', type: 'integer', nullable: true },
        { name: 'alternative_institution_name', type: 'text', nullable: true },
        { name: 'expertise_field', type: 'text', nullable: true },
        { name: 'learning_experience', type: 'text', nullable: true },
        { name: 'other_skills', type: 'text', nullable: true },
        { name: 'other_relevant_experience', type: 'text', nullable: true },
        { name: 'academic_achievements', type: 'text', nullable: true },
        { name: 'non_academic_achievements', type: 'text', nullable: true },
        { name: 'certifications_training', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: true },
        { name: 'updated_at', type: 'timestamp', nullable: true }
      ]
    },
    {
      table: 't_315_02_01_tutor_management',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'user_id', type: 'uuid', nullable: false },
        { name: 'status_tutor', type: 'text', nullable: true },
        { name: 'approval_level', type: 'text', nullable: true },
        { name: 'last_status_change', type: 'timestamp', nullable: true },
        { name: 'recruitment_stage_history', type: 'jsonb', nullable: true },
        { name: 'additional_screening', type: 'text[]', nullable: true },
        { name: 'staff_notes', type: 'text', nullable: true },
        { name: 'education_verification_status', type: 'text', nullable: true },
        { name: 'identity_verification_status', type: 'text', nullable: true },
        { name: 'status_changed_by', type: 'uuid', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: true },
        { name: 'updated_at', type: 'timestamp', nullable: true }
      ]
    },
    {
      table: 't_315_03_01_tutor_availability_config',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'educator_id', type: 'uuid', nullable: false },
        { name: 'availability_status', type: 'text', nullable: true },
        { name: 'max_new_students_per_week', type: 'integer', nullable: true },
        { name: 'max_total_students', type: 'integer', nullable: true },
        { name: 'target_student_ages', type: 'text[]', nullable: true },
        { name: 'available_schedule', type: 'text[]', nullable: true },
        { name: 'teaching_methods', type: 'text[]', nullable: true },
        { name: 'hourly_rate', type: 'numeric', nullable: true },
        { name: 'teaching_radius_km', type: 'numeric', nullable: true },
        { name: 'teaching_center_location', type: 'text', nullable: true },
        { name: 'teaching_center_lat', type: 'numeric', nullable: true },
        { name: 'teaching_center_lng', type: 'numeric', nullable: true },
        { name: 'transportation_method', type: 'text', nullable: true },
        { name: 'location_notes', type: 'text', nullable: true },
        { name: 'availability_notes', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: true },
        { name: 'updated_at', type: 'timestamp', nullable: true }
      ]
    },
    {
      table: 't_315_04_01_tutor_teaching_preferences',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'educator_id', type: 'uuid', nullable: false },
        { name: 'teaching_styles', type: 'text[]', nullable: true },
        { name: 'student_level_preferences', type: 'text[]', nullable: true },
        { name: 'special_needs_capability', type: 'text', nullable: true },
        { name: 'group_class_willingness', type: 'text', nullable: true },
        { name: 'online_teaching_capability', type: 'text', nullable: true },
        { name: 'tech_savviness_level', type: 'text', nullable: true },
        { name: 'gmeet_experience_level', type: 'text', nullable: true },
        { name: 'attendance_update_capability', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: true },
        { name: 'updated_at', type: 'timestamp', nullable: true }
      ]
    },
    {
      table: 't_315_05_01_tutor_personality_traits',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'educator_id', type: 'uuid', nullable: false },
        { name: 'personality_type', type: 'text[]', nullable: true },
        { name: 'communication_style', type: 'text[]', nullable: true },
        { name: 'teaching_patience_level', type: 'text', nullable: true },
        { name: 'student_motivation_ability', type: 'text', nullable: true },
        { name: 'schedule_flexibility_level', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: true },
        { name: 'updated_at', type: 'timestamp', nullable: true }
      ]
    },
    {
      table: 't_315_06_01_tutor_program_mappings',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'educator_id', type: 'uuid', nullable: false },
        { name: 'program_id', type: 'uuid', nullable: false },
        { name: 'is_primary_subject', type: 'boolean', nullable: true },
        { name: 'years_of_experience', type: 'integer', nullable: true },
        { name: 'competency_level', type: 'text', nullable: true },
        { name: 'proficiency_level', type: 'text', nullable: true },
        { name: 'certification_status', type: 'text', nullable: true },
        { name: 'confidence_score', type: 'numeric', nullable: true },
        { name: 'mapped_at', type: 'timestamp', nullable: true },
        { name: 'mapped_by', type: 'uuid', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: true },
        { name: 'updated_at', type: 'timestamp', nullable: true }
      ]
    },
    {
      table: 't_315_07_01_tutor_additional_subjects',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'educator_id', type: 'uuid', nullable: false },
        { name: 'subject_name', type: 'text', nullable: true },
        { name: 'subject_description', type: 'text', nullable: true },
        { name: 'target_level', type: 'text', nullable: true },
        { name: 'teaching_method_description', type: 'text', nullable: true },
        { name: 'competency_description', type: 'text', nullable: true },
        { name: 'approval_status', type: 'text', nullable: true },
        { name: 'approved_at', type: 'timestamp', nullable: true },
        { name: 'approved_by', type: 'uuid', nullable: true },
        { name: 'rejection_reason', type: 'text', nullable: true },
        { name: 'rejected_at', type: 'timestamp', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: true },
        { name: 'updated_at', type: 'timestamp', nullable: true }
      ]
    },
    {
      table: 't_380_01_01_user_demographics',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'user_id', type: 'uuid', nullable: false },
        { name: 'religion', type: 'text', nullable: true },
        { name: 'marital_status', type: 'text', nullable: true },
        { name: 'parent_occupation', type: 'text', nullable: true },
        { name: 'parent_education_level', type: 'text', nullable: true },
        { name: 'socioeconomic_status', type: 'text', nullable: true },
        { name: 'ethnicity', type: 'text', nullable: true },
        { name: 'religious_practice_level', type: 'text', nullable: true },
        { name: 'preferred_communication_time', type: 'text', nullable: true },
        { name: 'communication_language_preference', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: true },
        { name: 'updated_at', type: 'timestamp', nullable: true }
      ]
    },
    {
      table: 't_460_02_04_educator_banking_info',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'educator_id', type: 'uuid', nullable: false },
        { name: 'bank_id', type: 'uuid', nullable: true },
        { name: 'bank_code', type: 'text', nullable: true },
        { name: 'bank_name', type: 'text', nullable: true },
        { name: 'swift_code', type: 'text', nullable: true },
        { name: 'account_holder_name', type: 'text', nullable: true },
        { name: 'account_number', type: 'text', nullable: true },
        { name: 'city', type: 'text', nullable: true },
        { name: 'bank_branch', type: 'text', nullable: true },
        { name: 'country_code', type: 'text', nullable: true },
        { name: 'is_verified', type: 'boolean', nullable: true },
        { name: 'last_verified_at', type: 'timestamp', nullable: true },
        { name: 'verification_document_url', type: 'text', nullable: true },
        { name: 'total_payouts', type: 'numeric', nullable: true },
        { name: 'payout_count', type: 'integer', nullable: true },
        { name: 'last_payout_at', type: 'timestamp', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: true },
        { name: 'updated_at', type: 'timestamp', nullable: true }
      ]
    },
    {
      table: 'document_storage',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'user_id', type: 'uuid', nullable: false },
        { name: 'document_type', type: 'text', nullable: true },
        { name: 'original_filename', type: 'text', nullable: true },
        { name: 'stored_filename', type: 'text', nullable: true },
        { name: 'file_url', type: 'text', nullable: true },
        { name: 'storage_path', type: 'text', nullable: true },
        { name: 'mime_type', type: 'text', nullable: true },
        { name: 'file_size', type: 'bigint', nullable: true },
        { name: 'upload_status', type: 'text', nullable: true },
        { name: 'uploaded_by', type: 'uuid', nullable: true },
        { name: 'uploaded_at', type: 'timestamp', nullable: true },
        { name: 'verification_status', type: 'text', nullable: true },
        { name: 'verified_at', type: 'timestamp', nullable: true },
        { name: 'verified_by', type: 'uuid', nullable: true },
        { name: 'verification_notes', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: true },
        { name: 'updated_at', type: 'timestamp', nullable: true }
      ]
    }
  ];

  // Calculate statistics
  const stats = useMemo(() => {
    const total = FIELD_MAPPINGS.length;
    const mapped = FIELD_MAPPINGS.filter(m => m.status === 'mapped').length;
    const partial = FIELD_MAPPINGS.filter(m => m.status === 'partial').length;
    const unmapped = FIELD_MAPPINGS.filter(m => m.status === 'unmapped').length;
    const coverage = Math.round((mapped / total) * 100);
    
    const categories = [...new Set(FIELD_MAPPINGS.map(m => m.category))];
    const formFields = FIELD_MAPPINGS.filter(m => m.formField).length;
    const dbColumns = FIELD_MAPPINGS.filter(m => m.dbColumn).length;
    
    return {
      total,
      mapped,
      partial,
      unmapped,
      coverage,
      categories: categories.length,
      formFields,
      dbColumns
    };
  }, []);

  // Filter mappings
  const filteredMappings = useMemo(() => {
    return FIELD_MAPPINGS.filter(mapping => {
      const matchesSearch = 
        mapping.formField.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.dbColumn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || mapping.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || mapping.status === statusFilter;
      const matchesPage = pageFilter === 'all' || 
        (pageFilter === 'Add' && mapping.usageMap.formAdd) ||
        (pageFilter === 'ViewAll' && mapping.usageMap.viewAll) ||
        (pageFilter === 'SingleView' && mapping.usageMap.viewSingle) ||
        (pageFilter === 'Edit' && mapping.usageMap.edit) ||
        (pageFilter === 'Dashboard' && mapping.usageMap.dashboard) ||
        (pageFilter === 'Analytics' && mapping.usageMap.analytics);
      const matchesIssues = !showOnlyIssues || mapping.status !== 'mapped';
      
      return matchesSearch && matchesCategory && matchesStatus && matchesPage && matchesIssues;
    });
  }, [searchTerm, categoryFilter, statusFilter, pageFilter, showOnlyIssues]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mapped': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unmapped': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mapped': return 'ph:check-circle';
      case 'partial': return 'ph:warning-circle';
      case 'unmapped': return 'ph:x-circle';
      default: return 'ph:question';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Field Mapping Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time mapping antara form fields, database columns, dan page usage
          </p>
          {/* Database Schema Status */}
          <div className="flex items-center gap-2 mt-2">
            <Badge className={cn(
              "text-xs",
              isLoadingSchema ? "bg-yellow-100 text-yellow-800" : 
              schemaError ? "bg-red-100 text-red-800" : 
              "bg-green-100 text-green-800"
            )}>
              <Icon 
                icon={isLoadingSchema ? "ph:spinner" : 
                      schemaError ? "ph:x-circle" : 
                      "ph:check-circle"} 
                className={cn("h-3 w-3 mr-1", isLoadingSchema && "animate-spin")} 
              />
              {isLoadingSchema ? "Loading DB Schema..." : 
               schemaError ? "DB Schema Error" : 
               `DB Schema: ${databaseSchema.length} tables`}
            </Badge>
            {schemaError && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchDatabaseSchema}
                  className="h-6 text-xs"
                >
                  <Icon icon="ph:arrow-clockwise" className="h-3 w-3 mr-1" />
                  Retry
                </Button>
                <span className="text-xs text-red-600 max-w-xs truncate" title={schemaError}>
                  {schemaError}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={fetchDatabaseSchema}
            disabled={isLoadingSchema}
            className="gap-2"
          >
            <Icon icon="ph:arrow-clockwise" className="h-4 w-4" />
            {isLoadingSchema ? "Syncing..." : "Sync Schema"}
          </Button>
          <Button variant="outline" className="gap-2">
            <Icon icon="ph:export" className="h-4 w-4" />
            Export Mapping
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
            <Icon icon="ph:database" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.categories} categories
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mapping Coverage</CardTitle>
            <Icon icon="ph:chart-pie" className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.coverage}%</div>
            <Progress value={stats.coverage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Form Fields</CardTitle>
            <Icon icon="ph:text-box" className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.formFields}</div>
            <p className="text-xs text-muted-foreground">
              Input fields available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
            <Icon icon="ph:warning" className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unmapped + stats.partial}</div>
            <p className="text-xs text-muted-foreground">
              {stats.unmapped} unmapped, {stats.partial} partial
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mapping" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="pages">Page Usage</TabsTrigger>
          <TabsTrigger value="schema">Database Schema</TabsTrigger>
          <TabsTrigger value="dataflow">Data Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="mapping" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="ph:funnel" className="h-5 w-5" />
                Filters & Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input
                  placeholder="Search fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {[...new Set(FIELD_MAPPINGS.map(m => m.category))].map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="mapped">Mapped</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="unmapped">Unmapped</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={pageFilter} onValueChange={setPageFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Used in Page" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Pages</SelectItem>
                    {PAGE_DEFINITIONS.map(page => (
                      <SelectItem key={page.id} value={page.id}>{page.id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="show-issues"
                    checked={showOnlyIssues}
                    onCheckedChange={setShowOnlyIssues}
                  />
                  <label htmlFor="show-issues" className="text-sm">Show only issues</label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mapping Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon="ph:table" className="h-5 w-5" />
                  Field Mappings
                </div>
                <Badge className="bg-secondary text-secondary-foreground">
                  {filteredMappings.length} results
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DB Column</TableHead>
                      <TableHead>DB Table</TableHead>
                      <TableHead>Form Field</TableHead>
                      <TableHead className="text-center">Form Add</TableHead>
                      <TableHead className="text-center">View All</TableHead>
                      <TableHead className="text-center">View Single</TableHead>
                      <TableHead className="text-center">Edit</TableHead>
                      <TableHead className="text-center">Dashboard</TableHead>
                      <TableHead className="text-center">Analytics</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMappings.map((mapping) => (
                      <TableRow 
                        key={mapping.id}
                        className={cn(
                          "cursor-pointer hover:bg-muted/50",
                          selectedMapping?.id === mapping.id && "bg-muted"
                        )}
                        onClick={() => setSelectedMapping(mapping)}
                      >
                        <TableCell className="font-mono text-sm font-medium">
                          {mapping.dbColumn || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {mapping.dbTable || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {mapping.formField || <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        
                        {/* Form Add */}
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            {mapping.usageMap.formAdd ? (
                              <Icon icon="ph:check" className="h-4 w-4 text-green-600" />
                            ) : (
                              <Icon icon="ph:x" className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        </TableCell>
                        
                        {/* View All */}
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            {mapping.usageMap.viewAll ? (
                              <Icon icon="ph:check" className="h-4 w-4 text-green-600" />
                            ) : (
                              <Icon icon="ph:x" className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        </TableCell>
                        
                        {/* View Single */}
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            {mapping.usageMap.viewSingle ? (
                              <Icon icon="ph:check" className="h-4 w-4 text-green-600" />
                            ) : (
                              <Icon icon="ph:x" className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Edit */}
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            {mapping.usageMap.edit ? (
                              <Icon icon="ph:check" className="h-4 w-4 text-green-600" />
                            ) : (
                              <Icon icon="ph:x" className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Dashboard */}
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            {mapping.usageMap.dashboard ? (
                              <Icon icon="ph:check" className="h-4 w-4 text-green-600" />
                            ) : (
                              <Icon icon="ph:x" className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Analytics */}
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            {mapping.usageMap.analytics ? (
                              <Icon icon="ph:check" className="h-4 w-4 text-green-600" />
                            ) : (
                              <Icon icon="ph:x" className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <Badge className="font-mono text-xs bg-secondary text-secondary-foreground">
                            {mapping.dataType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(mapping.status)}>
                            <Icon icon={getStatusIcon(mapping.status)} className="h-3 w-3 mr-1" />
                            {mapping.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          {/* Page Usage Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PAGE_DEFINITIONS.map((page) => (
              <Card key={page.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Icon icon="ph:browser" className="h-5 w-5" />
                    {page.id}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{page.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Fields Used:</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {FIELD_MAPPINGS.filter(m => {
                          switch(page.id) {
                            case 'Add': return m.usageMap.formAdd;
                            case 'ViewAll': return m.usageMap.viewAll;
                            case 'SingleView': return m.usageMap.viewSingle;
                            case 'Edit': return m.usageMap.edit;
                            case 'Dashboard': return m.usageMap.dashboard;
                            case 'Analytics': return m.usageMap.analytics;
                            default: return false;
                          }
                        }).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Path:</span>
                      <code className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">
                        {page.path}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="ph:database" className="h-5 w-5" />
                Database Schema
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSchema ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2">
                    <Icon icon="ph:spinner" className="h-5 w-5 animate-spin" />
                    <span>Loading database schema...</span>
                  </div>
                </div>
              ) : schemaError ? (
                <Alert className="border-red-200 bg-red-50">
                  <Icon icon="ph:warning" className="h-4 w-4 text-red-500" />
                  <AlertDescription className="text-red-700">
                    {schemaError}
                  </AlertDescription>
                </Alert>
              ) : databaseSchema.length === 0 ? (
                <div className="text-center py-8">
                  <Icon icon="ph:database" className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No Database Schema</h3>
                  <p className="text-muted-foreground mb-4">
                    Click "Sync Schema" to load database structure
                  </p>
                  <Button onClick={fetchDatabaseSchema}>
                    <Icon icon="ph:arrow-clockwise" className="h-4 w-4 mr-2" />
                    Sync Schema
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {databaseSchema.map((table) => (
                    <Card key={table.table}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Icon icon="ph:table" className="h-5 w-5" />
                          {table.table}
                          <Badge className="bg-blue-100 text-blue-800">
                            {table.columns.length} columns
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Column</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Nullable</TableHead>
                                <TableHead>Default</TableHead>
                                <TableHead>Mapped Fields</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {table.columns.map((column) => {
                                // Find which form fields map to this column
                                const mappedFields = FIELD_MAPPINGS.filter(
                                  m => m.dbColumn === column.name
                                );
                                
                                return (
                                  <TableRow key={column.name}>
                                    <TableCell className="font-mono text-sm font-medium">
                                      {column.name}
                                    </TableCell>
                                    <TableCell>
                                      <Badge className="bg-secondary text-secondary-foreground font-mono text-xs">
                                        {column.type}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge className={column.nullable ? 
                                        "bg-green-100 text-green-800" : 
                                        "bg-red-100 text-red-800"}>
                                        {column.nullable ? 'Yes' : 'No'}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">
                                      {column.default || 'None'}
                                    </TableCell>
                                    <TableCell>
                                      {mappedFields.length > 0 ? (
                                        <div className="flex flex-wrap gap-1">
                                          {mappedFields.map(field => (
                                            <Badge key={field.id} className="text-xs bg-green-100 text-green-800">
                                              {field.formField}
                                            </Badge>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-muted-foreground text-xs">No mapping</span>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dataflow" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon icon="ph:flow-arrow" className="h-5 w-5" />
                Data Flow Visualization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Icon icon="ph:info" className="h-4 w-4" />
                <AlertDescription>
                  Data flow diagram menunjukkan alur data dari form input → database storage → page display.
                  Diagram interaktif akan segera tersedia.
                </AlertDescription>
              </Alert>
              
              <div className="mt-6 p-8 border-2 border-dashed border-gray-200 rounded-lg text-center">
                <Icon icon="ph:graph" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Interactive Data Flow Diagram</h3>
                <p className="text-gray-500 mb-4">Coming soon - Visual representation of data transformation</p>
                <Button variant="outline" disabled>
                  <Icon icon="ph:play" className="h-4 w-4 mr-2" />
                  Generate Diagram
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Field Details */}
      {selectedMapping && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon="ph:info" className="h-5 w-5" />
              Field Details: {selectedMapping.formField || selectedMapping.dbColumn}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Field Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Category:</span>
                      <Badge className="border border-border bg-background">{selectedMapping.category}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Data Type:</span>
                      <code className="bg-gray-100 px-2 py-1 rounded text-xs">{selectedMapping.dataType}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Required:</span>
                      <Badge className={selectedMapping.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                        {selectedMapping.required ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Validation:</span>
                      <span className="font-mono text-xs">{selectedMapping.validation || 'None'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Usage & Transformation</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Used in Pages:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Object.entries(selectedMapping.usageMap).map(([page, used]) => used && (
                          <Badge key={page} className="text-xs bg-blue-100 text-blue-800">
                            {page}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {selectedMapping.transformationRule && (
                      <div>
                        <span className="text-muted-foreground">Transformation:</span>
                        <p className="mt-1 text-xs bg-yellow-50 border border-yellow-200 p-2 rounded">
                          {selectedMapping.transformationRule}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">{selectedMapping.description}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}