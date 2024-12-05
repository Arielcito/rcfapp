import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import Colors from "../../../infraestructure/utils/Colors";
import { getDays, getTime } from "../../../infraestructure/utils/TimeDate";
import * as appointmentsApi from "../../../infraestructure/api/appointments.api";
import Toast from 'react-native-toast-message';

const BookingDateTimeScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { place } = route.params;

  const [availableTimes, setAvailableTimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [next7Days, setNext7Days] = useState([]);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

  useEffect(() => {
    initializeDateAndTime();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes();
    }
  }, [selectedDate]);

  const initializeDateAndTime = () => {
    const date = getDays();
    setNext7Days(date);
    setSelectedDate(date[0].date);
  };

  const fetchAvailableTimes = async () => {
    try {
      setLoading(true);
      const times = await appointmentsApi.getAvailableTimes(selectedDate);
      setAvailableTimes(times);
      setSelectedTime(null);
    } catch (error) {
      console.error("Error al obtener horarios disponibles:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderTimePickerModal = () => (
    <Modal
      visible={isTimePickerVisible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Selecciona una hora</Text>
          <FlatList
            data={availableTimes}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => {
                  setSelectedTime(item);
                  setIsTimePickerVisible(false);
                }}
              >
                <Text style={styles.timeButtonText}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.toString()}
            numColumns={3}
          />
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsTimePickerVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderDayButton = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.dayButton,
        selectedDate === item.date && { backgroundColor: Colors.PRIMARY },
      ]}
      onPress={() => setSelectedDate(item.date)}
    >
      <View style={styles.dayButtonHeader}>
        <Text style={[
          styles.dayButtonHeaderText,
          selectedDate === item.date && { color: Colors.WHITE },
        ]}>
          {item.day}
        </Text>
      </View>
      <View>
        <Text style={[
          styles.dayButtonDateText,
          selectedDate === item.date && { color: Colors.WHITE },
        ]}>
          {item.formmatedDate}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const handleReserve = () => {
    if (selectedDate && selectedTime && place) {
      const placeData = {
        place: {
          description: place.description,
          direccion: place.direccion,
          horarioApertura: place.horarioApertura,
          horarioCierre: place.horarioCierre,
          id: place.id,
          id_duenio: place.id_duenio,
          imageUrl: place.imageUrl,
          latitude: place.latitude,
          longitude: place.longitude,
          name: place.name,
          telefono: place.telefono
        }
      };
      console.log(selectedDate)
      console.log(selectedTime)
      navigation.navigate('payment', { appointmentData:placeData, selectedDate:{selectedDate}, selectedTime:{selectedTime} });
    } else {
      Toast.show({
        type: 'error',
        text1: 'Campos requeridos',
        text2: 'Por favor, selecciona una fecha y hora antes de reservar.',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.PRIMARY} />;
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Image source={{ uri: place.imageUrl }} style={styles.image} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{place.name}</Text>
          </View>
          <Text style={styles.address}>{place.direccion}</Text>

          <View style={styles.dateTimeContainer}>
            <Text style={styles.sectionTitle}>Elige la fecha</Text>
            <FlatList
              data={next7Days}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={renderDayButton}
            />
            <View style={styles.timePickerContainer}>
              <Text style={styles.timePickerLabel}>¿A qué hora juegas?</Text>
              <TouchableOpacity
                style={styles.timePickerButton}
                onPress={() => setIsTimePickerVisible(true)}
              >
                <Text style={styles.timePickerButtonText}>
                  {selectedTime || "Seleccionar"}
                </Text>
              </TouchableOpacity>
            </View>
            {renderTimePickerModal()}
          </View>

          <TouchableOpacity
            style={styles.reserveButton}
            onPress={handleReserve}
          >
            <Text style={styles.reserveButtonText}>Reservar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Toast />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  image: {
    width: "100%",
    height: 200,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "montserrat-bold",
  },
  address: {
    color: Colors.GRAY,
    marginTop: 4,
    fontFamily: "montserrat-regular",
  },
  dateTimeContainer: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    fontFamily: "montserrat-semibold",
  },
  dayButton: {
    borderWidth: 2,
    borderRadius: 16,
    marginBottom: 30,
    width: 50,
    height: 50,
    alignItems: "center",
    marginRight: 10,
    borderColor: Colors.BLUE,
  },
  dayButtonHeader: {
    backgroundColor: "#003366",
    width: "100%",
    height: 20,
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  dayButtonHeaderText: {
    fontFamily: "montserrat-medium",
    fontSize: 12,
    paddingTop: 1,
    color: Colors.PRIMARY,
  },
  dayButtonDateText: {
    fontFamily: "montserrat-medium",
    fontSize: 16,
    paddingTop: 2,
  },
  timePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  timePickerLabel: {
    padding: 10,
    fontFamily: "montserrat-medium",
    fontSize: 16,
  },
  timePickerButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  timePickerButtonText: {
    color: Colors.WHITE,
    fontFamily: "montserrat-medium",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontFamily: "montserrat-medium",
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  timeButton: {
    flex: 1,
    margin: 5,
    padding: 15,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    alignItems: "center",
  },
  timeButtonText: {
    color: Colors.WHITE,
    fontFamily: "montserrat-medium",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: Colors.GRAY,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: Colors.WHITE,
    fontFamily: "montserrat-medium",
    fontSize: 16,
  },
  reserveButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  reserveButtonText: {
    color: Colors.WHITE,
    fontFamily: "montserrat-bold",
    fontSize: 18,
  },
});

export default BookingDateTimeScreen;
