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

// Componente para mostrar reservas activas
const Activas = ({ appointments, setLoading, loading }) => (
  <View style={styles.container}>
    {appointments.length === 0 ? (
      <>
        <Text style={styles.noReservationsText}>
          Aún no hiciste ninguna reserva en la app
        </Text>
        <TouchableOpacity
          onPress={() => navigator.navigate("home")}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Buscar cancha</Text>
        </TouchableOpacity>
      </>
    ) : (
      <FlatList
        data={appointments}
        refreshing={loading}
        keyExtractor={(item) => item.appointmentId.toString()}
        renderItem={({ item }) => (
          <BookingItem place={item} setLoading={setLoading} />
        )}
      />
    )}
  </View>
);

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
        keyExtractor={(item) => item.appointmentId.toString()}
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
        keyExtractor={(item) => item.appointmentId.toString()}
        renderItem={({ item }) => (
          <BookingItem place={item} setLoading={setLoading} />
        )}
      />
    )}
  </View>
);

// Función que mapea las escenas
const renderScene = ({ route, jumpTo }) => {
  switch (route.key) {
    case "activas":
      return (
        <Activas
          appointments={jumpTo.appListActive}
          setLoading={jumpTo.setLoading}
          loading={jumpTo.loading}
        />
      );
    case "pasadas":
      return (
        <Pasadas
          appointments={jumpTo.appListPast}
          setLoading={jumpTo.setLoading}
          loading={jumpTo.loading}
        />
      );
    case "canceladas":
      return (
        <Canceladas
          appointments={jumpTo.appListCancelled}
          setLoading={jumpTo.setLoading}
          loading={jumpTo.loading}
        />
      );
    default:
      return null;
  }
};

export default function MyBookingsScreen() {
  const [index, setIndex] = useState(0);
  const navigator = useNavigation();
  const layout = useWindowDimensions();

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const appointments = await getAppointmentsByUser();
        
        if (appointments.length === 0) {
          setLoading(false);
          return;
        }

        setAppList(appointments);
        setAppListActive(filterActiveAppointments(appointments));
        setAppListPast(filterPastAppointments(appointments));
        setAppListCancelled(filterCancelledAppointments(appointments));
      } catch (error) {
        console.error("Error fetching data:", error);
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
          <TabView
            navigationState={{ index, routes }}
            renderScene={(props) =>
              renderScene({
                ...props,
                jumpTo: {
                  appListActive,
                  appListPast,
                  appListCancelled,
                  setLoading,
                  loading,
                },
              })
            }
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={(props) => (
              <TabBar
                {...props}
                indicatorStyle={{ backgroundColor: Colors.PRIMARY }}
                style={{ backgroundColor: "#fff" }}
                activeColor={Colors.PRIMARY}
                inactiveColor="#777"
              />
            )}
          />
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
});
