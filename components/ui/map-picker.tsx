/// <reference types="google.maps" />
'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Crosshair, AlertCircle } from 'lucide-react';

// Declare Google Maps types globally
declare global {
  interface Window {
    google: typeof google;
  }
}

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  defaultLat?: number;
  defaultLng?: number;
  radius?: number;
  className?: string;
  disabled?: boolean;
}

export function MapPicker({ 
  onLocationSelect, 
  defaultLat = -6.2088, // Jakarta default
  defaultLng = 106.8456, 
  radius = 10,
  className = '',
  disabled = false 
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [circle, setCircle] = useState<google.maps.Circle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [selectedCoords, setSelectedCoords] = useState<{lat: number, lng: number} | null>(
    defaultLat && defaultLng ? { lat: defaultLat, lng: defaultLng } : null
  );

  // Initialize Google Maps
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCqaVv2nRLoGxqwQ_pwhu2JUJ-Sp5gBKAE',
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: { lat: defaultLat, lng: defaultLng },
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'on' }]
            }
          ]
        });

        setMap(mapInstance);

        // Create initial marker if default coords exist
        if (defaultLat && defaultLng) {
          const initialMarker = new google.maps.Marker({
            position: { lat: defaultLat, lng: defaultLng },
            map: mapInstance,
            draggable: !disabled,
            title: 'Titik Lokasi Mengajar',
            icon: {
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 0C6.716 0 0 6.716 0 15C0 26.25 15 40 15 40S30 26.25 30 15C30 6.716 23.284 0 15 0ZM15 20.5C12.239 20.5 10 18.261 10 15.5C10 12.739 12.239 10.5 15 10.5C17.761 10.5 20 12.739 20 15.5C20 18.261 17.761 20.5 15 20.5Z" fill="#2563eb"/>
                  <circle cx="15" cy="15.5" r="3" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(30, 40),
              anchor: new google.maps.Point(15, 40)
            }
          });

          // Create radius circle
          const radiusCircle = new google.maps.Circle({
            strokeColor: '#2563eb',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#2563eb',
            fillOpacity: 0.15,
            map: mapInstance,
            center: { lat: defaultLat, lng: defaultLng },
            radius: radius * 1000 // Convert KM to meters
          });

          setMarker(initialMarker);
          setCircle(radiusCircle);

          // Get initial address
          reverseGeocode(defaultLat, defaultLng);
        }

        // Add click listener for map
        if (!disabled) {
          mapInstance.addListener('click', handleMapClick);
        }

        setIsLoading(false);
      } catch (err) {
        setError('Gagal memuat peta. Periksa koneksi internet Anda.');
        setIsLoading(false);
      }
    };

    initMap();
  }, [defaultLat, defaultLng, radius, disabled]);

  // Handle map click
  const handleMapClick = useCallback((event: google.maps.MapMouseEvent) => {
    if (disabled || !event.latLng) return;

    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    updateMarkerPosition(lat, lng);
  }, [disabled]);

  // Update marker position
  const updateMarkerPosition = (lat: number, lng: number) => {
    if (!map) return;

    // Remove existing marker and circle
    if (marker) {
      marker.setMap(null);
    }
    if (circle) {
      circle.setMap(null);
    }

    // Create new marker
    const newMarker = new google.maps.Marker({
      position: { lat, lng },
      map: map,
      draggable: !disabled,
      title: 'Titik Lokasi Mengajar',
      icon: {
        url: 'data:image/svg+xml;base64,' + btoa(`
          <svg width="30" height="40" viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 0C6.716 0 0 6.716 0 15C0 26.25 15 40 15 40S30 26.25 30 15C30 6.716 23.284 0 15 0ZM15 20.5C12.239 20.5 10 18.261 10 15.5C10 12.739 12.239 10.5 15 10.5C17.761 10.5 20 12.739 20 15.5C20 18.261 17.761 20.5 15 20.5Z" fill="#059669"/>
            <circle cx="15" cy="15.5" r="3" fill="white"/>
          </svg>
        `),
        scaledSize: new google.maps.Size(30, 40),
        anchor: new google.maps.Point(15, 40)
      }
    });

    // Create radius circle
    const newCircle = new google.maps.Circle({
      strokeColor: '#059669',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#059669',
      fillOpacity: 0.15,
      map: map,
      center: { lat, lng },
      radius: radius * 1000 // Convert KM to meters
    });

    // Add drag listener to marker
    if (!disabled) {
      newMarker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const newLat = event.latLng.lat();
          const newLng = event.latLng.lng();
          updateMarkerPosition(newLat, newLng);
        }
      });
    }

    setMarker(newMarker);
    setCircle(newCircle);
    setSelectedCoords({ lat, lng });

    // Get address for coordinates
    reverseGeocode(lat, lng);
  };

  // Reverse geocoding
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder();
      const response = await geocoder.geocode({
        location: { lat, lng }
      });

      if (response.results[0]) {
        const address = response.results[0].formatted_address;
        setSelectedAddress(address);
        onLocationSelect(lat, lng, address);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setSelectedAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
      onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (disabled) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (map) {
            map.setCenter({ lat, lng });
            map.setZoom(15);
          }
          
          updateMarkerPosition(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError('Tidak dapat mengakses lokasi. Pastikan GPS aktif dan izinkan akses lokasi.');
        }
      );
    } else {
      setError('Browser tidak mendukung geolokasi.');
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">Memuat peta...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 border-destructive/20 ${className}`}>
        <div className="flex items-center space-x-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">{error}</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Pilih Titik Lokasi Mengajar</span>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              className="flex items-center space-x-1"
            >
              <Crosshair className="h-4 w-4" />
              <span>Lokasi Saya</span>
            </Button>
          )}
        </div>

        {/* Map Container */}
        <div 
          ref={mapRef} 
          className="w-full h-64 rounded-lg border border-border"
          style={{ minHeight: '256px' }}
        />

        {/* Selected Location Info */}
        {selectedCoords && (
          <div className="bg-muted/50 p-3 rounded-lg space-y-1">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-success" />
              <span className="text-sm font-medium">Lokasi Terpilih:</span>
            </div>
            <p className="text-xs text-muted-foreground pl-6">
              {selectedAddress || `${selectedCoords.lat.toFixed(6)}, ${selectedCoords.lng.toFixed(6)}`}
            </p>
            <p className="text-xs text-muted-foreground pl-6">
              Radius: {radius} KM dari titik ini
            </p>
          </div>
        )}

        {/* Instructions */}
        {!disabled && !selectedCoords && (
          <div className="bg-info/10 p-3 rounded-lg">
            <p className="text-xs text-info">
              💡 <strong>Cara menggunakan:</strong>
              <br />• Klik di peta untuk menandai titik lokasi mengajar
              <br />• Atau klik &quot;Lokasi Saya&quot; untuk menggunakan posisi saat ini
              <br />• Marker bisa di-drag untuk penyesuaian posisi
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 