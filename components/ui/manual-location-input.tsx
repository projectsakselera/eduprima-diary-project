'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, Search, CheckCircle, AlertCircle, MapIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManualLocationInputProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  defaultAddress?: string;
  defaultLat?: number;
  defaultLng?: number;
  radius?: number;
  className?: string;
  disabled?: boolean;
}

export function ManualLocationInput({ 
  onLocationSelect, 
  defaultAddress = '',
  defaultLat,
  defaultLng,
  radius = 10,
  className = '',
  disabled = false
}: ManualLocationInputProps) {
  const [searchQuery, setSearchQuery] = useState(defaultAddress);
  const [manualLat, setManualLat] = useState(defaultLat?.toString() || '');
  const [manualLng, setManualLng] = useState(defaultLng?.toString() || '');
  const [manualAddress, setManualAddress] = useState(defaultAddress);
  const [isSearching, setIsSearching] = useState(false);
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
  const [searchMethod, setSearchMethod] = useState<'search' | 'manual'>('search');

  // Free geocoding using OpenStreetMap Nominatim
  const searchWithNominatim = async () => {
    if (!searchQuery.trim() || disabled) return;

    setIsSearching(true);
    setError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' Indonesia')}&limit=1`
      );
      
      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        const address = result.display_name;

        setSelectedLocation({ lat, lng, address });
        onLocationSelect(lat, lng, address);
        setError('');
      } else {
        setError('Alamat tidak ditemukan. Coba gunakan input manual.');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Gunakan input manual atau coba lagi.');
      console.error('Nominatim error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Manual coordinate input
  const handleManualInput = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Koordinat tidak valid. Masukkan angka decimal.');
      return;
    }

    if (lat < -90 || lat > 90) {
      setError('Latitude harus antara -90 sampai 90');
      return;
    }

    if (lng < -180 || lng > 180) {
      setError('Longitude harus antara -180 sampai 180');
      return;
    }

    const address = manualAddress.trim() || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    
    setSelectedLocation({ lat, lng, address });
    onLocationSelect(lat, lng, address);
    setError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  // Preset locations for Indonesia
  const presetLocations = [
    { name: 'Jakarta Pusat', lat: -6.2088, lng: 106.8456, address: 'Jakarta Pusat, DKI Jakarta' },
    { name: 'Bandung', lat: -6.9175, lng: 107.6191, address: 'Bandung, Jawa Barat' },
    { name: 'Surabaya', lat: -7.2575, lng: 112.7521, address: 'Surabaya, Jawa Timur' },
    { name: 'Medan', lat: 3.5952, lng: 98.6722, address: 'Medan, Sumatera Utara' },
    { name: 'Yogyakarta', lat: -7.7956, lng: 110.3695, address: 'Yogyakarta, DIY' },
  ];

  const selectPreset = (preset: typeof presetLocations[0]) => {
    setSelectedLocation(preset);
    onLocationSelect(preset.lat, preset.lng, preset.address);
    setSearchQuery(preset.address);
    setManualLat(preset.lat.toString());
    setManualLng(preset.lng.toString());
    setManualAddress(preset.address);
    setError('');
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header with Method Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Lokasi Mengajar</span>
          </div>
          <div className="flex space-x-1">
            <Button
              type="button"
              variant={searchMethod === 'search' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchMethod('search')}
            >
              <Search className="h-3 w-3 mr-1" />
              Cari
            </Button>
            <Button
              type="button"
              variant={searchMethod === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchMethod('manual')}
            >
              <MapIcon className="h-3 w-3 mr-1" />
              Manual
            </Button>
          </div>
        </div>

        {/* Search Method */}
        {searchMethod === 'search' && (
          <div className="space-y-3">
            {/* Search Input */}
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, searchWithNominatim)}
                  placeholder="Masukkan alamat lengkap (contoh: Jl. Sudirman Jakarta)"
                  disabled={disabled || isSearching}
                  className="pr-4"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
              <Button
                type="button"
                onClick={searchWithNominatim}
                disabled={disabled || isSearching || !searchQuery.trim()}
                className="px-4"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Preset Locations */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Atau pilih kota:</Label>
              <div className="flex flex-wrap gap-2">
                {presetLocations.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => selectPreset(preset)}
                    disabled={disabled}
                    className="text-xs"
                  >
                    {preset.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Manual Method */}
        {searchMethod === 'manual' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="manual-lat" className="text-xs">Latitude</Label>
                <Input
                  id="manual-lat"
                  type="number"
                  step="any"
                  value={manualLat}
                  onChange={(e) => setManualLat(e.target.value)}
                  placeholder="-6.208831"
                  disabled={disabled}
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="manual-lng" className="text-xs">Longitude</Label>
                <Input
                  id="manual-lng"
                  type="number"
                  step="any"
                  value={manualLng}
                  onChange={(e) => setManualLng(e.target.value)}
                  placeholder="106.845599"
                  disabled={disabled}
                  className="text-sm"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="manual-address" className="text-xs">Nama Alamat</Label>
              <Input
                id="manual-address"
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, handleManualInput)}
                placeholder="Nama lokasi atau alamat"
                disabled={disabled}
                className="text-sm"
              />
            </div>

            <Button
              type="button"
              onClick={handleManualInput}
              disabled={disabled || !manualLat || !manualLng}
              className="w-full"
            >
              Tetapkan Lokasi
            </Button>
          </div>
        )}

        {/* Selected Location Display */}
        {selectedLocation && (
          <div className="bg-success/10 border border-success/20 p-3 rounded-lg space-y-1">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Lokasi Berhasil Ditetapkan:</span>
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

        {/* Instructions */}
        {!selectedLocation && !error && (
          <div className="bg-info/10 p-3 rounded-lg">
            <p className="text-xs text-info">
              💡 <strong>Pilihan Input:</strong>
              <br />• <strong>Cari:</strong> Ketik alamat atau pilih kota preset
              <br />• <strong>Manual:</strong> Input koordinat langsung
              <br />• Koordinat bisa didapat dari Google Maps atau GPS
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 