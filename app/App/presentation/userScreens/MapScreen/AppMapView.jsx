import { View, StyleSheet } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import MapViewStyle from '../../../infraestructure/utils/MapViewStyle'
import Markers from './Markers'
import { UserLocationContext } from '../../../application/context/UserLocationContext'

export default function AppMapView({placeList}) {
  const {location} = useContext(UserLocationContext);
  const [mapReady, setMapReady] = useState(false);

  const initialRegion = {
    latitude: location?.latitude || 37.78825,
    longitude: location?.longitude || -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  };

  return (
    <View style={styles.container}>
      <MapView 
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={MapViewStyle}
        showsUserLocation={true}
        showsMyLocationButton={true}
        zoomEnabled={true}
        minZoomLevel={10}
        initialRegion={initialRegion}
        onMapReady={() => setMapReady(true)}
      >
        {mapReady && location && (
          <Marker
            coordinate={{
              latitude: location.latitude,
              longitude: location.longitude
            }}
            title="Mi ubicación"
          />
        )}

        {mapReady && placeList?.map((item) => (
          <Markers 
            key={item.id || `${item.latitude}-${item.longitude}`}
            place={item}
          />
        ))}
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});