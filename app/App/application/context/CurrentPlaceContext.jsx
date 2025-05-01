import { createContext, useState, useContext, useEffect } from 'react';
import { fetchOwnerPlace } from '../../infraestructure/api/places.api';
import { useCurrentUser } from './CurrentUserContext';

export const CurrentPlaceContext = createContext();

export const CurrentPlaceProvider = ({ children }) => {
  const [currentPlace, setCurrentPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (currentUser?.id || currentUser?.predioTrabajo) {
      loadPlace();
    } else {
      setIsLoading(false);
    }
  }, [currentUser?.id, currentUser?.predioTrabajo]);

  const loadPlace = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let placeData;
      try {
        // Primero intentamos con el ID del usuario
        placeData = await fetchOwnerPlace(currentUser.id);
      } catch (error) {
        if (error.response?.status === 404 && currentUser.predioTrabajo) {
          // Si falla con 404 y tenemos predioTrabajo, intentamos con ese
          placeData = await fetchOwnerPlace(currentUser.predioTrabajo);
        } else {
          throw error;
        }
      }
      
      setCurrentPlace(placeData);
    } catch (error) {
      console.error('Error al cargar predio:', error);
      if (error.response?.status === 404) {
        setError('No se encontró el predio asociado a tu cuenta. Por favor, contacta al administrador.');
      } else {
        setError('Error al cargar el predio. Por favor, intenta nuevamente más tarde.');
      }
      setCurrentPlace(null);
    } finally {
      setIsLoading(false);
    }
  };

  const retryLoadPlace = () => {
    loadPlace();
  };

  return (
    <CurrentPlaceContext.Provider value={{ currentPlace, isLoading, error, loadPlace: retryLoadPlace }}>
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
