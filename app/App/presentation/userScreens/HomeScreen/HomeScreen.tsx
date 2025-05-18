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
  SafeAreaView,
  useColorScheme,
} from "react-native";
import Header from "./Header";
import { UserLocationContext } from "../../../application/context/UserLocationContext";
import { SelectMarkerContext } from "../../../application/context/SelectMarkerContext";
import { CurrentUserContext } from "../../../application/context/CurrentUserContext";
import Colors from "../../../infrastructure/utils/Colors";
import PlaceItem from "../../components/PlaceItem";
import { getDays, getTime } from "../../../infrastructure/utils/TimeDate";
import { getAvailableTimes } from "../../../infrastructure/api/appointments.api";
import { useFocusEffect } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import moment from 'moment';
import { usePredios } from "../../../infrastructure/api/places.queries";
import type { Place } from "../../../domain/entities/place.entity";
import { LinearGradient } from "expo-linear-gradient";

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

  const colorScheme = useColorScheme();

  const backgroundColor = colorScheme === "dark" ? "#181A20" : "#F7F8FA";
  const headerGradientColors: [string, string] = colorScheme === "dark"
    ? ["#1e293b", "#2563eb"]
    : ["#2563eb", "#60a5fa"];

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
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecciona una hora</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsTimePickerVisible(false)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={timeList}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.timeButton,
                  selectedTime === item.time && styles.selectedTimeButton,
                ]}
                onPress={() => {
                  setSelectedTime(item.time);
                  setIsTimePickerVisible(false);
                }}
              >
                <Text style={[
                  styles.timeButtonText,
                  selectedTime === item.time && styles.selectedTimeButtonText,
                ]}>
                  {item.time}
                </Text>
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.time.toString()}
            numColumns={3}
            contentContainerStyle={styles.timeListContent}
          />
        </View>
      </View>
    </Modal>
  );

  const renderDayButton = useCallback(({ item, index }: { item: Day; index: number }) => {
    const isSelected = selectedDate === item.date;
    const isToday = moment(item.date).isSame(moment(), 'day');
    
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
            isSelected && styles.selectedDayButton,
            isToday && styles.todayButton,
            isTablet && styles.tabletDayButton,
          ]}
          onPress={handleDatePress}
        >
          <View style={[
            styles.dayButtonHeader,
            isSelected && styles.selectedDayButtonHeader,
            isToday && styles.todayButtonHeader,
          ]}>
            <Text style={[
              styles.dayButtonHeaderText,
              isSelected && styles.selectedDayButtonText,
              isToday && styles.todayButtonText,
            ]}>
              {item.day}
            </Text>
          </View>
          <View style={styles.dayButtonContent}>
            <Text style={[
              styles.dayButtonDateText,
              isSelected && styles.selectedDayButtonText,
              isToday && styles.todayButtonText,
            ]}>
              {item.formmatedDate}
            </Text>
            {isToday && (
              <View style={styles.todayIndicator}>
                <Text style={styles.todayIndicatorText}>Hoy</Text>
              </View>
            )}
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
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <LinearGradient
          colors={headerGradientColors}
          style={[
            styles.headerContainer,
            isTablet && styles.tabletHeaderContainer,
            { paddingTop: Platform.OS === 'ios' ? 25 : 25 }
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
        </LinearGradient>
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
      </SafeAreaView>
    </SelectMarkerContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabletContainer: {
    paddingHorizontal: 20,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 25 : 25,
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
    marginBottom: 10,
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
    marginTop: 6,
    backgroundColor: 'transparent',
    padding: 8,
    borderRadius: 8,
    minHeight: 0,
  },
  tabletTimePickerContainer: {
    alignItems: 'center',
  },
  timePickerLabel: {
    color: Colors.PRIMARY,
    fontSize: 13,
    fontFamily: "montserrat-medium",
    marginBottom: 6,
  },
  timePickerButton: {
    backgroundColor: Colors.WHITE,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: 'transparent',
    elevation: 0,
    minHeight: 0,
  },
  timePickerButtonText: {
    color: Colors.PRIMARY,
    fontSize: 15,
    fontFamily: "montserrat-medium",
  },
  listContainer: {
    flex: 1,
    paddingTop: 15,
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
    gap: 18,
  },
  placeCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.PRIMARY,
    flexDirection: 'row',
    alignItems: 'center',
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
    fontFamily: "montserrat-medium",
  },
  tabletNoPlacesText: {
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY_LIGHT,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "montserrat-medium",
    color: Colors.PRIMARY,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.GRAY_LIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.GRAY,
    lineHeight: 24,
  },
  timeListContent: {
    paddingBottom: 20,
  },
  timeButton: {
    flex: 1,
    margin: 5,
    padding: 15,
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    shadowColor: Colors.BLACK,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedTimeButton: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  timeButtonText: {
    color: Colors.PRIMARY,
    fontFamily: "montserrat-medium",
    fontSize: 16,
  },
  selectedTimeButtonText: {
    color: Colors.WHITE,
  },
  dayButton: {
    borderWidth: 2,
    borderRadius: 14,
    marginBottom: 20,
    width: 45,
    height: 45,
    alignItems: "center",
    marginRight: 8,
    borderColor: Colors.PRIMARY,
    backgroundColor: Colors.WHITE,
    shadowColor: Colors.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  selectedDayButton: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
    transform: [{ scale: 1.05 }],
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  todayButton: {
    borderColor: Colors.GREEN,
    backgroundColor: Colors.WHITE,
  },
  todayButtonHeader: {
    backgroundColor: Colors.GREEN,
  },
  todayButtonText: {
    color: Colors.GREEN,
  },
  todayIndicator: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: Colors.GREEN,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    shadowColor: Colors.BLACK,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  todayIndicatorText: {
    color: Colors.WHITE,
    fontSize: 10,
    fontFamily: "montserrat-medium",
  },
  dayButtonHeader: {
    backgroundColor: Colors.PRIMARY,
    width: "100%",
    height: 20,
    alignItems: "center",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  selectedDayButtonHeader: {
    backgroundColor: Colors.PRIMARY,
  },
  dayButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonHeaderText: {
    fontFamily: "montserrat-medium",
    fontSize: 12,
    paddingTop: 1,
    color: Colors.WHITE,
  },
  selectedDayButtonText: {
    color: Colors.WHITE,
  },
  dayButtonDateText: {
    fontFamily: "montserrat-medium",
    fontSize: 16,
    paddingTop: 2,
    color: Colors.PRIMARY,
  },
  tabletDayButton: {
    width: 80,
    height: 80,
    marginRight: 20,
  },
});
