import { Linking, Alert, Platform } from 'react-native';

/**
 * Tipos para la funcionalidad de WhatsApp
 */
export interface WhatsAppConfig {
  phoneNumber: string;
  message: string;
  fallbackUrl?: string;
}

/**
 * Formatea un número de teléfono para WhatsApp
 * @param phoneNumber - Número de teléfono en cualquier formato
 * @returns Número formateado para WhatsApp (con código de país 54 para Argentina)
 */
export const formatPhoneNumberForWhatsApp = (phoneNumber: string): string => {
  console.log('WhatsApp Utils - Formateando número de teléfono:', phoneNumber);
  
  if (!phoneNumber) {
    console.warn('WhatsApp Utils - Número de teléfono vacío');
    return '';
  }
  
  // Remover todos los caracteres no numéricos
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  console.log('WhatsApp Utils - Número limpio:', cleanNumber);
  
  // Si ya tiene código de país 54, devolverlo tal como está
  if (cleanNumber.startsWith('54')) {
    console.log('WhatsApp Utils - Número ya tiene código de país 54');
    return cleanNumber;
  }
  
  // Si empieza con 0, removerlo y agregar 54
  if (cleanNumber.startsWith('0')) {
    const formattedNumber = `54${cleanNumber.substring(1)}`;
    console.log('WhatsApp Utils - Número formateado (removiendo 0):', formattedNumber);
    return formattedNumber;
  }
  
  // Si no tiene código de país, agregar 54
  const formattedNumber = `54${cleanNumber}`;
  console.log('WhatsApp Utils - Número formateado (agregando 54):', formattedNumber);
  return formattedNumber;
};

/**
 * Abre WhatsApp con un número y mensaje específico
 * @param config - Configuración de WhatsApp
 * @returns Promise<boolean> - true si se abrió exitosamente, false si no
 */
export const openWhatsApp = async (config: WhatsAppConfig): Promise<boolean> => {
  console.log('WhatsApp Utils - Intentando abrir WhatsApp con config:', config);
  
  try {
    const formattedNumber = formatPhoneNumberForWhatsApp(config.phoneNumber);
    
    if (!formattedNumber) {
      console.error('WhatsApp Utils - No se pudo formatear el número');
      Alert.alert('Error', 'Número de teléfono no válido');
      return false;
    }
    
    const encodedMessage = encodeURIComponent(config.message);
    const whatsappUrl = `whatsapp://send?phone=${formattedNumber}&text=${encodedMessage}`;
    
    console.log('WhatsApp Utils - URL de WhatsApp generada:', whatsappUrl);
    
    // Verificar si WhatsApp está disponible
    const canOpen = await Linking.canOpenURL(whatsappUrl);
    console.log('WhatsApp Utils - WhatsApp disponible:', canOpen);
    
    if (!canOpen) {
      console.warn('WhatsApp Utils - WhatsApp no está instalado');
      Alert.alert(
        'WhatsApp no disponible',
        'WhatsApp no está instalado en este dispositivo. ¿Deseas instalarlo?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Instalar',
            onPress: () => {
              const storeUrl = Platform.OS === 'ios' 
                ? 'itms-apps://itunes.apple.com/app/whatsapp-messenger/id310633997'
                : 'market://details?id=com.whatsapp';
              
              Linking.openURL(storeUrl).catch(() => {
                Alert.alert('Error', 'No se pudo abrir la tienda de aplicaciones');
              });
            }
          }
        ]
      );
      return false;
    }
    
    // Abrir WhatsApp
    await Linking.openURL(whatsappUrl);
    console.log('WhatsApp Utils - WhatsApp abierto exitosamente');
    return true;
    
  } catch (error) {
    console.error('WhatsApp Utils - Error al abrir WhatsApp:', error);
    Alert.alert(
      'Error',
      'No se pudo abrir WhatsApp. Por favor, verifica que esté instalado.'
    );
    return false;
  }
};

/**
 * Función de conveniencia para contactar a un predio
 * @param phoneNumber - Número de teléfono del predio
 * @param predioName - Nombre del predio
 * @param fecha - Fecha de la reserva (opcional)
 * @param hora - Hora de la reserva (opcional)
 * @returns Promise<boolean>
 */
export const contactarPredio = async (
  phoneNumber: string,
  predioName: string,
  fecha?: string,
  hora?: string
): Promise<boolean> => {
  console.log('WhatsApp Utils - Contactando predio:', { phoneNumber, predioName, fecha, hora });
  
  let message = `¡Hola! Vi tu predio "${predioName}" en RCC App y me gustaría obtener más información.`;
  
  if (fecha && hora) {
    message += ` Tengo una reserva para el ${fecha} a las ${hora}. Me gustaría consultar algunos detalles.`;
  }
  
  return await openWhatsApp({
    phoneNumber,
    message
  });
};

/**
 * Función de conveniencia para soporte técnico
 * @returns Promise<boolean>
 */
export const contactarSoporte = async (): Promise<boolean> => {
  console.log('WhatsApp Utils - Contactando soporte técnico');
  
  return await openWhatsApp({
    phoneNumber: '+5491156569844',
    message: 'Hola, vengo de la app de RCC y necesito ayuda.'
  });
}; 