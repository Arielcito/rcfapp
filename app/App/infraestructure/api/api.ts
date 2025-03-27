import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../config/env';

console.log('Configurando API con URL base:', env.apiUrl);

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
});

// Función para verificar token de autenticación
export const verifyAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    console.log('Verificando token de autenticación:', token ? `${token.substring(0, 10)}...` : 'No hay token');
    
    if (!token) {
      console.log('No se encontró token en AsyncStorage');
      return { valid: false, message: 'No token found' };
    }
    
    // Realizar una petición de prueba al endpoint /users/me
    const response = await api.get('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Verificación de token exitosa:', response.status);
    return { valid: true, user: response.data };
  } catch (error) {
    console.error('Error al verificar token:', error);
    if (axios.isAxiosError(error)) {
      console.error('Detalles del error:', {
        status: error.response?.status,
        data: error.response?.data
      });
    }
    return { valid: false, message: 'Token inválido o expirado' };
  }
};

// Interceptor para manejar tokens
api.interceptors.request.use(
  async (config) => {
    try {
      const url = `${config.baseURL || ''}${config.url || ''}`;
      console.log('Realizando petición a:', url);
      
      const token = await AsyncStorage.getItem('auth_token');
      console.log('Token encontrado en AsyncStorage:', token ? `${token.substring(0, 10)}...` : 'No hay token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Header de autorización configurado:', `Bearer ${token.substring(0, 10)}...`);
      }
      
      console.log('Headers completos de la petición:', JSON.stringify(config.headers));
      return config;
    } catch (error) {
      console.error('Error al obtener token:', error);
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
      await AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);