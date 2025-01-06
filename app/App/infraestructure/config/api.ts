import axios from 'axios';
import { API_URL } from './env';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const getToken = async () => {
  try {
    // Aquí debes implementar la lógica para obtener el token de tu almacenamiento local
    // Por ejemplo, usando AsyncStorage
    return null;
  } catch (error) {
    console.error('Error al obtener el token:', error);
    return null;
  }
};

export default api; 