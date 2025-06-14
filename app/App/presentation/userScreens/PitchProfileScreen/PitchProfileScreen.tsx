import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';
import AppointmentFieldInfo from '../BookingScreen/AppointmentFieldInfo';
import { useRoute } from '@react-navigation/native';
import { usePredioConfig } from '../../../application/hooks/usePredioConfig';
import * as Location from 'expo-location';

const PitchProfileScreen = () => {
  const param = useRoute().params as { place: any };
  const { place } = param;
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<string>('Calculando...');
  
  // Usar el hook para obtener datos completos del predio
  const { data: predio, isLoading: loading, error } = usePredioConfig(place.id);

  const canchaLocation = {
    latitude: parseFloat(place.latitude || predio?.latitud || 0),  
    longitude: parseFloat(place.longitude || predio?.longitud || 0), 
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permiso de ubicación denegado');
          setDistance('No disponible');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        console.log('Ubicación del usuario obtenida:', location);
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude
        });

        // Calcular distancia
        if (canchaLocation.latitude && canchaLocation.longitude) {
          const distanceInMeters = await calculateDistance(
            location.coords.latitude,
            location.coords.longitude,
            canchaLocation.latitude,
            canchaLocation.longitude
          );
          const distanceInKm = (distanceInMeters / 1000).toFixed(1);
          setDistance(`${distanceInKm}km`);
        }
      } catch (err) {
        console.log('Error al obtener la ubicación:', err);
        setDistance('No disponible');
      }
    };

    getUserLocation();
  }, [canchaLocation.latitude, canchaLocation.longitude]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Radio de la tierra en metros
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distancia en metros
  };

  // Función para obtener el icono del servicio
  const getServiceIcon = (serviceName: string) => {
    const iconMap = {
      'Pickleball': 'tennisball-outline',
      'Fútbol': 'football-outline',
      'Vóley': 'basketball-outline',
      'Metegol': 'game-controller-outline',
      'Vestuarios': 'shirt-outline',
      'Estacionamiento': 'car-outline',
      'Bar': 'restaurant-outline',
      'Clases Particulares': 'school-outline',
    };
    return iconMap[serviceName as keyof typeof iconMap] || 'checkmark-circle-outline';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando información del predio...</Text>
      </View>
    );
  }

  if (error && 'message' in error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="alert-circle-outline" size={50} color="#FF5722" />
        <Text style={styles.errorText}>Error al cargar la información</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
        <AppointmentFieldInfo place={param?.place || {}}  />
      <View style={styles.header}>
        <Text style={styles.title}>{predio?.nombre || place.name}</Text>
        <View style={styles.starsContainer}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Icon key={i} name="star" size={20} color="#FFD700" />
          ))}
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Icon name="location-outline" size={24} color="#4CAF50" />
          <Text style={styles.infoText}>{predio?.direccion || place.direccion}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="call-outline" size={24} color="#4CAF50" />
          <Text style={styles.infoText}>{predio?.telefono || '1139323477'}</Text>
        </View>
      </View>

      {predio?.horarios && predio.horarios.length > 0 && (
        <View style={styles.horariosContainer}>
          <Text style={styles.sectionTitle}>Horarios de Atención</Text>
          {predio.horarios.map((horario) => (
            <View key={horario.id} style={styles.horarioRow}>
              <Icon name="time-outline" size={20} color="#4CAF50" />
              <Text style={styles.horarioText}>
                {horario.dia}: {horario.horaInicio} - {horario.horaFin}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Servicios del Predio */}
      {predio?.servicios && predio.servicios.length > 0 && (
        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Servicios Disponibles</Text>
          <View style={styles.servicesGrid}>
            {predio.servicios.map((servicio) => (
              <View key={servicio.id} style={styles.serviceItem}>
                <Icon 
                  name={getServiceIcon(servicio.nombre)} 
                  size={24} 
                  color="#4CAF50" 
                />
                <Text style={styles.serviceText}>{servicio.nombre}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>Ubicación de la Cancha</Text>
        <MapView
          style={styles.map}
          initialRegion={canchaLocation}
        >
          <Marker
            coordinate={canchaLocation}
            title={predio?.nombre || "Cancha"}
            description={predio?.direccion || ""}
          />
          {userLocation && (
            <Marker
              coordinate={userLocation}
              title="Tu ubicación"
              pinColor="blue"
            />
          )}
        </MapView>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  infoContainer: {
    marginHorizontal: 20,
    padding: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
  },
  servicesContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  activity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityText: {
    fontSize: 16,
    marginLeft: 10,
  },
  horariosContainer: {
    margin: 20,
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 10,
  },
  horarioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  horarioText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  serviceText: {
    fontSize: 14,
    marginLeft: 8,
    color: '#333',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5722',
    marginTop: 10,
    textAlign: 'center',
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  mapContainer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  map: {
    width: '90%',
    height: 300,
  },
});

export default PitchProfileScreen;
