import { createContext, useState, useContext, useEffect } from 'react';
import { fetchOwnerPlace } from '../../infraestructure/api/places.api';
import { useCurrentUser } from './CurrentUserContext';

export const CurrentPlaceContext = createContext();

export const CurrentPlaceProvider = ({ children }) => {
  const [currentPlace, setCurrentPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (currentUser?.id) {
      loadPlace();
    } else {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  const loadPlace = async () => {
    try {
      setIsLoading(true);
      const placeData = await fetchOwnerPlace(currentUser.id);
      setCurrentPlace(placeData);
    } catch (error) {
      console.log('Error al cargar predio:', error);
      setCurrentPlace(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CurrentPlaceContext.Provider value={{ currentPlace, isLoading, loadPlace }}>
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
