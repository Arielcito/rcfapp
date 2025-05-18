import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import Colors from '../../../../infraestructure/utils/Colors';
import { Place } from '../../../../domain/entities/place.entity';

interface PlaceCardProps {
  place: Place;
  isSelected: boolean;
  onPress: () => void;
}

export function PlaceCard({ place, isSelected, onPress }: PlaceCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.placeItem,
        isSelected && styles.selectedPlaceItem,
      ]}
      onPress={onPress}
    >
      <Image
        source={{ uri: place.imagenUrl }}
        style={styles.placeImage}
        contentFit="cover"
      />
      <View style={styles.placeDetails}>
        <Text style={styles.placeName}>{place.nombre}</Text>
        <Text style={styles.placeAddress}>{place.direccion}</Text>
        <View style={styles.placeExtraInfo}>
          <View style={styles.leftInfo}>
            <Text style={styles.placeHours}>
              {`${place.horarioApertura}:00 - ${place.horarioCierre}:00`}
            </Text>
            <Text style={styles.placePhone}>{place.telefono}</Text>
          </View>
          <Text style={styles.price}>$20.000/h</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  placeItem: {
    width: "100%",
    backgroundColor: Colors.WHITE,
    marginBottom: 15,
    borderRadius: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  selectedPlaceItem: {
    borderColor: Colors.PRIMARY,
    borderWidth: 2,
  },
  placeImage: {
    width: "100%",
    height: 120,
  },
  placeDetails: {
    padding: 15,
  },
  placeName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  placeAddress: {
    fontSize: 14,
    color: "#666",
    marginBottom: 10,
  },
  placeExtraInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftInfo: {
    flex: 1,
  },
  placeHours: {
    fontSize: 12,
    color: "#666",
  },
  placePhone: {
    fontSize: 12,
    color: Colors.PRIMARY,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.SECONDARY,
  },
}); 