import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
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
import moment from 'moment';

export default function HomeScreen() {
  const { location, setLocation } = useContext(UserLocationContext);
  const { user } = useContext(CurrentUserContext);

  const [placeList, setPlaceList] = useState([]);
  const [cachedPredios, setCachedPredios] = useState(null);
  const [selectedMarker, setSelectedMarker] = useState(0);
  const [next7Days, setNext7Days] = useState([]);
  const [timeList, setTimeList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  const initializeDateAndTime = useCallback(() => {
    const dates = getDays();
    const time = getTime();
    
    if (Array.isArray(dates) && dates.length > 0) {
      setNext7Days(dates);
      setSelectedDate(dates[0].date);

      // Verificar si la fecha seleccionada es hoy
      const today = moment();
      const selectedDateObj = moment(dates[0].date);
      const esHoy = selectedDateObj.isSame(today, 'day');

      let horariosDisponibles = time;
      
      if (esHoy) {
        const currentHour = today.hour();
        const currentMinutes = today.minutes();
        
        horariosDisponibles = time.filter((timeSlot) => {
          const [hour] = timeSlot.time.split(':').map(Number);
          // Permitir reservas desde la próxima hora
          return hour > currentHour || (hour === currentHour && currentMinutes < 30);
        });
      }

      setTimeList(horariosDisponibles);
      
      if (horariosDisponibles.length > 0) {
        const horarioInicial = horariosDisponibles[0].time;
        setSelectedTime(horarioInicial);
      } else {
        setSelectedTime(null);
      }
    }
  }, []);

  // Cargar los predios una sola vez y cachearlos
  const loadPredios = useCallback(async () => {
    try {
      if (!cachedPredios) {
        const predios = await getPredios();
        setCachedPredios(predios);
        return predios;
      }
      return cachedPredios;
    } catch (error) {
      console.error("Error al cargar predios:", error);
      return [];
    }
  }, [cachedPredios]);

  const updatePlaceList = useCallback(async () => {
    setLoading(true);
    try {
      const fecha = next7Days.find(day => day.date === selectedDate);
      if (!fecha) return;
      
      const fechaFormateada = `${fecha.year}-${String(fecha.month).padStart(2, '0')}-${String(fecha.date).padStart(2, '0')}`;
      const horariosDisponibles = await getAvailableTimes(fechaFormateada);
      
      const horaEstaDisponible = horariosDisponibles.includes(selectedTime);
      
      if (!horaEstaDisponible) {
        setPlaceList([]);
        return;
      }
      
      setPlaceList(cachedPredios);
    } catch (error) {
      console.error("Error al actualizar lista de lugares:", error);
      setPlaceList([]);
    } finally {
      setLoading(false);
    }
  }, [next7Days, selectedDate, selectedTime, cachedPredios]);

  useEffect(() => {
    const initialize = async () => {
      await loadPredios();
      initializeDateAndTime();
      setSelectedMarker(0);
    };
    initialize();
  }, [loadPredios, initializeDateAndTime]);

  useEffect(() => {
    if (selectedDate && selectedTime && cachedPredios) {
      updatePlaceList();
    }
  }, [selectedDate, selectedTime, cachedPredios, updatePlaceList]);

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

  const renderDayButton = useCallback(({ item }) => {
    const isSelected = selectedDate === item.date;
    
    const handleDatePress = () => {
      if (!item.date) return;

      setSelectedDate(item.date);
      
      const time = getTime();
      const today = moment();
      const selectedDateObj = moment(item.date);
      const esHoy = selectedDateObj.isSame(today, 'day');
      
      let horariosDisponibles = time;
      
      if (esHoy) {
        const currentHour = today.hour();
        const currentMinutes = today.minutes();
        
        horariosDisponibles = time.filter((timeSlot) => {
          const [hour] = timeSlot.time.split(':').map(Number);
          // Permitir reservas desde la próxima hora
          return hour > currentHour || (hour === currentHour && currentMinutes < 30);
        });
      }

      setTimeList(horariosDisponibles);
      
      // Verificar si el horario actual sigue siendo válido
      const horaActualDisponible = horariosDisponibles.find(slot => slot.time === selectedTime);
      if (!horaActualDisponible && horariosDisponibles.length > 0) {
        const nuevoHorario = horariosDisponibles[0].time;
        setSelectedTime(nuevoHorario);
      } else if (horariosDisponibles.length === 0) {
        setSelectedTime(null);
      }
    };
    
    return (
      <TouchableOpacity
        style={[
          styles.dayButton,
          isSelected && { backgroundColor: Colors.PRIMARY },
          isTablet && styles.tabletDayButton,
        ]}
        onPress={handleDatePress}
      >
        <View style={styles.dayButtonHeader}>
          <Text style={[
            styles.dayButtonHeaderText,
            isSelected && { color: Colors.WHITE },
          ]}>
            {item.day}
          </Text>
        </View>
        <View>
          <Text style={[
            styles.dayButtonDateText,
            isSelected && { color: Colors.WHITE },
          ]}>
            {item.formmatedDate}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [selectedDate, selectedTime, isTablet]);

  return (
    <SelectMarkerContext.Provider value={{ selectedMarker, setSelectedMarker }}>
      <View style={[styles.container, isTablet && styles.tabletContainer]}>
        <View style={[styles.headerContainer, isTablet && styles.tabletHeaderContainer]}>
          <Header isTablet={isTablet} />
          <Text style={[styles.sectionTitle, isTablet && styles.tabletSectionTitle]}>Elegi la fecha</Text>
          {Array.isArray(next7Days) && next7Days.length > 0 ? (
            <FlatList
              data={next7Days}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={renderDayButton}
              keyExtractor={item => item.date}
              contentContainerStyle={isTablet && styles.tabletDayButtonContainer}
            />
          ) : (
            <Text style={styles.noPlacesText}>Cargando fechas disponibles...</Text>
          )}
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
        
        <View style={styles.listContainer}>
          {loading ? (
            <View style={styles.listLoadingContainer}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
          ) : placeList.length > 0 ? (
            <FlatList
              data={placeList}
              style={styles.placeList}
              contentContainerStyle={styles.placeListContent}
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
      </View>
    </SelectMarkerContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  tabletContainer: {
    paddingHorizontal: 20,
  },
  headerContainer: {
    backgroundColor: Colors.PRIMARY,
    paddingTop: Platform.OS === 'ios' ? 45 : 25,
    paddingBottom: 15,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    paddingHorizontal: 15,
  },
  tabletHeaderContainer: {
    paddingHorizontal: 30,
  },
  sectionTitle: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: "montserrat-medium",
    marginVertical: 10,
  },
  tabletSectionTitle: {
    fontSize: 20,
  },
  dayButtonContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tabletDayButtonContainer: {
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  timePickerContainer: {
    marginTop: 10,
  },
  tabletTimePickerContainer: {
    alignItems: 'center',
  },
  timePickerLabel: {
    color: Colors.WHITE,
    fontSize: 14,
    fontFamily: "montserrat",
    marginBottom: 8,
  },
  timePickerButton: {
    backgroundColor: Colors.WHITE,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  timePickerButtonText: {
    color: Colors.PRIMARY,
    fontSize: 16,
    fontFamily: "montserrat-medium",
  },
  listContainer: {
    flex: 1,
    paddingTop: 10,
  },
  listLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeList: {
    flex: 1,
  },
  placeListContent: {
    paddingBottom: 20,
    alignItems: Platform.OS === 'ios' ? 'center' : 'stretch',
  },
  noPlacesText: {
    textAlign: 'center',
    fontSize: 16,
    color: Colors.GRAY,
    marginTop: 20,
  },
  tabletNoPlacesText: {
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: "montserrat-medium",
    marginBottom: 15,
    textAlign: 'center',
  },
  timeList: {
    maxHeight: 300,
  },
  timeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeItemText: {
    fontSize: 16,
    textAlign: 'center',
  },
  selectedTimeItem: {
    backgroundColor: Colors.PRIMARY_LIGHT,
  },
  selectedTimeText: {
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  dayButton: {
    borderWidth: 2,
    borderRadius: 14,
    marginBottom: 20,
    width: 45,
    height: 45,
    alignItems: "center",
    marginRight: 8,
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
  tabletDayButton: {
    width: 80,
    height: 80,
    marginRight: 20,
  },
});
