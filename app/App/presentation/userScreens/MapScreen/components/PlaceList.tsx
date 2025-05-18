import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Place } from '../../../../domain/entities/place.entity';
import { PlaceCard } from './PlaceCard';
import Colors from '../../../../infraestructure/utils/Colors';

interface PlaceListProps {
  places: Place[];
  selectedPlaceId: string | null;
  onPlacePress: (placeId: string) => void;
}

export function PlaceList({ places, selectedPlaceId, onPlacePress }: PlaceListProps) {
  return (
    <View>
      <Text style={styles.listTitle}>
        {places.length === 0 
          ? "No se encontraron predios" 
          : "Predios cercanos"}
      </Text>
      <FlatList
        data={places}
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            isSelected={selectedPlaceId === item.id}
            onPress={() => onPlacePress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
  },
  listContent: {
    paddingBottom: 20,
  },
}); 