import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  FlatList
} from "react-native";
import React, { useEffect, useState } from "react";
import moment from "moment";
import "moment/locale/es"; // Importamos la localización en español
import { useNavigation } from "@react-navigation/native";
import SubHeading from "../../components/SubHeading";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../../../infraestructure/utils/Colors";
import { FIREBASE_AUTH } from "../../../infraestructure/config/FirebaseConfig";
import CaracteristicItem from "../../components/CaracteristicItem";
export default function BookingSection({
  place,
  preselectedDate,
  preselectedTime,
}) {
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState();
  const [endTime, setEndTime] = useState();
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const navigator = useNavigation();

  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  useEffect(() => {
    moment.locale("es"); // Configuramos moment para usar español

    setSelectedDate(preselectedDate);
    setSelectedTime(preselectedTime);

    // Convierte preselectedTime a un objeto Moment
    const timeMoment = moment(preselectedTime, "HH:mm");

    // Añade una hora
    const newTimeMoment = timeMoment.add(1, "hour");

    // Formatea el nuevo tiempo
    const newTime = newTimeMoment.format("HH:mm");
    setEndTime(newTime);
  }, []);

  const formatDate = (date) => {
    return moment(date).format("dddd, D [de] MMMM");
  };

  const caracteristicsArray = ["techada", "iluminada", "sintetico"];

  return (
    <ScrollView style={styles.container}>
      <SubHeading subHeadingTitle={"Detalles de la Reserva"} seeAll={false} />

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={24} color={Colors.PRIMARY} />
          <Text style={styles.detailText}>{formatDate(selectedDate)}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time-outline" size={24} color={Colors.PRIMARY} />
          <Text style={styles.detailText}>
            {selectedTime} - {endTime}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location-outline" size={24} color={Colors.PRIMARY} />
          <Text style={styles.detailText}>{place.name}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash-outline" size={24} color={Colors.PRIMARY} />
          <Text style={styles.detailText}>$20.000 /hora</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="pricetag-outline" size={24} color={Colors.PRIMARY} />
          <Text style={styles.detailText}>Seña: $10.000</Text>
        </View>
      </View>
      <SubHeading subHeadingTitle={"Características"} seeAll={false} />
      <FlatList
        data={caracteristicsArray}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <CaracteristicItem name={item} />}
        keyExtractor={(item, index) => index.toString()}
        style={styles.caracteristicsList}
      />
      <SubHeading subHeadingTitle={"Notas"} seeAll={false} />
      <TextInput
        numberOfLines={3}
        onChangeText={(value) => setNotes(value)}
        style={styles.notesInput}
        placeholder="Algo que quieras agregar..."
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() =>
            navigator.navigate("pitch-profile", {
              place: place,
              selectedDate: selectedDate,
              selectedTime: selectedTime,
            })
          }
          disabled={loading}
          style={styles.viewProfileButton}
        >
          {!loading ? (
            <Text style={styles.buttonText}>Ver Perfil</Text>
          ) : (
            <ActivityIndicator color="#ffffff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigator.navigate("payment", {
              appointmentData: { place },
              selectedDate: { selectedDate },
              selectedTime: { selectedTime },
            })
          }
          disabled={loading}
          style={styles.reserveButton}
        >
          {!loading ? (
            <Text style={styles.buttonText}>Reservar</Text>
          ) : (
            <ActivityIndicator color="#ffffff" />
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  detailsContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  viewProfileButton: {
    backgroundColor: Colors.GRAY,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  reserveButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  caracteristicsList: {
    marginBottom: 16,
  },
  caracteristicItem: {
    backgroundColor: '#00B894',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  caracteristicText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
