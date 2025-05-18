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
import { format, parseISO, compareDesc } from 'date-fns';
import { es } from 'date-fns/locale';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { reservaApi } from "../../../infrastructure/api/reserva.api";
import { logger } from '../../../infrastructure/utils/logger';
import { mapReservaToBooking, ReservaResponse } from '../../../infrastructure/utils/bookingMappers';

// Constants
import Colors from "../../../infrastructure/utils/Colors";

// Components
import AppointmentItem from './AppointmentItem';

// Types
import { BookingResponse } from "../../../types/booking";

const COMPONENT_NAME = 'MyBookingsScreen';

interface EmptyBookingsListProps {
  message: string;
  buttonText: string;
  onButtonPress: () => void;
}

interface BookingListProps {
  appointments: BookingResponse[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  emptyMessage: string;
  buttonText: string;
  onButtonPress: () => void;
}

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  onPositive: () => void;
  onNegative: () => void;
}

// Components
const EmptyBookingsList = memo(({ message, buttonText, onButtonPress }: EmptyBookingsListProps) => (
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
}: BookingListProps) => {
  logger.debug(COMPONENT_NAME, 'BookingList - Received appointments:', { count: appointments.length });
  logger.debug(COMPONENT_NAME, 'BookingList - Loading state:', { loading });

  const keyExtractor = useCallback((item: BookingResponse) => 
    item.appointmentId?.toString() || Math.random().toString(), 
    []
  );

  const renderItem = useCallback(({ item }: { item: BookingResponse }) => {
    logger.debug(COMPONENT_NAME, 'BookingList - Rendering item:', { id: item.appointmentId });
    return <AppointmentItem reserva={item} onUpdate={() => setLoading(true)} />;
  }, [setLoading]);

  if (appointments.length === 0) {
    logger.debug(COMPONENT_NAME, 'BookingList - No appointments, showing empty state');
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

const FeedbackModal = memo(({ visible, onClose, onPositive, onNegative }: FeedbackModalProps) => (
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

type RootStackParamList = {
  home: undefined;
};

type MyBookingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MyBookingsScreen() {
  const navigation = useNavigation<MyBookingsScreenNavigationProp>();
  const layout = useWindowDimensions();

  const [index, setIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reservas, setReservas] = useState<BookingResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const ordenarReservas = (reservasArray: BookingResponse[]) => {
    try {
      logger.debug(COMPONENT_NAME, 'Ordenando reservas', { count: reservasArray.length });
      const sorted = [...reservasArray].sort((a, b) => 
        compareDesc(parseISO(a.fechaHora), parseISO(b.fechaHora))
      );
      logger.info(COMPONENT_NAME, 'Reservas ordenadas exitosamente', { count: sorted.length });
      return sorted;
    } catch (error) {
      logger.error(COMPONENT_NAME, 'Error al ordenar reservas', { error });
      return reservasArray;
    }
  };

  const fetchReservas = async () => {
    setLoading(true);
    logger.info(COMPONENT_NAME, 'Iniciando fetch de reservas');
    try {
      const response = (await reservaApi.obtenerTodasReservas() as unknown) as ReservaResponse[];
      logger.debug(COMPONENT_NAME, 'Respuesta de API recibida', { response });
      const todasLasReservas = response.map(mapReservaToBooking);
      const reservasOrdenadas = ordenarReservas(todasLasReservas);
      logger.info(COMPONENT_NAME, 'Reservas procesadas y ordenadas', { 
        total: reservasOrdenadas.length,
        sample: reservasOrdenadas.slice(0, 2)
      });
      setReservas(reservasOrdenadas);
      setError(null);
    } catch (error) {
      logger.error(COMPONENT_NAME, 'Error al cargar reservas', { error });
      setError('No pudimos cargar tus reservas en este momento');
    } finally {
      setLoading(false);
      logger.info(COMPONENT_NAME, 'Fetch de reservas completado');
    }
  };

  // Use useFocusEffect to refetch data when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchReservas();
    }, [])
  );

  const [routes] = useState([
    { key: "activas", title: "Aprobadas" },
    { key: "pasadas", title: "Pendientes" },
    { key: "canceladas", title: "Historial" },
  ]);

  const renderScene = SceneMap({
    activas: () => {
      const activeBookings = reservas.filter(reserva => {
        try {
          const fechaReserva = new Date(reserva.fechaHora);
          return reserva?.estado?.toLowerCase() === 'pagado' && fechaReserva > new Date();
        } catch (error) {
          logger.error(COMPONENT_NAME, 'Error al procesar fecha de reserva', { error, reserva });
          return false;
        }
      });
      logger.debug(COMPONENT_NAME, 'Active Tab - Filtered bookings:', { count: activeBookings.length });
      
      return (
        <BookingList
          appointments={activeBookings}
          loading={loading}
          setLoading={setLoading}
          emptyMessage="Aún no hiciste ninguna reserva en la app"
          buttonText="Buscar cancha"
          onButtonPress={() => navigation.navigate("home")}
        />
      );
    },
    pasadas: () => {
      const pendingBookings = reservas.filter(reserva => {
        try {
          const fechaReserva = new Date(reserva.fechaHora);
          return reserva?.estado?.toLowerCase() === 'pendiente' && fechaReserva > new Date();
        } catch (error) {
          logger.error(COMPONENT_NAME, 'Error al procesar fecha de reserva', { error, reserva });
          return false;
        }
      });
      logger.debug(COMPONENT_NAME, 'Pending Tab - Filtered bookings:', { count: pendingBookings.length });
      
      return (
        <BookingList
          appointments={pendingBookings}
          loading={loading}
          setLoading={setLoading}
          emptyMessage="Aún no tienes reservas pendientes"
          buttonText="Ver historial"
          onButtonPress={() => setIndex(2)}
        />
      );
    },
    canceladas: () => {
      const historyBookings = reservas.filter(reserva => {
        try {
          const fechaReserva = new Date(reserva.fechaHora);
          return fechaReserva <= new Date() || reserva?.estado?.toLowerCase() === 'cancelado';
        } catch (error) {
          logger.error(COMPONENT_NAME, 'Error al procesar fecha de reserva', { error, reserva });
          return false;
        }
      });
      logger.debug(COMPONENT_NAME, 'History Tab - Filtered bookings:', { count: historyBookings.length });
      
      return (
        <BookingList
          appointments={historyBookings}
          loading={loading}
          setLoading={setLoading}
          emptyMessage="No hay reservas en el historial"
          buttonText="Explorar"
          onButtonPress={() => navigation.navigate("home")}
        />
      );
    },
  });

  const renderTabBar = useCallback((props: any) => (
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
        <View style={styles.mainContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Mis reservas</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.noReservationsText}>
              {error}
            </Text>
            <TouchableOpacity 
              style={styles.button} 
              onPress={fetchReservas}
            >
              <Text style={styles.buttonText}>Intentar de nuevo</Text>
            </TouchableOpacity>
          </View>
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
        
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
          swipeEnabled={true}
        />
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
