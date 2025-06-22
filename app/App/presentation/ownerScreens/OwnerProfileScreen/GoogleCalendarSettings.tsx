import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { api } from "../../../infrastructure/api/api";
import Colors from "../../../infrastructure/utils/Colors";
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

interface GoogleCalendarSettingsProps {
  user: any;
  onToggleCalendar: (enabled: boolean) => void;
}

export function GoogleCalendarSettings({ user, onToggleCalendar }: GoogleCalendarSettingsProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Configurar el listener para la redirección
    const subscription = Linking.addEventListener('url', handleRedirect);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleRedirect = async (event: { url: string }) => {
    console.log('🔄 [GoogleCalendarSettings] URL de redirección recibida:', event.url);
    
    try {
      const parsedUrl = Linking.parse(event.url);
      
      // Verificar si la redirección fue exitosa
      if (parsedUrl.path === 'checkout/congrats' && parsedUrl.queryParams?.status === 'success') {
        // Verificar el estado de la conexión
        const statusResponse = await api.get('/google-calendar/connection-status');
        if (statusResponse.data.isConnected) {
          onToggleCalendar(true);
          Alert.alert('¡Éxito!', 'Google Calendar conectado exitosamente');
        }
      } else if (parsedUrl.queryParams?.status === 'error') {
        Alert.alert('Error', 'No se pudo completar la conexión con Google Calendar');
      }
    } catch (error) {
      console.error('❌ [GoogleCalendarSettings] Error procesando redirección:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    try {
      // La URL de redirección será manejada por el backend
      const response = await api.get('/google-calendar/auth-url');
      
      console.log('🔗 [GoogleCalendarSettings] Iniciando proceso de autorización');
      
      const result = await WebBrowser.openAuthSessionAsync(
        response.data.authUrl,
        'RFCApp://checkout/congrats',
        {
          showInRecents: true,
          preferEphemeralSession: true
        }
      );

      if (result.type !== 'success') {
        setIsConnecting(false);
        console.log('❌ [GoogleCalendarSettings] Autorización cancelada por el usuario');
        Alert.alert('Info', 'La autorización fue cancelada');
      }
    } catch (error) {
      console.error('❌ [GoogleCalendarSettings] Error iniciando autorización:', error);
      setIsConnecting(false);
      Alert.alert('Error', 'No se pudo iniciar la conexión con Google Calendar');
    }
  };

  const handleDisconnectCalendar = async () => {
    try {
      await api.delete('/google-calendar/disconnect');
      onToggleCalendar(false);
      Alert.alert('Éxito', 'Google Calendar desvinculado exitosamente');
    } catch (error) {
      console.error('❌ [GoogleCalendarSettings] Error al desvincular:', error);
      Alert.alert('Error', 'No se pudo desvincular Google Calendar');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Calendar</Text>
      <Text style={styles.description}>
        Vincula tu cuenta de Google para que las reservas aparezcan automáticamente en tu calendario
      </Text>
      
      {user.googleCalendarEnabled ? (
        <View style={styles.connectedContainer}>
          <View style={styles.statusContainer}>
            <View style={styles.checkmarkContainer}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
            <Text style={styles.connectedText}>Conectado</Text>
          </View>
          <TouchableOpacity 
            style={styles.disconnectButton}
            onPress={handleDisconnectCalendar}
          >
            <Text style={styles.disconnectText}>Desvincular</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          style={[
            styles.connectButton,
            isConnecting && styles.connectingButton
          ]}
          onPress={handleConnectCalendar}
          disabled={isConnecting}
        >
          <Text style={styles.connectText}>
            {isConnecting ? 'Conectando...' : 'Conectar con Google Calendar'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.PRIMARY,
    marginBottom: 8,
    fontFamily: 'MontserratAlternates-SemiBold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: 'MontserratAlternates-Regular',
  },
  connectedContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.SUCCESS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  connectedText: {
    fontSize: 16,
    color: Colors.SUCCESS,
    fontFamily: 'MontserratAlternates-SemiBold',
  },
  disconnectButton: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.ERROR,
    alignItems: 'center',
  },
  disconnectText: {
    color: Colors.ERROR,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'MontserratAlternates-SemiBold',
  },
  connectButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  connectingButton: {
    backgroundColor: Colors.PRIMARY + '80', // 50% opacity
  },
  connectText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'MontserratAlternates-SemiBold',
  },
});
