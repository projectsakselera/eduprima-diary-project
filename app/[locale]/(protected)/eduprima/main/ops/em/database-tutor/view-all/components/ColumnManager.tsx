"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from '@iconify/react';
import { Column } from '../spreadsheet-columns';

interface ColumnManagerProps {
  columns: Column[];
  visibleColumns: Set<string>;
  onToggleColumn: (columnKey: string) => void;
  categories: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onInvertSelection: () => void;
  onShowAllInCategory: (category: string) => void;
  onHideAllInCategory: (category: string) => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({ 
  columns, 
  visibleColumns, 
  onToggleColumn, 
  categories,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  onShowAllInCategory,
  onHideAllInCategory
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
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

  // Filter columns based on search and category
  const filteredColumns = useMemo(() => {
    let filtered = columns;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(col => col.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(col => 
        col.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (col.key as string).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [columns, selectedCategory, searchTerm]);

  const toggleAllInCategory = (category: string) => {
    const categoryColumns = columns.filter(col => col.category === category);
    const allVisible = categoryColumns.every(col => visibleColumns.has(col.key));
    
    categoryColumns.forEach(col => {
      if (allVisible && visibleColumns.has(col.key)) {
        onToggleColumn(col.key);
      } else if (!allVisible && !visibleColumns.has(col.key)) {
        onToggleColumn(col.key);
      }
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Compact Gear Button - Icon Only */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 w-8 relative text-slate-700 dark:text-slate-300 hover:text-primary"
        title={`Manage columns (${visibleColumns.size}/${columns.length} visible)`}
      >
        <Icon icon="ph:gear" className="h-4 w-4" />
        {visibleColumns.size > 0 && (
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
            {visibleColumns.size}
          </div>
        )}
      </Button>

      {/* Dropdown Modal - Responsive */}
      {isOpen && (
        <div className="dark absolute top-10 right-0 z-[999] w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto isolate">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm text-white">Manage Columns</h3>
              <Button
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0"
              >
                <Icon icon="ph:x" className="h-4 w-4 text-slate-400" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-4">
              <Icon icon="ph:magnifying-glass" className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-8 bg-slate-800 border-slate-700 placeholder:text-slate-400 text-slate-50"
              />
            </div>

            {/* Bulk Selection Controls */}
            <div className="mb-4 space-y-2">
              <div className="text-xs font-medium text-slate-300 mb-2">⚡ Bulk Actions:</div>
              
              {/* Main bulk actions */}
              <div className="flex flex-wrap gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSelectAll}
                  className="h-7 text-xs px-2 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Icon icon="ph:checks" className="h-3 w-3 mr-1" />
                  Select All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onDeselectAll}
                  className="h-7 text-xs px-2 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Icon icon="ph:square" className="h-3 w-3 mr-1" />
                  Deselect All
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onInvertSelection}
                  className="h-7 text-xs px-2 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <Icon icon="ph:arrows-clockwise" className="h-3 w-3 mr-1" />
                  Invert
                </Button>
              </div>

              {/* Category-specific bulk actions */}
              {selectedCategory !== 'all' && (
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-700">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onShowAllInCategory(selectedCategory)}
                    className="h-7 text-xs px-2 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Icon icon="ph:eye" className="h-3 w-3 mr-1" />
                    Show All in {selectedCategory}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onHideAllInCategory(selectedCategory)}
                    className="h-7 text-xs px-2 bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    <Icon icon="ph:eye-slash" className="h-3 w-3 mr-1" />
                    Hide All in {selectedCategory}
                  </Button>
                </div>
              )}
            </div>

            {/* Category Filter - Cleaner */}
            <div className="mb-4">
              <div className="text-xs font-medium text-slate-300 mb-2">📁 Categories:</div>
              <div className="max-h-20 overflow-y-auto">
                <div className="flex flex-wrap gap-1">
                  <Button
                    variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs h-6 px-2"
                  >
                    All
                  </Button>
                  {categories.map(category => {
                    const categoryColumns = columns.filter(col => col.category === category);
                    const visibleCount = categoryColumns.filter(col => visibleColumns.has(col.key)).length;
                    return visibleCount > 0 ? (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="text-xs h-6 px-2"
                      >
                        {category}
                        <span className="ml-1 text-muted-foreground">({visibleCount})</span>
                      </Button>
                    ) : null;
                  })}
                </div>
              </div>
            </div>

            {/* Columns List */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 hover:scrollbar-thumb-slate-400">
              <div className="space-y-1">
                {filteredColumns.map(col => (
                  <div key={col.key} className="flex items-center space-x-2 p-1 hover:bg-slate-800/50 rounded">
                    <Checkbox
                      checked={visibleColumns.has(col.key)}
                      onCheckedChange={() => onToggleColumn(col.key)}
                      className="h-4 w-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate text-slate-100">{col.label}</div>
                      <div className="text-xs text-slate-400">
                        {col.category} • {col.type}
                        {col.required && <span className="text-red-500 ml-1">*</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredColumns.length === 0 && (
                <div className="text-center py-4 text-sm text-slate-400">
                  {searchTerm ? `No columns found for "${searchTerm}" ` : 'No columns in this category'}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{visibleColumns.size} of {columns.length} columns visible</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="text-xs h-6"
                >
                  Clear search
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};