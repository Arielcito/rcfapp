import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from '../config/env';

export const api = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Interceptor para manejar tokens
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      console.log('Token recuperado:', token ? 'Existe token' : 'No hay token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Headers configurados:', config.headers);
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
    console.log('Respuesta exitosa:', {
      url: response.config.url,
      status: response.status,
      headers: response.headers
    });
    return response;
  },
  async (error) => {
    console.error('Error en respuesta:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.config?.headers
    });
    
    if (error.response?.status === 401) {
      console.log('Error 401 detectado - Removiendo token');
      await AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);