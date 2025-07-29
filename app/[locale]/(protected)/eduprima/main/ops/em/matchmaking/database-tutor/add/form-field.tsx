"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FormField as FormFieldConfig, TutorFormData } from './form-config';
import { AddressSearchPicker } from '@/components/ui/address-search-picker';
import { SimpleAddressSearch } from '@/components/ui/simple-address-search';
import { Icon as IconifyIcon } from '@iconify/react';

interface DynamicFormFieldProps {
  field: FormFieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  formData?: Partial<TutorFormData>; // Added for conditional visibility
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
  className,
  formData
}) => {
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const handleChange = (newValue: any) => {
    onChange(field.name, newValue);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleCheckboxGroupChange = (optionValue: string | number, checked: boolean) => {
    const currentValue = Array.isArray(value) ? value : [];
    if (checked) {
      handleChange([...currentValue, optionValue]);
    } else {
      handleChange(currentValue.filter((v: any) => v !== optionValue));
    }
  };

  const renderFieldInput = () => {
    // Handle separator fields
    if (field.disabled && field.className === 'section-divider') {
      return (
        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-primary/40"></div>
          <div className="mx-4 px-6 py-3 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span className="text-sm font-bold text-primary tracking-wide uppercase">
                {field.label}
              </span>
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            </div>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent via-primary/20 to-primary/40"></div>
        </div>
      );
    }

    // Handle info text fields
    if (field.disabled && field.className === 'info-text') {
      return (
        <div className="p-4 bg-info/10 border border-info/30 rounded-lg mb-4">
          <div className="flex items-start space-x-3">
            <Icon icon="ph:info" className="h-5 w-5 text-info mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-info">{field.label}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{field.helperText}</p>
            </div>
          </div>
        </div>
      );
    }

  // Handle conditional visibility
  if (field.conditional && !field.conditional(formData || {})) {
    return null;
  }

  // Handle map-picker-field
  if (field.className === 'map-picker-field') {
    return (
      <div className="space-y-2">
        {/* Label sudah ada di dalam SimpleAddressSearch component */}
        
        {/* Primary: Simple Address Search (Active) */}
        <SimpleAddressSearch
          onLocationSelect={(lat: number, lng: number, address: string) => {
            onChange('titikLokasiLat', lat);
            onChange('titikLokasiLng', lng);
            onChange('alamatTitikLokasi', address);
          }}
          defaultAddress={formData?.alamatTitikLokasi}
          radius={formData?.radiusMengajar || 10}
          disabled={field.disabled}
          className="w-full"
          label={field.label}
          icon={field.icon || 'ph:magnifying-glass'}
        />
        
        {/* Advanced: Address Search Picker (uncomment after API setup) */}
        {/*
        <AddressSearchPicker
          onLocationSelect={(lat: number, lng: number, address: string) => {
            onChange('titikLokasiLat', lat);
            onChange('titikLokasiLng', lng);
            onChange('alamatTitikLokasi', address);
          }}
          defaultAddress={formData?.alamatTitikLokasi}
          defaultLat={formData?.titikLokasiLat}
          defaultLng={formData?.titikLokasiLng}
          radius={formData?.radiusMengajar || 10}
          disabled={field.disabled}
          placeholder="Cari alamat lokasi mengajar (contoh: Jl. Sudirman Jakarta)"
          className="w-full"
        />
        */}
        
        {/* Helper text sudah ada di dalam SimpleAddressSearch component */}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    );
  }

    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'date':
      case 'number':
        return (
          <Input
            id={field.name}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={value ?? ''}
            onChange={(e) => handleChange(field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            disabled={disabled}
            size={field.size || 'default'}
            color={error ? 'destructive' : field.color || 'default'}
            min={field.min}
            max={field.max}
            step={field.step}
            className={cn("transition-all duration-200", {
              "ring-2 ring-destructive/20": error,
              "ring-2 ring-primary/20 border-primary": !error && value
            })}
          />
        );

      case 'textarea':
        return (
          <Textarea
            id={field.name}
            name={field.name}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            rows={field.rows || 3}
            color={error ? 'destructive' : field.color || 'default'}
            className={cn("transition-all duration-200 resize-none", {
              "ring-2 ring-destructive/20": error,
              "ring-2 ring-primary/20 border-primary": !error && value
            })}
          />
        );

      case 'select':
        return (
          <Select value={value || ''} onValueChange={handleChange} disabled={disabled}>
            <SelectTrigger 
              className={cn("transition-all duration-200", field.size === 'lg' ? 'h-12' : 'h-10', {
                "ring-2 ring-destructive/20 border-destructive": error,
                "ring-2 ring-primary/20 border-primary": !error && value
              })}
              color={error ? 'destructive' : field.color || 'default'}
            >
              <SelectValue placeholder={field.placeholder || `Pilih ${field.label}...`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={String(option.value)}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 p-4 bg-muted/20 rounded-lg border">
              {field.options?.map((option) => {
                const isSelected = value === option.value;
                return (
                  <div key={option.value} className="flex items-center space-x-3">
                    <div className="relative">
                      <input
                        type="radio"
                        id={`${field.name}-${option.value}`}
                        name={field.name}
                        value={String(option.value)}
                        checked={isSelected}
                        onChange={() => handleChange(option.value)}
                        disabled={disabled || option.disabled}
                        className="peer sr-only"
                      />
                      <div className={cn(
                        "w-4 h-4 border-2 rounded-full cursor-pointer transition-all duration-200",
                        "peer-checked:border-primary peer-checked:bg-primary",
                        "peer-focus:ring-2 peer-focus:ring-primary/20",
                        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
                        {
                          "border-primary bg-primary": isSelected,
                          "border-muted-foreground hover:border-primary": !isSelected && !disabled,
                          "border-destructive": error
                        }
                      )}>
                        {isSelected && (
                          <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>
                    <Label 
                      htmlFor={`${field.name}-${option.value}`}
                      className={cn("text-sm cursor-pointer leading-relaxed", {
                        "text-muted-foreground": option.disabled,
                        "text-primary font-medium": isSelected
                      })}
                    >
                      {option.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'checkbox':
        if (field.multiple && field.options) {
          // Multiple checkbox (checkbox group)
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-4 bg-muted/20 rounded-lg border">
                {field.options.map((option) => {
                  const isChecked = Array.isArray(value) && value.includes(option.value);
                  return (
                    <div key={option.value} className="flex items-center space-x-3">
                      <Checkbox
                        id={`${field.name}-${option.value}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => 
                          handleCheckboxGroupChange(option.value, checked as boolean)
                        }
                        disabled={disabled || option.disabled}
                        color={field.color || 'primary'}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <Label 
                        htmlFor={`${field.name}-${option.value}`}
                        className={cn("text-sm cursor-pointer", {
                          "text-muted-foreground": option.disabled
                        })}
                      >
                        {option.label}
                      </Label>
                    </div>
                  );
                })}
              </div>
              {Array.isArray(value) && value.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  {value.length} item dipilih
                </div>
              )}
            </div>
          );
        } else {
          // Single checkbox
          return (
            <div className="flex items-center space-x-3 p-4 bg-muted/20 rounded-lg border">
              <Checkbox
                id={field.name}
                checked={!!value}
                onCheckedChange={handleChange}
                disabled={disabled}
                color={field.color || 'primary'}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <Label 
                htmlFor={field.name}
                className="text-sm cursor-pointer leading-relaxed"
              >
                {field.helperText}
              </Label>
            </div>
          );
        }

      case 'switch':
        return (
          <div className="flex items-center space-x-3 p-4 bg-muted/20 rounded-lg border">
            <Switch
              id={field.name}
              checked={!!value}
              onCheckedChange={handleChange}
              disabled={disabled}
              color={field.color || 'primary'}
            />
            <Label htmlFor={field.name} className="text-sm">
              {field.helperText}
            </Label>
          </div>
        );

      case 'file':
        return (
          <div className="space-y-3">
            <div className="relative">
              <Input
                id={field.name}
                name={field.name}
                type="file"
                accept={field.accept}
                onChange={handleFileChange}
                disabled={disabled}
                size={field.size || 'default'}
                className={cn("", {
                  "ring-2 ring-destructive/20": error
                })}
              />
            </div>
            
            {/* File Preview */}
            {filePreview && (
              <div className="relative w-32 h-32 bg-muted rounded-lg overflow-hidden border">
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0"
                  onClick={() => {
                    setFilePreview(null);
                    handleChange(null);
                  }}
                >
                  <Icon icon="ph:x" className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {/* Existing file indicator */}
            {value && typeof value === 'string' && (
              <div className="flex items-center space-x-2 text-sm text-success">
                <Icon icon="ph:check-circle" className="h-4 w-4" />
                <span>File berhasil diunggah</span>
              </div>
            )}
          </div>
        );

      case 'category-program-selector':
        return (
          <CategoryProgramSelector
            field={field}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            error={error}
          />
        );

      default:
        return (
          <Input
            id={field.name}
            name={field.name}
            type="text"
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            size={field.size || 'default'}
            color={field.color || 'default'}
          />
        );
    }
  };

  return (
    <div className={cn("space-y-3", className, {
      "w-full max-w-none": field.type === 'category-program-selector'
    })}>
      {/* Field Label */}
      {!(field.disabled && field.className === 'section-divider') && !(field.disabled && field.className === 'info-text') && (
        <div className="flex items-center space-x-2">
          {field.icon && (
            <Icon 
              icon={field.icon} 
              className={cn("h-4 w-4", {
                "text-destructive": error,
                "text-primary": !error && value,
                "text-muted-foreground": !error && !value
              })} 
            />
          )}
          <Label 
            htmlFor={field.name}
            className={cn("text-sm font-medium transition-colors duration-200", {
              "text-destructive": error,
              "text-primary": !error && value,
              "text-default-900": !error && !value
            })}
          >
            {field.label}
            {field.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        </div>
      )}

      {/* Field Input */}
      <div className={cn("relative", {
        "w-full": field.type === 'category-program-selector'
      })}>
        {renderFieldInput()}
      </div>

      {/* Helper Text */}
      {field.helperText && field.type !== 'checkbox' && !error && !(field.disabled && field.className === 'info-text') && (
        <p className="text-xs text-muted-foreground leading-relaxed mt-3">
          {field.helperText}
        </p>
      )}

      {/* Error Message */}
      {error && !(field.disabled && field.className === 'info-text') && (
        <Alert variant="outline" className="border-destructive/20 bg-destructive/5">
          <Icon icon="ph:warning-circle" className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Field Status Indicator */}
      {!error && value && field.type !== 'checkbox' && !(field.disabled && field.className === 'info-text') && (
        <div className="flex items-center space-x-1 text-xs text-success">
          <Icon icon="ph:check-circle" className="h-3 w-3" />
          <span>Valid</span>
        </div>
      )}
    </div>
  );
};

// Category Program Selector Component
interface CategoryProgramSelectorProps {
  field: FormFieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: string;
}

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
  program_name_short: string;
  subject_focus: string;
  target_age_min: number;
  target_age_max: number;
  grade_level: number | null;
  ideal_session_duration_minutes: number;
  ideal_total_sessions: number;
  ideal_class_size_min: number;
  ideal_class_size_max: number;
  description: string | null;
  prerequisites: string | null;
  subcategory: {
    id: string;
    sub_name: string;
    sub_name_local: string;
    main_category: {
      id: string;
      main_code: string;
      main_name: string;
      main_name_local: string;
    };
  };
  program_type?: {
    id: string;
    type_name: string;
    type_name_local: string;
  };
}

const CategoryProgramSelector: React.FC<CategoryProgramSelectorProps> = ({
  field,
  value = [],
  onChange,
  disabled = false,
  error
}) => {
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [searchResults, setSearchResults] = useState<Program[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPrograms, setTotalPrograms] = useState(0);
  
  const PROGRAMS_PER_PAGE = 30;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await fetch('/api/subjects/categories');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        
        const categoriesData = await categoriesResponse.json();
        let categories = [];
        if (categoriesData.categories) {
          categories = categoriesData.categories;
        } else if (categoriesData.data) {
          categories = categoriesData.data.map((item: any) => ({
            id: item.id,
            main_code: item.code,
            main_name: item.name,
            main_name_local: item.nameLocal,
            description: item.description,
            is_active: true
          }));
        }
        setCategories(categories);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch programs with pagination
  const fetchPrograms = async (page: number = 1, reset: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const offset = (page - 1) * PROGRAMS_PER_PAGE;
      let programsToFetch: Program[] = [];
      
      // Fetch from all categories if "all" selected, otherwise specific category
      if (selectedCategory === 'all') {
        for (const category of categories) {
          const response = await fetch(
            `/api/subjects/programs?category=${category.main_code}&limit=50&offset=0`
          );
          if (response.ok) {
            const data = await response.json();
            let programs = data.programs || data.data || [];
            programsToFetch.push(...programs);
          }
        }
      } else {
        const response = await fetch(
          `/api/subjects/programs?category=${selectedCategory}&limit=100&offset=0`
        );
        if (response.ok) {
          const data = await response.json();
          programsToFetch = data.programs || data.data || [];
        }
      }
      
      // Apply pagination to fetched data
      const startIndex = offset;
      const endIndex = startIndex + PROGRAMS_PER_PAGE;
      const paginatedPrograms = programsToFetch.slice(startIndex, endIndex);
      
      setTotalPrograms(programsToFetch.length);
      setHasMore(endIndex < programsToFetch.length);
      
      if (reset || page === 1) {
        setAllPrograms(paginatedPrograms);
      } else {
        setAllPrograms(prev => [...prev, ...paginatedPrograms]);
      }
      
      console.log(`✅ Loaded page ${page}: ${paginatedPrograms.length} programs (${startIndex + 1}-${Math.min(endIndex, programsToFetch.length)} of ${programsToFetch.length} total)`);
      
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial fetch when categories are loaded or category changes
  useEffect(() => {
    if (categories.length > 0) {
      setSearchTerm(''); // Clear search when category changes
      setSearchResults([]); // Clear search results
      fetchPrograms(1, true);
      setCurrentPage(1);
    }
  }, [categories, selectedCategory]);

  // Load more programs
  const loadMore = () => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPrograms(nextPage, false);
    }
  };

  // Global search across all programs
  const searchAllPrograms = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      console.log('🔍 Searching all programs for:', searchTerm);
      
      // Fetch from all categories
      const allProgramsData: Program[] = [];
      for (const category of categories) {
        const response = await fetch(
          `/api/subjects/programs?category=${category.main_code}&limit=200&offset=0`
        );
        if (response.ok) {
          const data = await response.json();
          let programs = data.programs || data.data || [];
          allProgramsData.push(...programs);
        }
      }
      
      // Filter by search term
      const search = searchTerm.toLowerCase();
      const filtered = allProgramsData.filter(program =>
        program.program_name_local?.toLowerCase().includes(search) ||
        program.program_name?.toLowerCase().includes(search) ||
        program.program_code?.toLowerCase().includes(search) ||
        program.subject_focus?.toLowerCase().includes(search)
      );
      
      // Sort: selected first, then alphabetical
      const sorted = filtered.sort((a, b) => {
        const aSelected = value.includes(a.id);
        const bSelected = value.includes(b.id);
        
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        
        return (a.program_name_local || a.program_name).localeCompare(
          b.program_name_local || b.program_name
        );
      });
      
      setSearchResults(sorted);
      console.log('✅ Search results:', sorted.length, 'programs found');
      
    } catch (error) {
      console.error('❌ Error searching programs:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchAllPrograms(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, categories, value]);

  // Display programs: search results when searching, otherwise filtered category programs
  const displayPrograms = React.useMemo(() => {
    if (searchTerm.trim()) {
      // Show search results from all categories
      return searchResults;
    } else {
      // Show category-filtered programs with selected first
      return allPrograms.sort((a, b) => {
        const aSelected = value.includes(a.id);
        const bSelected = value.includes(b.id);
        
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        
        return (a.program_name_local || a.program_name).localeCompare(
          b.program_name_local || b.program_name
        );
      });
    }
  }, [allPrograms, searchResults, searchTerm, value]);

  const handleProgramToggle = (programId: string) => {
    if (disabled) return;
    const newValue = [...value];
    const index = newValue.indexOf(programId);
    
    if (index > -1) {
      newValue.splice(index, 1);
    } else {
      newValue.push(programId);
    }
    
    onChange(newValue);
  };

  const selectedPrograms = allPrograms.filter(p => value.includes(p.id));

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">Memuat mata pelajaran...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Selection Summary */}
      {value.length > 0 && (
        <div className="p-3 bg-success/10 border border-success/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon icon="ph:check-circle" className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">
                {value.length} program dipilih
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange([])}
              disabled={disabled}
              className="h-7 px-2 text-xs"
            >
              Hapus Semua
            </Button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="w-full space-y-3">
        <div className="flex gap-3 w-full">
          {/* Search */}
          <div className="flex-1 relative">
            <Icon icon="ph:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari program mata pelajaran dari semua kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 w-full"
            />
            {searchLoading && (
              <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
            {searchTerm && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              >
                <Icon icon="ph:x" className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={(value) => {
            setSelectedCategory(value);
            setCurrentPage(1);
            setAllPrograms([]);
          }}>
            <SelectTrigger className="w-52 h-9">
              <SelectValue placeholder="Semua Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.main_code}>
                  {cat.main_name_local} ({cat.main_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>
              {searchTerm.trim() ? (
                <>Hasil pencarian: {displayPrograms.length} program ditemukan untuk "{searchTerm}"</>
              ) : (
                <>Menampilkan {displayPrograms.length} dari {allPrograms.length} program - Page {currentPage} • Total: {totalPrograms} program</>
              )}
            </span>
            {searchTerm.trim() && (
              <span className="text-primary text-xs">
                Pencarian global dari semua kategori
              </span>
            )}
          </div>
          {value.length > 0 && (
            <span className="text-success font-medium">
              {value.length} dipilih
            </span>
          )}
        </div>
      </div>

      {/* Programs List - Simple Grid Layout */}
      <div className="w-full space-y-3">
        {displayPrograms.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-lg border">
            <Icon icon="ph:magnifying-glass" className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {searchTerm ? `Tidak ada program yang cocok dengan "${searchTerm}"` : 'Tidak ada program tersedia'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 bg-muted/20 rounded-lg border">
              {displayPrograms.map((program: Program) => {
                const isSelected = value.includes(program.id);
                const categoryInfo = categories.find(c => c.main_code === program.subcategory?.main_category?.main_code);
                
                return (
                  <div
                    key={program.id}
                    className={cn(
                      "flex items-start space-x-3 p-3 rounded cursor-pointer transition-colors",
                      "hover:bg-background/50 border",
                      {
                        "bg-primary/10 border-primary": isSelected,
                        "bg-background border-muted": !isSelected
                      }
                    )}
                    onClick={() => handleProgramToggle(program.id)}
                  >
                    {/* Checkbox */}
                    <Checkbox
                      id={`program-${program.id}`}
                      checked={isSelected}
                      onCheckedChange={() => {}} // Handle by parent click
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
                    />
                    
                    {/* Program Info */}
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={`program-${program.id}`}
                        className="text-sm cursor-pointer font-medium leading-tight"
                      >
                        {program.program_name_local || program.program_name}
                      </Label>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
                          {program.program_code}
                        </span>
                        {program.subject_focus && (
                          <span>{program.subject_focus}</span>
                        )}
                      </div>
                      {categoryInfo && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {categoryInfo.main_name_local}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Load More Button */}
            {!searchTerm && hasMore && (
              <Button
                type="button"
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Memuat program...
                  </>
                ) : (
                  <>
                    <Icon icon="ph:arrow-down" className="h-4 w-4 mr-2" />
                    Muat {Math.min(PROGRAMS_PER_PAGE, totalPrograms - allPrograms.length)} program lagi
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({allPrograms.length}/{totalPrograms})
                    </span>
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>

      {/* Selected Programs Recap */}
      {Array.isArray(value) && value.length > 0 && (
        <div className="w-full">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-success/10 border-b border-success/30 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon icon="ph:check-circle" className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium text-success">
                    {value.length} Program Dipilih
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onChange([])}
                  disabled={disabled}
                  className="h-7 px-2 text-xs border-success/30 text-success hover:bg-success/20"
                >
                  <Icon icon="ph:trash" className="h-3 w-3 mr-1" />
                  Hapus Semua
                </Button>
              </div>
            </div>
            <div className="p-4 bg-success/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(() => {
                  // Get selected programs from all available data
                  const allAvailablePrograms = [...allPrograms, ...searchResults];
                  const selectedProgramsData = value.map(id => 
                    allAvailablePrograms.find(p => p.id === id)
                  ).filter(Boolean);

                  return selectedProgramsData.map((program) => {
                    if (!program) return null;
                    const categoryInfo = categories.find(c => c.main_code === program.subcategory?.main_category?.main_code);
                    
                    return (
                      <div
                        key={program.id}
                        className="flex items-center justify-between p-2 bg-background rounded border border-success/20 hover:border-success/40 transition-colors group"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <Icon icon="ph:check-circle-fill" className="h-3 w-3 text-success flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-success truncate">
                              {program.program_name_local || program.program_name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="font-mono">{program.program_code}</span>
                              {categoryInfo && (
                                <span>• {categoryInfo.main_name_local}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleProgramToggle(program.id)}
                          disabled={disabled}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                          title="Hapus dari pilihan"
                        >
                          <Icon icon="ph:x" className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicFormField; 