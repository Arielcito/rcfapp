"use client";
import { createContext, useContext, useState, useEffect } from "react";
import axios from 'axios';
import api from "../../lib/axios";

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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/users/me');
      setUser(response.data);
    } catch (error) {
      // Manejar el error silenciosamente
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/users/login', {
        email,
        password
      });

      if (!response.data.user) {
        throw new Error('No se recibió información del usuario');
      }

      setUser(response.data.user);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error en el inicio de sesión');
      }
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await api.post('/api/users/register', data);
      setUser(response.data.user);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Error en el registro');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/users/logout');
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
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
