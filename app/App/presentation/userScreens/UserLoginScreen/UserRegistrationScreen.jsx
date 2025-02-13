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
  Platform,
  Alert,
  ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../../infraestructure/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../infraestructure/api/api';

export default function UserRegistrationScreen() {
  const [values, setValues] = useState({
    nombre: '',
    email: '',
    pwd: '',
    confirmPwd: '',
    telefono: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const image = require('../../assets/images/geometrias-circulares.png');

  const validateForm = () => {
    const newErrors = {};
    
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

  const handleChange = (text, field) => {
    setValues(prev => ({
      ...prev,
      [field]: text
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const showMessage = (message, title = 'Mensaje') => {
    if (Platform.OS === 'ios') {
      Alert.alert(title, message);
    } else {
      ToastAndroid.show(message, ToastAndroid.LONG);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await api.post('/users/register', {
        name: values.nombre,
        email: values.email.toLowerCase(),
        password: values.pwd,
        telefono: values.telefono,
        role: 'USER'
      });

      if (response.status === 201) {
        showMessage('¡Registro exitoso!');
        navigation.navigate('user-login');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      showMessage(error.response?.data?.message || 'Error en el registro');
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
          onChangeText={(text) => handleChange(text, 'nombre')}
          value={values.nombre}
        />
        {errors.nombre && <Text style={styles.errorText}>{errors.nombre}</Text>}
        
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
          textContentType="none"
          autoCorrect={false}
        />
        {errors.pwd && <Text style={styles.errorText}>{errors.pwd}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Confirmar Contraseña"
          onChangeText={(text) => handleChange(text, 'confirmPwd')}
          value={values.confirmPwd}
          secureTextEntry={true}
          autoCapitalize="none"
          textContentType="none"
          autoCorrect={false}
        />
        {errors.confirmPwd && <Text style={styles.errorText}>{errors.confirmPwd}</Text>}

        <TextInput
          style={styles.input}
          placeholder="Teléfono (+549XXXXXXXXXX)"
          onChangeText={(text) => handleChange(text, 'telefono')}
          value={values.telefono}
          keyboardType="phone-pad"
        />
        {errors.telefono && <Text style={styles.errorText}>{errors.telefono}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>
              Registrarse
            </Text>
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