'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

interface SearchQuery {
  freeText?: string;
  subjects?: string[];
  location?: {
    address?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  };
  priceRange?: [number, number];
  availability?: string[];
  teachingStyle?: string[];
  experience?: string;
  rating?: number;
}

interface SmartSearchBarProps {
  query: SearchQuery;
  onSearch: (newQuery: Partial<SearchQuery>) => void;
  loading?: boolean;
}

interface Suggestion {
  type: 'subject' | 'location' | 'price' | 'complete';
  text: string;
  icon: string;
  action: () => void;
}

const SEARCH_EXAMPLES = [
  'guru matematika jakarta selatan 150k-200k',
  'tutor bahasa inggris online',
  'fisika SMA bekasi murah',
  'matematika universitas depok',
  'kimia SMP tangerang weekend'
];

export default function SmartSearchBar({ query, onSearch, loading }: SmartSearchBarProps) {
  const [searchValue, setSearchValue] = useState(query.freeText || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent-tutor-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Generate smart suggestions based on input
  const generateSuggestions = (value: string): Suggestion[] => {
    const suggestions: Suggestion[] = [];
    const lowerValue = value.toLowerCase();

    // Subject suggestions
    const subjectMappings = {
      'mat': 'matematika',
      'math': 'matematika', 
      'fis': 'fisika',
      'physics': 'fisika',
      'kim': 'kimia',
      'chemistry': 'kimia',
      'bio': 'biologi',
      'biology': 'biologi',
      'ing': 'bahasa inggris',
      'english': 'bahasa inggris',
      'indonesia': 'bahasa indonesia'
    };

    Object.entries(subjectMappings).forEach(([key, subject]) => {
      if (lowerValue.includes(key) && !lowerValue.includes(subject)) {
        suggestions.push({
          type: 'subject',
          text: `${value.replace(new RegExp(key, 'gi'), subject)}`,
          icon: 'heroicons:academic-cap',
          action: () => handleSuggestionClick(`${value.replace(new RegExp(key, 'gi'), subject)}`)
        });
      }
    });

    // Location suggestions
    const locations = ['jakarta', 'bekasi', 'tangerang', 'depok', 'bogor'];
    locations.forEach(location => {
      if (lowerValue.includes(location.substring(0, 3)) && !lowerValue.includes(location)) {
        suggestions.push({
          type: 'location',
          text: `${value} ${location}`,
          icon: 'heroicons:map-pin',
          action: () => handleSuggestionClick(`${value} ${location}`)
        });
      }
    });

    // Price suggestions
    if (lowerValue.includes('murah') || lowerValue.includes('budget')) {
      suggestions.push({
        type: 'price',
        text: `${value} 100k-150k`,
        icon: 'heroicons:currency-dollar',
        action: () => handleSuggestionClick(`${value} 100k-150k`)
      });
    }

    if (lowerValue.includes('mahal') || lowerValue.includes('premium')) {
      suggestions.push({
        type: 'price',
        text: `${value} 200k-300k`,
        icon: 'heroicons:currency-dollar',
        action: () => handleSuggestionClick(`${value} 200k-300k`)
      });
    }

    // Complete query suggestions based on patterns
    if (value.length > 3) {
      const matchingExamples = SEARCH_EXAMPLES.filter(example => 
        example.toLowerCase().includes(lowerValue) || 
        lowerValue.split(' ').some(word => example.toLowerCase().includes(word))
      );
      
      matchingExamples.slice(0, 2).forEach(example => {
        suggestions.push({
          type: 'complete',
          text: example,
          icon: 'heroicons:light-bulb',
          action: () => handleSuggestionClick(example)
        });
      });
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  // Handle input change with debounced suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue.length > 2) {
        const newSuggestions = generateSuggestions(searchValue);
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue]);

  // Handle suggestion click
  const handleSuggestionClick = (text: string) => {
    setSearchValue(text);
    setShowSuggestions(false);
    handleSearch(text);
  };

  // Handle search execution
  const handleSearch = (value?: string) => {
    const searchText = value || searchValue;
    if (searchText.trim()) {
      // Save to recent searches
      const newRecentSearches = [
        searchText,
        ...recentSearches.filter(s => s !== searchText)
      ].slice(0, 5);
      setRecentSearches(newRecentSearches);
      localStorage.setItem('recent-tutor-searches', JSON.stringify(newRecentSearches));

      // Trigger search
      onSearch({ freeText: searchText });
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Handle focus
  const handleFocus = () => {
    if (suggestions.length > 0 || recentSearches.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      {/* Main Search Input */}
      <div className="relative">
        <Input
          ref={inputRef}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyPress}
          onFocus={handleFocus}
          placeholder="Search: 'guru matematika jakarta selatan 150k-200k' or 'fisika SMA bekasi'"
          className={cn(
            "w-full h-14 text-lg pl-12 pr-20",
            showSuggestions && "rounded-b-none border-b-0"
          )}
          disabled={loading}
        />
        
        {/* Search Icon */}
        <Icon 
          icon="heroicons:magnifying-glass" 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" 
        />
        
        {/* Search Button */}
        <Button
          onClick={() => handleSearch()}
          disabled={loading || !searchValue.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Icon icon="heroicons:arrow-right" className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <Card 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 border-t-0 rounded-t-none max-h-80 overflow-y-auto"
        >
          <CardContent className="p-0">
            {/* Smart Suggestions */}
            {suggestions.length > 0 && (
              <div className="border-b">
                <div className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/50">
                  Smart Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={suggestion.action}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 text-left transition-colors"
                  >
                    <Icon icon={suggestion.icon} className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{suggestion.text}</span>
                    <Badge className="text-xs">
                      {suggestion.type}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/50">
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 text-left transition-colors"
                  >
                    <Icon icon="heroicons:clock" className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Search Examples (when no input) */}
            {!searchValue && suggestions.length === 0 && (
              <div>
                <div className="px-4 py-2 text-sm font-medium text-muted-foreground bg-muted/50">
                  Try searching for:
                </div>
                {SEARCH_EXAMPLES.slice(0, 3).map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(example)}
                    className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-muted/50 text-left transition-colors"
                  >
                    <Icon icon="heroicons:light-bulb" className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{example}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 