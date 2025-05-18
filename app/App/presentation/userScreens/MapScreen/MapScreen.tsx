import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Platform,
  StatusBar,
  PanResponder,
  Text,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import Colors from "../../../infraestructure/utils/Colors";
import { usePredios } from "../../../infraestructure/api/places.queries";
import { Place } from "../../../domain/entities/place.entity";
import { SearchBar } from "./components/SearchBar";
import { PlaceList } from "./components/PlaceList";
import { DrawerHandle } from "./components/DrawerHandle";
import { useLocation } from "./hook/useLocation";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Add navigation type
type RootStackParamList = {
  booking: { place: Place };
  // ... other screens
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface MapScreenProps {
  navigation: NavigationProp;
}

// Constantes
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;
const INITIAL_DRAWER_STATE = {
  height: 400,
  isExpanded: false,
  isDragging: false,
};

// Ubicación por defecto (Pilar, Buenos Aires)
const DEFAULT_LOCATION = {
  latitude: -30.4587822,
  longitude: -58.9147611,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

interface DrawerState {
  height: number;
  isExpanded: boolean;
  isDragging: boolean;
}

const DRAWER_MIN_HEIGHT = 200;
const DRAWER_MAX_HEIGHT = Dimensions.get('window').height * 0.8;

const MapScreen = ({ navigation }: MapScreenProps) => {
  // Estados
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerState, setDrawerState] = useState<DrawerState>(INITIAL_DRAWER_STATE);
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>([]);

  // Hooks
  const { location, errorMsg, isLoading: isLoadingLocation } = useLocation();
  const { data: places = [], isLoading: isLoadingPlaces, error: placesError } = usePredios();

  // PanResponder setup
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setDrawerState(prev => ({ ...prev, isDragging: true }));
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = INITIAL_DRAWER_STATE.height - gestureState.dy;
        if (newHeight >= DRAWER_MIN_HEIGHT && newHeight <= DRAWER_MAX_HEIGHT) {
          setDrawerState(prev => ({ 
            ...prev,
            height: newHeight,
            isExpanded: newHeight > INITIAL_DRAWER_STATE.height
          }));
        }
      },
      onPanResponderRelease: () => {
        setDrawerState(prev => ({ ...prev, isDragging: false }));
      },
    })
  ).current;

  // Search functionality
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredPlaces(places);
      return;
    }

    const searchTerms = text.toLowerCase().split(' ');
    const filtered = places.filter(place => {
      const searchString = `${place.nombre} ${place.direccion}`.toLowerCase();
      return searchTerms.every(term => searchString.includes(term));
    });
    setFilteredPlaces(filtered);
  };

  useEffect(() => {
    setFilteredPlaces(places);
  }, [places]);

  const handlePlacePress = (placeId: string) => {
    const place = places.find(p => p.id === placeId);
    if (place) {
      setSelectedPlace(placeId);
      setDrawerState({ ...drawerState, height: 300, isExpanded: false });
      navigation.navigate('booking', { place });
    }
  };

  if (isLoadingPlaces || isLoadingLocation) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={styles.loadingText}>Cargando predios...</Text>
      </View>
    );
  }

  if (placesError || errorMsg) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{placesError?.message || errorMsg}</Text>
        <Text style={styles.errorSubtext}>
          Por favor, verifica tu conexión e inténtalo nuevamente.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={location}
        region={location}
        showsUserLocation
        showsMyLocationButton
      >
        {filteredPlaces.map((place) => (
          <Marker
            key={place.id}
            coordinate={{
              latitude: Number(place.latitud),
              longitude: Number(place.longitud),
            }}
            title={place.nombre}
            description={place.direccion}
            onPress={() => handlePlacePress(place.id)}
            pinColor={selectedPlace === place.id ? Colors.PRIMARY : Colors.SECONDARY}
          />
        ))}
      </MapView>

      <View style={[styles.listContainer, { height: drawerState.height }]}>
        <DrawerHandle panHandlers={panResponder.panHandlers} />
        <SearchBar value={searchQuery} onChangeText={handleSearch} />
        <PlaceList
          places={filteredPlaces}
          selectedPlaceId={selectedPlace}
          onPlacePress={handlePlacePress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  map: {
    flex: 1,
  },
  listContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.WHITE,
    padding: 16,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginBottom: 8,
    fontSize: 16,
  },
  errorSubtext: {
    color: "#666",
    textAlign: "center",
    fontSize: 14,
  },
});

export default MapScreen; 