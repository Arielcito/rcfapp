import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { getAppointmentById } from "../../../infraestructure/api/appointments.api";

export default function AppointmentInfo() {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  const route = useRoute();
  const { appointmentId } = route.params;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const appointment = await getAppointmentById(appointmentId.appointmentId);
      setAppointment(appointment[0]);
      setLoading(false);
    }
    fetchData();
  }, []);

  return (
    <>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00ff00" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.reservationCode}>CÓD. DE RESERVA</Text>
            <Text style={styles.code}>{appointment?.appointmentId}</Text>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Ionicons name="home-outline" size={24} color="green" />
              <Text style={styles.infoText}>Centro Deportivo</Text>
              <Text style={styles.infoDetail}>Arena sport Gerli</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={24} color="green" />
              <Text style={styles.infoText}>Fecha</Text>
              <Text style={styles.infoDetail}>
                {appointment?.appointmentDate}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={24} color="green" />
              <Text style={styles.infoText}>Hora</Text>
              <Text style={styles.infoDetail}>
                {appointment?.appointmentTime}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="football-outline" size={24} color="green" />
              <Text style={styles.infoText}>Cancha</Text>
              <Text style={styles.infoDetail}>
                cancha futbol 5
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="cash-outline" size={24} color="green" />
              <Text style={styles.infoText}>Monto a pagar</Text>
              <Text style={styles.infoDetail}>
                $20.000
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={24} color="green" />
              <Text style={styles.infoText}>Telefono</Text>
              <Text style={styles.infoDetail}>
                1156569844
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareText}>COMPARTIR</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reservationCode: {
    fontSize: 16,
    color: "green",
  },
  code: {
    fontSize: 20,
    fontWeight: "bold",
  },
  status: {
    backgroundColor: "#ffcccc",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  statusText: {
    color: "#ff0000",
    fontWeight: "bold",
  },
  sponsors: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  sponsorImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  infoContainer: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  infoDetail: {
    flex: 2,
    fontSize: 16,
    fontWeight: "bold",
  },
  shareButton: {
    backgroundColor: "#25D366",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  shareText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
