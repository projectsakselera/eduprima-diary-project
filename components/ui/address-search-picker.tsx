/// <reference types="google.maps" />
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Crosshair, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddressSearchPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  defaultAddress?: string;
  defaultLat?: number;
  defaultLng?: number;
  radius?: number;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

interface PlacePrediction {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
}

export function AddressSearchPicker({ 
  onLocationSelect, 
  defaultAddress = '',
  defaultLat,
  defaultLng,
  radius = 10,
  className = '',
  disabled = false,
  placeholder = "Cari alamat lokasi mengajar..."
}: AddressSearchPickerProps) {
  const [searchQuery, setSearchQuery] = useState(defaultAddress);
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(
    defaultLat && defaultLng && defaultAddress 
      ? { lat: defaultLat, lng: defaultLng, address: defaultAddress }
      : null
  );
  const [error, setError] = useState('');
  const [isGeocodingReady, setIsGeocodingReady] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  // Initialize Google Services
  useEffect(() => {
    const initializeGoogleServices = async () => {
      try {
        console.log('🔍 Starting Google Services initialization...');
        
        // Load Google Maps if not already loaded
        if (typeof google === 'undefined') {
          console.log('📡 Google Maps not loaded, loading script...');
          
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCqaVv2nRLoGxqwQ_pwhu2JUJ-Sp5gBKAE';
          console.log('🔑 Using API Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT_FOUND');
          
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
          script.async = true;
          
          script.onload = () => {
            console.log('✅ Google Maps script loaded successfully');
            initServices();
          };
          
          script.onerror = (err) => {
            console.error('❌ Failed to load Google Maps script:', err);
            setError('Gagal memuat Google Maps API. Periksa koneksi internet dan API key.');
          };
          
          document.head.appendChild(script);
        } else {
          console.log('✅ Google Maps already loaded');
          initServices();
        }
      } catch (err) {
        console.error('❌ Error initializing Google Services:', err);
        setError('Gagal memuat layanan pencarian alamat');
      }
    };

    const initServices = () => {
      try {
        console.log('🔧 Initializing Google Services...');
        
        // Create a dummy div for PlacesService
        const dummyDiv = document.createElement('div');
        
        // Initialize services
        autocompleteService.current = new google.maps.places.AutocompleteService();
        placesService.current = new google.maps.places.PlacesService(dummyDiv);
        geocoder.current = new google.maps.Geocoder();
        
        console.log('✅ All Google Services initialized successfully');
        console.log('📍 AutocompleteService:', autocompleteService.current);
        console.log('🗺️ PlacesService:', placesService.current);
        console.log('📍 Geocoder:', geocoder.current);
        
        setIsGeocodingReady(true);
      } catch (err) {
        console.error('❌ Error creating Google Services:', err);
        setError('Gagal menginisialisasi layanan Google Maps');
      }
    };

    initializeGoogleServices();
  }, []);

  // Debounced search function
  useEffect(() => {
    console.log('🔤 Search query changed:', searchQuery);
    console.log('📏 Query length:', searchQuery.length);
    console.log('🤖 AutocompleteService ready:', !!autocompleteService.current);
    
    if (!searchQuery.trim() || searchQuery.length < 3) {
      console.log('⏭️ Query too short, skipping search');
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!autocompleteService.current) {
      console.log('⏭️ AutocompleteService not ready, skipping search');
      return;
    }

    console.log('⏰ Setting up debounced search (300ms)...');
    const timeoutId = setTimeout(() => {
      console.log('🚀 Executing debounced search for:', searchQuery);
      searchAddresses(searchQuery);
    }, 300);

    return () => {
      console.log('🧹 Clearing timeout for:', searchQuery);
      clearTimeout(timeoutId);
    };
  }, [searchQuery]);

  // Search addresses using Google Places Autocomplete
  const searchAddresses = async (query: string) => {
    console.log('🔎 Searching for:', query);
    
    if (!autocompleteService.current) {
      console.warn('❌ AutocompleteService not ready');
      return;
    }
    
    if (disabled) {
      console.log('⏸️ Search disabled');
      return;
    }

    setIsSearching(true);
    setError('');

    try {
      const request = {
        input: query,
        componentRestrictions: { country: 'id' }, // Indonesia only
        types: ['address'], // Focus on addresses
        language: 'id'
      };

      console.log('📡 Sending request to Google Places API:', request);

      autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
        console.log('📥 API Response - Status:', status);
        console.log('📥 API Response - Predictions:', predictions);
        
        setIsSearching(false);

        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          const formattedPredictions = predictions.map(prediction => ({
            place_id: prediction.place_id,
            description: prediction.description,
            main_text: prediction.structured_formatting.main_text,
            secondary_text: prediction.structured_formatting.secondary_text || ''
          }));

          console.log('✅ Formatted predictions:', formattedPredictions);
          setSuggestions(formattedPredictions);
          setShowSuggestions(true);
        } else {
          console.warn('❌ No predictions or error status:', status);
          if (status !== google.maps.places.PlacesServiceStatus.OK) {
            setError(`API Error: ${status}`);
          }
          setSuggestions([]);
          setShowSuggestions(false);
        }
      });
    } catch (err) {
      setIsSearching(false);
      setError('Terjadi kesalahan saat mencari alamat');
      console.error('❌ Address search error:', err);
    }
  };

  // Handle address selection
  const handleAddressSelect = async (prediction: PlacePrediction) => {
    if (!placesService.current || disabled) return;

    setSearchQuery(prediction.description);
    setShowSuggestions(false);
    setIsSearching(true);

    try {
      // Get place details to get coordinates
      const request = {
        placeId: prediction.place_id,
        fields: ['geometry', 'formatted_address', 'name']
      };

      placesService.current.getDetails(request, (place, status) => {
        setIsSearching(false);

        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || prediction.description;

          setSelectedLocation({ lat, lng, address });
          setSearchQuery(address);
          onLocationSelect(lat, lng, address);
          setError('');
        } else {
          setError('Gagal mendapatkan detail lokasi');
        }
      });
    } catch (err) {
      setIsSearching(false);
      setError('Terjadi kesalahan saat mendapatkan detail lokasi');
      console.error('Place details error:', err);
    }
  };

  // Get current location using GPS
  const getCurrentLocation = () => {
    if (disabled || !geocoder.current) return;

    if (navigator.geolocation) {
      setIsSearching(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Reverse geocode to get address
          try {
            geocoder.current!.geocode({
              location: { lat, lng }
            }, (results, status) => {
              setIsSearching(false);

              if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
                const address = results[0].formatted_address;
                setSelectedLocation({ lat, lng, address });
                setSearchQuery(address);
                onLocationSelect(lat, lng, address);
                setError('');
              } else {
                setError('Gagal mendapatkan alamat dari lokasi saat ini');
              }
            });
          } catch (err) {
            setIsSearching(false);
            setError('Terjadi kesalahan saat mendapatkan alamat');
          }
        },
        (error) => {
          setIsSearching(false);
          setError('Tidak dapat mengakses lokasi. Pastikan GPS aktif dan izinkan akses lokasi.');
          console.error('Geolocation error:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      setError('Browser tidak mendukung geolokasi.');
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isGeocodingReady) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">Memuat layanan pencarian...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Cari Lokasi Mengajar</span>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={isSearching}
              className="flex items-center space-x-1"
            >
              <Crosshair className="h-4 w-4" />
              <span>Lokasi Saya</span>
            </Button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder}
              disabled={disabled || isSearching}
              className={cn(
                "pl-10 pr-4",
                error && "border-destructive",
                selectedLocation && "border-success"
              )}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.map((prediction) => (
                <button
                  key={prediction.place_id}
                  type="button"
                  className="w-full text-left px-4 py-3 hover:bg-muted focus:bg-muted focus:outline-none border-b border-border last:border-b-0"
                  onClick={() => handleAddressSelect(prediction)}
                  disabled={isSearching}
                >
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-sm text-foreground truncate">
                        {prediction.main_text}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {prediction.secondary_text}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="bg-success/10 border border-success/20 p-3 rounded-lg space-y-1">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Lokasi Terpilih:</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              {selectedLocation.address}
            </p>
            <p className="text-xs text-muted-foreground pl-6">
              Koordinat: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </p>
            <p className="text-xs text-muted-foreground pl-6">
              Radius: {radius} KM dari titik ini
            </p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Instructions & Debug Info */}
        {!selectedLocation && !error && (
          <div className="bg-info/10 p-3 rounded-lg space-y-2">
            <p className="text-xs text-info">
              💡 <strong>Cara menggunakan:</strong>
              <br />• Ketik nama jalan, gedung, atau landmark terkenal
              <br />• Pilih dari suggestions yang muncul
              <br />• Atau klik &quot;Lokasi Saya&quot; untuk auto-detect
            </p>
            <div className="text-xs text-muted-foreground border-t pt-2">
              <strong>Debug Info:</strong>
              <br />• API Ready: {isGeocodingReady ? '✅' : '❌'}
              <br />• Services: {autocompleteService.current ? '✅' : '❌'}
              <br />• Environment: {process.env.NODE_ENV}
              <br />• API Key: {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Set ✅' : 'Missing ❌'}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
} 