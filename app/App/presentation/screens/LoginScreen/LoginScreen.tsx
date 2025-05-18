import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState(null);

  const image = require("../../assets/images/geometrias-circulares.png");

  // Referencias de animación
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const headingOpacity = useRef(new Animated.Value(0)).current;
  const headingTranslateY = useRef(new Animated.Value(50)).current;
  const userButtonScale = useRef(new Animated.Value(0)).current;
  const ownerButtonScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Secuencia de animaciones
    Animated.sequence([
      // Fade in del fondo
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      // Animación del texto
      Animated.timing(headingOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
    ]).start();

    // Animación del texto hacia arriba
    Animated.timing(headingTranslateY, {
      toValue: 0,
      duration: 800,
      delay: 400,
      useNativeDriver: true,
      easing: Easing.out(Easing.back(1.7)),
    }).start();

    // Animación de los botones
    Animated.sequence([
      Animated.delay(600),
      Animated.stagger(200, [
        Animated.spring(userButtonScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(ownerButtonScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handlePressIn = (buttonScale: Animated.Value) => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (buttonScale: Animated.Value) => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  if (user) {
    return null; // No renderizamos nada porque ya estamos navegando en el useEffect
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View style={{ opacity: backgroundOpacity }}>
        <ImageBackground source={image} resizeMode="contain" style={styles.image} />
      </Animated.View>
      <View style={styles.container}>
        <Animated.View
          style={{
            opacity: headingOpacity,
            transform: [{ translateY: headingTranslateY }],
          }}
        >
          <Text style={styles.heading}>Inicia sesión como</Text>
        </Animated.View>
        <View style={styles.buttonContainer}>
          <Animated.View
            style={{
              transform: [{ scale: userButtonScale }],
              marginRight: 20,
            }}
          >
            <TouchableOpacity
              onPressIn={() => handlePressIn(userButtonScale)}
              onPressOut={() => handlePressOut(userButtonScale)}
              onPress={() => navigation.navigate("user-login")}
            >
              <Image
                source={require("../../assets/images/user-login.png")}
                style={styles.loginImage}
              />
              <Text style={styles.loginText}>Soy Usuario</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={{
              transform: [{ scale: ownerButtonScale }],
            }}
          >
            <TouchableOpacity
              onPressIn={() => handlePressIn(ownerButtonScale)}
              onPressOut={() => handlePressOut(ownerButtonScale)}
              onPress={() => navigation.navigate("owner-login")}
            >
              <Image
                source={require("../../assets/images/owner-login.png")}
                style={styles.loginImage}
              />
              <Text style={styles.loginText}>Soy Dueño</Text>
            </TouchableOpacity>
          </Animated.View>
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
