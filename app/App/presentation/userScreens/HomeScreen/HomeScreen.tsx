import React, { useEffect, useState, useContext, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  Platform,
  Animated,
  Easing,
} from "react-native";
import Header from "./Header";
import { UserLocationContext } from "../../../application/context/UserLocationContext";
import { SelectMarkerContext } from "../../../application/context/SelectMarkerContext";
import { CurrentUserContext } from "../../../application/context/CurrentUserContext";
import Colors from "../../../infraestructure/utils/Colors";
import PlaceItem from "../../components/PlaceItem";
import { getDays, getTime } from "../../../infraestructure/utils/TimeDate";
import { getAvailableTimes } from "../../../infraestructure/api/appointments.api";
import { useFocusEffect } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import moment from 'moment';
import { usePredios } from "../../../infraestructure/api/places.queries";
import type { Place } from "../../../domain/entities/place.entity";

interface Day {
  date: string;
  day: string;
  formmatedDate: string;
  fullDate: string;
  month: number;
  year: number;
}

interface TimeSlot {
  time: string;
}

export default function HomeScreen() {
  const [selectedMarker, setSelectedMarker] = useState(0);
  const [next7Days, setNext7Days] = useState<Day[]>([]);
  const [timeList, setTimeList] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isTimePickerVisible, setIsTimePickerVisible] = useState(false);

  const { width } = Dimensions.get('window');
  const isTablet = width >= 768;

  // React Query hook for fetching predios
  const { data: predios, isLoading: isLoadingPredios } = usePredios();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const dayButtonAnim = useRef(new Animated.Value(0)).current;
  const listItemAnim = useRef(new Animated.Value(0)).current;

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

  const updatePlaceList = useCallback(async () => {
    if (!predios) return;
    
    setLoading(true);
    try {
      const fecha = next7Days.find(day => day.date === selectedDate);
      if (!fecha) return;
      
      const fechaFormateada = `${fecha.year}-${String(fecha.month).padStart(2, '0')}-${String(fecha.date).padStart(2, '0')}`;
      const horariosDisponibles = await getAvailableTimes(fechaFormateada);
      
      const horaEstaDisponible = selectedTime ? horariosDisponibles.includes(selectedTime) : false;
      
      if (!horaEstaDisponible) {
        return;
      }
    } catch (error) {
      console.error("Error al actualizar lista de lugares:", error);
    } finally {
      setLoading(false);
    }
  }, [next7Days, selectedDate, selectedTime, predios]);

  useEffect(() => {
    initializeDateAndTime();
    setSelectedMarker(0);
  }, [initializeDateAndTime]);

  useEffect(() => {
    if (selectedDate && selectedTime && predios) {
      updatePlaceList();
    }
  }, [selectedDate, selectedTime, predios, updatePlaceList]);

  // Animation for initial load
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, []);

  // Animation for day buttons
  useEffect(() => {
    Animated.sequence([
      Animated.timing(dayButtonAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }, [next7Days]);

  // Update the list animation effect
  useEffect(() => {
    if (predios && predios.length > 0) {
      Animated.timing(listItemAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    }
  }, [predios]);

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

  const renderDayButton = useCallback(({ item, index }: { item: Day; index: number }) => {
    const isSelected = selectedDate === item.date;
    
    const handleDatePress = () => {
      if (!item.date) return;

      // Animate selection
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

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
          return hour > currentHour || (hour === currentHour && currentMinutes < 30);
        });
      }

      setTimeList(horariosDisponibles);
      
      const horaActualDisponible = horariosDisponibles.find(slot => slot.time === selectedTime);
      if (!horaActualDisponible && horariosDisponibles.length > 0) {
        const nuevoHorario = horariosDisponibles[0].time;
        setSelectedTime(nuevoHorario);
      } else if (horariosDisponibles.length === 0) {
        setSelectedTime(null);
      }
    };
    
    const buttonStyle = {
      opacity: dayButtonAnim,
      transform: [
        { translateX: dayButtonAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        })},
      ],
    };
    
    return (
      <Animated.View style={[buttonStyle, { marginRight: 8 }]}>
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
      </Animated.View>
    );
  }, [selectedDate, selectedTime, isTablet, dayButtonAnim]);

  const renderPlaceItem = useCallback(({ item, index }: { item: Place; index: number }) => {
    const delay = index * 100; // Stagger the animations

    return (
      <Animated.View
        style={{
          opacity: listItemAnim,
          transform: [
            {
              translateY: listItemAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        }}
      >
        <PlaceItem
          place={item}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          isTablet={isTablet}
        />
      </Animated.View>
    );
  }, [selectedDate, selectedTime, isTablet, listItemAnim]);

  return (
    <SelectMarkerContext.Provider value={{ selectedMarker, setSelectedMarker } as any}>
      <View style={[styles.container, isTablet && styles.tabletContainer]}>
        <Animated.View 
          style={[
            styles.headerContainer, 
            isTablet && styles.tabletHeaderContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <Header isTablet={isTablet} />
          <Animated.Text 
            style={[
              styles.sectionTitle, 
              isTablet && styles.tabletSectionTitle,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            Elegi la fecha
          </Animated.Text>
          {Array.isArray(next7Days) && next7Days.length > 0 ? (
            <View style={styles.dayButtonContainer}>
              <FlatList
                data={next7Days}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={renderDayButton}
                keyExtractor={item => item.date}
                contentContainerStyle={isTablet && styles.tabletDayButtonContainer}
              />
            </View>
          ) : (
            <Text style={styles.noPlacesText}>Cargando fechas disponibles...</Text>
          )}
          <Animated.View 
            style={[
              styles.timePickerContainer, 
              isTablet && styles.tabletTimePickerContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.timePickerLabel}>¿A qué hora jugas?</Text>
            <TouchableOpacity
              style={styles.timePickerButton}
              onPress={() => setIsTimePickerVisible(true)}
            >
              <Text style={styles.timePickerButtonText}>
                {selectedTime || "Seleccionar"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
          {renderTimePickerModal()}
        </Animated.View>
        
        <View style={styles.listContainer}>
          {isLoadingPredios || loading ? (
            <View style={styles.listLoadingContainer}>
              <ActivityIndicator size="large" color={Colors.PRIMARY} />
            </View>
          ) : predios && predios.length > 0 ? (
            <Animated.FlatList
              data={predios}
              style={styles.placeList}
              contentContainerStyle={[
                styles.placeListContent,
                isTablet && styles.tabletPlaceListContent,
              ]}
              renderItem={renderPlaceItem}
              keyExtractor={(item) => item.id.toString()}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={21}
              initialNumToRender={5}
              numColumns={isTablet ? 2 : 1}
              columnWrapperStyle={isTablet ? styles.tabletColumnWrapper : undefined}
            />
          ) : (
            <Animated.Text 
              style={[
                styles.noPlacesText, 
                isTablet && styles.tabletNoPlacesText,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              No hay lugares disponibles
            </Animated.Text>
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
    overflow: 'hidden',
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
    minHeight: 45,
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
    paddingHorizontal: 15,
  },
  tabletPlaceListContent: {
    paddingHorizontal: 20,
  },
  tabletColumnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15,
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
    backgroundColor: Colors.PRIMARY,
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
