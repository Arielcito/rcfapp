import api from '@/lib/axios';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

export const login = async (data: LoginData) => {
  const response = await api.post('/users/login', data);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const register = async (data: RegisterData) => {
  const response = await api.post('/users/register', data);
  return response.data;
};

export const logout = async () => {
  localStorage.removeItem('token');
  await api.post('/users/logout');
};

export const getCurrentUser = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const checkEmail = async (email: string) => {
  const response = await api.post('/users/check-email', { email });
  return response.data;
}; 