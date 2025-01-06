import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { FIREBASE_AUTH } from '../../../infraestructure/config/FirebaseConfig';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import Colors from '../../../infraestructure/utils/Colors';

export default function PhoneVerificationScreen({ route, navigation }) {
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const { verificationId, userData } = route.params;

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  async function verifyCode() {
    if (verificationCode.length !== 6) {
      setError('Por favor ingresa el código de 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(
        verificationId,
        verificationCode
      );
      await signInWithCredential(FIREBASE_AUTH, credential);
      
      console.log(userData);
      navigation.replace('CompleteRegistration', { userData });
    } catch (err) {
      console.error(err);
      setError('Código inválido. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setLoading(true);
    try {
      const phoneNumberWithCode = `+54${userData.phone}`;
      console.log('Intentando reenviar código a:', phoneNumberWithCode);
      
      if (!route.params.recaptchaVerifier) {
        throw new Error('No se encontró el verificador de reCAPTCHA');
      }

      const newVerificationId = await new PhoneAuthProvider(FIREBASE_AUTH)
        .verifyPhoneNumber(
          phoneNumberWithCode,
          route.params.recaptchaVerifier
        );

      // Actualizar el verificationId en los parámetros de la ruta
      route.params.verificationId = newVerificationId;
      
      console.log('Código reenviado exitosamente');
      setResendDisabled(true);
      setCountdown(60);
      setError('');
      // Mostrar mensaje de éxito
      setError('Código reenviado exitosamente');
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      console.error('Error al reenviar código:', err);
      setError(
        err.message === 'No se encontró el verificador de reCAPTCHA'
          ? 'Error: Necesitas volver a la pantalla anterior e intentar nuevamente'
          : 'Error al reenviar el código. Por favor intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Verificación de Teléfono</Text>
      <Text style={styles.subheading}>
        Ingresa el código de verificación enviado al número {userData.phone}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Código de verificación"
        onChangeText={setVerificationCode}
        value={verificationCode}
        keyboardType="number-pad"
        maxLength={6}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={styles.verifyButton}
        onPress={verifyCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.verifyButtonText}>Verificar Código</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.resendButton, resendDisabled && styles.resendButtonDisabled]}
        onPress={resendCode}
        disabled={resendDisabled || loading}
      >
        <Text style={[styles.resendButtonText, resendDisabled && styles.resendButtonTextDisabled]}>
          {resendDisabled 
            ? `Reenviar código en ${countdown}s`
            : 'Reenviar código'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 24,
    fontFamily: 'montserrat-bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subheading: {
    fontSize: 16,
    fontFamily: 'montserrat',
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
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
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 5,
  },
  verifyButton: {
    backgroundColor: Colors.PRIMARY,
    height: 60,
    width: width * 0.8,
    maxWidth: 350,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyButtonText: {
    color: Colors.WHITE,
    fontSize: 18,
    fontFamily: 'montserrat',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: 20,
    padding: 10,
  },
  resendButtonDisabled: {
    opacity: 0.6,
  },
  resendButtonText: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontFamily: 'montserrat',
  },
  resendButtonTextDisabled: {
    color: '#666',
  },
}); 