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
  const { verificationId, userData } = route.params;

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
}); 