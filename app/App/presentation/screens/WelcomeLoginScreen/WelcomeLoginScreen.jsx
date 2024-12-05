import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../../infraestructure/utils/Colors";

export default function WelcomeLoginScreen() {
  const navigation = useNavigation();
  const image = require("../../assets/images/geometrias-circulares.png");

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={image} style={styles.image} resizeMode="cover" />
      <View style={styles.container}>
        <Image
          style={styles.featureImage}
          source={require("../../assets/images/imagenLogin.png")}
        />
        <Text style={styles.welcomeText}>
          Organizar partidos de{" "}
          <Text style={styles.highlightedText}>Fútbol</Text> ya no es más un
          problema
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("login")}
        >
          <Text style={styles.buttonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
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
  image: {
    position: "absolute",
    top: 0,
    right: 0,
    width: width / 2,
    height: height / 4,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  featureImage: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 20,
    resizeMode: "contain",
  },
  welcomeText: {
    color: "#003366",
    textAlign: "center",
    fontFamily: "montserrat",
    fontSize: 24,
    lineHeight: 32,
    marginBottom: 30,
  },
  highlightedText: {
    color: Colors.PRIMARY,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#003366",
    height: 60,
    width: "80%",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  buttonText: {
    color: "white",
    fontFamily: "montserrat",
    fontSize: 20,
  },
});
