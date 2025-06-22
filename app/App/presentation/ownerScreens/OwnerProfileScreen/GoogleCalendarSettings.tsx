import { View, Text, TouchableOpacity, Alert, Linking, StyleSheet } from "react-native";
import { useState } from "react";
import { api } from "../../../infrastructure/api/api";
import Colors from "../../../infrastructure/utils/Colors";

interface GoogleCalendarSettingsProps {
  user: any;
  onToggleCalendar: (enabled: boolean) => void;
}

export function GoogleCalendarSettings({ user, onToggleCalendar }: GoogleCalendarSettingsProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnectCalendar = async () => {
    setIsConnecting(true);
    try {
      // Obtener URL de autorización
      const response = await api.get('/google-calendar/auth-url');
      
      // Abrir browser para autorización
      await Linking.openURL(response.data.authUrl);
      
      // Mostrar instrucciones al usuario
      Alert.alert(
        'Vinculación con Google Calendar',
        'Se abrirá tu navegador para autorizar el acceso. Una vez completado, vuelve a la app.',
        [{ text: 'Entendido' }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo iniciar la vinculación con Google Calendar');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectCalendar = async () => {
    try {
      await api.delete('/google-calendar/disconnect');
      onToggleCalendar(false);
      Alert.alert('Éxito', 'Google Calendar desvinculado exitosamente');
    } catch (error) {
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
