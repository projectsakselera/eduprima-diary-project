"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface Category {
  id: string;
  main_code: string;
  main_name: string;
  main_name_local: string;
  description: string;
  is_active: boolean;
}

interface Program {
  id: string;
  program_code: string;
  program_name: string;
  program_name_local: string;
  subject_focus: string;
  target_age_min: number;
  target_age_max: number;
  grade_level: number | null;
  subcategory: {
    sub_name: string;
    sub_name_local: string;
    main_category: {
      main_code: string;
      main_name: string;
      main_name_local: string;
    };
  };
}

const ApiDebugPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState<string>('');
  const [programsError, setProgramsError] = useState<string>('');
  const [rawCategoriesData, setRawCategoriesData] = useState<any>(null);
  const [rawProgramsData, setRawProgramsData] = useState<any>(null);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError('');
      setRawCategoriesData(null);
      
             console.log('🔄 Fetching categories...');
        const url = '/api/subjects/categories';
        console.log('📤 Calling URL:', url);
        const response = await fetch(url);
        console.log('📥 Categories response status:', response.status);
        console.log('📥 Categories response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Categories raw data:', data);
      
             setRawCategoriesData(data);
        
        // Handle different response formats
        let categories = [];
        if (data.categories) {
          // Format: {categories: [...]}
          categories = data.categories;
        } else if (data.data) {
          // Format: {success: true, data: [...]} - convert field names
          categories = data.data.map((item: any) => ({
            id: item.id,
            main_code: item.code,
            main_name: item.name,
            main_name_local: item.nameLocal,
            description: item.description,
            is_active: true // assuming from API
          }));
        } else if (Array.isArray(data)) {
          // Format: [...]
          categories = data;
        }
        
        setCategories(categories || []);
      
    } catch (error) {
      console.error('❌ Categories error:', error);
      setCategoriesError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchPrograms = async (categoryCode: string) => {
    if (!categoryCode) return;
    
    try {
      setProgramsLoading(true);
      setProgramsError('');
      setRawProgramsData(null);
      
      console.log('🔄 Fetching programs for category:', categoryCode);
      const response = await fetch(`/api/subjects/programs?category=${categoryCode}&limit=10`);
      console.log('📥 Programs response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📊 Programs raw data:', data);
      
             setRawProgramsData(data);
        
        // Handle different response formats
        let programs = [];
        if (data.programs) {
          // Format: {programs: [...]}
          programs = data.programs;
        } else if (data.data) {
          // Format: {success: true, data: [...]}
          programs = data.data;
        } else if (Array.isArray(data)) {
          // Format: [...]
          programs = data;
        }
        
        setPrograms(programs || []);
      
    } catch (error) {
      console.error('❌ Programs error:', error);
      setProgramsError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setProgramsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">🧪 API Debug - Supabase Test</h1>
        <p className="text-muted-foreground mt-2">
          Testing Supabase API connections for subjects and programs
        </p>
      </div>

      {/* Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            📋 Categories Test
            <Button 
              onClick={fetchCategories} 
              disabled={categoriesLoading}
              size="sm"
            >
              {categoriesLoading ? 'Loading...' : 'Refresh'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Categories Status */}
          <div className="flex items-center space-x-4">
            <Badge className={categories.length > 0 ? 'bg-success text-white' : 'bg-destructive text-white'}>
              Status: {categories.length > 0 ? 'Success' : 'No Data'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              Total: {categories.length} categories
            </span>
          </div>

          {/* Categories Error */}
          {categoriesError && (
            <Alert className="border-destructive bg-destructive/5">
              <AlertDescription className="text-destructive">
                <strong>Error:</strong> {categoriesError}
              </AlertDescription>
            </Alert>
          )}

          {/* Categories List */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">📂 Available Categories:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {categories.map((category) => (
                  <div 
                    key={category.id}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      selectedCategory === category.main_code 
                        ? 'border-primary bg-primary/5' 
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => {
                      setSelectedCategory(category.main_code);
                      fetchPrograms(category.main_code);
                    }}
                  >
                    <div className="font-medium text-sm">
                      {category.main_name_local}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Code: {category.main_code}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Categories Data */}
          {rawCategoriesData && (
            <div className="space-y-2">
              <h4 className="font-medium">🔍 Raw Categories Response:</h4>
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                {JSON.stringify(rawCategoriesData, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Programs Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🎯 Programs Test
            {selectedCategory && (
              <Button 
                onClick={() => fetchPrograms(selectedCategory)} 
                disabled={programsLoading}
                size="sm"
              >
                {programsLoading ? 'Loading...' : 'Refresh'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedCategory && (
            <p className="text-muted-foreground text-center py-8">
              👆 Select a category above to test programs API
            </p>
          )}

          {selectedCategory && (
            <>
              {/* Programs Status */}
              <div className="flex items-center space-x-4">
                <Badge className={programs.length > 0 ? 'bg-success text-white' : 'bg-destructive text-white'}>
                  Status: {programs.length > 0 ? 'Success' : 'No Data'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Category: {selectedCategory} | Total: {programs.length} programs
                </span>
              </div>

              {/* Programs Error */}
              {programsError && (
                <Alert className="border-destructive bg-destructive/5">
                  <AlertDescription className="text-destructive">
                    <strong>Error:</strong> {programsError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Programs List */}
              {programs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">📚 Available Programs:</h4>
                  <div className="space-y-2 max-h-64 overflow-auto">
                    {programs.map((program) => (
                      <div 
                        key={program.id}
                        className="p-3 border rounded"
                      >
                        <div className="font-medium text-sm">
                          {program.program_name_local || program.program_name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Code: {program.program_code} | Focus: {program.subject_focus}
                        </div>
                        {program.target_age_min && program.target_age_max && (
                          <div className="text-xs text-muted-foreground">
                            Age: {program.target_age_min}-{program.target_age_max} years
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Subcategory: {program.subcategory?.sub_name_local}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw Programs Data */}
              {rawProgramsData && (
                <div className="space-y-2">
                  <h4 className="font-medium">🔍 Raw Programs Response:</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-32">
                    {JSON.stringify(rawProgramsData, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Environment Check */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Environment Check</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Browser URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
            </div>
            <div>
              <strong>API Base:</strong> /api/subjects/
            </div>
            <div>
              <strong>Console:</strong> Check browser console for detailed logs
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDebugPage; 