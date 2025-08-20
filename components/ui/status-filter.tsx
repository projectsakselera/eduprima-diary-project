'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Icon } from '@/components/ui/icon';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface StatusOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  original?: any;
}

interface StatusFilterProps {
  selectedStatuses: string[];
  onStatusChange: (selectedStatuses: string[]) => void;
  className?: string;
}

export default function StatusFilter({ selectedStatuses, onStatusChange, className }: StatusFilterProps) {
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  // Fetch status types from API
  useEffect(() => {
    fetchStatusTypes();
  }, []);

  const fetchStatusTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Fetching tutor status types for filter...');
      const response = await fetch('/api/tutor-status-types', {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('📊 Status types API response:', result);
      
      if (result.success && result.data) {
        setStatusOptions(result.data);
        setDataSource(result.source || 'database');
        console.log(`✅ Loaded ${result.data.length} status options from ${result.source || 'database'}`);
      } else {
        throw new Error(result.error || 'Failed to fetch status types');
      }
      
    } catch (err) {
      console.error('❌ Error fetching status types:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      
      // Use minimal fallback on error
      const minimalFallback: StatusOption[] = [
        { value: 'active', label: '✅ ACTIVE', description: 'Aktif - Mengajar' },
        { value: 'inactive', label: '⏸️ INACTIVE', description: 'Tidak Aktif' },
        { value: 'pending', label: '⏳ PENDING', description: 'Menunggu Approval' }
      ];
      setStatusOptions(minimalFallback);
      setDataSource('minimal_fallback');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusToggle = (statusValue: string, checked: boolean) => {
    let newSelectedStatuses: string[];
    
    if (checked) {
      // Add status if not already selected
      newSelectedStatuses = [...selectedStatuses, statusValue];
    } else {
      // Remove status
      newSelectedStatuses = selectedStatuses.filter(s => s !== statusValue);
    }
    
    onStatusChange(newSelectedStatuses);
  };

  const handleSelectAll = () => {
    const allActiveStatuses = statusOptions.filter(option => !option.disabled).map(option => option.value);
    onStatusChange(allActiveStatuses);
  };

  const handleClearAll = () => {
    onStatusChange([]);
  };

  const getSelectedCount = () => selectedStatuses.length;
  const getTotalCount = () => statusOptions.filter(option => !option.disabled).length;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon icon="ph:funnel" className="h-4 w-4" />
            Filter Status Tutor
            {getSelectedCount() > 0 && (
              <Badge color="secondary" className="text-xs">
                {getSelectedCount()} selected
              </Badge>
            )}
          </div>
          
          {/* Data source indicator */}
          <div className="flex items-center gap-1">
            {dataSource === 'database' && (
              <Badge color="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                <Icon icon="ph:database" className="h-3 w-3 mr-1" />
                Database
              </Badge>
            )}
            {dataSource === 'fallback' && (
              <Badge color="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                <Icon icon="ph:warning" className="h-3 w-3 mr-1" />
                Fallback
              </Badge>
            )}
            {dataSource === 'error_fallback' && (
              <Badge color="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                <Icon icon="ph:x-circle" className="h-3 w-3 mr-1" />
                Error
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Error Alert */}
        {error && (
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <Icon icon="ph:warning" className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-700 text-sm">
              {error}. Using fallback options.
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Select All ({getTotalCount()})
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={isLoading || getSelectedCount() === getTotalCount()}
              className="text-xs"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              disabled={isLoading || getSelectedCount() === 0}
              className="text-xs"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* Status Options */}
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon icon="ph:spinner" className="h-4 w-4 animate-spin" />
              Loading status options...
            </div>
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {statusOptions.map((option) => (
              <div key={option.value} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <Checkbox
                  id={`status-${option.value}`}
                  checked={selectedStatuses.includes(option.value)}
                  onCheckedChange={(checked) => handleStatusToggle(option.value, checked as boolean)}
                  disabled={option.disabled}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={`status-${option.value}`}
                    className={`text-sm font-medium cursor-pointer block ${
                      option.disabled ? 'text-muted-foreground line-through' : ''
                    }`}
                  >
                    {option.label}
                  </label>
                  {option.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {option.description}
                    </p>
                  )}
                </div>
                {option.disabled && (
                  <Badge color="secondary" className="text-xs">
                    Disabled
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Status Count */}
        {!isLoading && statusOptions.length > 0 && (
          <div className="mt-4 pt-3 border-t text-center">
            <p className="text-xs text-muted-foreground">
              {getSelectedCount()} of {getTotalCount()} status types selected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}