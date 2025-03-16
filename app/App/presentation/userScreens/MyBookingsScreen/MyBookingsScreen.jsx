import React, { useState, useEffect, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  FlatList,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";

// Constants
import Colors from "../../../infraestructure/utils/Colors";

// Components
import BookingItem from "./BookingItem";

// Hooks
import { useCurrentUser } from "../../../application/context/CurrentUserContext";
import { useBookings } from "../../../application/hooks/useBookings";

// Utils
import { filterBookings } from "../../../infraestructure/utils/bookingFilters";
import { showErrorAlert } from "../../../infraestructure/utils/alerts";
import { STORAGE_KEYS } from "../../../infraestructure/constants";

// Components
const EmptyBookingsList = memo(({ message, buttonText, onButtonPress }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.noReservationsText}>{message}</Text>
    <TouchableOpacity onPress={onButtonPress} style={styles.button}>
      <Text style={styles.buttonText}>{buttonText}</Text>
    </TouchableOpacity>
  </View>
));

const BookingList = memo(({ 
  appointments, 
  loading, 
  setLoading, 
  emptyMessage, 
  buttonText, 
  onButtonPress 
}) => {
  const keyExtractor = useCallback((item) => 
    item.appointmentId?.toString() || Math.random().toString(), 
    []
  );

  const renderItem = useCallback(({ item }) => (
    <BookingItem place={item} setLoading={setLoading} />
  ), [setLoading]);

  if (appointments.length === 0) {
    return (
      <EmptyBookingsList 
        message={emptyMessage} 
        buttonText={buttonText} 
        onButtonPress={onButtonPress} 
      />
    );
  }

  return (
    <FlatList
      data={appointments}
      refreshing={loading}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      initialNumToRender={6}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
});

const FeedbackModal = memo(({ visible, onClose, onPositive, onNegative }) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>¡Tu opinión nos importa!</Text>
        <Text style={styles.modalText}>
          ¿Cómo ha sido tu experiencia usando nuestra app?
        </Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.feedbackButton, styles.positiveButton]}
            onPress={onPositive}
          >
            <Text style={styles.buttonText}>👍 Me gusta</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.feedbackButton, styles.negativeButton]}
            onPress={onNegative}
          >
            <Text style={styles.buttonText}>👎 Puede mejorar</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
        >
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
));

export default function MyBookingsScreen() {
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const { currentUser } = useCurrentUser();
  
  const [index, setIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);

  const { 
    bookings, 
    error, 
    isLoading, 
    refetch 
  } = useBookings(currentUser?.id);

  const [routes] = useState([
    { key: "activas", title: "Aprobadas" },
    { key: "pasadas", title: "Pendientes" },
    { key: "canceladas", title: "Historial" },
  ]);

  // Check if feedback has been shown before
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      try {
        const feedbackShown = await AsyncStorage.getItem(STORAGE_KEYS.FEEDBACK_SHOWN);
        setShowFeedback(feedbackShown !== 'true');
      } catch (error) {
        console.error('Error checking feedback status:', error);
      }
    };
    
    checkFeedbackStatus();
  }, []);

  const handleFeedbackClosed = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FEEDBACK_SHOWN, 'true');
      setShowFeedback(false);
    } catch (error) {
      console.error('Error saving feedback status:', error);
    }
  }, []);

  const handlePositiveFeedback = useCallback(async () => {
    Alert.alert("¡Gracias por tu feedback positivo!");
    handleFeedbackClosed();
  }, [handleFeedbackClosed]);

  const handleNegativeFeedback = useCallback(async () => {
    Alert.alert("Gracias por ayudarnos a mejorar");
    handleFeedbackClosed();
  }, [handleFeedbackClosed]);

  const navigateToHome = useCallback(() => 
    navigation.navigate("home"), 
    [navigation]
  );

  // Use useFocusEffect to refetch data when screen is focused
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const renderScene = SceneMap({
    activas: () => (
      <BookingList
        appointments={filterBookings(bookings?.active || [])}
        loading={loading}
        setLoading={setLoading}
        emptyMessage="Aún no hiciste ninguna reserva en la app"
        buttonText="Buscar cancha"
        onButtonPress={navigateToHome}
      />
    ),
    pasadas: () => (
      <BookingList
        appointments={filterBookings(bookings?.past || [])}
        loading={loading}
        setLoading={setLoading}
        emptyMessage="Aún no tienes reservas pendientes"
        buttonText="Ver historial"
        onButtonPress={() => setIndex(2)}
      />
    ),
    canceladas: () => (
      <BookingList
        appointments={filterBookings(bookings?.cancelled || [])}
        loading={loading}
        setLoading={setLoading}
        emptyMessage="No hay reservas canceladas"
        buttonText="Explorar"
        onButtonPress={navigateToHome}
      />
    ),
  });

  const renderTabBar = useCallback(props => (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabBar}
      activeColor={Colors.PRIMARY}
      inactiveColor="#777"
      labelStyle={styles.tabLabel}
    />
  ), []);

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudieron cargar las reservas</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={refetch}
          >
            <Text style={styles.buttonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis reservas</Text>
        </View>
        
        {isLoading && !bookings ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : (
          <>
            <FeedbackModal
              visible={showFeedback}
              onClose={handleFeedbackClosed}
              onPositive={handlePositiveFeedback}
              onNegative={handleNegativeFeedback}
            />
            
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: layout.width }}
              renderTabBar={renderTabBar}
              swipeEnabled={true}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  container: {
    flex: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  noReservationsText: {
    fontSize: 16,
    color: "#777",
    marginBottom: 20,
    textAlign: "center",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 5,
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    marginBottom: 20,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    width: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginBottom: 15,
  },
  feedbackButton: {
    padding: 10,
    borderRadius: 8,
    width: "45%",
    alignItems: "center",
  },
  positiveButton: {
    backgroundColor: Colors.PRIMARY,
  },
  negativeButton: {
    backgroundColor: "#FF6B6B",
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
  },
  closeButtonText: {
    color: "#666",
    fontSize: 14,
  },
  tabIndicator: {
    backgroundColor: Colors.PRIMARY
  },
  tabBar: {
    backgroundColor: "#fff"
  },
  tabLabel: {
    fontWeight: "500"
  }
});
