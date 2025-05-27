import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Colors from '../../../infrastructure/utils/Colors';
import { submitOwnerRegistrationRequest } from '../../../infrastructure/api/ownerRegistration.api';

interface RegistrationForm {
  fullName: string;
  email: string;
  phone: string;
  propertyName: string;
  propertyLocation: string;
  additionalInfo: string;
}

interface ValidationErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  propertyName?: string;
  propertyLocation?: string;
  additionalInfo?: string;
}

export default function OwnerRegistrationScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RegistrationForm>({
    fullName: '',
    email: '',
    phone: '',
    propertyName: '',
    propertyLocation: '',
    additionalInfo: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validateForm(): boolean {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (!form.fullName.trim()) {
      newErrors.fullName = 'El nombre completo es requerido';
      isValid = false;
    }

    if (!form.email) {
      newErrors.email = 'El email es requerido';
      isValid = false;
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
      isValid = false;
    }

    if (!form.propertyName.trim()) {
      newErrors.propertyName = 'El nombre del predio es requerido';
      isValid = false;
    }

    if (!form.propertyLocation.trim()) {
      newErrors.propertyLocation = 'La ubicación del predio es requerida';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }

  function handleChange(value: string, field: keyof RegistrationForm) {
    setForm(prev => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await submitOwnerRegistrationRequest({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        propertyName: form.propertyName,
        propertyLocation: form.propertyLocation,
        additionalInfo: form.additionalInfo || undefined,
      });
      
      Alert.alert(
        '¡Solicitud enviada!',
        'Gracias por tu interés. Nos pondremos en contacto contigo pronto para continuar con el proceso.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Hubo un error al enviar tu solicitud. Por favor, intenta nuevamente.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.PRIMARY} />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>Registro de Predio</Text>
        <Text style={styles.subheading}>
          Complete el formulario y nos pondremos en contacto con usted para continuar con el proceso
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre Completo</Text>
            <TextInput
              style={[styles.input, errors.fullName && styles.inputError]}
              placeholder="Ingrese su nombre completo"
              value={form.fullName}
              onChangeText={(text) => handleChange(text, 'fullName')}
              placeholderTextColor={Colors.GRAY}
            />
            {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="Ingrese su email"
              value={form.email}
              onChangeText={(text) => handleChange(text.toLowerCase(), 'email')}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={Colors.GRAY}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              placeholder="Ingrese su teléfono"
              value={form.phone}
              onChangeText={(text) => handleChange(text, 'phone')}
              keyboardType="phone-pad"
              placeholderTextColor={Colors.GRAY}
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre del Predio</Text>
            <TextInput
              style={[styles.input, errors.propertyName && styles.inputError]}
              placeholder="Ingrese el nombre del predio"
              value={form.propertyName}
              onChangeText={(text) => handleChange(text, 'propertyName')}
              placeholderTextColor={Colors.GRAY}
            />
            {errors.propertyName && <Text style={styles.errorText}>{errors.propertyName}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ubicación del Predio</Text>
            <TextInput
              style={[styles.input, errors.propertyLocation && styles.inputError]}
              placeholder="Ingrese la ubicación del predio"
              value={form.propertyLocation}
              onChangeText={(text) => handleChange(text, 'propertyLocation')}
              placeholderTextColor={Colors.GRAY}
            />
            {errors.propertyLocation && <Text style={styles.errorText}>{errors.propertyLocation}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Información Adicional (Opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Agregue cualquier información adicional que considere relevante"
              value={form.additionalInfo}
              onChangeText={(text) => handleChange(text, 'additionalInfo')}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={Colors.GRAY}
            />
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Enviar Solicitud</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 40,
    paddingHorizontal: 16,
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
  heading: {
    fontSize: 28,
    fontFamily: 'montserrat-bold',
    textAlign: 'center',
    marginBottom: 12,
    color: Colors.BLACK,
  },
  subheading: {
    fontSize: 16,
    fontFamily: 'montserrat',
    textAlign: 'center',
    marginBottom: 32,
    color: Colors.GRAY,
    paddingHorizontal: 20,
  },
  form: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'montserrat-bold',
    marginBottom: 8,
    color: Colors.BLACK,
  },
  input: {
    height: 50,
    width: '100%',
    borderColor: Colors.GRAY_LIGHT,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 16,
    fontFamily: 'montserrat',
    color: Colors.BLACK,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  inputError: {
    borderColor: Colors.ERROR,
  },
  errorText: {
    color: Colors.ERROR,
    fontSize: 12,
    fontFamily: 'montserrat',
    marginTop: 4,
  },
  button: {
    backgroundColor: Colors.PRIMARY,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
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
}); 