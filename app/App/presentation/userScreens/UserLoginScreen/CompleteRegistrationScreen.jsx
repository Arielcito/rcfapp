import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Colors from '../../../infraestructure/utils/Colors';
import { api } from '../../../infraestructure/api/api';

export default function CompleteRegistrationScreen({ route, navigation }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { userData } = route.params;

  const finalizeRegistration = useCallback(async () => {
    setLoading(true);
    try {
      await api.post('/users/register', {
        email: userData.email.toLowerCase(),
        password: userData.pwd,
        name: userData.name,
        phone: userData.phone,
        phoneVerified: true,
      });

      navigation.navigate('Tabs');
    } catch (error) {
      console.error("Error en el registro final:", error);
      setError('Error al crear la cuenta. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [userData, navigation]);

  React.useEffect(() => {
    finalizeRegistration();
  }, [finalizeRegistration]);

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