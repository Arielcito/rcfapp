import { createContext, useContext } from 'react';
import { useCurrentUser } from './CurrentUserContext';
import { useOwnerPlace } from '../hooks/useProfile';

export const CurrentPlaceContext = createContext();

export const CurrentPlaceProvider = ({ children }) => {
  const { currentUser } = useCurrentUser();
  const { 
    data: currentPlace, 
    isLoading, 
    error,
    refetch: loadPlace 
  } = useOwnerPlace(
    currentUser?.id || '', 
    currentUser?.role === 'OWNER'
  );

  return (
    <CurrentPlaceContext.Provider value={{ 
      currentPlace, 
      isLoading, 
      error: error?.message || (error ? 'Error al cargar el predio' : null), 
      loadPlace 
    }}>
      {children}
    </CurrentPlaceContext.Provider>
  );
};

export const useCurrentPlace = () => {
  const context = useContext(CurrentPlaceContext);
  if (!context) {
    throw new Error('useCurrentPlace debe ser usado dentro de CurrentPlaceProvider');
  }
  return context;
};
