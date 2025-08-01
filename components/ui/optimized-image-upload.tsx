"use client";

import React, { useState, useCallback, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { Upload, Image as ImageIcon, X, Check, Loader2, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/icon';

interface OptimizedImageUploadProps {
  onImageSelect: (file: File | null) => void;
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  quality?: number;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  currentValue?: string; // For showing existing image
}

export const OptimizedImageUpload: React.FC<OptimizedImageUploadProps> = ({
  onImageSelect,
  maxSizeMB = 2,
  maxWidthOrHeight = 800,
  quality = 0.8,
  className,
  placeholder = "Upload foto profil",
  disabled = false,
  error,
  currentValue
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentValue || null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [optimizedSize, setOptimizedSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const optimizeImage = useCallback(async (file: File): Promise<File> => {
    setProcessingStatus('Optimizing image...');
    
    const options = {
      maxSizeMB,
      maxWidthOrHeight,
      useWebWorker: true,
      quality,
      initialQuality: quality,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      
      // Create optimized file with proper name
      const optimizedFile = new File(
        [compressedFile], 
        file.name.replace(/\.[^/.]+$/, '') + '_optimized.' + (file.type.includes('png') ? 'jpg' : file.name.split('.').pop()),
        { 
          type: file.type.includes('png') ? 'image/jpeg' : file.type,
          lastModified: Date.now()
        }
      );

      return optimizedFile;
    } catch (error) {
      console.error('Image optimization failed:', error);
      throw new Error('Failed to optimize image');
    }
  }, [maxSizeMB, maxWidthOrHeight, quality]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG)');
      return;
    }

    setIsProcessing(true);
    setOriginalSize(file.size);
    setProcessingStatus('Processing image...');

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Optimize image
      const optimizedFile = await optimizeImage(file);
      setOptimizedSize(optimizedFile.size);
      
      setProcessingStatus('Image optimized successfully!');
      
      // Call parent callback with optimized file
      onImageSelect(optimizedFile);
      
      // Clear status after 2 seconds
      setTimeout(() => {
        setProcessingStatus('');
      }, 2000);

    } catch (error) {
      console.error('Error processing image:', error);
      setProcessingStatus('Failed to process image');
      onImageSelect(null);
    } finally {
      setIsProcessing(false);
    }
  }, [optimizeImage, onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || isProcessing) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, isProcessing, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('📁 File input change triggered', e.target.files?.length);
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      console.log('📁 File selected:', files[0].name, files[0].size);
      handleFileSelect(files[0]);
    }
    // Reset input value to allow selecting same file again
    e.target.value = '';
  }, [handleFileSelect]);

  const clearImage = useCallback(() => {
    setPreview(null);
    setOriginalSize(0);
    setOptimizedSize(0);
    setProcessingStatus('');
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageSelect]);

  const triggerFileInput = useCallback(() => {
    console.log('🖱️ Trigger file input clicked', { disabled, isProcessing });
    if (!disabled && !isProcessing) {
      console.log('🖱️ Triggering file input click');
      fileInputRef.current?.click();
    } else {
      console.log('🖱️ File input blocked', { disabled, isProcessing });
    }
  }, [disabled, isProcessing]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={triggerFileInput}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200",
          {
            "border-primary bg-primary/5 hover:bg-primary/10": !error && !disabled,
            "border-destructive bg-destructive/5": error,
            "border-muted bg-muted/20 cursor-not-allowed": disabled,
            "border-success bg-success/5": preview && !error,
          }
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isProcessing}
        />

        {/* Preview Image */}
        {preview && !isProcessing && (
          <div className="space-y-4">
            <div className="relative inline-block group">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full max-h-48 rounded-xl shadow-lg border-2 border-success/20 transition-all duration-200 group-hover:shadow-xl"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="absolute -top-3 -right-3 h-8 w-8 rounded-full p-0 shadow-lg opacity-80 hover:opacity-100 transition-opacity bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Optimization Stats Card */}
            {originalSize > 0 && optimizedSize > 0 && (
              <div className="bg-gradient-to-r from-success/10 to-primary/10 border border-success/20 rounded-lg p-4">
                <div className="flex items-center justify-center space-x-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-muted-foreground rounded-full"></div>
                    <span className="text-muted-foreground">Original: {formatFileSize(originalSize)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-success rounded-full"></div>
                    <span className="text-success font-medium">Optimized: {formatFileSize(optimizedSize)}</span>
                  </div>
                </div>
                <div className="text-center mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                    💾 Saved {Math.round((1 - optimizedSize / originalSize) * 100)}% space
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Upload UI */}
        {!preview && (
          <div className="space-y-4">
            {isProcessing ? (
              <div className="space-y-3">
                <div className="relative">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-primary/20 rounded-full"></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-primary">{processingStatus}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Mengoptimalkan gambar untuk performa terbaik...
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Upload className="h-12 w-12 mx-auto text-primary/60" />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <ImageIcon className="h-3 w-3 text-primary" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{placeholder}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Drag & drop atau click untuk upload
                  </p>
                  <p className="text-xs text-primary/80 mt-1 font-medium">
                    ✨ Auto-optimized untuk performa terbaik
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Processing Status */}
        {processingStatus && !isProcessing && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center space-x-2 px-3 py-2 bg-success border border-success/20 rounded-full shadow-lg">
              <Check className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Optimized!</span>
            </div>
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="bg-muted/30 rounded-lg p-3 border border-muted/50">
        <div className="flex items-center justify-center space-x-6 text-xs">
          <div className="flex items-center space-x-1">
            <span>📁</span>
            <span className="text-muted-foreground">Max {maxSizeMB}MB</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>🖼️</span>
            <span className="text-muted-foreground">JPG, PNG only</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>📐</span>
            <span className="text-muted-foreground">Auto-resize to {maxWidthOrHeight}px</span>
          </div>
        </div>
        <div className="text-center mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            ✨ Images will be automatically optimized for best performance
          </span>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-start space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <Icon icon="ph:warning" className="h-4 w-4 text-destructive mt-0.5" />
          <div className="text-sm text-destructive">{error}</div>
        </div>
      )}
    </div>
  );
};