import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
  Platform,
  Alert,
  ToastAndroid,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import Colors from '../../../infrastructure/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../infrastructure/api/api';
import { useCurrentUser } from "../../../application/context/CurrentUserContext";
import { StatusBar } from 'expo-status-bar';
import { AnalyticsService } from "../../../infrastructure/services/analytics.service";
import { AnalyticsMethods } from "../../../infrastructure/constants/analytics.constants";

type RootStackParamList = {
  TabUserNavigation: undefined;
  'user-login': undefined;
};

interface RegistrationValues {
  nombre: string;
  email: string;
  pwd: string;
  confirmPwd: string;
  telefono: string;
}

interface RegistrationErrors {
  nombre?: string;
  email?: string;
  pwd?: string;
  confirmPwd?: string;
  telefono?: string;
}

export default function UserRegistrationScreen() {
  const [values, setValues] = useState<RegistrationValues>({
    nombre: '',
    email: '',
    pwd: '',
    confirmPwd: '',
    telefono: '',
  });
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { login } = useCurrentUser();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(1)).current;

  const image = require('../../assets/images/geometrias-circulares.png');

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

    // Track screen view
    AnalyticsService.logScreen('UserRegistrationScreen');
  }, []);

  const validateForm = () => {
    const newErrors: RegistrationErrors = {};
    
    if (!values.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!values.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!values.pwd) {
      newErrors.pwd = 'La contraseña es requerida';
    } else if (values.pwd.length < 6) {
      newErrors.pwd = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!values.confirmPwd) {
      newErrors.confirmPwd = 'Confirma tu contraseña';
    } else if (values.pwd !== values.confirmPwd) {
      newErrors.confirmPwd = 'Las contraseñas no coinciden';
    }

    if (!values.telefono) {
      newErrors.telefono = 'El número de teléfono es requerido';
    } else if (!/^\+?[1-9]\d{1,14}$/.test(values.telefono)) {
      newErrors.telefono = 'Número de teléfono inválido (formato: +549XXXXXXXXXX)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (text: string, field: keyof RegistrationValues) => {
    setValues(prev => ({
      ...prev,
      [field]: text
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const showMessage = (message: string, title = 'Mensaje') => {
    if (Platform.OS === 'ios') {
      Alert.alert(title, message);
    } else {
      ToastAndroid.show(message, ToastAndroid.LONG);
    }
  };

  const handleSubmit = async () => {
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
      const response = await api.post('/users/register', {
        name: values.nombre,
        email: values.email.toLowerCase(),
        password: values.pwd,
        telefono: values.telefono,
        role: 'USER'
      });

      if (response.status === 201) {
        // Log successful registration
        await AnalyticsService.auth.logRegistration(
          AnalyticsMethods.EMAIL,
          true
        );

        try {
          const user = await login(values.email.toLowerCase(), values.pwd);
          
          // Log successful login after registration
          await AnalyticsService.auth.logLogin(
            AnalyticsMethods.EMAIL,
            true
          );

          if (user.role === 'USER') {
            navigation.reset({
              index: 0,
              routes: [{ name: 'TabUserNavigation' }],
            });
          } else {
            const errorMsg = "Esta cuenta no tiene permisos de usuario. Por favor, use la opción de inicio de sesión correcta.";
            showMessage(errorMsg);
            // Log failed login due to incorrect role
            await AnalyticsService.auth.logLogin(
              AnalyticsMethods.EMAIL,
              false,
              'incorrect_role'
            );
          }
        } catch (loginError) {
          console.error('Error en login automático:', loginError);
          showMessage('Registro exitoso. Por favor, inicie sesión.');
          // Log failed login after registration
          await AnalyticsService.auth.logLogin(
            AnalyticsMethods.EMAIL,
            false,
            'auto_login_failed'
          );
          navigation.navigate('user-login');
        }
      }
    } catch (error) {
      console.error('Error en registro:', error);
      const errorMsg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error en el registro';
      showMessage(errorMsg);
      // Log failed registration
      await AnalyticsService.auth.logRegistration(
        AnalyticsMethods.EMAIL,
        false,
        errorMsg
      );
    } finally {
      setLoading(false);
    }
  };

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

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
          <Text style={styles.heading}>
            Crea tu
            <Text style={styles.headingHighlight}> cuenta </Text>
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, errors.nombre && styles.inputError]}
              placeholder="Nombre"
              onChangeText={(text) => handleChange(text, 'nombre')}
              value={values.nombre}
              placeholderTextColor={Colors.GRAY}
            />
            {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
            
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Email"
              onChangeText={(text) => handleChange(text.toLowerCase(), 'email')}
              value={values.email}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.GRAY}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            
            <TextInput
              style={[styles.input, errors.pwd && styles.inputError]}
              placeholder="Contraseña"
              onChangeText={(text) => handleChange(text, 'pwd')}
              value={values.pwd}
              secureTextEntry={true}
              autoCapitalize="none"
              textContentType="none"
              autoCorrect={false}
              placeholderTextColor={Colors.GRAY}
            />
            {errors.pwd && <Text style={styles.errorText}>{errors.pwd}</Text>}

            <TextInput
              style={[styles.input, errors.confirmPwd && styles.inputError]}
              placeholder="Confirmar Contraseña"
              onChangeText={(text) => handleChange(text, 'confirmPwd')}
              value={values.confirmPwd}
              secureTextEntry={true}
              autoCapitalize="none"
              textContentType="none"
              autoCorrect={false}
              placeholderTextColor={Colors.GRAY}
            />
            {errors.confirmPwd && <Text style={styles.errorText}>{errors.confirmPwd}</Text>}

            <TextInput
              style={[styles.input, errors.telefono && styles.inputError]}
              placeholder="Teléfono (+549XXXXXXXXXX)"
              onChangeText={(text) => handleChange(text, 'telefono')}
              value={values.telefono}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.GRAY}
            />
            {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}

            <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Registrarse</Text>
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 100,
  },
  imageContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 150,
    height: 150,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 350,
    alignSelf: 'center',
    marginTop: 20,
  },
  heading: {
    fontSize: 32,
    fontFamily: 'montserrat-bold',
    textAlign: 'center',
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
  button: {
    backgroundColor: Colors.PRIMARY,
    height: 56,
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: Colors.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: Colors.WHITE,
    fontFamily: 'montserrat-bold',
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
});