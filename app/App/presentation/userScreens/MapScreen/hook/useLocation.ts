import * as Location from 'expo-location';
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import { MapLocation } from '../../types/search';

const DEFAULT_LOCATION: MapLocation = {
  latitude: -34.5884,
  longitude: -58.4259,
  latitudeDelta: 0.02, // Zoom más cercano para ver mejor el barrio
  longitudeDelta: 0.02,
};

export const useLocation = () => {
  const [location, setLocation] = useState<MapLocation>(DEFAULT_LOCATION);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    const getLocationAsync = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('El permiso para acceder a la ubicación fue denegado');
          setIsLoading(false);
          Alert.alert(
            'Permiso de ubicación requerido',
            'Necesitamos acceder a tu ubicación para mostrarte los restaurantes cercanos. Por favor, habilita el permiso en la configuración de tu dispositivo.',
            [{ text: 'OK' }]
          );
          return;
        }

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        });

        // Subscribe to location updates
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 10000, // Update every 10 seconds
            distanceInterval: 100, // Update if moved by 100 meters
          },
          location => {
            setLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            });
          }
        );
      } catch (error) {
        setErrorMsg('Error al obtener la ubicación');
        console.error('Location error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getLocationAsync();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  return {
    location,
    errorMsg,
    isLoading,
  };
};
