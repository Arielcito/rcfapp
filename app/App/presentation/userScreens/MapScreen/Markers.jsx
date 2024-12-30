import { Image } from 'react-native'
import React, { useContext } from 'react'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { SelectMarkerContext } from "../../../application/context/SelectMarkerContext";

export default function Markers({index, place }) {
  const {selectedMarker, setSelectedMarker} = useContext(SelectMarkerContext);
  
  if (!place) return null;

  return (
    <Marker
      provider={PROVIDER_GOOGLE}
      coordinate={{
        latitude: place.latitude,
        longitude: place.longitude
      }}
      onPress={() => setSelectedMarker(index)}
    >
      {selectedMarker === index ? (
        <Image 
          source={require('./../../assets/images/marker-selected.png')}
          style={{ width: 60, height: 60 }}
        />
      ) : (
        <Image 
          source={require('./../../assets/images/marker.png')}
          style={{ width: 60, height: 60 }}
        />
      )}
    </Marker>
  )
}