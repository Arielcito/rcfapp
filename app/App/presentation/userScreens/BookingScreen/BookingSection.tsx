import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Alert,
  Platform,
  Animated
} from "react-native";
import React, { useEffect, useState, useRef } from "react";
import moment from "moment";
import "moment/locale/es";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar } from 'react-native-calendars';
import SubHeading from "../../components/SubHeading";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../../../infrastructure/utils/Colors";
import { FIREBASE_AUTH } from "../../../infrastructure/config/FirebaseConfig";
import CaracteristicItem from "../../components/CaracteristicItem";
import { api } from "../../../infrastructure/api/api";
import { Cancha, Predio } from "../../../types/booking";
import { contactarPredio } from '../../../infrastructure/utils/whatsappUtils';

interface ExtendedPredio extends Predio {
  direccion?: string;
}

interface BookingSectionProps {
  place?: ExtendedPredio;
  preselectedDate?: string | Date;
  preselectedTime?: string;
  onCanchaSelect?: (cancha: Cancha) => void;
  onDateSelect?: (date: moment.Moment) => void;
  onTimeSelect?: (time: string) => void;
}

// Constantes para formatos de fecha y hora
const DATE_FORMATS = {
  API_DATE: 'YYYY-MM-DD',
  DISPLAY_DATE: 'dddd, D [de] MMMM',
  TIME: 'HH:mm'
};

