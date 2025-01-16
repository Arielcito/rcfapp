import { View, Text, Pressable, StyleSheet, Modal, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../../infraestructure/utils/Colors";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Icon from "react-native-vector-icons/Ionicons";

export default function AppointmentItem({ reserva }) {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const fecha = parseISO(reserva.fechaHora);
  const hora = format(fecha, 'HH:mm', { locale: es });
  const fechaFormateada = format(fecha, 'dd/MM/yyyy', { locale: es });
  const estado = reserva.estadoPago.toLowerCase();

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
                  {format(parseISO(reserva.fechaHora), 'dd MMM yyyy HH:mm', { locale: es })}
                </Text>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Duración</Text>
                <Text style={styles.detalleValor}>{reserva.duracion} minutos</Text>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Estado de Pago</Text>
                <Text style={[
                  styles.detalleValor,
                  { color: reserva.estadoPago.toLowerCase() === 'pagado' ? '#4CAF50' : '#FFC107' }
                ]}>
                  {reserva.estadoPago}
                </Text>
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

              {reserva.notasAdicionales && (
                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleLabel}>Notas</Text>
                  <Text style={styles.detalleValor}>{reserva.notasAdicionales}</Text>
                </View>
              )}
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
            {reserva.notasAdicionales && (
              <Text style={styles.notas} numberOfLines={1}>
                {reserva.notasAdicionales}
              </Text>
            )}
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
  notas: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
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
  }
});
