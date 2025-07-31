'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from '@supabase/supabase-js';
import { tutorFormConfig } from '../../add/form-config';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from '@/components/ui/use-toast';

// Supabase Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

interface FormField {
  name: string;
  type: string;
  required: boolean;
  label: string;
}

interface DatabaseField {
  name: string;
  type: string;
  required: boolean;
}

interface ColumnMapping {
  formField: string;
  databaseField: string | null;
  transformationType?: 'none' | 'camelToSnake' | 'snakeToTitle' | 'custom';
  customTransform?: string;
  isSkipped?: boolean;
}

export default function ColumnMapping() {
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [dbFields, setDbFields] = useState<DatabaseField[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchForm, setSearchForm] = useState('');
  const [searchDb, setSearchDb] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Extract form fields from configuration
  const extractFormFields = (): FormField[] => {
    const fields: FormField[] = [];
    
    tutorFormConfig.steps.forEach(step => {
      step.fields.forEach(field => {
        fields.push({
          name: field.name,
          type: field.type,
          required: field.required || false,
          label: field.label
        });
      });
    });

    return fields;
  };

  // Fetch database schema
  const fetchDatabaseSchema = async (): Promise<DatabaseField[]> => {
    try {
      // Try to get sample data to infer schema
      let sampleData = null;
      let sampleError = null;
      
      if (!supabase) {
        console.log('Supabase client not available, using known schema...');
      } else {
        const result = await supabase
          .from('t_310_01_01_users_universal')
          .select('*')
          .limit(1)
          .single();
        
        sampleData = result.data;
        sampleError = result.error;
      }

      if (sampleError && sampleError.code !== 'PGRST116') {
        console.log('Sample data not available, using known schema...');
      }

      // Define known database fields based on common tutor table structure
      const knownFields = [
        { name: 'id', type: 'uuid', required: true },
        { name: 'trn', type: 'varchar', required: true },
        { name: 'nama_lengkap', type: 'varchar', required: true },
        { name: 'email', type: 'varchar', required: true },
        { name: 'no_hp_1', type: 'varchar', required: true },
        { name: 'no_hp_2', type: 'varchar', required: false },
        { name: 'tanggal_lahir', type: 'date', required: false },
        { name: 'jenis_kelamin', type: 'varchar', required: false },
        { name: 'alamat_domisili', type: 'text', required: false },
        { name: 'kelurahan_domisili', type: 'varchar', required: false },
        { name: 'kecamatan_domisili', type: 'varchar', required: false },
        { name: 'kota_kabupaten_domisili', type: 'varchar', required: false },
        { name: 'provinsi_domisili', type: 'varchar', required: false },
        { name: 'kode_pos_domisili', type: 'varchar', required: false },
        { name: 'alamat_ktp', type: 'text', required: false },
        { name: 'mata_pelajaran_sd', type: 'text[]', required: false },
        { name: 'mata_pelajaran_smp', type: 'text[]', required: false },
        { name: 'mata_pelajaran_sma_ipa', type: 'text[]', required: false },
        { name: 'mata_pelajaran_sma_ips', type: 'text[]', required: false },
        { name: 'mata_pelajaran_bahasa_asing', type: 'text[]', required: false },
        { name: 'tarif_per_jam', type: 'numeric', required: false },
        { name: 'status_tutor', type: 'varchar', required: false },
        { name: 'nama_bank', type: 'varchar', required: false },
        { name: 'nomor_rekening', type: 'varchar', required: false },
        { name: 'nama_nasabah', type: 'varchar', required: false },
        { name: 'motivasi', type: 'text', required: false },
        { name: 'metode_pengajaran', type: 'text[]', required: false },
        { name: 'jadwal_tersedia', type: 'text[]', required: false },
        { name: 'foto_profil', type: 'varchar', required: false },
        { name: 'dokumen_identitas', type: 'varchar', required: false },
        { name: 'created_at', type: 'timestamp', required: true },
        { name: 'updated_at', type: 'timestamp', required: true }
      ];

      // If sample data is available, merge with known fields
      if (sampleData) {
        const sampleFields = Object.keys(sampleData).map(key => ({
          name: key,
          type: typeof sampleData[key] === 'number' ? 'numeric' : 
                typeof sampleData[key] === 'boolean' ? 'boolean' :
                Array.isArray(sampleData[key]) ? 'array' : 'varchar',
          required: false
        }));

        // Combine and deduplicate
        const allFields = [...knownFields];
        sampleFields.forEach(sampleField => {
          if (!knownFields.find(k => k.name === sampleField.name)) {
            allFields.push(sampleField);
          }
        });
        return allFields;
      }

      return knownFields;
    } catch (error) {
      console.error('Error fetching database schema:', error);
      return [];
    }
  };

  // Auto-suggest mappings based on field names
  const generateAutoMappings = (formFields: FormField[], dbFields: DatabaseField[]): ColumnMapping[] => {
    const mappings: ColumnMapping[] = [];

    formFields.forEach(formField => {
      let bestMatch: string | null = null;
      
      // Convert camelCase to snake_case for matching
      const snakeCase = formField.name.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      // Try exact match first
      if (dbFields.find(db => db.name === formField.name.toLowerCase())) {
        bestMatch = formField.name.toLowerCase();
      }
      // Try snake_case conversion
      else if (dbFields.find(db => db.name === snakeCase)) {
        bestMatch = snakeCase;
      }
      // Try partial matches
      else {
        const partialMatch = dbFields.find(db => 
          db.name.includes(formField.name.toLowerCase()) ||
          formField.name.toLowerCase().includes(db.name.replace(/_/g, ''))
        );
        if (partialMatch) {
          bestMatch = partialMatch.name;
        }
      }

      mappings.push({
        formField: formField.name,
        databaseField: bestMatch,
        transformationType: bestMatch ? 'camelToSnake' : 'none',
        isSkipped: false
      });
    });

    return mappings;
  };

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const formFields = extractFormFields();
      const dbFields = await fetchDatabaseSchema();
      const autoMappings = generateAutoMappings(formFields, dbFields);

      setFormFields(formFields);
      setDbFields(dbFields);
      setMappings(autoMappings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update mapping
  const updateMapping = (formField: string, databaseField: string | null) => {
    setMappings(prev => prev.map(mapping => 
      mapping.formField === formField 
        ? { ...mapping, databaseField, isSkipped: databaseField === null }
        : mapping
    ));
  };

  // Skip/unskip field
  const toggleSkipField = (formField: string) => {
    setMappings(prev => prev.map(mapping => 
      mapping.formField === formField 
        ? { ...mapping, isSkipped: !mapping.isSkipped, databaseField: mapping.isSkipped ? mapping.databaseField : null }
        : mapping
    ));
  };

  // Save mapping configuration
  const saveMappingConfig = () => {
    const config = {
      mappings,
      timestamp: new Date().toISOString(),
      totalMappings: mappings.length,
      activeMappings: mappings.filter(m => !m.isSkipped && m.databaseField).length,
      skippedFields: mappings.filter(m => m.isSkipped).length
    };

    // Save to localStorage for now (could be saved to database later)
    localStorage.setItem('tutorColumnMapping', JSON.stringify(config));
    
    toast({
      title: "Configuration Saved!",
      description: "Mapping configuration telah berhasil disimpan",
      duration: 3000,
    });
  };

  // Load saved configuration
  const loadSavedConfig = () => {
    const saved = localStorage.getItem('tutorColumnMapping');
    if (saved) {
      const config = JSON.parse(saved);
      setMappings(config.mappings);
    }
  };

  // Filter functions
  const filteredFormFields = formFields.filter(field =>
    field.name.toLowerCase().includes(searchForm.toLowerCase()) ||
    field.label.toLowerCase().includes(searchForm.toLowerCase())
  );

  const filteredDbFields = dbFields.filter(field =>
    field.name.toLowerCase().includes(searchDb.toLowerCase())
  );

  // Statistics
  const stats = {
    totalFields: formFields.length,
    mappedFields: mappings.filter(m => m.databaseField && !m.isSkipped).length,
    skippedFields: mappings.filter(m => m.isSkipped).length,
    unmappedFields: mappings.filter(m => !m.databaseField && !m.isSkipped).length
  };

  // Initialize on mount
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Column Mapping</h1>
          <p className="text-muted-foreground">
            Map Add Tutor form fields to database columns for accurate migration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSavedConfig}>
            <Icon icon="heroicons:folder-open" className="w-4 h-4 mr-2" />
            Load Saved
          </Button>
          <Button variant="outline" onClick={loadData}>
            <Icon icon="heroicons:arrow-path" className="w-4 h-4 mr-2" />
            Reset Mapping
          </Button>
          <Button onClick={saveMappingConfig}>
            <Icon icon="heroicons:check" className="w-4 h-4 mr-2" />
            Save Mapping
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
            <Icon icon="heroicons:document-text" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFields}</div>
            <p className="text-xs text-muted-foreground">Form fields</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mapped</CardTitle>
            <Icon icon="heroicons:link" className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.mappedFields}</div>
            <p className="text-xs text-muted-foreground">Successfully mapped</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skipped</CardTitle>
            <Icon icon="heroicons:x-circle" className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.skippedFields}</div>
            <p className="text-xs text-muted-foreground">Will be skipped</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unmapped</CardTitle>
            <Icon icon="heroicons:exclamation-triangle" className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.unmappedFields}</div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Mapping Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon icon="heroicons:document-text" className="w-5 h-5 mr-2 text-blue-600" />
                Form Fields ({filteredFormFields.length})
              </div>
              <Input
                placeholder="Search form fields..."
                value={searchForm}
                onChange={(e) => setSearchForm(e.target.value)}
                className="w-48"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {filteredFormFields.map((field, index) => {
                const mapping = mappings.find(m => m.formField === field.name);
                return (
                  <div key={index} className={`p-3 border rounded-lg ${
                    mapping?.isSkipped ? 'bg-orange-50' :
                    mapping?.databaseField ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Badge className="mr-2" color={
                          mapping?.isSkipped ? 'warning' :
                          mapping?.databaseField ? 'success' : 'destructive'
                        }>
                          {index + 1}
                        </Badge>
                        <div>
                          <span className="font-medium">{field.name}</span>
                          <div className="text-sm text-muted-foreground">{field.label}</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleSkipField(field.name)}
                        >
                          {mapping?.isSkipped ? 
                            <Icon icon="heroicons:arrow-path" className="w-3 h-3" /> :
                            <Icon icon="heroicons:x-mark" className="w-3 h-3" />
                          }
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-2">Maps to:</span>
                      <Select
                        value={mapping?.databaseField || 'none'}
                        onValueChange={(value) => updateMapping(field.name, value === 'none' ? null : value)}
                        disabled={mapping?.isSkipped}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select database field" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- No Mapping --</SelectItem>
                          {dbFields.map((dbField) => (
                            <SelectItem key={dbField.name} value={dbField.name}>
                              {dbField.name} ({dbField.type})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Database Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Icon icon="heroicons:circle-stack" className="w-5 h-5 mr-2 text-green-600" />
                Database Fields ({filteredDbFields.length})
              </div>
              <Input
                placeholder="Search database fields..."
                value={searchDb}
                onChange={(e) => setSearchDb(e.target.value)}
                className="w-48"
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {filteredDbFields.map((field, index) => {
                const isMapped = mappings.some(m => m.databaseField === field.name && !m.isSkipped);
                const mappingCount = mappings.filter(m => m.databaseField === field.name && !m.isSkipped).length;
                
                return (
                  <div key={index} className={`flex items-center justify-between p-3 border rounded-lg ${
                    isMapped ? 'bg-green-50' : 'bg-gray-50'
                  }`}>
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium">{field.name}</span>
                        {mappingCount > 1 && (
                          <Badge color="warning" className="ml-2">
                            Multiple ({mappingCount})
                          </Badge>
                        )}
                      </div>
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

      {/* Mapping Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon icon="heroicons:clipboard-document-list" className="w-5 h-5 mr-2" />
            Mapping Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mappings.filter(m => m.databaseField && !m.isSkipped).length > 0 ? (
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {mappings
                .filter(m => m.databaseField && !m.isSkipped)
                .map((mapping, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center">
                      <Icon icon="heroicons:arrow-right" className="w-4 h-4 mx-2 text-gray-400" />
                      <span className="font-medium">{mapping.formField}</span>
                    </div>
                    <div className="flex items-center">
                      <Icon icon="heroicons:arrow-right" className="w-4 h-4 mx-2 text-green-600" />
                      <span className="text-green-600 font-medium">{mapping.databaseField}</span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Icon icon="heroicons:link" className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No field mappings configured</p>
              <p className="text-sm">Configure mappings above to see the summary</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Alerts */}
      {stats.unmappedFields > 0 && (
        <Alert>
          <Icon icon="heroicons:exclamation-triangle" className="h-4 w-4" />
          <AlertDescription>
            {stats.unmappedFields} form fields are not mapped to any database columns. 
            These fields will be ignored during migration unless you map them or mark them as skipped.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 