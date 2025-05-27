import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ImageBackground,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import Colors from "../../../infrastructure/utils/Colors";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { useCurrentUser } from "../../../application/context/CurrentUserContext";
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

WebBrowser.maybeCompleteAuthSession();

type RootStackParamList = {
  TabOwnerNavigation: undefined;
  OwnerRegistration: undefined;
};

interface LoginValues {
  email: string;
  pwd: string;
}

interface ValidationErrors {
  email?: string;
  pwd?: string;
}

export default function OwnerLoginScreen() {
  const [values, setValues] = useState<LoginValues>({
    email: "",
    pwd: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { login } = useCurrentUser();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(1)).current;

  const image = require("../../assets/images/geometrias-circulares.png");

  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(imageScale, {
        toValue: 1.1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateForm(): boolean {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (!values.email) {
      newErrors.email = "El email es requerido";
      isValid = false;
    } else if (!validateEmail(values.email)) {
      newErrors.email = "Email inválido";
      isValid = false;
    }

    if (!values.pwd) {
      newErrors.pwd = "La contraseña es requerida";
      isValid = false;
    } else if (values.pwd.length < 6) {
      newErrors.pwd = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }

  function handleChange(text: string, field: keyof LoginValues) {
    setValues((prev) => ({
      ...prev,
      [field]: text,
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  }

  async function handleLogin() {
    Keyboard.dismiss();
    if (!validateForm()) return;

    setLoading(true);
    // Button press animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
    
    try {
      const user = await login(values.email.toLowerCase(), values.pwd);
      
      // Verificar si el usuario es propietario
      if (user.role !== 'OWNER') {
        setErrors(prev => ({
          ...prev,
          email: 'No tienes permisos de propietario'
        }));
        return;
      }

      navigation.navigate("TabOwnerNavigation");
      
    } catch (error) {
      console.error('Error de login:', error);
      if ((error as any).response?.status === 401) {
        setErrors(prev => ({
          ...prev,
          pwd: 'Credenciales incorrectas'
        }));
      } else if ((error as any).response?.status === 403) {
        setErrors(prev => ({
          ...prev,
          email: 'No tienes permisos de propietario'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          email: 'Error al iniciar sesión'
        }));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.PRIMARY} />
      </TouchableOpacity>

      <Animated.View style={[styles.imageContainer, { transform: [{ scale: imageScale }] }]}>
        <ImageBackground
          source={image}
          resizeMode="contain"
          style={styles.image}
        />
      </Animated.View>

      <Animated.View 
        style={[styles.contentContainer, { opacity: fadeAnim }]}
      >
        <Text style={styles.heading}>
          Gestiona tus
          <Text style={styles.headingHighlight}> alquileres </Text>
          y crece tu negocio!
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="Email"
            onChangeText={(text) => handleChange(text.toLowerCase(), "email")}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholderTextColor={Colors.GRAY}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            style={[styles.input, errors.pwd && styles.inputError]}
            placeholder="Contraseña"
            onChangeText={(text) => handleChange(text, "pwd")}
            secureTextEntry={true}
            placeholderTextColor={Colors.GRAY}
          />
          {errors.pwd && <Text style={styles.errorText}>{errors.pwd}</Text>}

          <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
          
          <TouchableOpacity
            onPress={() => navigation.navigate('OwnerRegistration')}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>
              ¿Quieres unirte? Completa el formulario de registro
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: width * 0.3,
    height: width * 0.3,
    maxWidth: 300,
    maxHeight: 300,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
    marginTop: 20,
  },
  heading: {
    fontSize: 32,
    fontFamily: "montserrat-bold",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 40,
    maxWidth: 600,
  },
  headingHighlight: {
    color: Colors.PRIMARY,
  },
  input: {
    height: 60,
    width: '100%',
    borderColor: Colors.GRAY_LIGHT,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#fff",
    fontSize: 16,
    fontFamily: "montserrat",
    color: Colors.BLACK,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  inputError: {
    borderColor: Colors.ERROR,
    borderWidth: 1.5,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    height: 56,
    width: '100%',
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: Colors.WHITE,
    fontFamily: "montserrat-bold",
    fontSize: 18,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  errorText: {
    color: Colors.ERROR,
    fontSize: 14,
    fontFamily: "montserrat",
    marginTop: -12,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 1,
    padding: 8,
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  ctaButton: {
    marginTop: 20,
    padding: 12,
  },
  ctaText: {
    color: Colors.PRIMARY,
    textAlign: "center",
    fontFamily: "montserrat",
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
