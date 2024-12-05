import { useRoute, useNavigation } from "@react-navigation/native";
import React from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from "react-native";
import WhatsappButton from "../../components/WhatsappButton";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function MyBookingDescriptionScreen() {
  const params = useRoute().params;
  const place = params.place;
  const navigation = useNavigation();

  const handleCancel = async (appointmentId) => {
    setLoading(true);
    const appointmentRef = doc(
      db,
      "rfc-appointments-place",
      appointmentId.toString()
    );

    await updateDoc(appointmentRef, {
      Estado: "Cancelado",
    });
    setLoading(false);
    ToastAndroid.show("Reserva cancelada!", ToastAndroid.LONG);
  };


  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <ImageBackground
          source={{ uri: "https://example.com/your-image-url.jpg" }} // Reemplaza con tu imagen
          resizeMode="cover"
          style={styles.headerImage}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis reservas</Text>
        </ImageBackground>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>{place.place.title}</Text>
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Ionicons name="football-outline" size={24} color="green" />
            <Text style={styles.cardText}>Cancha</Text>
            <Text style={styles.cardValue}>cancha 1</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="calendar-outline" size={24} color="green" />
            <Text style={styles.cardText}>Fecha</Text>
            <Text style={styles.cardValue}>{place.appointmentDate}</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="time-outline" size={24} color="green" />
            <Text style={styles.cardText}>Horario</Text>
            <Text style={styles.cardValue}>{place.appointmentTime}hs</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="cash-outline" size={24} color="green" />
            <Text style={styles.cardText}>Valor</Text>
            <Text style={styles.cardValue}>$20.000</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="timer-outline" size={24} color="green" />
            <Text style={styles.cardText}>Tiempo de cancha</Text>
            <Text style={styles.cardValue}>1hs</Text>
          </View>
          {/*<TouchableOpacity onPress={() => handleCancel(place?.appointmentId)}>
            <Text style={styles.cancelReservation}>Cancelar reserva</Text>
          </TouchableOpacity>*/}
        </View>
      </View>
      <View style={styles.whatsappButtonContainer}>

      <WhatsappButton phoneNumber={place?.place.telefono} message={"Hola! Acabo de reservar la cancha de " + place?.place.name + " para el día " + place?.appointmentDate + " a las " + place?.appointmentTime + ". ¿Podrías confirmarme la reserva?"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 150,
  },
  headerImage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    color: "black",
    fontWeight: "bold",
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#003366",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardText: {
    marginLeft: 8,
    fontSize: 16,
    color: "gray",
    flex: 1,
  },
  cardValue: {
    fontSize: 16,
    color: "black",
  },
  cancelReservation: {
    fontSize: 16,
    color: "red",
    textAlign: "right",
    marginTop: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderColor: "#e5e5e5",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderColor: "#e5e5e5",
  },
  whatsappText: {
    marginTop: 5,
    fontSize: 16,
    color: "green",
  },
  whatsappButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 70,
  },
});
