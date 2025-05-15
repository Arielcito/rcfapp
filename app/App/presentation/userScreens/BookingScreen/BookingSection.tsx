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
  Linking,
  Platform
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
import { Cancha, Predio } from "../../../types/booking";

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
  const navigator = useNavigation();

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

  const renderCanchaItem = ({ item }: { item: Cancha }) => (
    <TouchableOpacity
      style={[
        styles.canchaItem,
        selectedCancha?.id === item.id && styles.selectedCanchaItem,
      ]}
      onPress={() => {
        setSelectedCancha(item);
        onCanchaSelect?.(item);
      }}
    >
      <Text style={styles.canchaText}>Cancha {item.numero}</Text>
      <Text style={styles.canchaDetail}>{item.nombre}</Text>
      <Text style={styles.canchaDetail}>{item.tipo_superficie}</Text>
    </TouchableOpacity>
  );

  const handleWhatsApp = () => {
    if (!place) return;
    
    const message = `Hola! Vi tu predio "${place.nombre}" en RCF App y me gustaría obtener más información.`;
    const phoneNumber = place.telefono?.replace(/\D/g, '') || '';
    
    // Aseguramos que el número tenga el formato correcto (54 + número sin el 0 ni el 15)
    const formattedNumber = phoneNumber.startsWith('54') ? phoneNumber : `54${phoneNumber}`;
    
    const url = `whatsapp://send?phone=${formattedNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          Alert.alert(
            'Error',
            'WhatsApp no está instalado en este dispositivo'
          );
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => {
        console.error('Error al abrir WhatsApp:', err);
        Alert.alert('Error', 'No se pudo abrir WhatsApp');
      });
  };

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
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentContainer}>
          <SubHeading subHeadingTitle={"Seleccionar Cancha"} seelAll={false} />
          <FlatList
            data={canchas}
            renderItem={renderCanchaItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.canchasList}
          />

          <SubHeading subHeadingTitle={"Detalles de la Reserva"} seelAll={false} />
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={24} color={Colors.PRIMARY} />
              <Text style={styles.detailText}>
                {selectedDate ? DateTimeUtils.formatDisplayDate(selectedDate) : 'Fecha no seleccionada'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={24} color={Colors.PRIMARY} />
              <Text style={styles.detailText}>
                {selectedTime && endTime ? `${selectedTime} - ${endTime}` : 'Horario no seleccionado'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={24} color={Colors.PRIMARY} />
              <Text style={styles.detailText}>{place?.direccion || 'Dirección no disponible'}</Text>
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
              <Ionicons name="call-outline" size={24} color={Colors.PRIMARY} />
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
    marginBottom: 16,
  },
  canchaItem: {
    backgroundColor: '#E8F0FE',
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
    color: '#1E3A8A',
  },
  canchaDetail: {
    fontSize: 14,
    color: '#4B5563',
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
    color: Colors.PRIMARY,
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
});
