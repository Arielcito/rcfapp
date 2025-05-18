import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Colors from "../../../infraestructure/utils/Colors";

type RootStackParamList = {
  login: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function WelcomeLoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const image = require("../../assets/images/geometrias-circulares.png");

  // Referencias de animación
  const backgroundOpacity = useRef(new Animated.Value(0)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const textSlideUp = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Secuencia de animaciones
    Animated.sequence([
      // Primero, fade in del fondo
      Animated.timing(backgroundOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
      // Luego, muestra la imagen con fade
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.ease,
      }),
    ]).start();

    // Anima el texto independientemente
    Animated.timing(textSlideUp, {
      toValue: 0,
      duration: 1000,
      delay: 400,
      useNativeDriver: true,
      easing: Easing.ease,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const handlePress = () => {
    navigation.navigate("login");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Animated.View
        style={[
          styles.backgroundContainer,
          {
            opacity: backgroundOpacity
          },
        ]}
      >
        <ImageBackground source={image} style={styles.image} resizeMode="cover" />
      </Animated.View>
      <View style={styles.container}>
        <Animated.View style={{ opacity: imageOpacity }}>
          <Image
            style={styles.featureImage}
            source={require("../../assets/images/imagenLogin.png")}
          />
        </Animated.View>
        <Animated.View
          style={{
            transform: [{ translateY: textSlideUp }],
            opacity: textSlideUp.interpolate({
              inputRange: [0, 50],
              outputRange: [1, 0],
            }),
          }}
        >
          <Text style={styles.welcomeText}>
            Organizar partidos de{" "}
            <Text style={styles.highlightedText}>Fútbol</Text> ya no es más un
            problema
          </Text>
        </Animated.View>
        <Animated.View
          style={{
            width: "100%",
            transform: [{ scale: buttonScale }],
          }}
        >
          <TouchableOpacity
            style={styles.button}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
          >
            <Text style={styles.buttonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </Animated.View>
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
  backgroundContainer: {
    position: "absolute",
    top: 0,
    right: 0,
    width: width / 2,
    height: height / 4,
  },
  image: {
    width: "100%",
    height: "100%",
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
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    fontFamily: "montserrat",
    fontSize: 20,
  },
});
