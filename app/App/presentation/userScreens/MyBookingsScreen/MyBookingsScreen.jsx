import React, { useState, useEffect } from "react";
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
import { useNavigation } from "@react-navigation/native";
import { useCurrentUser } from "../../../application/context/CurrentUserContext";
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

const renderBookingList = (appointments, loading, setLoading, emptyMessage, buttonText, onButtonPress) => (
  <View style={styles.container}>
    {appointments.length === 0 ? (
      <>
        <Text style={styles.noReservationsText}>{emptyMessage}</Text>
        <TouchableOpacity onPress={onButtonPress} style={styles.button}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </>
    ) : (
      <FlatList
        data={appointments}
        refreshing={loading}
        keyExtractor={(item) => item.appointmentId?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <BookingItem place={item} setLoading={setLoading} />
        )}
      />
    )}
  </View>
);

export default function MyBookingsScreen() {
  const [index, setIndex] = useState(0);
  const navigation = useNavigation();
  const layout = useWindowDimensions();
  const [showFeedback, setShowFeedback] = useState(true);
  const { user } = useCurrentUser();

  const [loading, setLoading] = useState(false);
  const [appListActive, setAppListActive] = useState([]);
  const [appListPast, setAppListPast] = useState([]);
  const [appListCancelled, setAppListCancelled] = useState([]);

  const [routes] = useState([
    { key: "activas", title: "Aprobadas" },
    { key: "pasadas", title: "Pendientes" },
    { key: "canceladas", title: "Historial" },
  ]);

  const renderScene = SceneMap({
    activas: () => renderBookingList(
      appListActive,
      loading,
      setLoading,
      "Aún no hiciste ninguna reserva en la app",
      "Buscar cancha",
      () => navigation.navigate("home")
    ),
    pasadas: () => renderBookingList(
      appListPast,
      loading,
      setLoading,
      "Aún no tienes reservas pasadas",
      "Ver historial",
      () => {}
    ),
    canceladas: () => renderBookingList(
      appListCancelled,
      loading,
      setLoading,
      "No hay reservas canceladas",
      "Explorar",
      () => {}
    ),
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const appointments = await reservaApi.obtenerReservasUsuario();
        
        if (!appointments || appointments.length === 0) {
          setAppListActive([]);
          setAppListPast([]);
          setAppListCancelled([]);
          return;
        }

        const validAppointments = appointments.filter(app => app?.appointmentId);
        setAppListActive(filterActiveAppointments(validAppointments));
        setAppListPast(filterPastAppointments(validAppointments));
        setAppListCancelled(filterCancelledAppointments(validAppointments));
      } catch (error) {
        console.error("Error al obtener reservas:", error);
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
        setAppListActive([]);
        setAppListPast([]);
        setAppListCancelled([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: Colors.PRIMARY }}
      style={{ backgroundColor: "#fff" }}
      activeColor={Colors.PRIMARY}
      inactiveColor="#777"
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis reservas</Text>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size={"large"} color={Colors.PRIMARY} />
            <Text style={styles.loadingText}>Cargando...</Text>
          </View>
        ) : (
          <>
            <Modal
              animationType="slide"
              transparent={true}
              visible={showFeedback}
              onRequestClose={() => setShowFeedback(false)}
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
                      onPress={() => {
                        Alert.alert("¡Gracias por tu feedback positivo!");
                        setShowFeedback(false);
                      }}
                    >
                      <Text style={styles.buttonText}>👍 Me gusta</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.feedbackButton, styles.negativeButton]}
                      onPress={() => {
                        Alert.alert("Gracias por ayudarnos a mejorar");
                        setShowFeedback(false);
                      }}
                    >
                      <Text style={styles.buttonText}>👎 Puede mejorar</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowFeedback(false)}
                  >
                    <Text style={styles.closeButtonText}>Cerrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <TabView
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: layout.width }}
              renderTabBar={renderTabBar}
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontFamily: "montserrat",
    marginTop: 5,
  },
  appointmentItem: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    width: "90%",
  },
  appointmentText: {
    fontSize: 14,
    color: "#333",
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
