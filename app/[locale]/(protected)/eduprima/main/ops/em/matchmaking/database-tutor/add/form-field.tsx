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
import { FormField as FormFieldConfig, TutorFormData, coreSubjectProfiles, aiRecommendationEngine, AIRecommendationTier } from './form-config';
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

      case 'ai-core-select':
        return (
          <AICoreSelectorField
            field={field}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            error={error}
          />
        );

      case 'ai-recommendations':
        return (
          <AIRecommendationsField
            field={field}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            error={error}
            coreExpertise={formData?.coreExpertise || []}
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

// AI Core Selector Component
interface AICoreSelectorFieldProps {
  field: FormFieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: string;
}

const AICoreSelectorField: React.FC<AICoreSelectorFieldProps> = ({
  field,
  value = [],
  onChange,
  disabled = false,
  error
}) => {
  const maxSelections = field.maxCoreSelections || 3;

  const handleSelectionToggle = (subjectValue: string) => {
    if (disabled) return;

    const newValue = [...value];
    const index = newValue.indexOf(subjectValue);

    if (index > -1) {
      // Remove if already selected
      newValue.splice(index, 1);
    } else if (newValue.length < maxSelections) {
      // Add if under limit
      newValue.push(subjectValue);
    }

    onChange(newValue);
  };

  // Group subjects by category for better organization
  const subjectsByCategory = coreSubjectProfiles.reduce((acc, subject) => {
    if (!acc[subject.category]) {
      acc[subject.category] = [];
    }
    acc[subject.category].push(subject);
    return acc;
  }, {} as Record<string, typeof coreSubjectProfiles>);

  return (
    <div className="space-y-4">
      {/* Selection Counter */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Dipilih: {value.length} / {maxSelections}
        </div>
        {value.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange([])}
            disabled={disabled}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Category-based Selection */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {Object.entries(subjectsByCategory).map(([category, subjects]) => (
          <Card key={category} className="overflow-hidden">
            <CardHeader className="bg-muted/20 py-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {category}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subjects.map((subject) => {
                  const isSelected = value.includes(subject.value);
                  const isDisabled = disabled || (!isSelected && value.length >= maxSelections);

                  return (
                    <div
                      key={subject.value}
                      className={cn(
                        "relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200",
                        "hover:shadow-md hover:border-primary/50",
                        {
                          "border-primary bg-primary/5 shadow-md": isSelected,
                          "border-border hover:border-muted-foreground": !isSelected && !isDisabled,
                          "opacity-50 cursor-not-allowed": isDisabled,
                          "border-destructive/50": error
                        }
                      )}
                      onClick={() => handleSelectionToggle(subject.value)}
                    >
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                          <Icon icon="ph:check" className="h-3 w-3 text-white" />
                        </div>
                      )}

                      {/* Subject Content */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-foreground">
                          {subject.label}
                        </div>
                        <Badge className="text-xs bg-secondary text-secondary-foreground">
                          {subject.level}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Subjects Display */}
      {value.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium">Keahlian Inti Terpilih:</div>
          <div className="flex flex-wrap gap-2">
            {value.map((selectedValue) => {
              const subject = coreSubjectProfiles.find(s => s.value === selectedValue);
              return (
                <Badge
                  key={selectedValue}
                  className="flex items-center gap-1 pr-1 bg-primary text-primary-foreground"
                >
                  {subject?.label}
                  <button
                    type="button"
                    onClick={() => handleSelectionToggle(selectedValue)}
                    disabled={disabled}
                    className="ml-1 hover:bg-black/10 rounded p-0.5"
                  >
                    <Icon icon="ph:x" className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// AI Recommendations Component
interface AIRecommendationsFieldProps {
  field: FormFieldConfig;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  error?: string;
  coreExpertise: string[];
}

const AIRecommendationsField: React.FC<AIRecommendationsFieldProps> = ({
  field,
  value = [],
  onChange,
  disabled = false,
  error,
  coreExpertise
}) => {
  const [recommendations, setRecommendations] = useState<AIRecommendationTier[]>([]);

  // Generate recommendations when core expertise changes
  useEffect(() => {
    if (coreExpertise && coreExpertise.length > 0) {
      const newRecommendations = aiRecommendationEngine.generateRecommendations(coreExpertise);
      setRecommendations(newRecommendations);
    } else {
      setRecommendations([]);
    }
  }, [coreExpertise]);

  const handleSubjectToggle = (subjectName: string) => {
    if (disabled) return;

    const newValue = [...value];
    const index = newValue.indexOf(subjectName);

    if (index > -1) {
      newValue.splice(index, 1);
    } else {
      newValue.push(subjectName);
    }

    onChange(newValue);
  };

  if (coreExpertise.length === 0) {
    return (
      <Alert>
        <Icon icon="ph:info" className="h-4 w-4" />
        <AlertDescription>
          Silakan pilih keahlian inti terlebih dahulu untuk mendapatkan rekomendasi AI.
        </AlertDescription>
      </Alert>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Alert>
        <Icon icon="ph:robot" className="h-4 w-4" />
        <AlertDescription>
          Sedang menganalisis keahlian inti Anda untuk menghasilkan rekomendasi...
        </AlertDescription>
      </Alert>
    );
  }

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'border-success bg-success/5 text-success';
      case 2: return 'border-warning bg-warning/5 text-warning';
      case 3: return 'border-info bg-info/5 text-info';
      default: return 'border-muted bg-muted/5 text-muted-foreground';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success/10 text-success border-success/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'hard': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted/10 text-muted-foreground border-muted/20';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'high': return 'bg-success text-white';
      case 'medium': return 'bg-warning text-white';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
        <div className="flex items-center space-x-2 mb-2">
          <Icon icon="ph:robot" className="h-5 w-5 text-primary" />
          <div className="font-medium text-primary">AI Analysis Complete</div>
        </div>
        <div className="text-sm text-muted-foreground">
          Berdasarkan keahlian inti: {coreExpertise.map(expertise => {
            const subject = coreSubjectProfiles.find(s => s.value === expertise);
            return subject?.label;
          }).join(', ')}
        </div>
        {value.length > 0 && (
          <div className="text-sm text-primary font-medium mt-2">
            ✓ {value.length} rekomendasi telah dipilih
          </div>
        )}
      </div>

      {/* Recommendations by Tier */}
      <div className="space-y-6">
        {recommendations.map((tier) => (
          <Card key={tier.tier} className={cn("overflow-hidden", getTierColor(tier.tier))}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon icon={tier.icon} className="h-5 w-5" />
                  <span className="text-lg">{tier.title}</span>
                </div>
                <Badge className="text-xs border border-border bg-background">
                  {tier.subjects.length} subjek
                </Badge>
              </CardTitle>
              <p className="text-sm opacity-80">{tier.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {tier.subjects.map((subject) => {
                const isSelected = value.includes(subject.subject);
                
                return (
                  <div
                    key={subject.subject}
                    className={cn(
                      "p-3 bg-white rounded-lg border cursor-pointer transition-all duration-200",
                      "hover:shadow-md hover:border-primary/30",
                      {
                        "ring-2 ring-primary border-primary bg-primary/5": isSelected,
                        "hover:border-muted-foreground": !isSelected
                      }
                    )}
                    onClick={() => handleSubjectToggle(subject.subject)}
                  >
                    <div className="flex items-start justify-between">
                      {/* Subject Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-foreground">
                            {subject.subject}
                          </div>
                          {isSelected && (
                            <Icon icon="ph:check-circle-fill" className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {subject.reason}
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Badge className={getDifficultyColor(subject.difficulty)}>
                            {subject.difficulty}
                          </Badge>
                          <Badge className={getDemandColor(subject.marketDemand || 'medium')}>
                            {subject.marketDemand} demand
                          </Badge>
                          <Badge className="bg-secondary text-secondary-foreground">
                            {subject.preparationTime}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Confidence Score */}
                      <div className="text-right">
                        <div className="text-xl font-bold text-primary">
                          {Math.round(subject.correlation * 100)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          confidence
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Selected Summary */}
      {value.length > 0 && (
        <Card className="bg-gradient-to-r from-success/5 to-success/10 border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon icon="ph:check-circle" className="h-5 w-5 text-success" />
                <span className="font-medium text-success">
                  {value.length} mata pelajaran dipilih dari rekomendasi AI
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onChange([])}
                disabled={disabled}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DynamicFormField; 