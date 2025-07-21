"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
    <div className={cn("space-y-3", className)}>
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
      <div className="relative">
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

export default DynamicFormField; 