import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
} from "react-native";
import Header from "./Header";
import { UserLocationContext } from "../../../application/context/UserLocationContext";
import { SelectMarkerContext } from "../../../application/context/SelectMarkerContext";
import { CurrentUserContext } from "../../../application/context/CurrentUserContext";
import Colors from "../../../infraestructure/utils/Colors";
import PlaceItem from "../../components/PlaceItem";
import { getDays, getTime } from "../../../infraestructure/utils/TimeDate";
import { getPredios } from "../../../infraestructure/api/places.api";
import { getAvailableTimes } from "../../../infraestructure/api/appointments.api";
import { useFocusEffect } from '@react-navigation/native';
import { Dimensions } from 'react-native';

export default function HomeScreen() {
  const { location, setLocation } = useContext(UserLocationContext);
  const { user } = useContext(CurrentUserContext);

  const [placeList, setPlaceList] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(0);
  const [next7Days, setNext7Days] = useState([]);
  const [timeList, setTimeList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [selectedTime, setSelectedTime] = useState(new Date().getHours());
  const [loading, setLoading] = useState(true);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth >= 768; // Consideramos tablet si el ancho es 768px o más

  useEffect(() => {
    initializeDateAndTime();
    setSelectedMarker(0);
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedDate, selectedTime]);

  useFocusEffect(
    useCallback(() => {
      initializeDateAndTime();
      fetchData();
    }, [])
  );

  const initializeDateAndTime = () => {
    const date = getDays();
    const time = getTime();

    setNext7Days(date);
    setTimeList(time);

    setSelectedDate(date[0].date);
    const today = new Date();

    if (selectedDate == today) {
      const preselectedTime = time.filter(
        (time) => time.time > today.getHours()
      );
      setSelectedTime(preselectedTime);
    } else setSelectedTime(time[12].time);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const predios = await getPredios();
      
      const fecha = next7Days.find(day => day.date === selectedDate);
      if (!fecha) return;
      
      const fechaFormateada = `${fecha.year}-${String(fecha.month).padStart(2, '0')}-${String(fecha.date).padStart(2, '0')}`;
      const horariosDisponibles = await getAvailableTimes(fechaFormateada);
      const horaSeleccionada = `${String(selectedTime).padStart(2, '0')}`;
      const horaEstaDisponible = horariosDisponibles.includes(horaSeleccionada);
      console.log(horaEstaDisponible)
      if (!horaEstaDisponible) {
        setPlaceList([]);
        return;
      }
      
      setPlaceList(predios);
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setPlaceList([]);
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
            data={timeList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => {
                  setSelectedTime(item.time);
                  setIsTimePickerVisible(false);
                }}
              >
                <Text style={styles.timeButtonText}>{item.time}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.time.toString()}
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
        selectedDate == item.date && { backgroundColor: Colors.PRIMARY },
        isTablet && styles.tabletDayButton,
      ]}
      onPress={() => setSelectedDate(item.date)}
    >
      <View style={styles.dayButtonHeader}>
        <Text style={[
          styles.dayButtonHeaderText,
          selectedDate == item.date && { color: Colors.WHITE },
        ]}>
          {item.day}
        </Text>
      </View>
      <View>
        <Text style={[
          styles.dayButtonDateText,
          selectedDate == item.date && { color: Colors.WHITE },
        ]}>
          {item.formmatedDate}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SelectMarkerContext.Provider value={{ selectedMarker, setSelectedMarker }}>
      <View style={[styles.container, isTablet && styles.tabletContainer]}>
        <View style={[styles.headerContainer, isTablet && styles.tabletHeaderContainer]}>
          <Header />
          <Text style={[styles.sectionTitle, isTablet && styles.tabletSectionTitle]}>Elegi la fecha</Text>
          <FlatList
            data={next7Days}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            renderItem={renderDayButton}
            contentContainerStyle={isTablet && styles.tabletDayButtonContainer}
          />
          <View style={[styles.timePickerContainer, isTablet && styles.tabletTimePickerContainer]}>
            <Text style={styles.timePickerLabel}>¿A qué hora jugas?</Text>
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
        
        {loading ? (
          <View style={styles.listLoadingContainer}>
            <ActivityIndicator size="large" color={Colors.PRIMARY} />
          </View>
        ) : placeList.length > 0 ? (
          <FlatList
            data={placeList}
            style={[styles.placeList]}
            renderItem={({ item }) => (
              <PlaceItem
                place={item}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                isTablet={isTablet}
              />
            )}
            keyExtractor={(item) => item.id}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={21}
            initialNumToRender={5}
            numColumns={isTablet ? 2 : 1}
          />
        ) : (
          <Text style={[styles.noPlacesText, isTablet && styles.tabletNoPlacesText]}>
            No hay lugares disponibles
          </Text>
        )}
      </View>
    </SelectMarkerContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
  },
  headerContainer: {
    zIndex: 10,
    padding: 10,
    width: "100%",
    paddingHorizontal: 20,
  },
  sectionTitle: {
    padding: 10,
    fontFamily: "montserrat-medium",
    fontSize: 16,
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
    width: "80%",
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
  placeList: {
    paddingBottom: 300,
    marginBottom: 100,
  },
  noPlacesText: {
    fontFamily: "montserrat-medium",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  listLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  tabletContainer: {
    paddingTop: 70,
    paddingHorizontal: 30,
  },
  tabletHeaderContainer: {
    paddingHorizontal: 30,
  },
  tabletSectionTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  tabletDayButton: {
    width: 80,
    height: 80,
    marginRight: 20,
  },
  tabletDayButtonContainer: {
    paddingVertical: 20,
  },
  tabletTimePickerContainer: {
    marginBottom: 30,
  },
  tabletPlaceList: {
    paddingBottom: 400,
  },
  tabletNoPlacesText: {
    fontSize: 20,
    marginTop: 40,
  },
});
