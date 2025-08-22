/**
 * Format utility functions for tutor spreadsheet
 * Handles text formatting, truncation, and cell value formatting
 */

import { Column } from '../spreadsheet-columns';

/**
 * Utility function for truncating text to maximum number of words
 */
export const truncateToWords = (text: string | null | undefined, maxWords: number = 4): string => {
  if (!text || typeof text !== 'string') return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
};

/**
 * Format header labels with line breaks for better display
 */
export const formatHeaderLabel = (label: string) => {
  // Pattern 1: Break before parentheses (keep all characters including spaces)
  if (label.includes('(') && label.includes(')')) {
    return label.replace(/\s+(\([^)]+\))$/, '\n$1');
  }
  
  // Pattern 2: Break long text at word boundary (no character loss)
  if (label.length > 30) {
    const words = label.split(' ');
    let line1 = '';
    let line2 = '';
    
    for (const word of words) {
      if (line1.length + word.length + 1 <= 30) {
        line1 += (line1 ? ' ' : '') + word;
      } else {
        line2 += (line2 ? ' ' : '') + word;
      }
    }
    
    return line2 ? line1 + '\n' + line2 : label;
  }
  
  // Return exactly as-is for short text - NO CHANGES
  return label;
};

/**
 * Format cell value based on column type and configuration
 */
export const formatCellValue = (value: any, column: Column, programsLookup: Record<string, string> = {}): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (column.formatter) {
    return column.formatter(value);
  }

  switch (column.type) {
    case 'array':
      if (Array.isArray(value)) {
        // Special handling for selectedPrograms to show names instead of IDs
        if (column.key === 'selectedPrograms') {
          return value.map(id => programsLookup[id] || id).join(', ');
        }
        return value.join(', ');
      }
      return String(value);
    case 'boolean':
      return value ? '✓' : '✗';
    case 'date':
      return new Date(value).toLocaleDateString('id-ID');
    case 'number':
      if (column.key === 'hourly_rate') {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(value);
      }
      return String(value);
    case 'file':
      return value ? '📎 File' : '';
    default:
      return String(value);
  }
};

/**
 * Format cell value for display (with truncation)
 */
export const formatCellValueForDisplay = (value: any, column: Column, programsLookup: Record<string, string> = {}): string => {
  const fullValue = formatCellValue(value, column, programsLookup);
  return truncateToWords(fullValue, 4);
};