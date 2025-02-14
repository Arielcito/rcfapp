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

// Constantes para formatos de fecha y hora
const DATE_FORMATS = {
  API_DATE: 'YYYY-MM-DD',
  DISPLAY_DATE: 'dddd, D [de] MMMM',
  TIME: 'HH:mm'
};

// Utilidad para manejo de fechas y horas
const DateTimeUtils = {
  parseDate: (dateString) => {
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

  parseTime: (timeString) => {
    if (!timeString) return null;
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours.padStart(2, '0')}:${minutes ? minutes.padStart(2, '0') : '00'}`;
    } catch (error) {
      console.error('Error parseando hora:', error);
      return null;
    }
  },

  calculateEndTime: (startTime) => {
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

  formatDisplayDate: (date) => {
    if (!date) return null;
    try {
      const momentDate = moment.isMoment(date) ? date : moment(date);
      return momentDate.isValid() ? momentDate.format(DATE_FORMATS.DISPLAY_DATE) : null;
    } catch (error) {
      console.error('Error formateando fecha para mostrar:', error);
      return null;
    }
  },

  formatApiDate: (date) => {
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
}) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [canchas, setCanchas] = useState([]);
  const [selectedCancha, setSelectedCancha] = useState(null);
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
      } else {
        setSelectedDate(moment());
      }
    } else {
      setSelectedDate(moment());
    }

    // Manejo del horario
    if (preselectedTime) {
      const parsedTime = DateTimeUtils.parseTime(preselectedTime);
      if (parsedTime) {
        setSelectedTime(parsedTime);
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
      const response = await api.get(`/canchas/predio/${place.id}`);
      if (response.data && response.data.length > 0) {
        setCanchas(response.data);
        setSelectedCancha(response.data[0]);
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

  const handleWhatsApp = () => {
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

          <SubHeading subHeadingTitle={"Contacto"} seeAll={false} />
          <View style={styles.contactContainer}>
            <View style={styles.phoneContainer}>
              <Ionicons name="call-outline" size={24} color={Colors.PRIMARY} />
              <Text style={styles.phoneText}>{place.telefono || 'No disponible'}</Text>
            </View>
            <TouchableOpacity
              style={styles.whatsappButton}
              onPress={handleWhatsApp}
            >
              <Ionicons name="logo-whatsapp" size={24} color="white" />
              <Text style={styles.whatsappButtonText}>Contactar por WhatsApp</Text>
            </TouchableOpacity>
          </View>

          <SubHeading subHeadingTitle={"Notas"} seeAll={false} />
          <TextInput
            numberOfLines={3}
            onChangeText={(value) => setNotes(value)}
            style={styles.notesInput}
            placeholder="Algo que quieras agregar..."
          />
        </View>
        <View style={styles.bottomSpacing} />
      </ScrollView>

      <View style={styles.stickyButtonContainer}>
        <TouchableOpacity
          onPress={() => {
            // Log para debugging de navegación
            console.log('BookingSection - Navegando a perfil:', {
              fecha: selectedDate?.format('YYYY-MM-DD'),
              hora: selectedTime,
              cancha: selectedCancha?.id
            });
            navigator.navigate("pitch-profile", {
              place: place,
              selectedDate: selectedDate,
              selectedTime: selectedTime,
              selectedCancha: selectedCancha
            });
          }}
          disabled={!selectedCancha || loading}
          style={[styles.viewProfileButton, !selectedCancha && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>Ver Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            // Log para debugging de pago
            console.log('BookingSection - Iniciando pago:', {
              fecha: selectedDate?.format('YYYY-MM-DD'),
              hora: selectedTime,
              cancha: selectedCancha?.id,
              precio: selectedCancha?.precioPorHora
            });
            navigator.navigate("payment", {
              appointmentData: { place, cancha: selectedCancha },
              selectedDate: selectedDate,
              selectedTime: selectedTime,
            });
          }}
          disabled={!selectedCancha || loading}
          style={[styles.reserveButton, !selectedCancha && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>Reservar</Text>
        </TouchableOpacity>
      </View>
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
  notesInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  bottomSpacing: {
    height: Platform.OS === 'ios' ? 120 : 100,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: 'white',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 1000,
  },
  viewProfileButton: {
    backgroundColor: Colors.GRAY,
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  reserveButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
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
