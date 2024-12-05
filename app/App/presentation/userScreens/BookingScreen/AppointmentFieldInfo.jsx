import { View, Text, Image } from "react-native";
import React from "react";

export default function ApointmentFieldInfo({ place }) {
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
          source={{ uri: place.imageUrl }}
          style={{ width: "100%", height: 200 }}
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
