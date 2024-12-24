import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { CurrentUserContext } from "../../../application/context/CurrentUserContext";
import Colors from "../../../infraestructure/utils/Colors";
import ButtonPrimary from "../../components/ButtonPrimary";
import { getProfileInfo } from "../../../infraestructure/api/user.api";
import WhatsappButton from "../../components/WhatsappButton";

const SuccessScreen = () => {
  const { appointmentData } = useRoute().params;
  const { user } = useContext(CurrentUserContext);
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    const obtenerDatosUsuario = async () => {
      try {
        const perfilUsuario = await getProfileInfo({ email: user.email });
        console.log(perfilUsuario);
        setUserData(perfilUsuario);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    obtenerDatosUsuario();
  }, [user.email]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>¡ {userData?.name}</Text>
        <Text style={styles.subtitle}>TU RESERVA YA ESTÁ LISTA !</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>
              {appointmentData?.place.nombre}
            </Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.row}>
              <Text style={styles.label}>Deporte</Text>
              <Text style={styles.value}>Fútbol</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Cancha</Text>
              <Text style={styles.value}>Cancha {appointmentData?.cancha}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha</Text>
              <Text style={styles.value}>
                {appointmentData.appointmentDate}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Hora</Text>
              <Text style={styles.value}>
                {appointmentData.appointmentTime}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#666"
              />
              <Text style={styles.infoText}>
                Estado: {appointmentData.estado}
              </Text>
            </View>
          </View>
        </View>

        <View>
          <ButtonPrimary
            text="Ver agenda de reservas"
            onPress={() => navigation.navigate("Tabs")}
          />
        </View>
      </View>
      <View style={styles.whatsappButtonContainer}>
        <WhatsappButton 
          phoneNumber={appointmentData?.place.phone} 
          message={`Hola! Acabo de reservar la cancha de ${appointmentData?.place.name} para el día ${appointmentData?.appointmentDate} a las ${appointmentData?.appointmentTime}. ¿Podrías confirmarme la reserva?`} 
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
  },
  cardHeader: {
    backgroundColor: Colors.BLUE,
    padding: 16,
  },
  cardHeaderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cardContent: {
    padding: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: {
    fontWeight: "bold",
    color: "#666",
  },
  value: {
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  infoText: {
    marginLeft: 8,
    color: "#666",
    flex: 1,
  },
  whatsappButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    marginBottom: 20, 
  },
});

export default SuccessScreen;
