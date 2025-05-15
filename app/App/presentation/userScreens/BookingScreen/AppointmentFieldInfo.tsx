import { View, Text } from "react-native";
import { Image } from 'expo-image';
import React from "react";

export default function ApointmentFieldInfo({ place }: { place: any }) {
  return (
    <View>
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Image
          source={{ uri: place.imagenUrl }}
          style={{ width: "100%", height: 200 }}
          contentFit="cover"
          transition={300}
        />
        <View>
          <Text
            style={{
              fontSize: 20,
              fontFamily: "montserrat-medium",
              marginBottom: 8,
            }}
          >
            {place.name}
          </Text>
        </View>
      </View>
    </View>
  );
}
