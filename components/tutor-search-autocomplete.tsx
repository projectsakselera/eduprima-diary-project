'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { Search, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from '@/components/navigation';

interface SearchResult {
  id: string;
  trn: string;
  namaLengkap: string;
  namaPanggilan: string;
  email: string;
  noHp1: string;
  fotoProfil: string | null;
  status_tutor: string;
  headline: string;
  statusAkademik: string;
  namaUniversitas: string;
  selectedPrograms: string[];
}

interface TutorSearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  compact?: boolean;
  variant?: 'default' | 'compact' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  maxResults?: number;
}

export default function TutorSearchAutocomplete({ 
  placeholder = "Search tutors by name, email, or TRN...",
  className,
  compact = false,
  variant = 'default',
  size = 'md',
  maxResults = 8
}: TutorSearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      
      try {
        const response = await fetch(
          `/api/tutors/search?q=${encodeURIComponent(searchQuery)}&limit=${maxResults}`,
          { 
            signal: abortControllerRef.current.signal,
            headers: {
              'Cache-Control': 'no-cache'
            }
          }
        );
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        setResults(data.results || []);
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Search error:', error);
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, debouncedSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectTutor(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle tutor selection
  const handleSelectTutor = (tutor: SearchResult) => {
    setQuery(tutor.namaLengkap);
    setIsOpen(false);
    setSelectedIndex(-1);
    router.push(`/eduprima/main/ops/em/database-tutor/view/${tutor.id}`);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'inactive':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  // Dynamic styling based on props
  const getInputSize = () => {
    switch (size) {
      case 'sm': return 'h-8 text-sm';
      case 'lg': return 'h-12 text-base';
      default: return 'h-10 text-sm';
    }
  };

  const getDropdownMaxHeight = () => {
    if (compact) return 'max-h-64';
    return variant === 'minimal' ? 'max-h-48' : 'max-h-96';
  };

  const getAvatarSize = () => {
    if (compact) return 'h-8 w-8';
    return size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  };

  const getResultPadding = () => {
    if (compact) return 'px-3 py-2';
    return 'px-4 py-3';
  };

  return (
    <div ref={searchRef} className={cn(
      "relative w-full", 
      !compact && "max-w-2xl",
      "will-change-contents", // Optimize for frequent updates
      className
    )}>
      <div className="relative">
        <Search className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none",
          compact ? "h-3 w-3" : "h-4 w-4"
        )} />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className={cn(
            "pl-10 pr-10",
            getInputSize()
          )}
        />
        {isLoading && (
          <Loader2 className={cn(
            "absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-muted-foreground",
            compact ? "h-3 w-3" : "h-4 w-4"
          )} />
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <Card className={cn(
          "absolute top-full left-0 right-0 mt-1 z-50 overflow-y-auto shadow-lg border",
          getDropdownMaxHeight(),
          variant === 'minimal' ? 'shadow-md' : 'shadow-lg backdrop-blur-sm'
        )}>
          <CardContent className="p-0">
            {results.length === 0 && query.length >= 2 && !isLoading ? (
              <div className={cn("text-center text-muted-foreground", compact ? "p-3" : "p-4")}>
                <User className={cn("mx-auto mb-2 opacity-50", compact ? "h-6 w-6" : "h-8 w-8")} />
                <p className={compact ? "text-xs" : "text-sm"}>No tutors found for "{query}"</p>
                {!compact && (
                  <p className="text-xs mt-1 opacity-75">Try searching by name, email, or TRN</p>
                )}
              </div>
            ) : isLoading && query.length >= 2 ? (
              <div className={cn("text-center text-muted-foreground", compact ? "p-3" : "p-4")}>
                <Loader2 className={cn("mx-auto mb-2 animate-spin", compact ? "h-4 w-4" : "h-6 w-6")} />
                <p className={compact ? "text-xs" : "text-sm"}>Searching...</p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((tutor, index) => (
                                      <div
                      key={tutor.id}
                      className={cn(
                        "flex items-center cursor-pointer transition-colors",
                        "hover:bg-muted/50 active:bg-muted/70",
                        "touch-manipulation", // Better touch performance
                        getResultPadding(),
                        compact ? "gap-2" : "gap-3",
                        selectedIndex === index && "bg-muted"
                      )}
                      onClick={() => handleSelectTutor(tutor)}
                    >
                    {/* Avatar */}
                    <Avatar className={cn(getAvatarSize(), "flex-shrink-0")}>
                      <AvatarImage src={tutor.fotoProfil || undefined} alt={tutor.namaLengkap} />
                      <AvatarFallback className={compact ? "text-xs" : "text-xs"}>
                        {tutor.namaLengkap?.split(' ').map(n => n[0]).join('').toUpperCase() || 'T'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className={cn("flex items-center gap-2", compact ? "mb-0" : "mb-1")}>
                        <h4 className={cn("font-medium truncate", compact ? "text-xs" : "text-sm")}>
                          {tutor.namaLengkap}
                        </h4>
                        {tutor.namaPanggilan && !compact && (
                          <span className="text-xs text-muted-foreground">
                            "{tutor.namaPanggilan}"
                          </span>
                        )}
                        <Badge className={cn(getStatusBadgeColor(tutor.status_tutor), compact ? "text-[10px] px-1" : "text-xs")}>
                          {tutor.status_tutor}
                        </Badge>
                      </div>
                      
                      {tutor.headline && !compact && (
                        <p className="text-xs text-muted-foreground truncate mb-1">
                          {tutor.headline}
                        </p>
                      )}
                      
                      <div className={cn("flex items-center gap-2 text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>
                        {tutor.trn && (
                          <span className={cn("font-mono bg-muted px-1 rounded", compact ? "text-[9px]" : "text-[10px]")}>TRN: {tutor.trn}</span>
                        )}
                        {tutor.statusAkademik && !compact && (
                          <>
                            <span>•</span>
                            <span>{tutor.statusAkademik}</span>
                          </>
                        )}
                        {tutor.selectedPrograms.length > 0 && (
                          <>
                            {!compact && <span>•</span>}
                            <span className="font-medium">{tutor.selectedPrograms.length} programs</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Contact info */}
                    {!compact && (
                      <div className="flex flex-col items-end text-xs text-muted-foreground flex-shrink-0">
                        {tutor.email && (
                          <span className="truncate max-w-[120px]">{tutor.email}</span>
                        )}
                        {tutor.noHp1 && (
                          <span className="font-mono">{tutor.noHp1}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}