// Utilidad para manejo de fechas y horas
const DateTimeUtils = {
  parseDate: (dateString: string | Date | null) => {
    if (!dateString) return null;
    
    // Si ya es un objeto moment válido, lo devolvemos
    if (moment.isMoment(dateString) && dateString.isValid()) {
      return dateString.local();
    }
    
    // Si es una cadena, intentamos parsearla
    try {
      const parsed = moment(dateString);
      if (parsed.isValid()) {
        return parsed.local();
      }
    } catch (error) {
      console.error('Error parseando fecha:', error);
    }
    
    return null;
  },

  parseTime: (timeString: string | null) => {
    if (!timeString) return null;
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours.padStart(2, '0')}:${minutes ? minutes.padStart(2, '0') : '00'}`;
    } catch (error) {
      console.error('Error parseando hora:', error);
      return null;
    }
  },

  calculateEndTime: (startTime: string | null) => {
    if (!startTime) return null;
    try {
      return moment(startTime, DATE_FORMATS.TIME)
        .add(1, 'hour')
        .format(DATE_FORMATS.TIME);
    } catch (error) {
      console.error('Error calculando hora fin:', error);
      return null;
    }
  },

  formatDisplayDate: (date: string | Date | moment.Moment | null) => {
    if (!date) return null;
    try {
      const momentDate = moment.isMoment(date) ? date : moment(date);
      return momentDate.isValid() ? momentDate.format(DATE_FORMATS.DISPLAY_DATE) : null;
    } catch (error) {
      console.error('Error formateando fecha para mostrar:', error);
      return null;
    }
  },

  formatApiDate: (date: string | Date | null) => {
    if (!date) return null;
    try {
      const momentDate = moment.isMoment(date) ? date : moment(date);
      return momentDate.isValid() ? momentDate.format(DATE_FORMATS.API_DATE) : null;
    } catch (error) {
      console.error('Error formateando fecha para API:', error);
      return null;
    }
  }
};

type RootStackParamList = {
  BookingDateTime: { place: ExtendedPredio };
  // ... other screens
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AVAILABLE_HOURS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00',
];

export default function BookingSection({
  place,
  preselectedDate,
  preselectedTime,
  onCanchaSelect,
  onDateSelect,
  onTimeSelect,
}: BookingSectionProps) {
  const [selectedDate, setSelectedDate] = useState<moment.Moment | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [endTime, setEndTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [canchas, setCanchas] = useState([]);
  const [selectedCancha, setSelectedCancha] = useState<Cancha | null>(null);
  const navigator = useNavigation<NavigationProp>();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  useEffect(() => {
    moment.locale("es");
    
    // Log esencial para debugging de reservas
    console.log('BookingSection - Estado inicial:', {
      fecha: preselectedDate,
      hora: preselectedTime,
      predio: {
        id: place?.id,
        nombre: place?.nombre
      }
    });

    // Manejo de la fecha
    if (preselectedDate) {
      const parsedDate = moment(preselectedDate);
      if (parsedDate.isValid()) {
        setSelectedDate(parsedDate);
        onDateSelect?.(parsedDate);
      } else {
        setSelectedDate(moment());
        onDateSelect?.(moment());
      }
    } else {
      setSelectedDate(moment());
      onDateSelect?.(moment());
    }

    // Manejo del horario
    if (preselectedTime) {
      const parsedTime = DateTimeUtils.parseTime(preselectedTime);
      if (parsedTime) {
        setSelectedTime(parsedTime);
        onTimeSelect?.(parsedTime);
        const calculatedEndTime = DateTimeUtils.calculateEndTime(parsedTime);
        setEndTime(calculatedEndTime);
      }
    }

    // Cargar canchas
    if (place?.id) {
      fetchCanchas();
    }
  }, [preselectedDate, preselectedTime, place?.id, place?.nombre]);

  // Eliminar el useEffect de validación y alerta
  useEffect(() => {
    if (!preselectedDate || !preselectedTime) {
      if (place) {
        navigator.navigate('BookingDateTime', { place });
      }
    }
  }, [preselectedDate, preselectedTime, place]);

  const fetchCanchas = async () => {
    try {
      setLoading(true);
      if (!place?.id) {
        throw new Error("ID de predio no disponible");
      }
      const response = await api.get(`/canchas/predio/${place.id}`);
      if (response.data && response.data.length > 0) {
        setCanchas(response.data);
        setSelectedCancha(response.data[0]);
        onCanchaSelect?.(response.data[0]);
        // Log relevante para debugging
        console.log('BookingSection - Cancha seleccionada:', {
          id: response.data[0].id,
          nombre: response.data[0].nombre,
          precio: response.data[0].precioPorHora
        });
      } else {
        Alert.alert("Error", "No hay canchas disponibles en este predio");
      }
    } catch (error) {
      console.error('Error al cargar canchas:', error);
      Alert.alert("Error", "No se pudieron cargar las canchas");
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onTimeSelect?.(time);
    const calculatedEndTime = DateTimeUtils.calculateEndTime(time);
    setEndTime(calculatedEndTime);
  };

  const handleDateSelect = (date: any) => {
    const selectedMoment = moment(date.dateString);
    setSelectedDate(selectedMoment);
    onDateSelect?.(selectedMoment);
  };

  const renderDateSelector = () => {
    if (preselectedDate) return null;

    const dates = Array.from({ length: 7 }, (_, index) => {
      return moment().add(index, 'days');
    });

    return (
      <View style={styles.dateSelectorContainer}>
        <SubHeading subHeadingTitle={"Seleccionar Fecha"} seelAll={false} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.dateGrid}>
            {dates.map((date) => {
              const dateStr = date.format('YYYY-MM-DD');
              const isSelected = selectedDate && selectedDate.format('YYYY-MM-DD') === dateStr;
              
              return (
                <TouchableOpacity
                  key={dateStr}
                  style={[
                    styles.dateSlot,
                    isSelected && styles.selectedDateSlot,
                  ]}
                  onPress={() => handleDateSelect({ dateString: dateStr })}
                >
                  <Text
                    style={[
                      styles.dayName,
                      isSelected && styles.selectedDateText,
                    ]}
                  >
                    {date.format('ddd')}
                  </Text>
                  <Text
                    style={[
                      styles.dayNumber,
                      isSelected && styles.selectedDateText,
                    ]}
                  >
                    {date.format('D')}
                  </Text>
                  <Text
                    style={[
                      styles.monthName,
                      isSelected && styles.selectedDateText,
                    ]}
                  >
                    {date.format('MMM')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderTimeSelector = () => {
    if (preselectedTime) return null;

    return (
      <View style={styles.timeSelectorContainer}>
        <SubHeading subHeadingTitle={"Seleccionar Horario"} seelAll={false} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.timeGrid}>
            {AVAILABLE_HOURS.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.selectedTimeSlot,
                ]}
                onPress={() => handleTimeSelect(time)}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.selectedTimeText,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderCanchaItem = ({ item }: { item: Cancha }) => {
    const isSelected = selectedCancha?.id === item.id;
    
    const handlePress = () => {
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
        })
      ]).start();

      setSelectedCancha(item);
      onCanchaSelect?.(item);
    };

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
      >
        <Animated.View
          style={[
            styles.canchaItem,
            isSelected && styles.selectedCanchaItem,
            {
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.canchaIconContainer}>
            <Ionicons 
              name={isSelected ? "football" : "football-outline"} 
              size={24} 
              color={isSelected ? 'white' : Colors.SECONDARY} 
            />
          </View>
          <Text style={[
            styles.canchaName,
            isSelected && styles.selectedCanchaText
          ]}>
            {item.nombre}
          </Text>
          <Text style={[
            styles.canchaType,
            isSelected && styles.selectedCanchaText
          ]}>
            {item.tipoSuperficie}
          </Text>
          <View style={[
            styles.priceBadge,
            isSelected && styles.selectedPriceBadge
          ]}>
            <Text style={[
              styles.priceText,
              isSelected && styles.selectedPriceText
            ]}>
              ${Number(item.precioPorHora).toLocaleString()}
            </Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  const handleWhatsApp = async () => {
    if (!place) return;
    
    console.log('BookingSection - Iniciando contacto por WhatsApp con predio');
    await contactarPredio(
      place.telefono || '',
      place.nombre || 'Predio'
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.SECONDARY} />
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
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentContainer}>
          {place?.nombre && (
            <Text style={styles.venueTitle}>{place.nombre}</Text>
          )}
          {selectedCancha && (
            <Text style={styles.courtTitle}>{selectedCancha.nombre}</Text>
          )}
          
          <SubHeading subHeadingTitle={"Seleccionar Cancha"} seelAll={false} />
          <FlatList
            data={canchas}
            renderItem={renderCanchaItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.canchasList}
          />

          {renderDateSelector()}
          {renderTimeSelector()}

          <SubHeading subHeadingTitle={"Detalles de la Reserva"} seelAll={false} />
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={24} color={Colors.SECONDARY} />
              <Text style={styles.detailText}>
                {selectedDate ? DateTimeUtils.formatDisplayDate(selectedDate) : 'Fecha no seleccionada'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={24} color={Colors.SECONDARY} />
              <Text style={styles.detailText}>
                {selectedTime && endTime ? `${selectedTime} - ${endTime}` : 'Horario no seleccionado'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={24} color={Colors.SECONDARY} />
              <Text style={styles.detailText}>{place?.direccion || 'Dirección no disponible'}</Text>
            </View>
            {selectedCancha && (
              <>
                <View style={styles.detailItem}>
                  <Ionicons name="football-outline" size={24} color={Colors.SECONDARY} />
                  <Text style={styles.detailText}> {selectedCancha.nombre}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={24} color={Colors.SECONDARY} />
                  <Text style={styles.detailText}>${Number(selectedCancha.precioPorHora).toLocaleString()} /hora</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="pricetag-outline" size={24} color={Colors.SECONDARY} />
                  <Text style={styles.detailText}>Seña: ${Number(selectedCancha.precioPorHora / 2).toLocaleString()}</Text>
                </View>
              </>
            )}
          </View>

          {selectedCancha && selectedCancha.caracteristicas && (
            <>
              <SubHeading subHeadingTitle={"Características"} seelAll={false} />
              <FlatList
                data={selectedCancha.caracteristicas || []}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => <CaracteristicItem name={item} />}
                keyExtractor={(item, index) => index.toString()}
                style={styles.caracteristicsList}
              />
            </>
          )}

          <SubHeading subHeadingTitle={"Contacto"} seelAll={false} />
          <View style={styles.contactContainer}>
            <View style={styles.phoneContainer}>
              <Ionicons name="call-outline" size={24} color={Colors.SECONDARY} />
              <Text style={styles.phoneText}>{place?.telefono || 'No disponible'}</Text>
            </View>
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={handleWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={24} color="white" />
              <Text style={styles.whatsappButtonText}>Contactar por WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentContainer: {
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
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  canchaItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 130,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedCanchaItem: {
    backgroundColor: Colors.SECONDARY,
    borderColor: Colors.SECONDARY,
  },
  canchaIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  canchaName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.PRIMARY,
    marginBottom: 2,
    textAlign: 'center',
  },
  canchaType: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
  },
  selectedCanchaText: {
    color: 'white',
  },
  priceBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  selectedPriceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  priceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.SECONDARY,
  },
  selectedPriceText: {
    color: 'white',
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
  caracteristicsList: {
    marginBottom: 16,
  },
  contactContainer: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phoneText: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.SECONDARY,
    fontWeight: '500',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  venueTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
    marginBottom: 8,
    textAlign: 'center',
  },
  courtTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.SECONDARY,
    marginBottom: 16,
    textAlign: 'center',
  },
  timeSelectorContainer: {
    marginBottom: 20,
  },
  timeGrid: {
    flexDirection: 'row',
    paddingHorizontal: 6,
  },
  timeSlot: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: Colors.PRIMARY,
  },
  timeSlotText: {
    fontSize: 16,
    color: Colors.SECONDARY,
    fontWeight: '500',
  },
  selectedTimeText: {
    color: Colors.WHITE,
  },
  dateSelectorContainer: {
    marginBottom: 20,
  },
  dateGrid: {
    flexDirection: 'row',
    paddingHorizontal: 6,
  },
  dateSlot: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedDateSlot: {
    backgroundColor: Colors.PRIMARY,
  },
  dayName: {
    fontSize: 14,
    color: Colors.SECONDARY,
    fontWeight: '500',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 20,
    color: Colors.SECONDARY,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  monthName: {
    fontSize: 14,
    color: Colors.SECONDARY,
    textTransform: 'uppercase',
  },
  selectedDateText: {
    color: Colors.WHITE,
  },
});
