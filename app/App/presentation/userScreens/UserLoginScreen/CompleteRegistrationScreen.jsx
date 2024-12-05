import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../infraestructure/config/FirebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import Colors from '../../../infraestructure/utils/Colors';

export default function CompleteRegistrationScreen({ route, navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { userData } = route.params;

  async function finalizeRegistration() {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        userData.email,
        userData.pwd
      );

      await setDoc(doc(FIREBASE_DB, 'users', userCredential.user.uid), {
        email: userData.email.toLowerCase(),
        name: userData.name,
        phone: userData.phone,
        userType: 'user',
        phoneVerified: true,
      });

      navigation.navigate('Tabs');
    } catch (error) {
      console.error("Error en el registro final:", error);
      setError('Error al crear la cuenta. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  // Iniciar el registro automáticamente cuando se carga la pantalla
  React.useEffect(() => {
    finalizeRegistration();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Creando tu cuenta...</Text>
        </>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'montserrat',
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'montserrat',
  },
}); 