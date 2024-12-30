import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import * as Font from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";
import * as SplashScreen from 'expo-splash-screen';

import TabNavigation from "./App/presentation/navigations/TabUserNavigation";
import TabNavigationOwner from "./App/presentation/navigations/TabOwnerNavigation";
import { LoginStack } from "./App/presentation/navigations/LoginNavigation";

import { UserLocationContext } from "./App/application/context/UserLocationContext";
import { CurrentUserProvider, useCurrentUser } from "./App/application/context/CurrentUserContext";
import { CurrentPlaceContext } from "./App/application/context/CurrentPlaceContext";

import Colors from "./App/infraestructure/utils/Colors";
import { fetchOwnerPlace } from "./App/infraestructure/api/places.api";

// Prevenir que la pantalla de splash se oculte automáticamente
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlace, setCurrentPlace] = useState(null);
  const [location, setLocation] = useState({
    latitude: -34.80468427411911,
    longitude: -58.46083856046927,
  });

  const { currentUser, isLoading: isLoadingUser } = useCurrentUser();

  useEffect(() => {
    async function prepare() {
      try {
        await Promise.all([
          loadFonts(),
          loadLocation(),
        ]);
      } catch (e) {
        console.warn(e);
      } finally {
        setIsLoading(false);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    async function loadOwnerPlace() {
      if (currentUser?.role === "OWNER") {
        const place = await fetchOwnerPlace(currentUser.id);
        setCurrentPlace(place);
      }
    }
    loadOwnerPlace();
  }, [currentUser]);

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

  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

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
        {currentUser ? (
          currentUser.role === "OWNER" ? (
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

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <UserLocationContext.Provider value={{ location, setLocation }}>
        <CurrentPlaceContext.Provider value={{ currentPlace, setCurrentPlace }}>
          <Toast />
          {renderContent()}
        </CurrentPlaceContext.Provider>
      </UserLocationContext.Provider>
    </View>
  );
}

export default function App() {
  return (
    <CurrentUserProvider>
      <AppContent />
    </CurrentUserProvider>
  );
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
