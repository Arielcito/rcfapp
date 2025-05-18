import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCurrentUser } from '../../../application/context/CurrentUserContext';
import Colors from '../../../infrastructure/utils/Colors';

const DeleteAccountScreen = () => {
  const navigation = useNavigation();
  const { logout } = useCurrentUser();

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Eliminar cuenta",
      "¿Estás seguro que deseas eliminar tu cuenta? Esta acción no se puede deshacer.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sí, eliminar cuenta",
          style: "destructive",
          onPress: async () => {
            try {
              // Por ahora solo hacemos logout
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'userLoginStack' }],
              });
            } catch (error) {
              console.error("Error al eliminar la cuenta:", error);
              Alert.alert(
                "Error",
                "Hubo un problema al eliminar la cuenta. Por favor, intenta nuevamente."
              );
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Eliminar cuenta</Text>
        <Text style={styles.description}>
          Al eliminar tu cuenta, perderás acceso a todos tus datos y reservas. Esta acción no se puede deshacer.
        </Text>
        
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Eliminar cuenta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.PRIMARY,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    lineHeight: 24,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  cancelButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default DeleteAccountScreen; 