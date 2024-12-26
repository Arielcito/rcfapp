import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../infraestructure/config/FirebaseConfig';
import { PhoneAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Colors from '../../../infraestructure/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../infraestructure/api/api';

export default function UserRegistrationScreen() {
  const [values, setValues] = useState({
    email: '',
    pwd: '',
    confirmPwd: '',
    name: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const image = require('../../assets/images/geometrias-circulares.png');

  // Agregar la referencia para el captcha
  const recaptchaVerifier = useRef(null);

  function handleChange(text, eventName) {
    setValues(prev => ({
      ...prev,
      [eventName]: text,
    }));
    setErrors(prev => ({
      ...prev,
      [eventName]: '',
    }));
  }

  function validateInputs() {
    const newErrors = {};
    let isValid = true;

    if (values.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      newErrors.email = 'Por favor, introduce un email válido';
      isValid = false;
    }

    if (values.pwd.length < 8) {
      newErrors.pwd = 'La contraseña debe tener al menos 8 caracteres';
      isValid = false;
    }

    if (values.pwd !== values.confirmPwd) {
      newErrors.confirmPwd = 'Las contraseñas no coinciden';
      isValid = false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(values.phone)) {
      newErrors.phone = 'Por favor, introduce un número de teléfono válido (10 dígitos)';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }

  async function handleRegistration() {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const phoneNumberWithCode = `+54${values.phone}`;
      
      await api.post('/users/check-email', {
        email: values.email
      });

      const verificationId = await new PhoneAuthProvider(FIREBASE_AUTH)
        .verifyPhoneNumber(
          phoneNumberWithCode,
          recaptchaVerifier.current
        );

      navigation.navigate('PhoneVerification', {
        verificationId,
        userData: values
      });

    } catch (err) {
      console.error("Error:", err);
      setErrors(prev => ({
        ...prev,
        email: err?.response?.data?.message || 'Error al verificar el email',
        general: 'Error al procesar la solicitud. Por favor, intente nuevamente.'
      }));
    } finally {
      setLoading(false);
    }
  }

  async function saveUserData(user) {
    await setDoc(doc(FIREBASE_DB, 'users', user.uid), {
      email: values.email.toLowerCase(),
      name: values.name,
      phone: values.phone,
      userType: 'user',
    });
  }

  return (
    <View style={styles.container}>
      {/* Botón de retroceso */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.PRIMARY} />
      </TouchableOpacity>

      {/* Agregar el componente de Recaptcha */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={FIREBASE_AUTH.app.options}
        // Puedes personalizar el título si lo deseas
        title='Verificación de número telefónico'
        cancelLabel='Cancelar'
      />

      <ImageBackground source={image} resizeMode="contain" style={styles.image} />
      <Text style={styles.heading}>Registro de Usuario</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          onChangeText={(text) => handleChange(text, 'name')}
          value={values.name}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={(text) => handleChange(text, 'email')}
          value={values.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          onChangeText={(text) => handleChange(text, 'pwd')}
          value={values.pwd}
          secureTextEntry={true}
          autoCapitalize="none"
        />
        {errors.pwd && <Text style={styles.errorText}>{errors.pwd}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Confirmar Contraseña"
          onChangeText={(text) => handleChange(text, 'confirmPwd')}
          value={values.confirmPwd}
          secureTextEntry={true}
          autoCapitalize="none"
        />
        {errors.confirmPwd && <Text style={styles.errorText}>{errors.confirmPwd}</Text>}
        
        <View style={styles.phoneInputContainer}>
          <View style={styles.prefixContainer}>
            <Text style={styles.prefixText}>+54</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="Teléfono"
            onChangeText={(text) => handleChange(text, 'phone')}
            value={values.phone}
            keyboardType="phone-pad"
          />
        </View>
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleRegistration}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>Verificar Teléfono</Text>
          )}
        </TouchableOpacity>
        {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inputContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 30,
    fontFamily: 'montserrat-bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  input: {
    height: 60,
    width: width * 0.8,
    maxWidth: 350,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: '#003366',
    height: 60,
    width: width * 0.8,
    maxWidth: 350,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 40,
  },
  loginButtonText: {
    color: Colors.WHITE,
    textAlign: 'center',
    fontFamily: 'montserrat',
    fontSize: 17,
  },
  image: {
    width: 150,
    height: 150,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
  googleButton: {
    backgroundColor: '#4285F4',
    height: 60,
    width: width * 0.8,
    maxWidth: 350,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 20,
  },
  googleButtonText: {
    color: Colors.WHITE,
    textAlign: 'center',
    fontFamily: 'montserrat',
    fontSize: 17,
  },
  registerButton: {
    backgroundColor: Colors.SECONDARY,
    height: 60,
    width: width * 0.8,
    maxWidth: 350,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: Colors.PRIMARY,
    textAlign: 'center',
    fontFamily: 'montserrat',
    fontSize: 17,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 0.8,
    maxWidth: 350,
    marginBottom: 25,
  },
  prefixContainer: {
    backgroundColor: Colors.PRIMARY,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  prefixText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: 'montserrat',
  },
  phoneInput: {
    flex: 1,
    height: 60,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#ccc',
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
});