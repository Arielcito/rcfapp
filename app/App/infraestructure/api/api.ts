import axios from "axios";
import env from '../config/env';

export const api = axios.create({
  baseURL: env.apiUrl,
  headers: {
    'Content-Type': 'application/json'
  },
});

// Interceptor para manejar tokens si es necesario
api.interceptors.request.use(
  async (config) => {
    // Aquí podrías agregar el token desde AsyncStorage si lo necesitas
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);