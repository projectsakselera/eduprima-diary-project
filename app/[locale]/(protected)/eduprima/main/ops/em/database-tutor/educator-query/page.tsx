'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createClient } from '@supabase/supabase-js';

// Import our custom search components
import SmartSearchBar from './components/SmartSearchBar';
import { useEducatorSearch } from './hooks/useEducatorSearch';
// import FilterPanel from './components/FilterPanel';
// import ResultsPanel from './components/ResultsPanel';
// import DetailsPanel from './components/DetailsPanel';

// Types and Interfaces
export interface SearchQuery {
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

export interface UserPreferences {
  weights: {
    distance: number;
    price: number;
    experience: number;
    availability: number;
    subjects: number;
    rating: number;
  };
  defaultRadius: number;
  maxPrice: number;
  preferredTeachingStyle: string[];
  viewMode: 'list' | 'cards' | 'map' | 'split';
}

export interface TutorResult {
  id: string;
  nama_lengkap: string;
  email: string;
  foto_profil?: string;
  subjects: string[];
  tariff_per_jam: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  experience: string;
  rating: number;
  availability: string[];
  teaching_style: string[];
  distance?: number;
  matchScore?: number;
  matchBreakdown?: {
    distance: number;
    price: number;
    experience: number;
    availability: number;
    subjects: number;
    rating: number;
  };
}

export default function EducatorQueryPage() {
  // State Management
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({});
  const [selectedTutor, setSelectedTutor] = useState<TutorResult | null>(null);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    weights: {
      distance: 60,
      price: 70,
      experience: 80,
      availability: 60,
      subjects: 90,
      rating: 75
    },
    defaultRadius: 10,
    maxPrice: 300000,
    preferredTeachingStyle: [],
    viewMode: 'split'
  });
  
  // Load user preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('educator-search-preferences');
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setUserPreferences(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences: Partial<UserPreferences>) => {
    const updated = { ...userPreferences, ...newPreferences };
    setUserPreferences(updated);
    localStorage.setItem('educator-search-preferences', JSON.stringify(updated));
  }, [userPreferences]);

  // Custom hook for search functionality
  const {
    results,
    loading,
    error,
    searchStats,
    executeSearch
  } = useEducatorSearch();

  // Handle search query changes
  const handleSearchChange = useCallback((newQuery: Partial<SearchQuery>) => {
    const updated = { ...searchQuery, ...newQuery };
    setSearchQuery(updated);
    executeSearch(updated, userPreferences);
  }, [searchQuery, userPreferences, executeSearch]);

  // Handle preference changes
  const handlePreferenceChange = useCallback((newPrefs: Partial<UserPreferences>) => {
    savePreferences(newPrefs);
    // Re-execute search with new preferences
    if (Object.keys(searchQuery).length > 0) {
      executeSearch(searchQuery, { ...userPreferences, ...newPrefs });
    }
  }, [searchQuery, userPreferences, savePreferences, executeSearch]);

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon icon="ph:brain" className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Smart Educator Query</h1>
              </div>
              <p className="text-muted-foreground max-w-2xl">
                Advanced search system with AI-powered matching, dynamic ranking, and intelligent filtering to find the perfect educators.
              </p>
            </div>
            
            {/* Search Stats */}
            {searchStats && (
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <Badge>
                  <Icon icon="heroicons:users" className="w-4 h-4 mr-1" />
                  {searchStats.totalResults} tutors
                </Badge>
                <Badge>
                  <Icon icon="heroicons:clock" className="w-4 h-4 mr-1" />
                  {searchStats.searchTime}ms
                </Badge>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smart Search Bar - Full Width */}
      <div className="container mx-auto px-4 py-4">
        <SmartSearchBar 
          query={searchQuery}
          onSearch={handleSearchChange}
          loading={loading}
        />
      </div>

      {/* Main 3-Panel Layout */}
      <div className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-300px)]">
          
          {/* Left Panel: Filters & Preferences (30%) */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Icon icon="heroicons:adjustments-horizontal" className="w-5 h-5" />
                  <span>Smart Filters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-full">
                  <div className="p-6 pt-0">
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Filter Panel (Coming Soon)</p>
                      <div className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">
                          <Icon icon="heroicons:map-pin" className="w-4 h-4 mr-2" />
                          Location
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Icon icon="heroicons:currency-dollar" className="w-4 h-4 mr-2" />
                          Price Range
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Icon icon="heroicons:academic-cap" className="w-4 h-4 mr-2" />
                          Subjects
                        </Button>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Center Panel: Results & Map (50%) */}
          <div className="col-span-12 lg:col-span-6">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon icon="heroicons:magnifying-glass" className="w-5 h-5" />
                    <span>Search Results</span>
                                         {results.length > 0 && (
                       <Badge>{results.length} found</Badge>
                     )}
                  </div>
                  
                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-1">
                    {(['list', 'cards', 'map', 'split'] as const).map((mode) => (
                      <Button
                        key={mode}
                        variant={userPreferences.viewMode === mode ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => handlePreferenceChange({ viewMode: mode })}
                      >
                        <Icon 
                          icon={
                            mode === 'list' ? 'heroicons:list-bullet' :
                            mode === 'cards' ? 'heroicons:squares-2x2' :
                            mode === 'map' ? 'heroicons:map' :
                            'heroicons:view-columns'
                          } 
                          className="w-4 h-4" 
                        />
                      </Button>
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-full">
                                     <div className="p-6">
                     {loading ? (
                       <div className="flex items-center justify-center h-64">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                         <span className="ml-2">Searching...</span>
                       </div>
                     ) : results.length > 0 ? (
                       <div className="space-y-4">
                         {results.map((tutor) => (
                           <Card key={tutor.id} className="cursor-pointer hover:shadow-md transition-shadow"
                                 onClick={() => setSelectedTutor(tutor)}>
                             <CardContent className="p-4">
                               <div className="flex items-center justify-between">
                                 <h3 className="font-semibold">{tutor.nama_lengkap}</h3>
                                 <Badge>Rp {tutor.tariff_per_jam.toLocaleString()}/jam</Badge>
                               </div>
                               <p className="text-sm text-muted-foreground mt-1">
                                 {tutor.subjects.join(', ')}
                               </p>
                             </CardContent>
                           </Card>
                         ))}
                       </div>
                     ) : (
                       <div className="flex items-center justify-center h-64 text-muted-foreground">
                         <Icon icon="heroicons:magnifying-glass" className="w-8 h-8 mr-2" />
                         <span>Start searching to find tutors</span>
                       </div>
                     )}
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Selected Tutor Details (20%) */}
          <div className="col-span-12 lg:col-span-3">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <Icon icon="heroicons:user-circle" className="w-5 h-5" />
                  <span>Tutor Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-full">
                  <div className="p-6 pt-0">
                    <div className="space-y-4">
                      {selectedTutor ? (
                        <div className="space-y-4">
                          <div className="text-center">
                            <h3 className="font-semibold text-lg">{selectedTutor.nama_lengkap}</h3>
                            <p className="text-muted-foreground">{selectedTutor.email}</p>
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Tarif per jam</span>
                              <Badge>Rp {selectedTutor.tariff_per_jam.toLocaleString()}</Badge>
                            </div>
                            
                            <div>
                              <span className="text-sm text-muted-foreground">Mata Pelajaran</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedTutor.subjects.map((subject, idx) => (
                                  <Badge key={idx}>{subject}</Badge>
                                ))}
                              </div>
                            </div>
                            
                            {selectedTutor.matchScore && (
                              <div>
                                <span className="text-sm text-muted-foreground">Match Score</span>
                                <div className="mt-1">
                                  <div className="w-full bg-muted rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full transition-all"
                                      style={{ width: `${selectedTutor.matchScore}%` }}
                                    ></div>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {selectedTutor.matchScore}% match
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <Separator />
                          
                          <div className="space-y-2">
                            <Button className="w-full">
                              <Icon icon="heroicons:chat-bubble-left" className="w-4 h-4 mr-2" />
                              Contact Tutor
                            </Button>
                            <Button variant="outline" className="w-full">
                              <Icon icon="heroicons:heart" className="w-4 h-4 mr-2" />
                              Save to Favorites
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Icon icon="heroicons:user-circle" className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            Select a tutor to see details
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="container mx-auto px-4 pb-4">
          <Alert>
            <Icon icon="heroicons:exclamation-triangle" className="h-4 w-4" />
            <AlertDescription>
              Search Error: {error}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
} 