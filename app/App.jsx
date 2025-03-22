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
import { TestMonitoring } from "./App/infraestructure/monitoring/TestMonitoring";

import { UserLocationContext } from "./App/application/context/UserLocationContext";
import { CurrentUserProvider, useCurrentUser } from "./App/application/context/CurrentUserContext";
import { CurrentPlaceContext } from "./App/application/context/CurrentPlaceContext";

import Colors from "./App/infraestructure/utils/Colors";
import { fetchOwnerPlace } from "./App/infraestructure/api/places.api";
import { initializeMonitoring } from "./App/infraestructure/monitoring/config";
import { withPerformanceTracking, withErrorBoundary, logError } from "./App/infraestructure/monitoring/utils";
import { monitoringConstants } from "./App/infraestructure/monitoring/config";

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
        await withPerformanceTracking(monitoringConstants.PERFORMANCE_METRICS.APP_LAUNCH, async () => {
          await Promise.all([
            loadFonts(),
            loadLocation(),
          ]);
          
          // Inicializar monitoreo después de cargar el usuario
          if (currentUser) {
            await initializeMonitoring(currentUser.id);
          } else {
            await initializeMonitoring();
          }
        });
      } catch (e) {
        logError('Error durante la inicialización de la app', {
          error: e,
          userId: currentUser?.id
        });
      } finally {
        setIsLoading(false);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    async function loadOwnerPlace() {
      if (currentUser?.role === "OWNER") {
        await withErrorBoundary(async () => {
          const place = await fetchOwnerPlace(currentUser.id);
          setCurrentPlace(place);
        }, {
          userId: currentUser.id,
          operation: 'fetchOwnerPlace'
        });
      }
    }
    loadOwnerPlace();
  }, [currentUser]);

  const loadFonts = async () => {
    await withErrorBoundary(async () => {
      await Font.loadAsync({
        "montserrat": require("./App/presentation/assets/fonts/Montserrat-Regular.ttf"),
        "montserrat-bold": require("./App/presentation/assets/fonts/Montserrat-Bold.ttf"),
        "montserrat-medium": require("./App/presentation/assets/fonts/Montserrat-SemiBold.ttf"),
      });
      setFontsLoaded(true);
    }, {
      operation: 'loadFonts'
    });
  };

  const loadLocation = async () => {
    await withErrorBoundary(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        logError("Permiso de ubicación denegado", {
          userId: currentUser?.id
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    }, {
      operation: 'loadLocation',
      userId: currentUser?.id
    });
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

    // Mostrar el componente de prueba en modo desarrollo
    if (__DEV__) {
      return <TestMonitoring />;
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
