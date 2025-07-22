import { useState, useCallback } from 'react';

// Types (should match the main page types)
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

interface UserPreferences {
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

interface TutorResult {
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

interface SearchStats {
  totalResults: number;
  searchTime: number;
}

interface UseEducatorSearchReturn {
  results: TutorResult[];
  loading: boolean;
  error: string | null;
  searchStats: SearchStats | null;
  executeSearch: (query: SearchQuery, preferences: UserPreferences, userLocation?: {lat: number, lng: number}) => Promise<void>;
}

export function useEducatorSearch(): UseEducatorSearchReturn {
  const [results, setResults] = useState<TutorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null);

  const executeSearch = useCallback(async (
    query: SearchQuery, 
    preferences: UserPreferences,
    userLocation?: {lat: number, lng: number}
  ) => {
    // Don't search if no meaningful query
    if (!query.freeText && !query.subjects?.length && !query.priceRange) {
      setResults([]);
      setSearchStats(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tutor/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          preferences,
          userLocation
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setResults(data.data.results);
        setSearchStats(data.data.searchStats);
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setResults([]);
      setSearchStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    searchStats,
    executeSearch
  };
} 