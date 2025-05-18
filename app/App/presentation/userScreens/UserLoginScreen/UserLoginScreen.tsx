import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Animated,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Colors from "../../../infrastructure/utils/Colors";
import { useCurrentUser } from "../../../application/context/CurrentUserContext";
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

interface LoginValues {
  email: string;
  pwd: string;
}

interface ValidationErrors {
  email?: string;
  pwd?: string;
}

type RootStackParamList = {
  TabUserNavigation: undefined;
  'user-registration': undefined;
};

export default function UserLoginScreen() {
  const [values, setValues] = useState<LoginValues>({
    email: "",
    pwd: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
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
    const errors: ValidationErrors = {};
    let isValid = true;

    if (!values.email) {
      errors.email = "El email es requerido";
      isValid = false;
    } else if (!validateEmail(values.email)) {
      errors.email = "Email inválido";
      isValid = false;
    }

    if (!values.pwd) {
      errors.pwd = "La contraseña es requerida";
      isValid = false;
    } else if (values.pwd.length < 6) {
      errors.pwd = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }

    setValidationErrors(errors);
    return isValid;
  }

  function handleChange(text: string, eventName: keyof LoginValues) {
    setValues((prev) => ({
      ...prev,
      [eventName]: text,
    }));
    // Clear validation error when user types
    if (validationErrors[eventName]) {
      setValidationErrors(prev => ({
        ...prev,
        [eventName]: undefined,
      }));
    }
  }

  async function handleLogin() {
    Keyboard.dismiss();
    if (!validateForm()) return;

    setError("");
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
    

      if (user.role === 'USER') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'TabUserNavigation' }],
        });
      } else {
        const errorMsg = "Esta cuenta no tiene permisos de usuario. Por favor, use la opción de inicio de sesión correcta.";
        setError(errorMsg);
      }
    } catch (error) {
      console.log(error);
      const errorMsg = "Error de inicio de sesión. Por favor, verifique sus credenciales.";
      setError(errorMsg);

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
        style={[
          styles.contentContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.heading}>
          Reserva tu
          <Text style={styles.headingHighlight}> cancha </Text>
          de manera sencilla
        </Text>

        <View style={styles.inputContainer}>
          <View>
            <TextInput
              style={[
                styles.input,
                validationErrors.email && styles.inputError,
              ]}
              placeholder="Email"
              onChangeText={(text) => handleChange(text.toLowerCase(), "email")}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor={Colors.GRAY}
            />
            {validationErrors.email && (
              <Text style={styles.errorText}>{validationErrors.email}</Text>
            )}
          </View>

          <View>
            <TextInput
              style={[
                styles.input,
                validationErrors.pwd && styles.inputError,
              ]}
              placeholder="Contraseña"
              onChangeText={(text) => handleChange(text, "pwd")}
              secureTextEntry={true}
              placeholderTextColor={Colors.GRAY}
            />
            {validationErrors.pwd && (
              <Text style={styles.errorText}>{validationErrors.pwd}</Text>
            )}
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.loginButtonText}>Entrar</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('user-registration')}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </TouchableOpacity>

          {error ? (
            <Animated.Text 
              style={[styles.errorText, { opacity: fadeAnim }]}
            >
              {error}
            </Animated.Text>
          ) : null}
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    height: 150,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
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
  loginButton: {
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
  loginButtonText: {
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
  registerButton: {
    backgroundColor: Colors.WHITE,
    height: 56,
    width: '100%',
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    borderWidth: 2,
    borderColor: Colors.PRIMARY,
  },
  registerButtonText: {
    color: Colors.PRIMARY,
    fontFamily: "montserrat-bold",
    fontSize: 18,
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
}); 