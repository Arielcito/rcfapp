import { Alert } from 'react-native';

export const showErrorAlert = (error: unknown) => {
  if (error instanceof Error) {
    if (error.message === 'No autorizado') {
      Alert.alert(
        'Error de autenticación',
        'Por favor, inicia sesión nuevamente para ver tus reservas'
      );
    } else {
      Alert.alert(
        'Error',
        'No se pudieron cargar las reservas. Por favor, intenta más tarde.'
      );
    }
  } else {
    Alert.alert(
      'Error',
      'Ha ocurrido un error inesperado. Por favor, intenta más tarde.'
    );
  }
}; 