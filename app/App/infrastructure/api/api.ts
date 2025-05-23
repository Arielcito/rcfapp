import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../config/env';

console.log('Configurando API con URL base:', env.apiUrl);

// Servicio de token con redundancia y manejo de errores
export const TokenService = {
  async setToken(token: string, maxRetries = 3): Promise<boolean> {
    let retries = 0;
    
    while (retries < maxRetries) {
      try {
        // Guardamos en múltiples ubicaciones para redundancia
        await AsyncStorage.setItem('auth_token', token);
        await AsyncStorage.setItem('auth_token_backup', token);
        
        // Verificación inmediata
        const savedToken = await AsyncStorage.getItem('auth_token');
        if (savedToken === token) {
          console.log('Token guardado exitosamente:', token ? `${token.substring(0, 10)}...` : 'No hay token');
          return true;
        } else {
          console.error('Error verificando token guardado - no coincide');
          retries++;
        }
      } catch (error) {
        console.error('Error guardando token en el intento', retries, error);
        retries++;
        // Pequeña espera antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.error('Falló al guardar token después de', maxRetries, 'intentos');
    return false;
  },
  
  async getToken(): Promise<string | null> {
    try {
      // Intentar obtener del storage principal
      let token = await AsyncStorage.getItem('auth_token');
      
      // Si no existe, intentar recuperar del backup
      if (!token) {
        token = await AsyncStorage.getItem('auth_token_backup');
        
        // Si se recuperó del backup, restaurar el principal
        if (token) {
          await AsyncStorage.setItem('auth_token', token);
        }
      }
      
      return token;
    } catch (error) {
      console.error('Error recuperando token:', error);
      return null;
    }
  },
  
  async removeToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('auth_token_backup');
      console.log('Token eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando token:', error);
    }
  }
};

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

let onTokenExpired: (() => void) | null = null;

export const setTokenExpiredCallback = (callback: () => void) => {
  onTokenExpired = callback;
};

// Interceptor para manejar tokens mejorado
api.interceptors.request.use(
  async (config) => {
    try {
      const url = `${config.baseURL || ''}${config.url || ''}`;
      
      // Usar TokenService en lugar de AsyncStorage directamente
      const token = await TokenService.getToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log('No se encontró token para la petición');
      }
      
      return config;
    } catch (error) {
      console.error('Error al obtener token para request:', error);
      // Seguimos con la petición aunque haya error
      return config;
    }
  },
  (error) => {
    console.error('Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);
