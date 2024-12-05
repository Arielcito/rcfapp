import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../infraestructure/utils/Colors";

const TermsAndConditions = ({ navigation }) => {
  const terms = [
    "En las reservas sin señas, los complejos te podrán cancelar la reserva en cualquier momento.",
    "En las reservas con seña, una vez confirmada la reserva los complejos no podrán cancelarte la reserva.",
    "Las señas solo pueden efectuarse con tarjeta de crédito OCA, VISA Y MASTERCARD.",
    "Cancelación de reserva con seña: cancelando antes de 24hrs de la hora de juego el valor de la seña te quedará a favor para volver a usarlo en ese complejo. Este crédito a favor expirará a los 21 días de realizar la cancelación.",
    "Cancelación de reserva con seña: cancelando con menos de 24hrs de la hora de juego (mismo día) dependerás de que el complejo vuelva a reservar esa hora para que la seña te quede como crédito a favor. Si el complejo no logra volver a ocupar la hora, perderás el derecho de hacer uso de esa seña en otra oportunidad.",
    "En caso de hacer uso de esa seña a favor, si vuelves a cancelar, perderás el derecho a usarla nuevamente. Es decir, solo podrás cancelar por una vez.",
    "Nunca se te devuelve el valor de la seña en ninguno de los dos casos mencionados en los puntos 4 y 5.",
    "Cancelación por clima: esta opción solo está disponible en canchas abiertas. Para cancelar por...",
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Términos y condiciones</Text>
        </View>
      </View>
      <View style={styles.termsContainer}>
        <View style={styles.termsHeader}>
          <Ionicons name="document-text-outline" size={24} color="#666" />
          <Text style={styles.termsTitle}>Términos y condiciones</Text>
        </View>
        <ScrollView style={styles.termsList}>
          {terms.map((term, index) => (
            <View key={index} style={styles.termItem}>
              <View style={styles.termNumber}>
                <Text style={styles.termNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.termText}>{term}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BLUE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    
  },
  titleContainer: {
    marginLeft: 16,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#E57373",
    fontSize: 14,
  },
  termsContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  termsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  termsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#666",
  },
  termsList: {
    flex: 1,
  },
  termItem: {
    flexDirection: "row",
    marginBottom: 16,
  },
  termNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  termNumberText: {
    color: "#fff",
    fontWeight: "bold",
  },
  termText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
  },
});

export default TermsAndConditions;
