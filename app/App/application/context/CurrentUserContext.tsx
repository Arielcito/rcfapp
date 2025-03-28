import { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, TokenService } from "../../infraestructure/api/api";

export interface User {
  id: string;
  email: string;
  [key: string]: any;
}

interface CurrentUserContextType {
  currentUser: User | null;
  setCurrentUser: (userData: User) => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

export const CurrentUserContext = createContext<CurrentUserContextType | null>(null);

export const CurrentUserProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const token = await TokenService.getToken();
      const userData = await AsyncStorage.getItem('userData');
      
      console.log('userData', userData);
      console.log('token', token ? `${token.substring(0, 10)}...` : 'No hay token');
      
      if (userData && token) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error al cargar usuario almacenado:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    try {
      console.log('Iniciando login para:', email);
      const response = await api.post('/users/login', { email, password });
      console.log('Respuesta de login:', {
        success: !!response.data,
        hasUser: !!response.data.user,
        hasToken: !!response.data.token,
        headers: response.headers
      });
      
      const { user, token } = response.data;

      if (!user || !token) {
        throw new Error('Respuesta inválida del servidor');
      }

      console.log('Guardando datos de sesión...');
      
      const tokenSaved = await TokenService.setToken(token);
      if (!tokenSaved) {
        console.error('No se pudo guardar el token después de múltiples intentos');
      }
      
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      await AsyncStorage.setItem('userId', user.id);

      const storedUserData = await AsyncStorage.getItem('userData');
      if (!storedUserData) {
        console.error('Error: No se pudo verificar que los datos del usuario se guardaron');
        await AsyncStorage.setItem('userData', JSON.stringify(user));
      }

      console.log('Configurando headers de API...');
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      console.log('Actualizando estado de usuario...');
      setCurrentUser(user);
      return user;
    } catch (error: any) {
      console.error('Error detallado en login:', {
        mensaje: error.message,
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('CurrentUserContext - Iniciando proceso de logout');
      console.log('CurrentUserContext - Haciendo llamada a /users/auth/logout');
      await api.post('/users/auth/logout');
      console.log('CurrentUserContext - Respuesta de logout recibida');
    } catch (error: any) {
      console.error('CurrentUserContext - Error en logout:', {
        message: error?.message || 'Error desconocido',
        status: error?.response?.status,
        data: error?.response?.data
      });
      throw error;
    } finally {
      console.log('CurrentUserContext - Limpiando datos de sesión');
      await TokenService.removeToken();
      await AsyncStorage.multiRemove(['userData', 'userId']);
      console.log('CurrentUserContext - Limpiando headers de API');
      api.defaults.headers.common.Authorization = '';
      console.log('CurrentUserContext - Actualizando estado de usuario');
      setCurrentUser(null);
      console.log('CurrentUserContext - Proceso de logout completado');
    }
  };

  const updateUserData = async (userData: User) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setCurrentUser(userData);
    } catch (error) {
      console.error('Error al actualizar datos del usuario:', error);
      throw error;
    }
  };

  return (
    <CurrentUserContext.Provider 
      value={{ 
        currentUser,
        setCurrentUser: updateUserData,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export const useCurrentUser = () => {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error('useCurrentUser debe ser usado dentro de CurrentUserProvider');
  }
  return context;
}; 