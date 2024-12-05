'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from "@/components/ui/input"
import { useLoadScript } from "@react-google-maps/api";

const libraries: ["places"] = ["places"];

interface LocationSelectorProps {
  onLocationSelect: (location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  }) => void;
  defaultValue?: string;
  error?: string;
}

export function LocationSelector({ onLocationSelect, defaultValue = '', error }: LocationSelectorProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [input, setInput] = useState({
    address: defaultValue,
    coordinates: {
      lat: 0,
      lng: 0
    }
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!isLoaded || loadError || !inputRef.current) return;

    const options = {
      componentRestrictions: { country: "ar" },
      fields: ["address_components", "geometry", "formatted_address"],
    };

    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, options);
    
    const listener = autocompleteRef.current.addListener("place_changed", () => {
      if (autocompleteRef.current) {
        handlePlaceChanged(autocompleteRef.current);
      }
    });

    return () => {
      if (listener) {
        google.maps.event.removeListener(listener);
      }
      if (autocompleteRef.current) {
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded, loadError]);

  const handlePlaceChanged = (autocomplete: google.maps.places.Autocomplete) => {
    const place = autocomplete.getPlace();

    if (!place || !place.geometry) {
      setInput({
        address: '',
        coordinates: { lat: 0, lng: 0 }
      });
      return;
    }

    const newLocation = {
      address: place.formatted_address || '',
      coordinates: {
        lat: place.geometry.location?.lat() || 0,
        lng: place.geometry.location?.lng() || 0
      }
    };

    setInput(newLocation);
    onLocationSelect(newLocation);
  };

  if (!isLoaded) return <Input placeholder="Cargando..." disabled />;
  if (loadError) return <Input placeholder="Error al cargar el mapa" disabled />;

  return (
    <div className="flex flex-col gap-2">
      <Input
        ref={inputRef}
        value={input.address}
        onChange={(e) => setInput(prev => ({ ...prev, address: e.target.value }))}
        placeholder="Ingresa la dirección"
        className={`flex-1 ${error ? 'border-red-500' : ''}`}
      />
    </div>
  );
} 