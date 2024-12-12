"use client";
import { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';
import { api } from "../libs/axios";

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Estado del usuario actualizado:', user);
  }, [user]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('🔍 AuthContext: Verificando autenticación...');
      const response = await api.get('/api/users/me');
      console.log('📡 AuthContext: Respuesta de checkAuth:', response.data);
      setUser(response.data);
      console.log('✅ AuthContext: Usuario establecido:', response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('❌ AuthContext: Error en checkAuth:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      } else {
        console.error('💥 AuthContext: Error desconocido en checkAuth:', error);
      }
    } finally {
      setLoading(false);
      console.log('🏁 AuthContext: Loading finalizado');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Intentando login con email:', email);
      const response = await api.post('/api/users/login', {
        email,
        password
      });
      
      console.log('Respuesta de login:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });

      console.log('Usuario a guardar en contexto:', response.data.user);
      
      await new Promise<void>((resolve) => {
        setUser(response.data.user);
        resolve();
      });

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error en login:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        throw new Error(error.response?.data?.message || 'Error en el inicio de sesión');
      }
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      console.log('Intentando registro con datos:', { ...data, password: '[PROTECTED]' });
      const response = await api.post('/api/users/register', data);
      
      console.log('Respuesta de registro:', {
        status: response.status,
        headers: response.headers,
        data: response.data
      });

      setUser(response.data.user);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error en registro:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
        throw new Error(error.response?.data?.message || 'Error en el registro');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Intentando logout...');
      await api.post('/api/users/logout');
      console.log('Logout exitoso');
      setUser(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error en logout:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers
        });
      }
      throw error;
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: loading, 
      isLoading: loading, 
      login, 
      register, 
      logout,
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
