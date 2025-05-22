import { View, Text, Pressable, StyleSheet, Modal, ScrollView, TouchableOpacity, Linking, Alert } from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Colors from "../../../infrastructure/utils/Colors";
import { format, parseISO, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import Icon from "react-native-vector-icons/Ionicons";
import { getProfileInfo } from "../../../infrastructure/api/user.api";
import { reservaApi } from "../../../infrastructure/api/reserva.api";
import { BookingResponse } from "../../../types/booking";
import { useCurrentUser } from "../../../application/context/CurrentUserContext";
import { useUser } from "../../../application/hooks/useUser";
import { useCancha } from "../../../application/hooks/useCancha";
import { useMutation, useQueryClient } from '@tanstack/react-query';

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

export default function AppointmentItem({ reserva, onUpdate }: AppointmentItemProps) {
  const navigation = useNavigation<AppointmentItemNavigationProp>();
  const { currentUser } = useCurrentUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const queryClient = useQueryClient();
  
  // Usar los hooks para obtener la información del usuario y la cancha
  const { data: userData, isLoading: loadingUser } = useUser(reserva.userId);
  const { data: canchaData, isLoading: loadingCancha } = useCancha(reserva.canchaId);

  // Mutation para actualizar el estado de la reserva
  const updateReservaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      return await reservaApi.actualizarReserva(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      if (onUpdate) {
        onUpdate();
      }
    },
  });

  // Combinar fecha y hora para parsear
  const fechaHora = `${reserva.appointmentDate}T${reserva.appointmentTime}`;
  const fecha = parseISO(fechaHora);
  const hora = format(fecha, 'HH:mm', { locale: es });
  const fechaFormateada = format(fecha, 'dd/MM/yyyy', { locale: es });
  const estado = reserva.estado.toLowerCase();
  const isPastReservation = isPast(fecha);
  const canRate = isPastReservation && estado === 'PAGADO';
  // Verificar si el usuario actual es el propietario del predio o el creador de la reserva
  const canEditStatus = currentUser?.role === 'OWNER' ;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pagado':
        return { bg: '#E8F5E9', text: '#2E7D32' };
      case 'pendiente':
        return { bg: '#FFF3E0', text: '#E65100' };
      case 'cancelado':
        return { bg: '#FFEBEE', text: '#C62828' };
      default:
        return { bg: '#F5F5F5', text: '#616161' };
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await updateReservaMutation.mutateAsync({
        id: reserva.appointmentId,
        data: { estadoPago: newStatus }
      });
      
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

  const handleCancelReserva = async () => {
    Alert.alert(
      'Cancelar Reserva',
      '¿Estás seguro que deseas cancelar esta reserva?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateReservaMutation.mutateAsync({
                id: reserva.appointmentId,
                data: { estado: 'CANCELADO' }
              });
              
              Alert.alert(
                'Éxito',
                'Reserva cancelada exitosamente',
                [{ text: 'OK', onPress: () => setModalVisible(false) }]
              );
            } catch (error) {
              console.error('Error al cancelar reserva:', error);
              Alert.alert(
                'Error',
                'No se pudo cancelar la reserva'
              );
            }
          }
        }
      ]
    );
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

  const handleRatePredio = () => {
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    try {
      // Simulación de envío de calificación
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay
      
      setHasRated(true);
      Alert.alert(
        '¡Gracias por tu opinión!',
        'Tu calificación ayuda a otros usuarios a conocer mejor este predio.',
        [{ text: 'OK', onPress: () => setShowRatingModal(false) }]
      );
    } catch (error) {
      console.error('Error al enviar calificación:', error);
      Alert.alert(
        'Error',
        'No se pudo enviar la calificación. Por favor, intenta nuevamente.'
      );
    }
  };

  const renderDetalleReserva = () => {
    const statusColors = getStatusColor(estado);
    
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
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={[styles.statusBanner, { backgroundColor: statusColors.bg }]}>
                <Icon 
                  name={estado === 'PAGADO' ? "checkmark-circle" : estado === 'CANCELADO' ? "close-circle" : "time"} 
                  size={24} 
                  color={statusColors.text} 
                />
                <Text style={[styles.statusBannerText, { color: statusColors.text }]}>
                  {estado === 'PAGADO' ? 'Reserva Confirmada' : 
                   estado === 'CANCELADO' ? 'Reserva Cancelada' : 
                   'Pendiente de Pago'}
                </Text>
                {canEditStatus && (
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
                )}
              </View>

              <View style={styles.reservationCard}>
                <View style={styles.reservationHeader}>
                  <Icon name="calendar" size={24} color={Colors.PRIMARY} />
                  <Text style={styles.reservationTitle}>Información de la Reserva</Text>
                </View>

                <View style={styles.reservationDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="time-outline" size={20} color={Colors.PRIMARY} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Fecha y Hora</Text>
                      <Text style={styles.detailValue}>
                        {format(fecha, 'dd MMM yyyy HH:mm', { locale: es })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="hourglass-outline" size={20} color={Colors.PRIMARY} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Duración</Text>
                      <Text style={styles.detailValue}>{reserva.duracion} minutos</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="card-outline" size={20} color={Colors.PRIMARY} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Método de Pago</Text>
                      <Text style={styles.detailValue}>{reserva.metodoPago || 'No especificado'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="cash-outline" size={20} color={Colors.PRIMARY} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Precio Total</Text>
                      <Text style={styles.detailPrice}>
                        ${Number(reserva.precioTotal).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <View style={styles.reservationCard}>
                <View style={styles.reservationHeader}>
                  <Icon name="person-circle-outline" size={24} color={Colors.PRIMARY} />
                  <Text style={styles.reservationTitle}>Información del Usuario</Text>
                </View>

                {loadingUser ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Cargando información del usuario...</Text>
                  </View>
                ) : userData ? (
                  <View style={styles.reservationDetails}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="person-outline" size={20} color={Colors.PRIMARY} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Nombre</Text>
                        <Text style={styles.detailValue}>
                          {userData.name || 'No disponible'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="mail-outline" size={20} color={Colors.PRIMARY} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Email</Text>
                        <Text style={styles.detailValue}>
                          {userData.email || 'No disponible'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="call-outline" size={20} color={Colors.PRIMARY} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Teléfono</Text>
                        <Text style={styles.detailValue}>
                          {userData.telefono || 'No disponible'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={24} color="#ff4444" />
                    <Text style={styles.errorText}>No se pudo cargar la información del usuario</Text>
                  </View>
                )}
              </View>

              <View style={styles.reservationCard}>
                <View style={styles.reservationHeader}>
                  <Icon name="football-outline" size={24} color={Colors.PRIMARY} />
                  <Text style={styles.reservationTitle}>Información de la Cancha</Text>
                </View>

                {loadingCancha ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Cargando información de la cancha...</Text>
                  </View>
                ) : canchaData ? (
                  <View style={styles.reservationDetails}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="football-outline" size={20} color={Colors.PRIMARY} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Nombre de la Cancha</Text>
                        <Text style={styles.detailValue}>
                          {canchaData?.nombre || reserva.place.name || 'Sin nombre'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="information-circle-outline" size={20} color={Colors.PRIMARY} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Características</Text>
                        <View style={styles.featuresContainer}>
                          {canchaData?.esTechada && (
                            <View style={styles.featureTag}>
                              <Icon name="umbrella-outline" size={16} color={Colors.PRIMARY} />
                              <Text style={styles.featureText}>Techada</Text>
                            </View>
                          )}
                          {canchaData?.tieneIluminacion && (
                            <View style={styles.featureTag}>
                              <Icon name="bulb-outline" size={16} color={Colors.PRIMARY} />
                              <Text style={styles.featureText}>Iluminación</Text>
                            </View>
                          )}
                          {canchaData?.tipo && (
                            <View style={styles.featureTag}>
                              <Icon name="football-outline" size={16} color={Colors.PRIMARY} />
                              <Text style={styles.featureText}>{canchaData.tipo}</Text>
                            </View>
                          )}
                          {canchaData?.tipoSuperficie && (
                            <View style={styles.featureTag}>
                              <Icon name="layers-outline" size={16} color={Colors.PRIMARY} />
                              <Text style={styles.featureText}>{canchaData.tipoSuperficie}</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="cash-outline" size={20} color={Colors.PRIMARY} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Precios</Text>
                        <View style={styles.pricesContainer}>
                          <Text style={styles.detailValue}>
                            ${Number(canchaData?.precioPorHora).toLocaleString()} por hora
                          </Text>
                          {canchaData?.requiereSeña && (
                            <Text style={styles.detailValue}>
                              Seña: ${canchaData.montoSeña.toLocaleString()}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="business-outline" size={20} color={Colors.PRIMARY} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Predio</Text>
                        <Text style={styles.detailValue}>
                          {canchaData?.predio?.nombre || 'Predio no disponible'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <View style={styles.detailIconContainer}>
                        <Icon name="location-outline" size={20} color={Colors.PRIMARY} />
                      </View>
                      <View style={styles.detailContent}>
                        <Text style={styles.detailLabel}>Dirección</Text>
                        <Text style={styles.detailValue}>
                          {canchaData?.predio?.direccion || 'Dirección no disponible'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle-outline" size={24} color="#ff4444" />
                    <Text style={styles.errorText}>No se pudo cargar la información de la cancha</Text>
                  </View>
                )}
              </View>

              <View style={styles.reservationCard}>
                <View style={styles.reservationHeader}>
                  <Icon name="call-outline" size={24} color={Colors.PRIMARY} />
                  <Text style={styles.reservationTitle}>Contacto del Predio</Text>
                </View>

                <View style={styles.reservationDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <Icon name="call-outline" size={20} color={Colors.PRIMARY} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Teléfono</Text>
                      <Text style={styles.detailValue}>
                        {canchaData?.predio?.telefono || reserva.place.telefono || 'No disponible'}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.whatsappButton}
                    onPress={handleWhatsApp}
                    activeOpacity={0.7}
                  >
                    <Icon name="logo-whatsapp" size={20} color="white" />
                    <Text style={styles.whatsappButtonText}>
                      Contactar por WhatsApp
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {canRate && !hasRated && (
                <TouchableOpacity
                  style={styles.rateButton}
                  onPress={handleRatePredio}
                  activeOpacity={0.7}
                >
                  <Icon name="star-outline" size={20} color="#333" />
                  <Text style={styles.rateButtonText}>
                    Calificar tu experiencia
                  </Text>
                </TouchableOpacity>
              )}

              {hasRated && (
                <View style={styles.ratedContainer}>
                  <Icon name="checkmark-circle" size={24} color="#4CAF50" />
                  <Text style={styles.ratedText}>¡Gracias por calificar!</Text>
                </View>
              )}

              {reserva.estado.toLowerCase() !== 'cancelado' && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleCancelReserva}
                  activeOpacity={0.7}
                >
                  <Icon name="close-circle-outline" size={20} color="white" />
                  <Text style={styles.cancelButtonText}>
                    Cancelar Reserva
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderRatingModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRatingModal}
        onRequestClose={() => setShowRatingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Calificar Predio</Text>
              <TouchableOpacity 
                onPress={() => setShowRatingModal(false)}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.ratingContainer}>
              <Text style={styles.ratingTitle}>¿Cómo fue tu experiencia?</Text>
              <Text style={styles.ratingSubtitle}>
                Tu opinión ayuda a otros usuarios a elegir el mejor lugar
              </Text>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Icon
                      name={star <= rating ? "star" : "star-outline"}
                      size={40}
                      color={star <= rating ? "#FFD700" : "#ccc"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingLabel}>
                {rating === 1 ? 'Muy mala' :
                 rating === 2 ? 'Mala' :
                 rating === 3 ? 'Regular' :
                 rating === 4 ? 'Buena' :
                 rating === 5 ? 'Excelente' : 'Selecciona una calificación'}
              </Text>
              <TouchableOpacity
                style={[styles.submitRatingButton, !rating && styles.submitRatingButtonDisabled]}
                onPress={handleSubmitRating}
                disabled={!rating}
                activeOpacity={0.7}
              >
                <Text style={styles.submitRatingButtonText}>Enviar Calificación</Text>
              </TouchableOpacity>
            </View>
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
              { 
                backgroundColor: estado === 'pagado' ? '#E8F5E9' : '#FFEBEE',
                color: estado === 'pagado' ? '#2E7D32' : '#C62828'
              }
            ]}>
              {estado}
            </Text>
            <Text style={styles.precio}>$ {Number(reserva.precioTotal).toLocaleString()}</Text>
          </View>
        </View>
      </Pressable>
      {renderDetalleReserva()}
      {renderRatingModal()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  timeContainer: {
    backgroundColor: Colors.BLUE,
    padding: 10,
    borderRadius: 10,
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    color: '#fff',
    fontSize: 13,
    marginTop: 4,
    opacity: 0.9,
  },
  details: {
    flex: 1,
    marginLeft: 8,
    gap: 6,
  },
  duracion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  metodoPago: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    alignItems: 'flex-end',
    minWidth: 100,
    gap: 6,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
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
    paddingBottom: 40,
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
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fff3f3',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#ff4444',
    flex: 1,
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    width: '100%',
    justifyContent: 'center',
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  statusButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  canchaInfoContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  canchaInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  canchaInfoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#DC3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  ratingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  ratingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 30,
  },
  submitRatingButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  submitRatingButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitRatingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rateButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  rateButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginBottom: 20,
    borderRadius: 8,
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBannerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  ratedText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '600',
  },
  ratingSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 20,
  },
  reservationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reservationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  reservationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  reservationDetails: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  detailPrice: {
    fontSize: 18,
    color: Colors.PRIMARY,
    fontWeight: '600',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  featureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  featureText: {
    fontSize: 12,
    color: Colors.PRIMARY,
    fontWeight: '500',
  },
  pricesContainer: {
    gap: 4,
  },
});
