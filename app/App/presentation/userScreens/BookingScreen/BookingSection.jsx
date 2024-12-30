import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Alert
} from "react-native";
import React, { useEffect, useState } from "react";
import moment from "moment";
import "moment/locale/es";
import { useNavigation } from "@react-navigation/native";
import SubHeading from "../../components/SubHeading";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../../../infraestructure/utils/Colors";
import { FIREBASE_AUTH } from "../../../infraestructure/config/FirebaseConfig";
import CaracteristicItem from "../../components/CaracteristicItem";
import { api } from "../../../infraestructure/api/api";

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
  const [canchas, setCanchas] = useState([]);
  const [selectedCancha, setSelectedCancha] = useState(null);
  const navigator = useNavigation();

  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  useEffect(() => {
    moment.locale("es");
    setSelectedDate(preselectedDate);
    setSelectedTime(preselectedTime);
    const timeMoment = moment(preselectedTime, "HH:mm");
    const newTimeMoment = timeMoment.add(1, "hour");
    const newTime = newTimeMoment.format("HH:mm");
    setEndTime(newTime);
    fetchCanchas();
  }, [preselectedDate, preselectedTime]);

  const fetchCanchas = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/canchas/predio/${place.id}`);
      if (response.data && response.data.length > 0) {
        setCanchas(response.data);
        setSelectedCancha(response.data[0]);
        console.log(response.data[0]);
      } else {
        Alert.alert("Error", "No hay canchas disponibles en este predio");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las canchas");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return moment(date).format("dddd, D [de] MMMM");
  };

  const renderCanchaItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.canchaItem,
        selectedCancha?.id === item.id && styles.selectedCanchaItem,
      ]}
      onPress={() => setSelectedCancha(item)}
    >
      <Text style={styles.canchaText}>Cancha {item.numero}</Text>
      <Text style={styles.canchaDetail}>{item.nombre}</Text>
      <Text style={styles.canchaDetail}>{item.tipo_superficie}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (canchas.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No hay canchas disponibles en este momento</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <SubHeading subHeadingTitle={"Seleccionar Cancha"} seeAll={false} />
      <FlatList
        data={canchas}
        renderItem={renderCanchaItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.canchasList}
      />

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
          <Text style={styles.detailText}>{place.direccion}</Text>
        </View>
        {selectedCancha && (
          <>
            <View style={styles.detailItem}>
              <Ionicons name="football-outline" size={24} color={Colors.PRIMARY} />
              <Text style={styles.detailText}> {selectedCancha.nombre}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={24} color={Colors.PRIMARY} />
              <Text style={styles.detailText}>${Number(selectedCancha.precioPorHora).toLocaleString()} /hora</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="pricetag-outline" size={24} color={Colors.PRIMARY} />
              <Text style={styles.detailText}>Seña: ${Number(selectedCancha.precioPorHora / 2).toLocaleString()}</Text>
            </View>
          </>
        )}
      </View>

      <SubHeading subHeadingTitle={"Características"} seeAll={false} />
      {selectedCancha && (
        <FlatList
          data={selectedCancha.caracteristicas || []}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => <CaracteristicItem name={item} />}
          keyExtractor={(item, index) => index.toString()}
          style={styles.caracteristicsList}
        />
      )}

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
              selectedCancha: selectedCancha
            })
          }
          disabled={!selectedCancha || loading}
          style={[styles.viewProfileButton, !selectedCancha && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>Ver Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigator.navigate("payment", {
              appointmentData: { place, cancha: selectedCancha },
              selectedDate: selectedDate,
              selectedTime: selectedTime,
            })
          }
          disabled={!selectedCancha || loading}
          style={[styles.reserveButton, !selectedCancha && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>Reservar</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.ERROR,
    textAlign: 'center',
  },
  canchasList: {
    marginBottom: 16,
  },
  canchaItem: {
    backgroundColor: Colors.LIGHT_GRAY,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  selectedCanchaItem: {
    backgroundColor: Colors.PRIMARY,
  },
  canchaText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  canchaDetail: {
    fontSize: 14,
    color: Colors.GRAY,
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
    marginBottom: 20,
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
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  caracteristicsList: {
    marginBottom: 16,
  },
});
