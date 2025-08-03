'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Icon } from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface ColumnFilterProps {
  column: string;
  columnLabel: string;
  uniqueValues: string[];
  selectedValues: string[];
  onFilterChange: (column: string, selectedValues: string[]) => void;
  isLoading?: boolean;
  totalCount?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  error?: string;
}

export default function ColumnFilter({
  column,
  columnLabel,
  uniqueValues,
  selectedValues,
  onFilterChange,
  isLoading = false,
  totalCount = 0,
  className,
  onClick,
  error
}: ColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>(selectedValues);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Filter unique values based on search
  const filteredValues = uniqueValues.filter(value => 
    value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle select all
  const handleSelectAll = () => {
    if (tempSelected.length === filteredValues.length) {
      setTempSelected([]);
    } else {
      setTempSelected(filteredValues);
    }
  };

  // Handle individual value toggle
  const handleValueToggle = (value: string) => {
    setTempSelected(prev => 
      prev.includes(value) 
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  // Apply filters
  const handleApply = () => {
    onFilterChange(column, tempSelected);
    setIsOpen(false);
  };

  // Clear filters
  const handleClear = () => {
    setTempSelected([]);
    onFilterChange(column, []);
    setIsOpen(false);
  };

  // Reset temp selection when opening
  const handleToggleOpen = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
    }
    if (!isOpen) {
      setTempSelected(selectedValues);
      setSearchTerm('');
    }
    setIsOpen(!isOpen);
  };

  const hasActiveFilter = selectedValues.length > 0 && selectedValues.length < uniqueValues.length;
  const isSelectAllChecked = tempSelected.length === filteredValues.length && filteredValues.length > 0;
  const isSelectAllIndeterminate = tempSelected.length > 0 && tempSelected.length < filteredValues.length;

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Filter Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggleOpen}
        className={cn(
          "h-6 w-6 p-0 hover:bg-muted",
          hasActiveFilter && "text-primary bg-primary/10",
          isLoading && "animate-pulse",
          error && "text-red-600"
        )}
        title={`Filter ${columnLabel}${error ? ` - Error: ${error}` : ''}`}
        disabled={isLoading}
      >
        <span 
          className={cn(
            "text-xs font-bold leading-none select-none",
            isLoading ? "text-blue-600" : error ? "text-red-600" : uniqueValues.length > 0 ? "text-green-600" : "text-black"
          )}
          style={{ fontFamily: 'monospace' }}
        >
          {isLoading ? "⏳" : error ? "⚠️" : uniqueValues.length > 0 ? "✅" : hasActiveFilter ? "🔽" : "▼"}
        </span>
      </Button>

      {/* Active Filter Indicator */}
      {hasActiveFilter && (
        <Badge 
          className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-secondary text-secondary-foreground"
        >
          {selectedValues.length}
        </Badge>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-8 left-0 z-50 w-72 bg-background border rounded-lg shadow-lg">
          <div className="p-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔍</span>
                <span className="font-medium text-sm">Filter {columnLabel}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <span className="text-sm font-bold text-black">✕</span>
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <span 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500"
              >
                🔍
              </span>
              <Input
                placeholder="Search values..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 h-8 text-sm"
              />
            </div>

            {/* Select All */}
            <div className="flex items-center space-x-2 mb-2">
              <Checkbox
                id={`select-all-${column}`}
                checked={isSelectAllChecked}
                // @ts-ignore - indeterminate is supported
                indeterminate={isSelectAllIndeterminate}
                onCheckedChange={handleSelectAll}
              />
              <label 
                htmlFor={`select-all-${column}`}
                className="text-sm font-medium cursor-pointer"
              >
                Select All ({filteredValues.length})
              </label>
            </div>

            <Separator className="my-2" />

            {/* Values List */}
            <div className="max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-muted-foreground">Loading values...</span>
                  </div>
                </div>
              ) : filteredValues.length === 0 ? (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  {searchTerm ? `No values match "${searchTerm}"` : 'No values available'}
                  {!searchTerm && uniqueValues.length === 0 && (
                    <div className="mt-2 text-xs text-red-500">
                      {error ? (
                        <div>
                          <div>Error: {error}</div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onClick) onClick(e);
                            }}
                            className="mt-1 text-blue-600 hover:text-blue-700 underline"
                          >
                            Retry loading values
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div>Try refreshing the page or check API connection</div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onClick) onClick(e);
                            }}
                            className="mt-1 text-blue-600 hover:text-blue-700 underline"
                          >
                            Retry loading values
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredValues.map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${column}-${value}`}
                        checked={tempSelected.includes(value)}
                        onCheckedChange={() => handleValueToggle(value)}
                      />
                      <label 
                        htmlFor={`${column}-${value}`}
                        className="text-sm cursor-pointer flex-1 truncate"
                        title={value}
                      >
                        {value || '(Empty)'}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Separator className="my-3" />

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {tempSelected.length} of {uniqueValues.length} selected
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  disabled={tempSelected.length === 0}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  className="bg-primary"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}