import React, { useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, ImageBackground, SafeAreaView, Dimensions, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../../infraestructure/config/FirebaseConfig"; // Asegúrate de que la ruta sea correcta

export default function LoginScreen() {
  const navigation = useNavigation();
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  const image = require("../../assets/images/geometrias-circulares.png");



  if (user) {
    return null; // No renderizamos nada porque ya estamos navegando en el useEffect
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={image} resizeMode="contain" style={styles.image}/>
      <View style={styles.container}>
        <Text style={styles.heading}>Inicia sesión como</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginImage} onPress={() => navigation.navigate("user-login")}>
            <Image
              source={require("../../assets/images/user-login.png")}
              style={styles.loginImage}
            />
            <Text style={styles.loginText}>Soy Usuario</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginImage} onPress={() => navigation.navigate("owner-login")}>
            <Image
              source={require("../../assets/images/owner-login.png")}
              style={styles.loginImage}
            />
            <Text style={styles.loginText}>Soy Dueño</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",

    paddingHorizontal: 16,
  },
  heading: {
    color: "#003366",
    textAlign: "center",
    fontFamily: "montserrat",
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 30,
  },
  loginImage: {
    height: 100,
    marginBottom: 20,
    marginRight: 20,
    aspectRatio: 1, // Ensure the image remains square
  },
  loginText: {
    color: "#003366",
    textAlign: "center",
    fontFamily: "montserrat",
    fontSize: 15,
  },
  image: {
    position: "absolute",
    top: 0,
    right: 0,
    width: width / 2,
    height: height / 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
});
