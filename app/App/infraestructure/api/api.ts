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
        console.log('Token principal no encontrado, probando backup');
        token = await AsyncStorage.getItem('auth_token_backup');
        
        // Si se recuperó del backup, restaurar el principal
        if (token) {
          console.log('Token recuperado de backup, restaurando principal');
          await AsyncStorage.setItem('auth_token', token);
        }
      }
      
      console.log('Token recuperado:', token ? `${token.substring(0, 10)}...` : 'No hay token');
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

// Interceptor para manejar tokens mejorado
api.interceptors.request.use(
  async (config) => {
    try {
      const url = `${config.baseURL || ''}${config.url || ''}`;
      console.log('Realizando petición a:', url);
      
      // Usar TokenService en lugar de AsyncStorage directamente
      const token = await TokenService.getToken();
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Header de autorización configurado:', `Bearer ${token.substring(0, 10)}...`);
      } else {
        console.log('No se encontró token para la petición');
      }
      
      console.log('Headers completos de la petición:', JSON.stringify(config.headers));
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

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    console.log('Respuesta exitosa de:', response.config.url || 'URL desconocida');
    console.log('Status code:', response.status);
    console.log('Headers de respuesta:', JSON.stringify(response.headers));
    return response;
  },
  async (error) => {
    console.error('Error en respuesta:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code,
      isAxiosError: error.isAxiosError,
      baseURL: error.config?.baseURL,
      headers: error.config?.headers
    });
    
    if (error.response?.status === 401) {
      console.log('Error 401 detectado - Removiendo token');
      console.log('Detalles de la respuesta 401:', JSON.stringify(error.response?.data));
      // Usar TokenService en lugar de AsyncStorage directamente
      await TokenService.removeToken();
    }
    return Promise.reject(error);
  }
);