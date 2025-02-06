import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  ImageBackground,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../infraestructure/config/FirebaseConfig';
import { PhoneAuthProvider, signInWithPhoneNumber } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Colors from '../../../infraestructure/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../infraestructure/api/api';

export default function UserRegistrationScreen() {
  const [values, setValues] = useState({
    name: '',
    email: '',
    pwd: '',
    confirmPwd: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const image = require('../../assets/images/geometrias-circulares.png');

  const validateForm = () => {
    const newErrors = {};
    
    if (!values.name.trim()) {
      newErrors.name = 'El nombre es requerido';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (text, field) => {
    setValues(prev => ({
      ...prev,
      [field]: text
    }));
    // Limpiar error cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/users/register', {
        nombre: values.name,
        email: values.email.toLowerCase(),
        password: values.pwd,
        role: 'USER'
      });

      if (response.status === 201) {
        ToastAndroid.show('¡Registro exitoso!', ToastAndroid.LONG);
        navigation.navigate('user-login');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      ToastAndroid.show(
        error.response?.data?.message || 'Error en el registro',
        ToastAndroid.LONG
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      
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

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Registrarse</Text>
          )}
        </TouchableOpacity>
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
  button: {
    backgroundColor: '#003366',
    height: 60,
    width: width * 0.8,
    maxWidth: 350,
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 40,
  },
  buttonText: {
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
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
});