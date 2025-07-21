'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { MapPin, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleAddressSearchProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  defaultAddress?: string;
  radius?: number;
  className?: string;
  disabled?: boolean;
  label?: string;
  icon?: string;
}

export function SimpleAddressSearch({ 
  onLocationSelect, 
  defaultAddress = '',
  radius = 10,
  className = '',
  disabled = false,
  label = 'Pencarian Alamat',
  icon = 'ph:magnifying-glass'
}: SimpleAddressSearchProps) {
  const [searchQuery, setSearchQuery] = useState(defaultAddress);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [error, setError] = useState('');

  // Simple geocoding using Google Geocoding REST API
  const searchAddress = async () => {
    if (!searchQuery.trim() || disabled) return;

    setIsSearching(true);
    setError('');

    try {
      const apiKey = 'AIzaSyCqaVv2nRLoGxqwQ_pwhu2JUJ-Sp5gBKAE';
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${apiKey}&region=id`
      );
      
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const result = data.results[0];
        const lat = result.geometry.location.lat;
        const lng = result.geometry.location.lng;
        const address = result.formatted_address;

        setSelectedLocation({ lat, lng, address });
        onLocationSelect(lat, lng, address);
        setError('');
      } else {
        setError(`Alamat tidak ditemukan: ${data.status}`);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat mencari alamat');
      console.error('Geocoding error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchAddress();
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-2">
          <Icon icon={icon} className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{label}</span>
        </div>

        {/* Search Input */}
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Contoh: Mall Senayan City Jakarta atau Jl. Sudirman Jakarta"
              disabled={disabled || isSearching}
              className={cn(
                "pr-4",
                error && "border-destructive",
                selectedLocation && "border-success"
              )}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
          <Button
            type="button"
            onClick={searchAddress}
            disabled={disabled || isSearching || !searchQuery.trim()}
            className="px-4"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="bg-success/10 border border-success/20 p-3 rounded-lg space-y-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Lokasi Ditemukan:</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              {selectedLocation.address}
            </p>
            <p className="text-xs text-muted-foreground pl-6">
              Koordinat: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </p>
            <p className="text-xs text-muted-foreground pl-6">
              Titik dispatch untuk mencari siswa dalam radius {radius} KM
            </p>
            
            {/* Check Maps Button */}
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const mapsUrl = `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`;
                  window.open(mapsUrl, '_blank');
                }}
                className="text-xs h-8 gap-1"
              >
                <MapPin className="h-3 w-3" />
                Cek akurasi titik di maps
              </Button>
            </div>
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

        {/* Instructions */}
        {!selectedLocation && !error && (
          <div className="bg-info/10 p-3 rounded-lg">
            <p className="text-xs text-info">
              💡 <strong>Petunjuk:</strong>
              <br />• Masukkan alamat tempat tinggal atau landmark terdekat
              <br />• Titik ini hanya <strong>acuan approximate</strong>, tidak harus tepat
              <br />• Anda boleh pilih landmark/area yang mudah dijangkau
              <br />• Tekan Enter atau klik tombol cari
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 