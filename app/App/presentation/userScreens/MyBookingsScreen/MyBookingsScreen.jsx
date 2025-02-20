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
import { TabView, TabBar } from "react-native-tab-view";
import Colors from "../../../infraestructure/utils/Colors";
import BookingItem from "./BookingItem";
import moment from "moment";
import { getAppointmentsByUser } from "../../../infraestructure/api/appointments.api";
import { useNavigation } from "@react-navigation/native";

const filterActiveAppointments = (appointments) => {
  const now = moment().format("YYYY-MM-DD");
  const currentHour = moment().format("HH:mm");

  console.log('Filtrando reservas activas:', {
    fechaActual: now,
    horaActual: currentHour,
    totalReservas: appointments.length
  });

  const filtered = appointments.filter(
    (appointment) =>
      appointment.estado === "reservado" &&
      (appointment.appointmentDate > now || 
       (appointment.appointmentDate === now && 
        appointment.appointmentTime > currentHour))
  );

  console.log('Resultado filtrado activas:', {
    reservasFiltradas: filtered.length,
    primeraReserva: filtered[0] ? {
      fecha: filtered[0].appointmentDate,
      hora: filtered[0].appointmentTime,
      estado: filtered[0].estado
    } : null
  });

  return filtered;
};

const filterPastAppointments = (appointments) => {
  const now = moment().format("YYYY-MM-DD");
  
  console.log('Filtrando reservas pendientes:', {
    fechaActual: now,
    totalReservas: appointments.length
  });

  const filtered = appointments.filter(
    (appointment) =>
      (appointment.estado === "pendiente" || appointment.estado === "reservado") && 
      appointment.appointmentDate >= now
  );

  console.log('Resultado filtrado pendientes:', {
    reservasFiltradas: filtered.length,
    primeraReserva: filtered[0] ? {
      fecha: filtered[0].appointmentDate,
      hora: filtered[0].appointmentTime,
      estado: filtered[0].estado
    } : null
  });

  return filtered;
};

const filterCancelledAppointments = (appointments) => {
  return appointments.filter(
    (appointment) => appointment.estado === "cancelado"
  );
};

// Componente para mostrar reservas activas
const Activas = ({ appointments, setLoading, loading }) => {
  const navigation = useNavigation();
  
  return (
    <View style={styles.container}>
      {appointments.length === 0 ? (
        <>
          <Text style={styles.noReservationsText}>
            Aún no hiciste ninguna reserva en la app
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("home")}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Buscar cancha</Text>
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
};

// Componente para mostrar reservas pasadas
const Pasadas = ({ appointments, setLoading, loading }) => (
  <View style={styles.container}>
    {appointments.length === 0 ? (
      <>
        <Text style={styles.noReservationsText}>
          Aún no tienes reservas pasadas
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Ver historial</Text>
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

// Componente para mostrar reservas canceladas
const Canceladas = ({ appointments, setLoading, loading }) => (
  <View style={styles.container}>
    {appointments.length === 0 ? (
      <>
        <Text style={styles.noReservationsText}>
          No hay reservas canceladas
        </Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Explorar</Text>
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
  const navigator = useNavigation();
  const layout = useWindowDimensions();
  const [showFeedback, setShowFeedback] = useState(true);

  const [routes] = useState([
    { key: "activas", title: "Aprobadas" },
    { key: "pasadas", title: "Pendientes" },
    { key: "canceladas", title: "Historial" },
  ]);

  const [loading, setLoading] = useState(false);
  const [appList, setAppList] = useState([]);
  const [appListActive, setAppListActive] = useState([]);
  const [appListPast, setAppListPast] = useState([]);
  const [appListCancelled, setAppListCancelled] = useState([]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "activas":
        return (
          <Activas
            appointments={appListActive}
            setLoading={setLoading}
            loading={loading}
          />
        );
      case "pasadas":
        return (
          <Pasadas
            appointments={appListPast}
            setLoading={setLoading}
            loading={loading}
          />
        );
      case "canceladas":
        return (
          <Canceladas
            appointments={appListCancelled}
            setLoading={setLoading}
            loading={loading}
          />
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const appointments = await getAppointmentsByUser();
        
        console.log('Reservas obtenidas:', {
          total: appointments?.length || 0,
          primeraReserva: appointments?.[0] ? {
            fecha: appointments[0].appointmentDate,
            hora: appointments[0].appointmentTime,
            estado: appointments[0].estado
          } : null
        });
        
        if (!appointments || appointments.length === 0) {
          setAppList([]);
          setAppListActive([]);
          setAppListPast([]);
          setAppListCancelled([]);
          return;
        }

        const validAppointments = appointments.filter(app => app?.appointmentId);
        console.log("validAppointments", validAppointments)
        setAppList(validAppointments);
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
        setAppList([]);
        setAppListActive([]);
        setAppListPast([]);
        setAppListCancelled([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
              key={layout.width}
              navigationState={{ index, routes }}
              renderScene={renderScene}
              onIndexChange={setIndex}
              initialLayout={{ width: layout.width }}
              renderTabBar={props => (
                <TabBar
                  {...props}
                  key={`tabbar-${index}`}
                  indicatorStyle={{ backgroundColor: Colors.PRIMARY }}
                  style={{ backgroundColor: "#fff" }}
                  activeColor={Colors.PRIMARY}
                  inactiveColor="#777"
                />
              )}
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
