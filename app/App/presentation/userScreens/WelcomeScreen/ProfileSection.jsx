import { View, Text, StyleSheet } from "react-native";
import { Image } from 'expo-image';
import React from "react";

export default function ProfileSection({ user }) {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginTop: 20,
      }}
    >
      <Image
        source={require("./../../../assets/profile.jpeg")}
        style={styles.profileImage}
        contentFit="cover"
        transition={300}
      />

      <Text>Hola {user?.email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    margin: 10,
  },
});
