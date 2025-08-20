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
import { OptimizedImageUpload } from '@/components/ui/optimized-image-upload';
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
  // Get initial preview from form data if available
  const previewFieldName = `${field.name}Preview`;
  const initialPreview = formData?.[previewFieldName as keyof TutorFormData] as string || null;
  const [filePreview, setFilePreview] = useState<string | null>(initialPreview);
  const [dynamicOptions, setDynamicOptions] = useState<Array<{ value: string; label: string; disabled?: boolean }>>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);

  // Sync filePreview with form data when it changes (for tab switching)
  useEffect(() => {
    const previewFieldName = `${field.name}Preview`;
    const formPreview = formData?.[previewFieldName as keyof TutorFormData] as string;
    
    if (formPreview && formPreview !== filePreview) {
      setFilePreview(formPreview);
    } else if (!formPreview && filePreview) {
      setFilePreview(null);
    }
  }, [formData, field.name]);

  // Load dynamic options from API
  useEffect(() => {
    if (field.apiEndpoint && (field.type === 'select' || field.type === 'checkbox')) {
      const loadOptions = async (attempt: number = 0) => {
        setIsLoadingOptions(true);
        setLoadingError(null);
        try {
          let url = field.apiEndpoint;
          if (!url) return;
          if (field.dependsOn && formData) {
            const dependentValue = formData[field.dependsOn as keyof TutorFormData];
            if (dependentValue) {
              const paramName = field.dependsOn.includes('provinsi') ? 'province_id' :
                field.dependsOn.includes('kota') ? 'city_id' :
                field.dependsOn.includes('kecamatan') ? 'district_id' : 'parent_id';
              url += `?${paramName}=${dependentValue}`;
            } else {
              setDynamicOptions([]);
              setIsLoadingOptions(false);
              return;
            }
          }
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          });
          clearTimeout(timeoutId);
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          const data = await response.json();
          let options: Array<{ value: string; label: string; disabled?: boolean }> = [];

            // Tambahkan penanganan untuk provinces di bagian pertama
            if (data.provinces && Array.isArray(data.provinces)) {
              options = data.provinces.map((item: any) => ({
                value: item.value,
                label: item.label,
                disabled: false
              }));
            } else if (Array.isArray(data.brands)) {
              options = data.brands.map((item: any) => ({
                value: item.value,
                label: item.label,
                disabled: item.disabled || false
              }));
            } else if (data.data && Array.isArray(data.data)) {
              options = data.data.map((item: any) => ({
                value: item.value,
                label: item.label,
                disabled: item.disabled || false
              }));
            }
          setDynamicOptions(options);
          setRetryCount(0);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setLoadingError(errorMessage);
          setDynamicOptions([]);
          if (attempt < 2) {
            setTimeout(() => {
              setRetryCount(attempt + 1);
              loadOptions(attempt + 1);
            }, 1000 * (attempt + 1));
          }
        } finally {
          setIsLoadingOptions(false);
        }
      };
      loadOptions();
    }
  }, [field.apiEndpoint, field.dependsOn, formData?.[field.dependsOn as keyof TutorFormData]]);

  // Retry function for manual retry
  const handleRetry = () => {
    setRetryCount(0);
    if (field.apiEndpoint && field.type === 'select') {
      const loadOptionsRetry = async () => {
        setIsLoadingOptions(true);
        setLoadingError(null);
        
        try {
          let url = field.apiEndpoint;
          if (!url) return;
          
          if (field.dependsOn && formData) {
            const dependentValue = formData[field.dependsOn as keyof TutorFormData];
            if (dependentValue) {
              const paramName = field.dependsOn.includes('provinsi') ? 'province_id' : 
                               field.dependsOn.includes('kota') ? 'city_id' : 
                               field.dependsOn.includes('kecamatan') ? 'district_id' : 'parent_id';
              url += `?${paramName}=${dependentValue}`;
            } else {
              setDynamicOptions([]);
              setIsLoadingOptions(false);
              return;
            }
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            }
          });
          
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          
          let options: Array<{ value: string; label: string; disabled?: boolean }> = [];
          
          if (data.provinces) {
            options = data.provinces.map((item: any) => ({
              value: item.value,
              label: item.label,
              disabled: false
            }));
          } else if (data.cities) {
            options = data.cities.map((item: any) => ({
              value: item.value,
              label: item.label,
              disabled: false
            }));
          } else if (data.districts) {
            options = data.districts.map((item: any) => ({
              value: item.value,
              label: item.label,
              disabled: false
            }));
          } else if (data.villages) {
            options = data.villages.map((item: any) => ({
              value: item.value,
              label: item.label,
              disabled: false
            }));
          } else if (data.banks) {
            options = data.banks.map((item: any) => ({
              value: item.value,
              label: item.label,
              disabled: false
            }));
          } else if (data.data && Array.isArray(data.data)) {
            // Handle tutor-status-types and other generic API response format
            options = data.data.map((item: any) => ({
              value: item.value,
              label: item.label,
              disabled: item.disabled || false
            }));
          }

          setDynamicOptions(options);
          setRetryCount(0);
        } catch (error) {

          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setLoadingError(errorMessage);
          setDynamicOptions([]);
        } finally {
          setIsLoadingOptions(false);
        }
      };
      
      loadOptionsRetry();
    }
  };

  const handleChange = (newValue: any) => {
    // Apply formatting based on field type
    let formattedValue = newValue;
    
    if (field.type === 'tel' && newValue) {
      // Format phone numbers with +62 prefix
      formattedValue = formatPhoneNumber(newValue);
    } else if (field.type === 'tel_split' && newValue) {
      // For tel_split, value is already formatted as 62XXXXXXXXX
      formattedValue = newValue;
    } else if ((field.name === 'nomorRekening' || field.name.includes('rekening')) && newValue) {
      // Sanitize account numbers (remove spaces, dashes)
      formattedValue = sanitizeInput(newValue);
    }
    
    onChange(field.name, formattedValue);
  };

  // Phone number formatting function
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    // Remove all spaces, dashes, and other non-digit characters
    let cleaned = phone.replace(/[\s\-\(\)\.\+]/g, '');
    
    // Handle different input formats - always return clean number without + or dashes
    if (cleaned.startsWith('0')) {
      // Replace leading 0 with 62 (e.g., 081234567890 → 6281234567890)
      cleaned = '62' + cleaned.slice(1);
    } else if (cleaned.startsWith('8')) {
      // Add 62 prefix if starts with 8 (e.g., 81234567890 → 6281234567890)
      cleaned = '62' + cleaned;
    } else if (!cleaned.startsWith('62')) {
      // Add 62 prefix if doesn't have it
      cleaned = '62' + cleaned;
    }
    
    return cleaned;
  };

  // Input sanitization function  
  const sanitizeInput = (input: string): string => {
    if (!input) return '';
    // Remove all spaces, dashes, and non-digit characters for account numbers
    return input.replace(/[\s\-\(\)\.\+]/g, '');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    
    if (!file) {
      setFilePreview(null);
      handleChange(null);
      return;
    }

    // File validation
    const validationError = validateFile(file);
    if (validationError) {
      setFileError(validationError);
      e.target.value = ''; // Clear the input
      return;
    }

    handleChange(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFilePreview(result);
        
        // Persist preview in form data to prevent loss when switching tabs
        const previewFieldName = `${field.name}Preview`;
        onChange(previewFieldName, result);
        
        // Additional dimension validation for images
        const img = new Image();
        img.onload = () => {
          const dimensionError = validateImageDimensions(img.width, img.height);
          if (dimensionError) {
            setFileError(dimensionError);
            setFilePreview(null);
            handleChange(null);
            // Also clear the preview from form data
            onChange(previewFieldName, null);
            // Clear the file input
            const fileInput = document.getElementById(field.name) as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // File validation function
  const validateFile = (file: File): string | null => {
    // File size validation - different limits for different file types
    let maxSize: number;
    let maxSizeText: string;
    
    if (field.name === 'fotoProfil') {
      maxSize = 2 * 1024 * 1024; // 2MB for profile photos
      maxSizeText = '2MB';
    } else {
      maxSize = 5 * 1024 * 1024; // 5MB for documents
      maxSizeText = '5MB';
    }
    
    if (file.size > maxSize) {
      return `File size too large. Maximum size is ${maxSizeText}. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
    }

    // File format validation based on field type
    if (field.name === 'fotoProfil') {
      // Profile photo - only images
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        return `Invalid file format. Only JPG and PNG files are allowed for profile photos. Current format: ${file.type}`;
      }
    } else if (field.accept?.includes('.pdf')) {
      // Document fields - images and PDF
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        return `Invalid file format. Only JPG, PNG, and PDF files are allowed for documents. Current format: ${file.type}`;
      }
    } else {
      // Default image validation
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        return `Invalid file format. Only JPG and PNG files are allowed. Current format: ${file.type}`;
      }
    }

    return null;
  };

  // Image dimension validation
  const validateImageDimensions = (width: number, height: number): string | null => {
    // Only check maximum dimensions - no minimum restrictions
    const maxWidth = 2000;
    const maxHeight = 2000;
    
    if (width > maxWidth || height > maxHeight) {
      return `Image dimensions too large. Maximum size: ${maxWidth}x${maxHeight}px. Current: ${width}x${height}px`;
    }

    return null;
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
          radius={formData?.teaching_radius_km || 10}
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
          radius={formData?.teaching_radius_km || 10}
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

      case 'tel':
        return (
          <Input
            id={field.name}
            name={field.name}
            type="tel"
            placeholder={field.placeholder}
            value={value ?? ''}
            onChange={(e) => {
              // Format phone number: remove spaces, dashes, and format to Indonesian standard
              let cleaned = e.target.value.replace(/[\s\-\(\)\.\+]/g, '');
              
              // Auto-format to Indonesian format
              if (cleaned.startsWith('0')) {
                cleaned = '62' + cleaned.slice(1);
              } else if (cleaned.startsWith('8') && !cleaned.startsWith('62')) {
                cleaned = '62' + cleaned;
              }
              
              handleChange(cleaned);
            }}
            disabled={disabled}
            size={field.size || 'default'}
            color={error ? 'destructive' : field.color || 'default'}
            className={cn("transition-all duration-200", {
              "ring-2 ring-destructive/20": error,
              "ring-2 ring-primary/20 border-primary": !error && value
            })}
          />
        );

      case 'tel_split':
        // Split phone input: dynamic country code + number
        const parsePhoneValue = (fullValue: string) => {
          if (!fullValue) return ['62', '']; // Default to Indonesia
          
          // Try to detect country code (1-4 digits at start)
          const match = fullValue.match(/^(\d{1,4})(\d*)$/);
          if (match) {
            const [, code, number] = match;
            // Common country codes: 1(US), 44(UK), 60(MY), 62(ID), 65(SG), 86(CN), etc.
            if (['1', '44', '60', '62', '65', '86', '91', '81', '82', '84'].includes(code)) {
              return [code, number];
            }
            // For 2-digit codes
            if (code.length >= 2 && ['60', '62', '65', '86', '91', '81', '82', '84'].includes(code.substring(0, 2))) {
              return [code.substring(0, 2), code.substring(2) + number];
            }
          }
          
          // Default parsing: assume first 2 digits are country code
          if (fullValue.length >= 2) {
            return [fullValue.substring(0, 2), fullValue.substring(2)];
          }
          
          return ['62', fullValue]; // Fallback to Indonesia
        };
        
        const [countryCode, phoneNumber] = parsePhoneValue(value || '');

        return (
          <div className="flex gap-2">
            {/* Country Code Input - Editable, default 62 */}
            <div className="w-20">
              <Input
                id={`${field.name}_country`}
                name={`${field.name}_country`}
                type="text"
                value={countryCode}
                onChange={(e) => {
                  let code = e.target.value.replace(/[^0-9]/g, ''); // Only numbers
                  if (code.length <= 4) { // Max 4 digits for country codes
                    const newFullNumber = code + phoneNumber;
                    handleChange(newFullNumber);
                  }
                }}
                placeholder="62"
                disabled={disabled}
                className="text-center font-mono"
                size={field.size || 'default'}
                maxLength={4}
              />
            </div>
            
            {/* Phone Number Input */}
            <div className="flex-1">
              <Input
                id={field.name}
                name={field.name}
                type="tel"
                placeholder={field.placeholder}
                value={phoneNumber}
                onChange={(e) => {
                  let input = e.target.value;
                  
                  // Step 1: Remove all non-numeric characters (spaces, dashes, parentheses, etc.)
                  let cleaned = input.replace(/[^0-9]/g, '');
                  
                  // Step 2: Handle common wrong formats
                  // Remove multiple leading zeros: 00811 -> 811
                  cleaned = cleaned.replace(/^0+/, '0'); // Keep only one leading zero
                  
                  // Step 3: Remove leading 0 if present
                  if (cleaned.startsWith('0')) {
                    cleaned = cleaned.slice(1);
                  }
                  
                  // Step 4: Limit length to reasonable phone number length
                  if (cleaned.length > 12) {
                    cleaned = cleaned.substring(0, 12);
                  }
                  
                  // Step 5: Combine with country code and update
                  const fullNumber = countryCode + cleaned;
                  handleChange(fullNumber);
                }}
                disabled={disabled}
                size={field.size || 'default'}
                color={error ? 'destructive' : field.color || 'default'}
                className={cn("transition-all duration-200", {
                  "ring-2 ring-destructive/20": error,
                  "ring-2 ring-primary/20 border-primary": !error && value
                })}
                maxLength={12} // Max 12 digits for Indonesian numbers
              />
            </div>
          </div>
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
        // Use dynamic options if available, otherwise use static options
        const optionsToUse = field.apiEndpoint ? dynamicOptions : (field.options || []);
        const isDisabled = Boolean(disabled) || (Boolean(field.apiEndpoint) && isLoadingOptions);
        
        // Show skeleton loader for API-driven selects when first loading
        if (field.apiEndpoint && isLoadingOptions && optionsToUse.length === 0 && retryCount === 0) {
          return (
            <div className="space-y-2">
              <div className={cn("animate-pulse bg-muted rounded-md border", field.size === 'lg' ? 'h-12' : 'h-10')} />
              <div className="text-xs text-muted-foreground">Loading options...</div>
            </div>
          );
        }

        // Show error state with retry option
        if (field.apiEndpoint && loadingError && optionsToUse.length === 0 && !isLoadingOptions) {
          return (
            <div className="space-y-2">
              <div className={cn("border-2 border-destructive/20 bg-destructive/5 rounded-md flex items-center justify-between px-3", field.size === 'lg' ? 'h-12' : 'h-10')}>
                <div className="flex items-center">
                  {field.icon && (
                    <Icon icon={field.icon} className="h-4 w-4 mr-2 text-destructive" />
                  )}
                  <span className="text-sm text-destructive">Failed to load</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRetry}
                  className="h-6 text-xs hover:bg-destructive/10"
                >
                  <Icon icon="ph:arrow-clockwise" className="h-3 w-3 mr-1" />
                  Retry
                </Button>
              </div>
              <div className="text-xs text-destructive">{loadingError}</div>
            </div>
          );
        }
        
        return (
          <div className="space-y-2">
            <Select value={value || ''} onValueChange={handleChange} disabled={isDisabled}>
              <SelectTrigger 
                className={cn("transition-all duration-200", field.size === 'lg' ? 'h-12' : 'h-10', {
                  "ring-2 ring-destructive/20 border-destructive": error,
                  "ring-2 ring-primary/20 border-primary": !error && value,
                  "opacity-60": isDisabled
                })}
                color={error ? 'destructive' : field.color || 'default'}
              >
                {field.icon && (
                  <Icon icon={field.icon} className="h-4 w-4 mr-2 text-muted-foreground" />
                )}
                <SelectValue placeholder={
                  isLoadingOptions ? 'Loading...' : 
                  field.placeholder || `Pilih ${field.label}...`
                } />
                {isLoadingOptions && (
                  <Icon icon="ph:spinner" className="h-4 w-4 ml-auto animate-spin text-muted-foreground" />
                )}
              </SelectTrigger>
              <SelectContent>
                {isLoadingOptions ? (
                  <SelectItem value="loading-state" disabled={true}>
                    <div className="flex items-center gap-2">
                      <Icon icon="ph:spinner" className="h-4 w-4 animate-spin" />
                      {retryCount > 0 ? `Loading... (attempt ${retryCount + 1}/3)` : 'Loading...'}
                    </div>
                  </SelectItem>
                ) : optionsToUse.length === 0 ? (
                  <SelectItem value="no-options" disabled>
                    No options available
                  </SelectItem>
                ) : (
                  optionsToUse.map((option) => (
                    <SelectItem 
                      key={option.value} 
                      value={String(option.value)}
                      disabled={Boolean(option.disabled)}
                    >
                      {option.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            
            {/* Dependency message */}
            {field.dependsOn && !formData?.[field.dependsOn as keyof TutorFormData] && (
              <div className="text-xs text-muted-foreground flex items-center">
                <Icon icon="ph:info" className="h-3 w-3 mr-1" />
                Please select {field.dependsOn.replace(/([A-Z])/g, ' $1').toLowerCase()} first
              </div>
            )}
          </div>
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
        // Dynamic checkbox group support
        if (field.multiple && (field.apiEndpoint || field.options)) {
          const optionsToUse = field.apiEndpoint ? dynamicOptions : (field.options || []);
          const isDisabled = Boolean(disabled) || (Boolean(field.apiEndpoint) && isLoadingOptions);
          if (field.apiEndpoint && isLoadingOptions && optionsToUse.length === 0 && retryCount === 0) {
            return (
              <div className="space-y-2">
                <div className={cn("animate-pulse bg-muted rounded-md border", field.size === 'lg' ? 'h-12' : 'h-10')} />
                <div className="text-xs text-muted-foreground">Loading options...</div>
              </div>
            );
          }
          if (field.apiEndpoint && loadingError && optionsToUse.length === 0 && !isLoadingOptions) {
            return (
              <div className="space-y-2">
                <div className={cn("border-2 border-destructive/20 bg-destructive/5 rounded-md flex items-center justify-between px-3", field.size === 'lg' ? 'h-12' : 'h-10')}>
                  <div className="flex items-center">
                    {field.icon && (
                      <Icon icon={field.icon} className="h-4 w-4 mr-2 text-destructive" />
                    )}
                    <span className="text-sm text-destructive">Failed to load</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRetry}
                  >Retry</Button>
                </div>
                <div className="text-xs text-muted-foreground">{loadingError}</div>
              </div>
            );
          }
          return (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-4 bg-muted/20 rounded-lg border">
                {optionsToUse.map((option) => {
                  const isChecked = Array.isArray(value) && value.includes(option.value);
                  return (
                    <div key={option.value} className="flex items-center space-x-3">
                      <Checkbox
                        id={`${field.name}-${option.value}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleCheckboxGroupChange(option.value, checked as boolean)
                        }
                        disabled={isDisabled || option.disabled}
                      />
                      <Label htmlFor={`${field.name}-${option.value}`}>{option.label}</Label>
                    </div>
                  );
                })}
              </div>
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
        // Special handling for profile photo with optimization
        if (field.name === 'fotoProfil') {
          console.log('🖼️ Rendering OptimizedImageUpload for fotoProfil (Cloudflare R2 Storage)');
          return (
            <div className="space-y-2">
              <OptimizedImageUpload
                onImageSelect={(file) => handleChange(file)}
                maxSizeMB={2}
                maxWidthOrHeight={800}
                quality={0.8}
                placeholder="Upload foto profil"
                disabled={disabled}
                error={error || (fileError ?? undefined)}
                currentValue={filePreview ?? undefined}
              />
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Icon icon="ph:cloud" className="h-3 w-3 text-blue-500" />
                <span>Powered by Cloudflare R2 Storage</span>
              </div>
            </div>
          );
        }
        
        console.log('📁 Rendering standard file input for:', field.name);

        // Standard file upload for documents
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
                  "ring-2 ring-destructive/20": error || fileError
                })}
              />
              
              {/* File upload guidelines */}
              <div className="mt-2 text-xs text-muted-foreground space-y-1">
                <div className="flex items-center space-x-4">
                  <span>📁 Max 5MB</span>
                  <span>📄 JPG, PNG, PDF</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Icon icon="ph:cloud" className="h-3 w-3 text-blue-500" />
                  <span>Powered by Cloudflare R2 Storage</span>
                </div>
              </div>
            </div>
            
            {/* File validation error */}
            {fileError && (
              <div className="flex items-start space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <Icon icon="ph:warning" className="h-4 w-4 text-destructive mt-0.5" />
                <div className="text-sm text-destructive">{fileError}</div>
              </div>
            )}

            {/* File Upload Success (for non-image files) */}
            {value && !fileError && !filePreview && (
              <div className="flex items-center justify-between p-3 bg-success/10 border border-success/20 rounded-md">
                <div className="flex items-center space-x-2">
                  <Icon icon="ph:check-circle" className="h-4 w-4 text-success" />
                  <div className="text-sm text-success">
                    <span className="font-medium">File uploaded successfully</span>
                    {typeof value === 'object' && value?.name && (
                      <div className="text-xs opacity-80">{value.name}</div>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs text-success hover:bg-success/10"
                  onClick={() => {
                    handleChange(null);
                    setFilePreview(null);
                    setFileError(null);
                    
                    // Clear the file input
                    const fileInput = document.getElementById(field.name) as HTMLInputElement;
                    if (fileInput) {
                      fileInput.value = '';
                    }
                  }}
                >
                  <Icon icon="ph:x" className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {/* File Preview */}
            {filePreview && !fileError && (
              <div className="relative w-32 h-32 bg-muted rounded-lg overflow-hidden border-2 border-success/20">
                <img 
                  src={filePreview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="absolute top-1 right-1 h-6 w-6 p-0 bg-white/90 hover:bg-white"
                  onClick={() => {
                    setFilePreview(null);
                    setFileError(null);
                    handleChange(null);
                    // Clear the preview from form data
                    const previewFieldName = `${field.name}Preview`;
                    onChange(previewFieldName, null);
                    // Clear the file input
                    const fileInput = document.getElementById(field.name) as HTMLInputElement;
                    if (fileInput) fileInput.value = '';
                  }}
                >
                  <Icon icon="ph:x" className="h-3 w-3" />
                </Button>
                
                {/* Success indicator */}
                <div className="absolute bottom-1 left-1 bg-success text-success-foreground rounded px-1.5 py-0.5">
                  <Icon icon="ph:check" className="h-3 w-3" />
                </div>
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
  icon?: string;
  color_hex?: string;
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
  popularity?: string;
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

// Helper function to get popularity badge variant
const getPopularityVariant = (popularity: string | undefined) => {
  switch (popularity?.toUpperCase()) {
    case 'CORE/POPULAR':
    case 'POPULAR':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'TRENDING':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'EXPLORATIVE':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'PROMISING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'UNPOPULAR':
      return 'bg-gray-100 text-gray-500 border-gray-200';
    case 'ORDINARY':
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

// Helper function to get popularity sort order
const getPopularityOrder = (popularity: string | undefined) => {
  switch (popularity?.toUpperCase()) {
    case 'CORE/POPULAR':
    case 'POPULAR':
      return 1;
    case 'TRENDING':
      return 2;
    case 'PROMISING':
      return 3;
    case 'ORDINARY':
      return 4;
    case 'EXPLORATIVE':
      return 5;
    case 'UNPOPULAR':
      return 6;
    default:
      return 7;
  }
};

// Session-based cache for development safety
const sessionCache = new Map<string, { data: Program[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for development

const CategoryProgramSelector: React.FC<CategoryProgramSelectorProps> = ({
  field,
  value = [],
  onChange,
  disabled = false,
  error
}) => {
  const [allPrograms, setAllPrograms] = useState<Program[]>([]);
  const [allProgramsRaw, setAllProgramsRaw] = useState<Program[]>([]); // Store all programs
  const [programsByCategory, setProgramsByCategory] = useState<Map<string, Program[]>>(new Map());
  const [searchResults, setSearchResults] = useState<Program[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPopularity, setSelectedPopularity] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPrograms, setTotalPrograms] = useState(0);
  
  const PROGRAMS_PER_PAGE = 100;

  // Helper function to check cache validity
  const isCacheValid = (cacheKey: string): boolean => {
    const cached = sessionCache.get(cacheKey);
    if (!cached) return false;
    return Date.now() - cached.timestamp < CACHE_DURATION;
  };

  // Helper function to get cached data
  const getCachedData = (cacheKey: string): Program[] | null => {
    if (!isCacheValid(cacheKey)) return null;
    return sessionCache.get(cacheKey)?.data || null;
  };

  // Helper function to set cache data
  const setCacheData = (cacheKey: string, data: Program[]): void => {
    sessionCache.set(cacheKey, { data, timestamp: Date.now() });
  };

  // Lazy fetch function for specific category (performance optimized)
  const fetchCategoryPrograms = async (categoryCode: string): Promise<Program[]> => {
    const cacheKey = `programs_${categoryCode}`;
    
    // Check cache first
    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await fetch(
        `/api/subjects/programs?category=${categoryCode}&limit=1000&offset=0`
      );
      
      if (response.ok) {
        const data = await response.json();
        const programs = data.programs || data.data || [];
        
        // Cache the result
        setCacheData(cacheKey, programs);
        return programs;
      }
      
      return [];
    } catch (error) {
      return [];
    }
  };

  // Batch fetch for multiple categories (only when needed)
  const fetchMultipleCategories = async (categoryCodes: string[]): Promise<Map<string, Program[]>> => {
    const programsMap = new Map<string, Program[]>();
    
    // Use Promise.all for truly needed categories only
    const fetchPromises = categoryCodes.map(async (categoryCode) => {
      const programs = await fetchCategoryPrograms(categoryCode);
      return { categoryCode, programs };
    });
    
    const results = await Promise.all(fetchPromises);
    results.forEach(({ categoryCode, programs }) => {
      programsMap.set(categoryCode, programs);
    });
    
    return programsMap;
  };

  // Fetch main categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesResponse = await fetch('/api/subjects/categories');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Optimized fetch with parallel loading and smart caching
  const fetchPrograms = async (page: number = 1, reset: boolean = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      let programsToFetch: Program[] = [];
      
      // Check if we need to fetch data
      if (programsByCategory.size === 0 || reset) {
        
        // Fetch all categories when 'all' is selected, or specific category
        const categoriesToFetch = selectedCategory === 'all' 
          ? categories.map(cat => cat.main_code) // Fetch ALL categories when 'all' is selected
          : [selectedCategory];
        
        const programsMap = await fetchMultipleCategories(categoriesToFetch);
        setProgramsByCategory(programsMap);
        
        // Combine programs based on selected category
        if (selectedCategory === 'all') {
          // Combine all programs from all categories and deduplicate
          const allCombinedPrograms = Array.from(programsMap.values()).flat();
          programsToFetch = allCombinedPrograms.filter((program, index, array) => 
            array.findIndex(p => p.id === program.id) === index
          );
        } else {
          // Get programs from specific category
          programsToFetch = programsMap.get(selectedCategory) || [];
        }
        
        // Sort all programs by popularity FIRST
        const sortedPrograms = programsToFetch.sort((a, b) => {
          const aPopularityOrder = getPopularityOrder(a.popularity);
          const bPopularityOrder = getPopularityOrder(b.popularity);
          
          if (aPopularityOrder !== bPopularityOrder) {
            return aPopularityOrder - bPopularityOrder;
          }
          
          // Then alphabetically
          return (a.program_name_local || a.program_name).localeCompare(
            b.program_name_local || b.program_name
          );
        });
        
        // Cache the sorted programs
        setAllProgramsRaw(sortedPrograms);
        setTotalPrograms(sortedPrograms.length);
        
        console.log(`✅ Sorted ${sortedPrograms.length} programs by popularity`);
        
        // Use sorted programs for pagination
        programsToFetch = sortedPrograms;
      } else {
        // Use cached data - instant category switching!
        console.log('⚡ Using cached data for instant switching...');
        
        if (selectedCategory === 'all') {
          // Use all cached programs
          programsToFetch = allProgramsRaw;
        } else {
          // Get programs from specific category and sort
          const categoryPrograms = programsByCategory.get(selectedCategory) || [];
          programsToFetch = categoryPrograms.sort((a, b) => {
            const aPopularityOrder = getPopularityOrder(a.popularity);
            const bPopularityOrder = getPopularityOrder(b.popularity);
            
            if (aPopularityOrder !== bPopularityOrder) {
              return aPopularityOrder - bPopularityOrder;
            }
            
            return (a.program_name_local || a.program_name).localeCompare(
              b.program_name_local || b.program_name
            );
          });
          
          setTotalPrograms(programsToFetch.length);
        }
      }
      
      // Apply pagination to SORTED data
      const offset = (page - 1) * PROGRAMS_PER_PAGE;
      const endIndex = offset + PROGRAMS_PER_PAGE;
      const paginatedPrograms = programsToFetch.slice(offset, endIndex);
      
      setHasMore(endIndex < programsToFetch.length);
      
      if (reset || page === 1) {
        setAllPrograms(paginatedPrograms);
      } else {
        setAllPrograms(prev => [...prev, ...paginatedPrograms]);
      }
      
      console.log(`✅ Page ${page}: ${paginatedPrograms.length} programs (${offset + 1}-${Math.min(endIndex, programsToFetch.length)} of ${programsToFetch.length} total)`);
      
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
      
      // Only reset if categories changed (not category selection)
      const shouldReset = programsByCategory.size === 0;
      fetchPrograms(1, shouldReset);
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

  // Optimized search using cached data
  const searchAllPrograms = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      
      
      // Use cached data for instant search
      let allProgramsData: Program[] = [];
      
      if (programsByCategory.size > 0) {
        // Use cached programs from all categories and deduplicate
        const allCachedPrograms = Array.from(programsByCategory.values()).flat();
        allProgramsData = allCachedPrograms.filter((program, index, array) => 
          array.findIndex(p => p.id === program.id) === index
        );

      } else if (allProgramsRaw.length > 0) {
        // Fallback to allProgramsRaw
        allProgramsData = allProgramsRaw;

      } else {
        // Last resort: fetch specific category for search
        const programsMap = await fetchMultipleCategories([selectedCategory]);
        const fetchedPrograms = Array.from(programsMap.values()).flat();
        allProgramsData = fetchedPrograms.filter((program, index, array) => 
          array.findIndex(p => p.id === program.id) === index
        );
      }
      
      // Filter by search term - Enhanced search across multiple fields
      const search = searchTerm.toLowerCase();
      const filtered = allProgramsData.filter(program => {
        // Search in program names
        const nameMatch = program.program_name_local?.toLowerCase().includes(search) ||
                         program.program_name?.toLowerCase().includes(search);
        
        // Search in program code
        const codeMatch = program.program_code?.toLowerCase().includes(search);
        
        // Search in subject focus
        const subjectMatch = program.subject_focus?.toLowerCase().includes(search);
        
        // Search in popularity
        const popularityMatch = program.popularity?.toLowerCase().includes(search);
        
        // Search in program type
        const typeMatch = program.program_type?.type_name?.toLowerCase().includes(search) ||
                         program.program_type?.type_name_local?.toLowerCase().includes(search);
        
        // Search in category names
        const categoryMatch = program.subcategory?.main_category?.main_name?.toLowerCase().includes(search) ||
                             program.subcategory?.main_category?.main_name_local?.toLowerCase().includes(search) ||
                             program.subcategory?.sub_name?.toLowerCase().includes(search) ||
                             program.subcategory?.sub_name_local?.toLowerCase().includes(search);
        
        // Search in description
        const descriptionMatch = program.description?.toLowerCase().includes(search);
        
        return nameMatch || codeMatch || subjectMatch || popularityMatch || 
               typeMatch || categoryMatch || descriptionMatch;
      });
      
      // Sort search results by popularity
      const sorted = filtered.sort((a, b) => {
        const aPopularityOrder = getPopularityOrder(a.popularity);
        const bPopularityOrder = getPopularityOrder(b.popularity);
        
        if (aPopularityOrder !== bPopularityOrder) {
          return aPopularityOrder - bPopularityOrder;
        }
        
        return (a.program_name_local || a.program_name).localeCompare(
          b.program_name_local || b.program_name
        );
      });
      
      setSearchResults(sorted);
      
      
    } catch (error) {
      
    } finally {
      setSearchLoading(false);
    }
  };

  // Optimized debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        searchAllPrograms(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 200); // Reduced debounce for snappier feel

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Display programs: search results when searching, otherwise filtered category programs
  const displayPrograms = React.useMemo(() => {
    const filterByPopularity = (programs: Program[]) => {
      if (selectedPopularity === 'all') return programs;
      return programs.filter(program => program.popularity === selectedPopularity);
    };

    // Deduplicate programs by ID to prevent duplicate keys
    const deduplicatePrograms = (programs: Program[]) => {
      const seen = new Set<string>();
      return programs.filter(program => {
        if (seen.has(program.id)) {
          console.warn(`🔍 Duplicate program detected: ${program.id} - ${program.program_name}`);
          return false;
        }
        seen.add(program.id);
        return true;
      });
    };

    if (searchTerm.trim()) {
      // Show search results (already sorted by popularity)
      return deduplicatePrograms(filterByPopularity([...searchResults]));
    } else {
      // Show category-filtered programs (already sorted by popularity)
      return deduplicatePrograms(filterByPopularity([...allPrograms]));
    }
  }, [allPrograms, searchResults, searchTerm, value, selectedPopularity]);

  const handleProgramToggle = (programId: string) => {
    if (disabled) return;
    const newValue = [...value];
    const index = newValue.indexOf(programId);
    
    if (index > -1) {
      newValue.splice(index, 1);
      console.log('🔍 DEBUG: Removed program', programId, 'from selection. New value:', newValue);
    } else {
      newValue.push(programId);
      console.log('🔍 DEBUG: Added program', programId, 'to selection. New value:', newValue);
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
              placeholder="Cari nama program, popularity, tipe program, kategori..."
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
                  {cat.icon} {cat.main_name_local}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Popularity Filter */}
          <Select value={selectedPopularity} onValueChange={(value) => {
            setSelectedPopularity(value);
          }}>
            <SelectTrigger className="w-44 h-9">
              <SelectValue placeholder="Semua Popularity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Popularity</SelectItem>
              <SelectItem value="CORE/POPULAR">🟢 Core/Popular</SelectItem>
              <SelectItem value="TRENDING">🔵 Trending</SelectItem>
              <SelectItem value="PROMISING">🟡 Promising</SelectItem>
              <SelectItem value="ORDINARY">⚪ Ordinary</SelectItem>
              <SelectItem value="EXPLORATIVE">🟣 Explorative</SelectItem>
              <SelectItem value="UNPOPULAR">⚫ Unpopular</SelectItem>
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
                Pencarian global: nama, popularity, tipe program, kategori
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
              {displayPrograms.map((program: Program, index: number) => {
                const isSelected = value.includes(program.id);
                
                return (
                  <div
                    key={`${program.id}-${index}`}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded cursor-pointer transition-colors",
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
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    
                    {/* Program Info - Simplified */}
                    <div className="flex-1 min-w-0">
                      <Label 
                        htmlFor={`program-${program.id}`}
                        className="text-sm cursor-pointer font-medium leading-tight"
                      >
                        {program.program_name_local || program.program_name}
                      </Label>
                      
                      {/* Popularity Badge & Program Type */}
                      <div className="mt-1 flex items-center gap-2">
                        {program.popularity && (
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border",
                            getPopularityVariant(program.popularity)
                          )}>
                            {program.popularity}
                          </span>
                        )}
                        {program.program_type?.type_name_local && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs text-muted-foreground bg-muted border">
                            {program.program_type.type_name_local}
                          </span>
                        )}
                      </div>
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
                  
                  // Deduplicate available programs by ID first
                  const deduplicatedAvailablePrograms = allAvailablePrograms.filter((program, index, array) => 
                    array.findIndex(p => p.id === program.id) === index
                  );
                  
                  const selectedProgramsData = value.map(id => 
                    deduplicatedAvailablePrograms.find(p => p.id === id)
                  ).filter(Boolean);

                  return selectedProgramsData.map((program, index) => {
                    if (!program) return null;
                    const categoryInfo = categories.find(c => c.main_code === program.subcategory?.main_category?.main_code);
                    
                    return (
                      <div
                        key={`selected-${program.id}-${index}`}
                        className="flex items-center justify-between p-2 bg-background rounded border border-success/20 hover:border-success/40 transition-colors group"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <Icon icon="ph:check-circle-fill" className="h-3 w-3 text-success flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-success truncate">
                              {program.program_name_local || program.program_name}
                            </div>
                            <div className="mt-1 flex items-center gap-2">
                              {program.popularity && (
                                <span className={cn(
                                  "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border",
                                  getPopularityVariant(program.popularity)
                                )}>
                                  {program.popularity}
                                </span>
                              )}
                              {program.program_type?.type_name_local && (
                                <span className="inline-flex items-center px-1 py-0.5 rounded text-xs text-muted-foreground bg-muted border">
                                  {program.program_type.type_name_local}
                                </span>
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