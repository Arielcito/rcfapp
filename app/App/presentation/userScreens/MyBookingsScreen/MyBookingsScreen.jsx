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
import Colors from "../../../infraestructure/utils/Colors";
import BookingItem from "./BookingItem";
import moment from "moment";
import { reservaApi } from "../../../infraestructure/api/reserva.api";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useCurrentUser } from "../../../application/context/CurrentUserContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Move filter functions outside component for better performance
const filterActiveAppointments = (appointments) => {
  const now = moment().format("YYYY-MM-DD");
  const currentHour = moment().format("HH:mm");

  return appointments.filter(
    (appointment) =>
      appointment.estado === "reservado" &&
      (appointment.appointmentDate > now || 
       (appointment.appointmentDate === now && 
        appointment.appointmentTime > currentHour))
  );
};

const filterPastAppointments = (appointments) => {
  const now = moment().format("YYYY-MM-DD");
  return appointments.filter(
    (appointment) =>
      (appointment.estado === "pendiente" || appointment.estado === "reservado") && 
      appointment.appointmentDate >= now
  );
};

const filterCancelledAppointments = (appointments) => {
  return appointments.filter(
    (appointment) => appointment.estado === "cancelado"
  );
};

// Create a memoized EmptyBookingsList component
const EmptyBookingsList = memo(({ message, buttonText, onButtonPress }) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.noReservationsText}>{message}</Text>
    <TouchableOpacity onPress={onButtonPress} style={styles.button}>
      <Text style={styles.buttonText}>{buttonText}</Text>
    </TouchableOpacity>
  </View>
));

// Create a memoized BookingList component
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
    />
  );
});

// Create a memoized FeedbackModal component
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
  const [index, setIndex] = useState(0);
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const [showFeedback, setShowFeedback] = useState(false);
  const { currentUser: user } = useCurrentUser();

  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState({
    active: [],
    past: [],
    cancelled: []
  });
  const [error, setError] = useState(null);

  const [routes] = useState([
    { key: "activas", title: "Aprobadas" },
    { key: "pasadas", title: "Pendientes" },
    { key: "canceladas", title: "Historial" },
  ]);

  // Check if feedback has been shown before
  useEffect(() => {
    const checkFeedbackStatus = async () => {
      try {
        const feedbackShown = await AsyncStorage.getItem('feedbackShown');
        setShowFeedback(feedbackShown !== 'true');
      } catch (error) {
        console.error('Error checking feedback status:', error);
      }
    };
    
    checkFeedbackStatus();
  }, []);

  const handleFeedbackClosed = async () => {
    try {
      await AsyncStorage.setItem('feedbackShown', 'true');
      setShowFeedback(false);
    } catch (error) {
      console.error('Error saving feedback status:', error);
    }
  };

  const handlePositiveFeedback = async () => {
    Alert.alert("¡Gracias por tu feedback positivo!");
    handleFeedbackClosed();
  };

  const handleNegativeFeedback = async () => {
    Alert.alert("Gracias por ayudarnos a mejorar");
    handleFeedbackClosed();
  };

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Intenta obtener el userId del context primero
      let userId = user?.id;
      
      // Si no hay userId del usuario en el context, intentar con AsyncStorage
      if (!userId) {
        console.warn('ID de usuario no disponible en context, buscando en AsyncStorage');
        try {
          const userIdFromStorage = await AsyncStorage.getItem('userId');
          if (userIdFromStorage) {
            userId = userIdFromStorage;
          } else {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
              const parsedUser = JSON.parse(userData);
              userId = parsedUser?.id;
              console.log('ID recuperado de userData:', userId);
            }
          }
        } catch (storageError) {
          console.error('Error al leer de AsyncStorage:', storageError);
        }
      }
      
      // Si aún no hay userId, usar modo demo
      if (!userId) {
        console.warn('No hay datos de usuario en ninguna fuente, mostrando reservas de ejemplo');
        const demoAppointment = {
          appointmentId: 999,
          appointmentDate: moment().format('YYYY-MM-DD'),
          appointmentTime: '18:00',
          estado: 'reservado',
          duracion: 60,
          precioTotal: '0',
          place: {
            name: 'Modo Sin Conexión',
            description: 'Fútbol - Césped sintético',
            imageUrl: 'https://example.com/placeholder.jpg',
            telefono: '555-1234'
          }
        };
        
        setAppointments({
          active: [demoAppointment],
          past: [],
          cancelled: []
        });
        
        return;
      }
      
      // Continúa con el proceso normal
      console.log('Filtrando reservas para usuario con ID:', userId);
      const allAppointments = await reservaApi.obtenerReservasUsuarioFiltradas(userId);
      
      if (!allAppointments || allAppointments.length === 0) {
        console.log('No se encontraron reservas');
        setAppointments({
          active: [],
          past: [],
          cancelled: []
        });
        return;
      }

      const validAppointments = allAppointments.filter(app => app?.appointmentId);
      console.log(`Total de reservas válidas: ${validAppointments.length}`);
      
      const activeApps = filterActiveAppointments(validAppointments);
      const pastApps = filterPastAppointments(validAppointments);
      const cancelledApps = filterCancelledAppointments(validAppointments);
      
      console.log(`Reservas por categoría: Activas=${activeApps.length}, Pendientes=${pastApps.length}, Historial=${cancelledApps.length}`);
      
      setAppointments({
        active: activeApps,
        past: pastApps,
        cancelled: cancelledApps
      });
    } catch (error) {
      console.error("Error detallado al obtener reservas:", {
        message: error.message,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data
        } : 'No response data'
      });
      
      setError(error.message);
      
      if (error.message === 'No autorizado') {
        Alert.alert(
          "Error de autenticación",
          "Por favor, inicia sesión nuevamente para ver tus reservas"
        );
      } else {
        Alert.alert(
          "Error",
          "No se pudieron cargar las reservas. Por favor, intenta más tarde."
        );
      }
      
      setAppointments({
        active: [],
        past: [],
        cancelled: []
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Use useFocusEffect to refetch data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchAppointments();
    }, [fetchAppointments])
  );

  const navigateToHome = useCallback(() => navigation.navigate("home"), [navigation]);

  const renderScene = SceneMap({
    activas: () => (
      <BookingList
        appointments={appointments.active}
        loading={loading}
        setLoading={setLoading}
        emptyMessage="Aún no hiciste ninguna reserva en la app"
        buttonText="Buscar cancha"
        onButtonPress={navigateToHome}
      />
    ),
    pasadas: () => (
      <BookingList
        appointments={appointments.past}
        loading={loading}
        setLoading={setLoading}
        emptyMessage="Aún no tienes reservas pendientes"
        buttonText="Ver historial"
        onButtonPress={() => setIndex(2)}
      />
    ),
    canceladas: () => (
      <BookingList
        appointments={appointments.cancelled}
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
      indicatorStyle={{ backgroundColor: Colors.PRIMARY }}
      style={{ backgroundColor: "#fff" }}
      activeColor={Colors.PRIMARY}
      inactiveColor="#777"
      labelStyle={{ fontWeight: "500" }}
    />
  ), []);

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se pudieron cargar las reservas</Text>
          <TouchableOpacity 
            style={styles.button} 
            onPress={fetchAppointments}
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
        
        {loading && appointments.active.length === 0 && 
          appointments.past.length === 0 && 
          appointments.cancelled.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={"large"} color={Colors.PRIMARY} />
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
    fontFamily: "montserrat",
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
});
