import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers.Cookie = `auth_token=${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error al configurar headers:', error);
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const cookieToken = response.headers?.['set-cookie']?.[0]?.split(';')[0]?.split('=')[1];
    if (cookieToken) {
      AsyncStorage.setItem('auth_token', cookieToken);
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

export default api; 