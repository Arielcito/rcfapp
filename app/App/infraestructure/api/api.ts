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

// Interceptor para manejar tokens
api.interceptors.request.use(
  async (config) => {
    try {
      const url = `${config.baseURL || ''}${config.url || ''}`;
      console.log('Realizando petición a:', url);
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
      await AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);