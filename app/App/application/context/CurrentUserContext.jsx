import { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from "../../infraestructure/api/api";

export const CurrentUserContext = createContext(null);

export const CurrentUserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const [userData, token] = await Promise.all([
        AsyncStorage.getItem('userData'),
        AsyncStorage.getItem('userToken')
      ]);

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

  const login = async (email, password) => {
    try {
      const response = await api.post('/users/login', { email, password });
      const { user, token } = response.data;

      if (!user || !token) {
        throw new Error('Respuesta inválida del servidor');
      }

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(user));
      await AsyncStorage.setItem('userId', user.id);

      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      await AsyncStorage.multiRemove(['userToken', 'userData', 'userId']);
      api.defaults.headers.common.Authorization = '';
      setCurrentUser(null);
    }
  };

  const updateUserData = async (userData) => {
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
