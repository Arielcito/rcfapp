import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import * as Font from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';

import TabNavigation from "./App/presentation/navigations/TabUserNavigation";
import TabNavigationOwner from "./App/presentation/navigations/TabOwnerNavigation";
import { LoginStack } from "./App/presentation/navigations/LoginNavigation";

import { UserLocationContext } from "./App/application/context/UserLocationContext";
import { CurrentUserContext } from "./App/application/context/CurrentUserContext";
import { CurrentPlaceContext } from "./App/application/context/CurrentPlaceContext";

import Colors from "./App/infraestructure/utils/Colors";
import { fetchOwnerPlace } from "./App/infraestructure/api/places.api";
import { api } from "./App/infraestructure/api/api";

// Prevenir que la pantalla de splash se oculte automáticamente
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlace, setCurrentPlace] = useState(null);
  const [location, setLocation] = useState({
    latitude: -34.80468427411911,
    longitude: -58.46083856046927,
  });
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all([
          loadFonts(),
          loadLocation(),
          checkAuthStatus(),
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    }

    prepare();
  }, []);

  const loadFonts = async () => {
    await Font.loadAsync({
      "montserrat": require("./App/presentation/assets/fonts/Montserrat-Regular.ttf"),
      "montserrat-bold": require("./App/presentation/assets/fonts/Montserrat-Bold.ttf"),
      "montserrat-medium": require("./App/presentation/assets/fonts/Montserrat-SemiBold.ttf"),
    });
    setFontsLoaded(true);
  };

  const loadLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permiso de ubicación denegado");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    setLocation(location.coords);
  };

  const checkAuthStatus = async () => {
    setIsLoadingUser(true);
    try {
      // Verificar si existe un token almacenado
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        setUser(null);
        setIsLoadingUser(false);
        return;
      }

      // Verificar si el token es válido y obtener información del usuario
      const response = await api.get('/users/me');
      const userData = response.data;
      
      if (userData) {
        setUser(userData);
        
        // Si es un propietario, cargar información de su lugar
        if (userData.role === "OWNER") {
          const place = await fetchOwnerPlace(userData.id);
          setCurrentPlace(place);
        }
      }
    } catch (error) {
      console.error("Error al verificar el estado de autenticación:", error);
      // Si hay un error (token inválido o expirado), limpiar el almacenamiento
      await AsyncStorage.removeItem('userToken');
      setUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  // Función para manejar el logout globalmente
  const handleLogout = async () => {
    try {
      await api.post('/users/auth/logout');
      await AsyncStorage.removeItem('userToken');
      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <UserLocationContext.Provider value={{ location, setLocation }}>
        <CurrentUserContext.Provider value={{ user, setUser, handleLogout }}>
          <CurrentPlaceContext.Provider value={{ currentPlace, setCurrentPlace }}>
            <Toast />
            {renderContent()}
          </CurrentPlaceContext.Provider>
        </CurrentUserContext.Provider>
      </UserLocationContext.Provider>
    </View>
  );

  function renderContent() {
    if (isLoadingUser) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.PRIMARY} />
        </View>
      );
    }

    return (
      <NavigationContainer>
        {user ? (
          user.role === "OWNER" ? (
            <TabNavigationOwner />
          ) : (
            <TabNavigation />
          )
        ) : (
          <LoginStack />
        )}
      </NavigationContainer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.WHITE,
  },
});
