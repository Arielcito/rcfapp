import { View, Text, StyleSheet, TextInput, ImageBackground, Dimensions } from "react-native";
import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import Colors from "../../../infraestructure/utils/Colors";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useCurrentUser } from "../../../application/context/CurrentUserContext";

const { width, height } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

export default function OwnerLoginScreen() {
  const [values, setValues] = useState({
    email: "",
    pwd: "",
  });
  
  const navigation = useNavigation();
  const { login } = useCurrentUser();
  const image = require("../../assets/images/geometrias-circulares.png");

  function handleChange(text, eventName) {
    setValues((prev) => {
      return {
        ...prev,
        [eventName]: text,
      };
    });
  }

  async function handleLogin() {
    const { email, pwd } = values;
    
    try {
      const user = await login(email.toLowerCase(), pwd);
      
      // Verificar si el usuario es propietario
      if (user.role !== 'OWNER') {
        alert('No tienes permisos de propietario');
        return;
      }

      navigation.navigate("TabOwnerNavigation");
      
    } catch (error) {
      console.error('Error de login:', error);
      if (error.response?.status === 401) {
        alert('Credenciales incorrectas');
      } else if (error.response?.status === 403) {
        alert('No tienes permisos de propietario');
      } else {
        alert('Error al iniciar sesión');
      }
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <ImageBackground
        source={image}
        resizeMode="contain"
        style={styles.image}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.heading}>Gestiona tus{' '}
          <Text style={{color:Colors.PRIMARY}}>
            {' '}alquileres{' '}
          </Text>
          y crece tu negocio!</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={(text) => handleChange(text, "email")}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            onChangeText={(text) => handleChange(text, "pwd")}
            secureTextEntry={true}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleLogin()}
          >
            <Text style={styles.buttonText}>
              Entrar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => WebBrowser.openBrowserAsync('https://tudominio.com/contacto')}
          >
            <Text style={styles.ctaText}>
              ¿Quieres unirte? Contacta con soporte para crear una cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: width * 0.05,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 600,
    alignItems: "center",
    paddingVertical: height * 0.03,
  },
  image: {
    width: width * 0.3,
    height: width * 0.3,
    maxWidth: 300,
    maxHeight: 300,
    position: "absolute",
    top: 0,
    right: 0,
  },
  heading: {
    fontSize: width < 768 ? 25 : 35,
    fontFamily: "montserrat-bold",
    textAlign: "center",
    marginBottom: height * 0.03,
    maxWidth: 600,
  },
  input: {
    height: 60,
    width: '100%',
    maxWidth: 500,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: height * 0.02,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  button: {
    backgroundColor: "#003366",
    height: 60,
    width: '100%',
    maxWidth: 500,
    borderRadius: 10,
    justifyContent: "center",
    marginTop: height * 0.03,
  },
  buttonText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontFamily: "montserrat",
    fontSize: width < 768 ? 17 : 20,
  },
  ctaText: {
    marginTop: height * 0.02,
    color: Colors.PRIMARY,
    textAlign: "center",
    fontFamily: "montserrat",
    fontSize: width < 768 ? 14 : 16,
    textDecorationLine: 'underline',
    maxWidth: 400,
  },
  backButton: {
    position: 'absolute',
    top: height * 0.05,
    left: width * 0.05,
    zIndex: 1,
    padding: 10,
  },
});
