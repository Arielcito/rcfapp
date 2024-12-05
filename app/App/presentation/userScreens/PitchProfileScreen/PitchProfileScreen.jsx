import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';
import AppointmentFieldInfo from '../BookingScreen/AppointmentFieldInfo';
import { useRoute } from '@react-navigation/native';

const PitchProfileScreen = () => {
  const param = useRoute().params;
  const { place } = param;

  const canchaLocation = {
    latitude: place.latitude,  
    longitude: place.longitude, 
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
  
  return (
    <ScrollView style={styles.container}>
        <AppointmentFieldInfo place={param.place}  />
      <View style={styles.header}>
        <Text style={styles.title}>{place.name}</Text>
        <View style={styles.starsContainer}>
          {Array(5).fill().map((_, i) => (
            <Icon key={i} name="star" size={20} color="#FFD700" />
          ))}
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Icon name="location-outline" size={24} color="#4CAF50" />
          <Text style={styles.infoText}>{place.direccion}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="call-outline" size={24} color="#4CAF50" />
          <Text style={styles.infoText}>1139323477</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="time-outline" size={24} color="#4CAF50" />
          <Text style={styles.infoText}>Abre a las {place.horarioApertura}hs</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="time-outline" size={24} color="#4CAF50" />
          <Text style={styles.infoText}>Cierra {place.horarioCierre}hs</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="walk-outline" size={24} color="#4CAF50" />
          <Text style={styles.infoText}>1.5Km de ti</Text>
        </View>
      </View>

      <View style={styles.servicesContainer}>
        <Text style={styles.sectionTitle}>Servicios</Text>
        <View style={styles.activity}>
          <Icon name="football-outline" size={30} color="#4CAF50" />
          <Text style={styles.activityText}>Fútbol</Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <Text style={styles.mapTitle}>Ubicación de la Cancha</Text>
        <MapView
          style={styles.map}
          initialRegion={canchaLocation}
        >
          <Marker
            coordinate={canchaLocation}
            title={"Montegrande Futbol"}
            description={"Cancha de fútbol en Esteban Echeverría"}
          />
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
