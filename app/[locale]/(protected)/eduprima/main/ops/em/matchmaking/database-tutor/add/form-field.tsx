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
import { FormField as FormFieldConfig } from './form-config';

interface DynamicFormFieldProps {
  field: FormFieldConfig;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const DynamicFormField: React.FC<DynamicFormFieldProps> = ({
  field,
  value,
  onChange,
  error,
  disabled = false,
  className
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
            value={value || ''}
            onChange={(e) => handleChange(field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
            disabled={disabled}
            size={field.size || 'default'}
            color={error ? 'destructive' : field.color || 'default'}
            min={field.min}
            max={field.max}
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
          <div className="space-y-4">
            <div className="relative">
              <Input
                id={field.name}
                name={field.name}
                type="file"
                accept={field.accept}
                onChange={handleFileChange}
                disabled={disabled}
                className={cn("file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90", {
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
    <div className={cn("space-y-2", className)}>
      {/* Field Label */}
      {field.type !== 'checkbox' && !(field.disabled && field.className === 'section-divider') && (
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
      {field.helperText && field.type !== 'checkbox' && !error && (
        <p className="text-xs text-muted-foreground leading-relaxed">
          {field.helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="outline" className="border-destructive/20 bg-destructive/5">
          <Icon icon="ph:warning-circle" className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive font-medium">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Field Status Indicator */}
      {!error && value && field.type !== 'checkbox' && (
        <div className="flex items-center space-x-1 text-xs text-success">
          <Icon icon="ph:check-circle" className="h-3 w-3" />
          <span>Valid</span>
        </div>
      )}
    </div>
  );
};

export default DynamicFormField; 