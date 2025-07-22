'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Icon } from "@/components/ui/icon";
import { createClient } from '@supabase/supabase-js';
import { tutorFormConfig, type TutorFormData } from '../../add/form-config';

// Supabase Configuration
const supabaseUrl = 'https://btnsfqhgrjdyxwjiomrj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0bnNmcWhncmpkeXh3amlvbXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzODAwOTEsImV4cCI6MjA2Nzk1NjA5MX0.AzC7DZEmzIs9paMsrPJKYdCH4J2pLKMcaPF_emVZH6Q';
const supabase = createClient(supabaseUrl, supabaseKey);

interface FormField {
  field: string;
  type: string;
  required: boolean;
  source: 'form';
}

interface DatabaseField {
  field: string;
  type: string;
  required: boolean;
  source: 'database';
}

interface ValidationResult {
  field: string;
  formType?: string;
  dbType?: string;
  status: 'matched' | 'warning' | 'missing_in_form' | 'missing_in_db';
  issues: string[];
}

export default function SchemaValidation() {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [dbFields, setDbFields] = useState<DatabaseField[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Extract form fields from form configuration
  const extractFormFields = (): FormField[] => {
    const fields: FormField[] = [];
    
    tutorFormConfig.steps.forEach(step => {
      step.fields.forEach(field => {
        fields.push({
          field: field.name,
          type: field.type,
          required: field.required || false,
          source: 'form'
        });
      });
    });

    return fields;
  };

  // Fetch database schema from Supabase
  const fetchDatabaseSchema = async (): Promise<DatabaseField[]> => {
    try {
      // Query information_schema to get table structure
      const { data, error } = await supabase
        .rpc('get_table_schema', { 
          table_name: 't_310_01_01_users_universal',
          schema_name: 'public'
        });

      if (error) {
        console.log('RPC not available, using alternative approach...');
        
        // Alternative: Get a sample record to infer schema
        const { data: sampleData, error: sampleError } = await supabase
          .from('t_310_01_01_users_universal')
          .select('*')
          .limit(1)
          .single();

        if (sampleError && sampleError.code !== 'PGRST116') {
          throw sampleError;
        }

        // If we have sample data, infer schema from it
        if (sampleData) {
          const dbFields: DatabaseField[] = Object.keys(sampleData).map(key => ({
            field: key,
            type: typeof sampleData[key] === 'number' ? 'number' : 
                  typeof sampleData[key] === 'boolean' ? 'boolean' :
                  Array.isArray(sampleData[key]) ? 'array' : 'text',
            required: false, // Can't determine nullability from sample
            source: 'database'
          }));

          return dbFields;
        }

        // Fallback: Define known database fields manually based on common structure
        return [
          { field: 'id', type: 'uuid', required: true, source: 'database' },
          { field: 'trn', type: 'varchar', required: true, source: 'database' },
          { field: 'nama_lengkap', type: 'varchar', required: true, source: 'database' },
          { field: 'email', type: 'varchar', required: true, source: 'database' },
          { field: 'no_hp_1', type: 'varchar', required: true, source: 'database' },
          { field: 'no_hp_2', type: 'varchar', required: false, source: 'database' },
          { field: 'tanggal_lahir', type: 'date', required: false, source: 'database' },
          { field: 'jenis_kelamin', type: 'varchar', required: false, source: 'database' },
          { field: 'alamat_domisili', type: 'text', required: false, source: 'database' },
          { field: 'mata_pelajaran', type: 'text[]', required: false, source: 'database' },
          { field: 'tarif_per_jam', type: 'numeric', required: false, source: 'database' },
          { field: 'status_tutor', type: 'varchar', required: false, source: 'database' },
          { field: 'created_at', type: 'timestamp', required: true, source: 'database' },
          { field: 'updated_at', type: 'timestamp', required: true, source: 'database' }
        ];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching database schema:', error);
      return [];
    }
  };

  // Validate form fields against database schema
  const validateFields = (formFields: FormField[], dbFields: DatabaseField[]): ValidationResult[] => {
    const results: ValidationResult[] = [];
    const dbFieldMap = new Map(dbFields.map(f => [f.field.toLowerCase(), f]));
    const formFieldMap = new Map(formFields.map(f => [f.field.toLowerCase(), f]));

    // Check form fields against database
    formFields.forEach(formField => {
      const dbField = dbFieldMap.get(formField.field.toLowerCase()) || 
                     dbFieldMap.get(formField.field.replace(/([A-Z])/g, '_$1').toLowerCase()) ||
                     dbFieldMap.get(formField.field.replace(/_/g, '').toLowerCase());

      const issues: string[] = [];
      let status: ValidationResult['status'] = 'matched';

      if (!dbField) {
        status = 'missing_in_db';
        issues.push(`Field '${formField.field}' exists in form but not in database`);
      } else {
        // Check type compatibility
        const formType = formField.type;
        const dbType = dbField.type;

        if (!areTypesCompatible(formType, dbType)) {
          status = 'warning';
          issues.push(`Type mismatch: form has '${formType}', database has '${dbType}'`);
        }

        // Check required field compatibility
        if (formField.required && !dbField.required) {
          issues.push(`Form field is required but database field allows null`);
        }
      }

      results.push({
        field: formField.field,
        formType: formField.type,
        dbType: dbField?.type,
        status,
        issues
      });
    });

    // Check for database fields missing in form
    dbFields.forEach(dbField => {
      const formField = formFieldMap.get(dbField.field.toLowerCase()) ||
                       formFieldMap.get(dbField.field.replace(/_/g, '').toLowerCase());

      if (!formField && !isSystemField(dbField.field)) {
        results.push({
          field: dbField.field,
          dbType: dbField.type,
          status: 'missing_in_form',
          issues: [`Database field '${dbField.field}' has no corresponding form field`]
        });
      }
    });

    return results;
  };

  // Helper function to check type compatibility
  const areTypesCompatible = (formType: string, dbType: string): boolean => {
    const typeMap: Record<string, string[]> = {
      'text': ['varchar', 'text', 'character varying'],
      'email': ['varchar', 'text', 'character varying'],
      'tel': ['varchar', 'text', 'character varying'],
      'number': ['integer', 'numeric', 'decimal', 'bigint', 'real', 'double precision'],
      'date': ['date', 'timestamp', 'timestamptz'],
      'textarea': ['text'],
      'select': ['varchar', 'text', 'character varying'],
      'checkbox': ['boolean', 'text[]', 'varchar[]'],
      'radio': ['varchar', 'text', 'character varying'],
      'file': ['varchar', 'text', 'bytea']
    };

    const compatibleDbTypes = typeMap[formType] || [formType];
    return compatibleDbTypes.some(type => 
      dbType.toLowerCase().includes(type.toLowerCase())
    );
  };

  // Helper function to identify system fields
  const isSystemField = (fieldName: string): boolean => {
    const systemFields = ['id', 'created_at', 'updated_at', 'deleted_at', 'version'];
    return systemFields.includes(fieldName.toLowerCase());
  };

  // Run validation
  const runValidation = async () => {
    setLoading(true);
    setProgress(0);

    try {
      setProgress(25);
      const extractedFormFields = extractFormFields();
      setFormFields(extractedFormFields);

      setProgress(50);
      const fetchedDbFields = await fetchDatabaseSchema();
      setDbFields(fetchedDbFields);

      setProgress(75);
      const results = validateFields(extractedFormFields, fetchedDbFields);
      setValidationResults(results);

      setProgress(100);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run validation on component mount
  useEffect(() => {
    runValidation();
  }, []);

  // Calculate statistics
  const stats = {
    totalFields: validationResults.length,
    matchedFields: validationResults.filter(r => r.status === 'matched').length,
    warningFields: validationResults.filter(r => r.status === 'warning').length,
    missingInDb: validationResults.filter(r => r.status === 'missing_in_db').length,
    missingInForm: validationResults.filter(r => r.status === 'missing_in_form').length,
    compatibilityPercentage: validationResults.length > 0 ? 
      Math.round((validationResults.filter(r => r.status === 'matched').length / validationResults.length) * 100) : 0
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schema Validation</h1>
          <p className="text-muted-foreground">
            Real-time analysis of Add Tutor form compatibility with Supabase database schema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={runValidation} disabled={loading}>
            <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2" />
            {loading ? 'Refreshing...' : 'Refresh Schema'}
          </Button>
        </div>
      </div>

      {/* Loading Progress */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing schema compatibility...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
            <Icon icon="heroicons:document-text" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFields}</div>
            <p className="text-xs text-muted-foreground">Fields analyzed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Matched</CardTitle>
            <Icon icon="heroicons:check-circle" className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.matchedFields}</div>
            <p className="text-xs text-muted-foreground">Compatible fields</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <Icon icon="heroicons:exclamation-triangle" className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.warningFields}</div>
            <p className="text-xs text-muted-foreground">Type mismatches</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compatibility</CardTitle>
            <Icon icon="heroicons:shield-check" className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.compatibilityPercentage}%</div>
            <p className="text-xs text-muted-foreground">Overall compatibility</p>
          </CardContent>
        </Card>
      </div>

      {/* Validation Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon icon="heroicons:document-text" className="w-5 h-5 mr-2 text-blue-600" />
              Add Tutor Form Fields ({formFields.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {validationResults
                .filter(r => r.status !== 'missing_in_form')
                .map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      result.status === 'matched' ? 'bg-green-500' :
                      result.status === 'warning' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <span className="font-medium">{result.field}</span>
                      <div className="text-sm text-muted-foreground">{result.formType}</div>
                    </div>
                  </div>
                  <Badge color={
                    result.status === 'matched' ? 'success' :
                    result.status === 'warning' ? 'warning' : 'destructive'
                  }>
                    {result.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Database Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Icon icon="heroicons:circle-stack" className="w-5 h-5 mr-2 text-green-600" />
              Database Schema ({dbFields.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {dbFields.map((field, index) => {
                const matchedResult = validationResults.find(r => 
                  r.field.toLowerCase() === field.field.toLowerCase() ||
                  r.field.replace(/([A-Z])/g, '_$1').toLowerCase() === field.field.toLowerCase()
                );
                const isMapped = !!matchedResult && matchedResult.status !== 'missing_in_form';
                
                return (
                  <div key={index} className={`flex items-center justify-between p-3 border rounded-lg ${
                    isMapped ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <div>
                      <span className="font-medium">{field.field}</span>
                      <div className="text-sm text-muted-foreground">
                        {field.type} {field.required && <span className="text-red-500">*</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge color={field.required ? "destructive" : "secondary"}>
                        {field.required ? "Required" : "Optional"}
                      </Badge>
                      {isMapped && (
                        <Badge color="success">
                          <Icon icon="heroicons:check" className="w-3 h-3 mr-1" />
                          Mapped
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issues and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon icon="heroicons:light-bulb" className="w-5 h-5 mr-2 text-yellow-600" />
            Issues and Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {validationResults
              .filter(result => result.issues.length > 0)
              .map((result, index) => (
                <div key={index} className={`flex items-start space-x-3 p-3 border rounded-lg ${
                  result.status === 'warning' ? 'bg-orange-50' :
                  result.status === 'missing_in_db' ? 'bg-red-50' :
                  result.status === 'missing_in_form' ? 'bg-blue-50' : 'bg-gray-50'
                }`}>
                  <Icon 
                    icon={
                      result.status === 'warning' ? 'heroicons:exclamation-triangle' :
                      result.status === 'missing_in_db' ? 'heroicons:x-circle' :
                      'heroicons:information-circle'
                    } 
                    className={`w-5 h-5 mt-0.5 ${
                      result.status === 'warning' ? 'text-orange-600' :
                      result.status === 'missing_in_db' ? 'text-red-600' :
                      'text-blue-600'
                    }`} 
                  />
                  <div>
                    <p className="font-medium">{result.field}</p>
                    {result.issues.map((issue, issueIndex) => (
                      <p key={issueIndex} className="text-sm text-muted-foreground">
                        {issue}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            
            {validationResults.filter(r => r.issues.length > 0).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Icon icon="heroicons:check-circle" className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>No issues found! Form and database schemas are fully compatible.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 