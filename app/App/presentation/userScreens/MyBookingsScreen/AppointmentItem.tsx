import { View, Text, Pressable, StyleSheet, Modal, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Colors from "../../../infraestructure/utils/Colors";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Icon from "react-native-vector-icons/Ionicons";
import { getProfileInfo } from "../../../infraestructure/api/user.api";
import { reservaApi } from "../../../infraestructure/api/reserva.api";
import { BookingResponse } from "../../../types/booking";

type RootStackParamList = {
  myBookingDescription: {
    place: BookingResponse;
  };
};

type AppointmentItemNavigationProp = NativeStackNavigationProp<RootStackParamList, 'myBookingDescription'>;

interface AppointmentItemProps {
  reserva: BookingResponse;
  onUpdate: () => void;
}

interface UserData {
  name?: string;
  email?: string;
  telefono?: string;
}

export default function AppointmentItem({ reserva, onUpdate }: AppointmentItemProps) {
  const navigation = useNavigation<AppointmentItemNavigationProp>();
  const [modalVisible, setModalVisible] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Combinar fecha y hora para parsear
  console.log('🎫 [AppointmentItem] Renderizando con reserva:', JSON.stringify(reserva, null, 2));
  const fechaHora = `${reserva.appointmentDate}T${reserva.appointmentTime}`;
  const fecha = parseISO(fechaHora);
  const hora = format(fecha, 'HH:mm', { locale: es });
  const fechaFormateada = format(fecha, 'dd/MM/yyyy', { locale: es });
  const estado = reserva.estado.toLowerCase();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoadingUser(true);
        // Since userId is not available in BookingResponse, we'll skip fetching user data
        setUserData(null);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await reservaApi.actualizarReserva(reserva.appointmentId, {
        estadoPago: newStatus
      });
      
      if (onUpdate) {
        onUpdate();
      }
      
      Alert.alert(
        'Éxito',
        `Estado de pago actualizado a ${newStatus}`,
        [{ text: 'OK', onPress: () => setModalVisible(false) }]
      );
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      Alert.alert(
        'Error',
        'No se pudo actualizar el estado de pago'
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleWhatsApp = () => {
    const message = `Hola! Tengo una reserva en "${reserva.place.name}" para el ${fechaFormateada} a las ${hora}. Me gustaría consultar algunos detalles.`;
    const phoneNumber = reserva.place.telefono.replace(/\D/g, '');
    
    // Aseguramos que el número tenga el formato correcto
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

  const renderDetalleReserva = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles de la Reserva</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Fecha y Hora</Text>
                <Text style={styles.detalleValor}>
                  {format(fecha, 'dd MMM yyyy HH:mm', { locale: es })}
                </Text>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Duración</Text>
                <Text style={styles.detalleValor}>{reserva.duracion} minutos</Text>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Estado de Pago</Text>
                <View style={styles.statusContainer}>
                  <Text style={[
                    styles.detalleValor,
                    { color: reserva.estado.toLowerCase() === 'pagado' ? '#4CAF50' : '#FFC107' }
                  ]}>
                    {reserva.estado}
                  </Text>
                  <View style={styles.statusButtons}>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        reserva.estado.toLowerCase() === 'pagado' && styles.statusButtonActive
                      ]}
                      onPress={() => handleUpdateStatus('PAGADO')}
                      disabled={updatingStatus || reserva.estado.toLowerCase() === 'pagado'}
                    >
                      <Text style={[
                        styles.statusButtonText,
                        reserva.estado.toLowerCase() === 'pagado' && styles.statusButtonTextActive
                      ]}>Pagado</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.statusButton,
                        reserva.estado.toLowerCase() === 'pendiente' && styles.statusButtonActive
                      ]}
                      onPress={() => handleUpdateStatus('PENDIENTE')}
                      disabled={updatingStatus || reserva.estado.toLowerCase() === 'pendiente'}
                    >
                      <Text style={[
                        styles.statusButtonText,
                        reserva.estado.toLowerCase() === 'pendiente' && styles.statusButtonTextActive
                      ]}>Pendiente</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Método de Pago</Text>
                <Text style={styles.detalleValor}>{reserva.metodoPago || 'No especificado'}</Text>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Precio</Text>
                <Text style={styles.detallePrecio}>
                  ${Number(reserva.precioTotal).toLocaleString()}
                </Text>
              </View>

              <View style={styles.separador} />

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Información del Usuario</Text>
                {loadingUser ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Cargando información del usuario...</Text>
                  </View>
                ) : userData ? (
                  <View style={styles.userInfoContainer}>
                    <View style={styles.userInfoItem}>
                      <Icon name="person-outline" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.userInfoText}>
                        {userData.name || 'No disponible'}
                      </Text>
                    </View>
                    <View style={styles.userInfoItem}>
                      <Icon name="mail-outline" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.userInfoText}>
                        {userData.email || 'No disponible'}
                      </Text>
                    </View>
                    <View style={styles.userInfoItem}>
                      <Icon name="call-outline" size={20} color={Colors.PRIMARY} />
                      <Text style={styles.userInfoText}>
                        {userData.telefono || 'No disponible'}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>No se pudo cargar la información del usuario</Text>
                  </View>
                )}
              </View>

              <View style={styles.separador} />

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Contacto del Predio</Text>
                <View style={styles.contactContainer}>
                  <View style={styles.phoneContainer}>
                    <Icon name="call-outline" size={20} color={Colors.PRIMARY} />
                    <Text style={styles.phoneText}>
                      {reserva.place.telefono || 'No disponible'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={handleWhatsApp}
                  >
                    <Icon name="logo-whatsapp" size={20} color="white" />
                    <Text style={styles.whatsappButtonText}>
                      Contactar por WhatsApp
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <>
      <Pressable
        style={styles.container}
        onPress={() => setModalVisible(true)}
      >
        <View style={styles.infoContainer}>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{hora}</Text>
            <Text style={styles.date}>{fechaFormateada}</Text>
          </View>
          <View style={styles.details}>
            <Text style={styles.duracion}>{reserva.duracion} minutos</Text>
            <Text style={styles.metodoPago}>{reserva.metodoPago || 'No especificado'}</Text>
          </View>
          <View style={styles.statusContainer}>
            <Text style={[
              styles.status,
              { color: estado === 'pagado' ? Colors.PRIMARY : 'red' }
            ]}>
              {estado}
            </Text>
            <Text style={styles.precio}>$ {Number(reserva.precioTotal).toLocaleString()}</Text>
          </View>
        </View>
      </Pressable>
      {renderDetalleReserva()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeContainer: {
    backgroundColor: Colors.BLUE,
    padding: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  time: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
  details: {
    flex: 1,
    marginLeft: 15,
  },
  duracion: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metodoPago: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
    minWidth: 100,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  precio: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  detalleSeccion: {
    marginBottom: 15,
  },
  detalleLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  detalleValor: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  detallePrecio: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  separador: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  contactContainer: {
    marginTop: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phoneText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.PRIMARY,
    fontWeight: '500',
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
  },
  whatsappButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  userInfoContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  userInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  loadingContainer: {
    padding: 12,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: '#fff3f3',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusButtonActive: {
    backgroundColor: Colors.PRIMARY,
    borderColor: Colors.PRIMARY,
  },
  statusButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
});
