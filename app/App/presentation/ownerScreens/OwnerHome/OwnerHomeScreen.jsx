import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Dimensions, Modal, TouchableOpacity, Linking, Platform } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme, VictoryContainer } from 'victory-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { reservaApi } from '../../../infraestructure/api/reserva.api';
import { format, parseISO, compareDesc, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import AsyncStorage from '@react-native-async-storage/async-storage';

const screenWidth = Dimensions.get('window').width;

const OwnerHomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [reservas, setReservas] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [userName, setUserName] = useState('');
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const ordenarReservas = (reservasArray) => {
    return [...reservasArray].sort((a, b) => 
      compareDesc(parseISO(a.fechaReserva), parseISO(b.fechaReserva))
    );
  };

  const generarDatosGrafico = (reservas) => {
    const hoy = new Date();
    const labels = Array.from({ length: 7 }, (_, i) => {
      return format(subDays(hoy, 6 - i), 'EEE', { locale: es });
    });

    const datos = Array(7).fill(0);
    for (const reserva of reservas) {
      const fechaReserva = parseISO(reserva.fechaHora);
      const diasAtras = Math.floor((hoy - fechaReserva) / (1000 * 60 * 60 * 24));
      if (diasAtras >= 0 && diasAtras < 7) {
        datos[6 - diasAtras]++;
      }
    }

    return labels.map((label, index) => ({
      x: label,
      y: datos[index]
    }));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const storedName = await AsyncStorage.getItem('userName');
      setUserName(storedName || '');

      const response = await reservaApi.obtenerTodasReservas();
      const todasLasReservas = response.data || response;
      const reservasOrdenadas = ordenarReservas(todasLasReservas);
      
      setReservas(reservasOrdenadas);
      setChartData(generarDatosGrafico(reservasOrdenadas));
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setLoading(false);
    }
  };

  const handleContactar = (tipo, valor) => {
    if (tipo === 'telefono') {
      const phoneNumber = Platform.OS === 'android' ? `tel:${valor}` : `telprompt:${valor}`;
      Linking.openURL(phoneNumber);
    } else if (tipo === 'email') {
      Linking.openURL(`mailto:${valor}`);
    }
  };

  const renderDetalleReserva = () => {
    if (!selectedReserva) return null;

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
                  {format(parseISO(selectedReserva.fechaHora), 'dd MMM yyyy HH:mm', { locale: es })}
                </Text>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Duración</Text>
                <Text style={styles.detalleValor}>{selectedReserva.duracion} minutos</Text>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Estado de Pago</Text>
                <Text style={[
                  styles.detalleValor,
                  { color: selectedReserva.estadoPago.toLowerCase() === 'pagado' ? '#4CAF50' : '#FFC107' }
                ]}>
                  {selectedReserva.estadoPago}
                </Text>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Método de Pago</Text>
                <Text style={styles.detalleValor}>{selectedReserva.metodoPago || 'No especificado'}</Text>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Precio</Text>
                <Text style={styles.detallePrecio}>
                  ${Number(selectedReserva.precioTotal).toLocaleString()}
                </Text>
              </View>

              <View style={styles.separador} />

              {selectedReserva.notasAdicionales && (
                <View style={styles.detalleSeccion}>
                  <Text style={styles.detalleLabel}>Notas</Text>
                  <Text style={styles.detalleValor}>{selectedReserva.notasAdicionales}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderProximasReservas = () => {
    if (!Array.isArray(reservas) || reservas.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No hay reservas próximas</Text>
        </View>
      );
    }

    // Mostrar solo las próximas 5 reservas
    const proximasReservas = reservas.slice(0, 5);

    return proximasReservas.map((reserva) => (
      <TouchableOpacity
        key={reserva.id}
        style={styles.reservaCard}
        onPress={() => {
          setSelectedReserva(reserva);
          setModalVisible(true);
        }}
      >
        <View style={styles.reservaInfo}>
          <Text style={styles.reservaFecha}>
            {format(parseISO(reserva.fechaHora), 'dd MMM yyyy HH:mm', { locale: es })}
          </Text>
          <View style={styles.reservaDetalles}>
            <Text style={styles.reservaDuracion}>Duración: {reserva.duracion} min</Text>
            <Text style={styles.reservaPrecio}>
              ${Number(reserva.precioTotal).toLocaleString()}
            </Text>
          </View>
          <Text style={[
            styles.reservaEstado,
            { color: reserva.estadoPago.toLowerCase() === 'pagado' ? '#4CAF50' : '#FFC107' }
          ]}>
            {reserva.estadoPago}
          </Text>
        </View>
        <Icon name="chevron-forward" size={24} color="#888" />
      </TouchableOpacity>
    ));
  };

  if (loading || !chartData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1AFF92" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.profilePic} />
          <Text style={styles.greeting}>¡Hola{userName ? `, ${userName}` : ''}!</Text>
          <Icon name="menu" size={24} color="#000" style={styles.menuIcon} />
        </View>
        <Text style={styles.subGreeting}>Mira tus reservas de hoy</Text>
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Canchas reservadas</Text>
          <Text style={styles.chartSubtitle}>Última semana</Text>
          <VictoryChart
            theme={VictoryTheme.material}
            height={220}
            width={screenWidth - 60}
            padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
            containerComponent={<VictoryContainer responsive={true} />}
          >
            <VictoryAxis
              tickFormat={(t) => t}
              style={{
                axis: { stroke: '#e3e3e3' },
                tickLabels: { fontSize: 10, fill: '#888' }
              }}
            />
            <VictoryAxis
              dependentAxis
              tickFormat={(t) => Math.round(t)}
              style={{
                axis: { stroke: '#e3e3e3' },
                tickLabels: { fontSize: 10, fill: '#888' }
              }}
            />
            <VictoryLine
              data={chartData}
              style={{
                data: { stroke: '#1AFF92', strokeWidth: 2 },
              }}
              animate={{
                duration: 2000,
                onLoad: { duration: 1000 }
              }}
            />
          </VictoryChart>
          <Text style={styles.chartFooter}>
            {chartData.reduce((a, b) => a + b.y, 0)} canchas reservadas en total
          </Text>
        </View>

        <View style={styles.proximasReservasContainer}>
          <View style={styles.proximasReservasHeader}>
            <Text style={styles.proximasReservasTitle}>Últimas Reservas</Text>
            <Text style={styles.proximasReservasCount}>
              Mostrando 5 de {reservas.length}
            </Text>
          </View>
          {renderProximasReservas()}
        </View>
      </ScrollView>
      {renderDetalleReserva()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  menuIcon: {
    marginLeft: 'auto',
  },
  subGreeting: {
    fontSize: 16,
    marginTop: 15,
    marginLeft: 20,
    color: '#666',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartFooter: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
    fontSize: 14,
  },
  proximasReservasContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  proximasReservasTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  reservaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 10,
  },
  reservaInfo: {
    flex: 1,
  },
  reservaFecha: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  reservaDetalles: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  reservaDuracion: {
    fontSize: 14,
    color: '#666',
  },
  reservaPrecio: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  reservaEstado: {
    fontSize: 13,
    marginTop: 5,
    fontWeight: '500',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888',
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
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  proximasReservasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  proximasReservasCount: {
    fontSize: 14,
    color: '#666',
  },
});

export default OwnerHomeScreen;