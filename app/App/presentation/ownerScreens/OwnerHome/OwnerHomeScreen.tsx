import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Dimensions, Modal, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTheme, VictoryContainer } from 'victory-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { reservaApi } from '../../../infraestructure/api/reserva.api';
import { format, parseISO, compareDesc, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking } from '../../../types/booking';
import { ChartDataPoint, ReservaResponse, ContactInfo, OwnerHomeScreenState } from '../../../types/owner';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { logger } from '../../../infraestructure/utils/logger';
import AppointmentItem from '../OwnerAppointment/AppointmentItem';
import {Colors} from '../../../infraestructure/utils/Colors';

const COMPONENT_NAME = 'OwnerHomeScreen';
const screenWidth = Dimensions.get('window').width;

// Función auxiliar para logging
const logError = (error: any, context: string) => {
  logger.error(COMPONENT_NAME, `Error en ${context}`, { error });
  if (__DEV__) {
    console.error(`Error en ${context}:`, error);
  }
};

const OwnerHomeContent = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reservas, setReservas] = useState<Booking[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[] | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [selectedReserva, setSelectedReserva] = useState<Booking | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<'week' | 'month' | '3months'>('week');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);

  const ordenarReservas = (reservasArray: Booking[]): Booking[] => {
    if (!Array.isArray(reservasArray)) {
      logError('reservasArray no es un array', 'ordenarReservas');
      return [];
    }
    try {
      logger.debug(COMPONENT_NAME, 'Ordenando reservas', { reservasArray });
      const sorted = [...reservasArray].sort((a, b) => {
        try {
          const dateFieldA = a.fechaHora;
          const dateFieldB = b.fechaHora;
          
          if (!dateFieldA || !dateFieldB) {
            logger.warn(COMPONENT_NAME, 'Fechas faltantes en reservas', { a, b });
            return 0;
          }
          return compareDesc(parseISO(dateFieldA), parseISO(dateFieldB));
        } catch (error) {
          logError(error, 'ordenarReservas');
          return 0;
        }
      });
      logger.info(COMPONENT_NAME, 'Reservas ordenadas exitosamente', { count: sorted.length });
      return sorted;
    } catch (error) {
      logError(error, 'ordenarReservas');
      return [];
    }
  };

  const generarDatosGrafico = (reservas: Booking[]): ChartDataPoint[] => {
    if (!Array.isArray(reservas)) {
      logError('reservas no es un array', 'generarDatosGrafico');
      return [];
    }
    
    try {
      logger.debug(COMPONENT_NAME, 'Generando datos para gráfico', { reservas });
      const hoy = new Date();
      const daysToShow = dateFilter === 'week' ? 7 : dateFilter === 'month' ? 30 : 90;
      const labels = Array.from({ length: daysToShow }, (_, i) => {
        const date = subDays(hoy, daysToShow - 1 - i);
        return format(date, 'd', { locale: es });
      });

      const datos = Array(daysToShow).fill(0);
      for (const reserva of reservas) {
        try {
          if (!reserva.fechaHora) {
            logger.warn(COMPONENT_NAME, 'Reserva sin fecha', { reserva });
            continue;
          }

          // Apply payment filter
          if (paymentFilter !== 'all') {
            const isPaid = reserva.estadoPago?.toLowerCase() === 'pagado';
            if ((paymentFilter === 'paid' && !isPaid) || (paymentFilter === 'pending' && isPaid)) {
              continue;
            }
          }

          const fechaReserva = parseISO(reserva.fechaHora);
          
          if (!Number.isFinite(fechaReserva.getTime())) {
            logger.warn(COMPONENT_NAME, 'Fecha inválida en reserva', { reserva });
            continue;
          }
          
          const diasAtras = Math.floor((hoy.getTime() - fechaReserva.getTime()) / (1000 * 60 * 60 * 24));
          if (diasAtras >= 0 && diasAtras < daysToShow) {
            datos[daysToShow - 1 - diasAtras]++;
          }
        } catch (error) {
          logError(error, 'procesando fecha de reserva');
        }
      }

      const result = labels.map((label, index) => ({
        x: label,
        y: datos[index]
      }));
      logger.info(COMPONENT_NAME, 'Datos del gráfico generados', { result });
      return result;
    } catch (error) {
      logError(error, 'generarDatosGrafico');
      return [];
    }
  };

  const cargarDatosConRetry = async (intentos = 3) => {
    for (let i = 0; i < intentos; i++) {
      try {
        setLoading(true);
        setError(null);
        logger.info(COMPONENT_NAME, `Iniciando carga de datos (intento ${i + 1}/${intentos})`);
        
        const storedName = await AsyncStorage.getItem('userName');
        logger.debug(COMPONENT_NAME, 'Nombre de usuario recuperado', { storedName });
        setUserName(storedName || '');

        let todasLasReservas: Booking[] = [];
        const response = await reservaApi.obtenerTodasReservas() as ReservaResponse;
        logger.debug(COMPONENT_NAME, 'Respuesta de API recibida', { response });
        
        if (response) {
          todasLasReservas = 'data' in response ? response.data : response;
        }

        if (!Array.isArray(todasLasReservas)) {
          throw new Error('Formato de respuesta inválido');
        }

        const reservasOrdenadas = ordenarReservas(todasLasReservas);
        setReservas(reservasOrdenadas);
        setChartData(generarDatosGrafico(reservasOrdenadas));
        logger.info(COMPONENT_NAME, 'Datos cargados exitosamente', {
          reservasCount: reservasOrdenadas.length,
          chartDataPoints: chartData?.length
        });
        break;
      } catch (error) {
        logError(error, `Intento ${i + 1} de cargar datos`);
        if (i === intentos - 1) {
          setError('No se pudieron cargar los datos. Por favor, intenta de nuevo.');
          setReservas([]);
          setChartData([]);
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    logger.info(COMPONENT_NAME, 'Component mounted');
    cargarDatosConRetry();
  }, []);

  const handleContactar = ({ tipo, valor }: ContactInfo) => {
    logger.info(COMPONENT_NAME, 'Intentando contactar', { tipo, valor });
    if (tipo === 'telefono') {
      const phoneNumber = Platform.OS === 'android' ? `tel:${valor}` : `telprompt:${valor}`;
      Linking.openURL(phoneNumber).catch(err => {
        logError(err, 'handleContactar - teléfono');
      });
    } else if (tipo === 'email') {
      Linking.openURL(`mailto:${valor}`).catch(err => {
        logError(err, 'handleContactar - email');
      });
    }
  };

  const handleContactSupport = () => {
    const phoneNumber = '+5491156569844';
    const message = 'Hola vengo de la app de rcf';
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          Alert.alert(
            'Error',
            'No se puede abrir WhatsApp. Por favor, instala la aplicación.'
          );
        }
      })
      .catch(err => {
        logError(err, 'handleContactSupport');
        Alert.alert('Error', 'No se pudo abrir WhatsApp');
      });
  };

  const renderDetalleReserva = () => {
    if (!selectedReserva) return null;

    // Helper function to safely format dates
    const safeFormatDate = (dateStr: string | undefined): string => {
      try {
        if (!dateStr) return "Fecha no disponible";
        const date = parseISO(dateStr);
        if (!Number.isFinite(date.getTime())) return "Fecha inválida";
        return format(date, 'dd MMM yyyy HH:mm', { locale: es });
      } catch (error) {
        return "Error en formato de fecha";
      }
    };

    // Helper function to safely format numbers
    const safeFormatNumber = (num: number | undefined | null): string => {
      try {
        if (num === undefined || num === null) return "0";
        const number = Number(num);
        return !Number.isFinite(number) ? "0" : number.toLocaleString();
      } catch (error) {
        return "0";
      }
    };

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
                  {safeFormatDate(selectedReserva.fechaHora)}
                </Text>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Duración</Text>
                <Text style={styles.detalleValor}>{selectedReserva.duracion || 0} minutos</Text>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Estado de Pago</Text>
                <Text style={[
                  styles.detalleValor,
                  { color: selectedReserva.estadoPago && selectedReserva.estadoPago.toLowerCase() === 'pagado' ? '#4CAF50' : '#FFC107' }
                ]}>
                  {selectedReserva.estadoPago || 'Pendiente'}
                </Text>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Método de Pago</Text>
                <Text style={styles.detalleValor}>{selectedReserva.metodoPago || 'No especificado'}</Text>
              </View>

              <View style={styles.detalleSeccion}>
                <Text style={styles.detalleLabel}>Precio</Text>
                <Text style={styles.detallePrecio}>
                  ${safeFormatNumber(Number(selectedReserva.precioTotal))}
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

    return proximasReservas.map((reserva, index) => (
      <AppointmentItem
        key={reserva.id || index}
        reserva={reserva}
        onUpdate={() => cargarDatosConRetry()}
      />
    ));
  };

  const renderChart = () => {
    try {
      return (
        <VictoryChart
          theme={VictoryTheme.material}
          height={220}
          width={Math.max(screenWidth - 60, 1)}
          padding={{ top: 20, bottom: 40, left: 40, right: 20 }}
          containerComponent={
            <VictoryContainer 
              responsive={true}
            />
          }
        >
          <VictoryAxis
            tickFormat={(t) => t}
            style={{
              axis: { stroke: '#e3e3e3' },
              tickLabels: { 
                fontSize: 8, 
                fill: '#888',
                angle: -45,
                textAnchor: 'end',
                padding: 5
              }
            }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => Math.round(t)}
            style={{
              axis: { stroke: '#e3e3e3' },
              tickLabels: { fontSize: 10, fill: '#888' },
              grid: { stroke: '#e3e3e3', strokeWidth: 0.5 }
            }}
            tickValues={[0, 1, 2, 3, 4, 5]}
            domain={{ y: [0, 5] }}
          />
          <VictoryLine
            data={chartData || []}
            style={{
              data: { stroke: '#1AFF92', strokeWidth: 2 },
            }}
            animate={{
              duration: 2000,
              onLoad: { duration: 1000 }
            }}
          />
        </VictoryChart>
      );
    } catch (error) {
      logError(error, 'Renderizado del gráfico');
      return null;
    }
  };

  const renderFilterModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={filterModalVisible}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.filterModalOverlay}>
          <View style={styles.filterModalContent}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filtros</Text>
              <TouchableOpacity 
                onPress={() => setFilterModalVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterModalBody}>
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Período</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[styles.filterOption, dateFilter === 'week' && styles.filterOptionActive]}
                    onPress={() => setDateFilter('week')}
                  >
                    <Text style={[styles.filterOptionText, dateFilter === 'week' && styles.filterOptionTextActive]}>Última semana</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, dateFilter === 'month' && styles.filterOptionActive]}
                    onPress={() => setDateFilter('month')}
                  >
                    <Text style={[styles.filterOptionText, dateFilter === 'month' && styles.filterOptionTextActive]}>Último mes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, dateFilter === '3months' && styles.filterOptionActive]}
                    onPress={() => setDateFilter('3months')}
                  >
                    <Text style={[styles.filterOptionText, dateFilter === '3months' && styles.filterOptionTextActive]}>Últimos 3 meses</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Estado de Pago</Text>
                <View style={styles.filterOptions}>
                  <TouchableOpacity
                    style={[styles.filterOption, paymentFilter === 'all' && styles.filterOptionActive]}
                    onPress={() => setPaymentFilter('all')}
                  >
                    <Text style={[styles.filterOptionText, paymentFilter === 'all' && styles.filterOptionTextActive]}>Todos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, paymentFilter === 'paid' && styles.filterOptionActive]}
                    onPress={() => setPaymentFilter('paid')}
                  >
                    <Text style={[styles.filterOptionText, paymentFilter === 'paid' && styles.filterOptionTextActive]}>Pagados</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.filterOption, paymentFilter === 'pending' && styles.filterOptionActive]}
                    onPress={() => setPaymentFilter('pending')}
                  >
                    <Text style={[styles.filterOptionText, paymentFilter === 'pending' && styles.filterOptionTextActive]}>Pendientes</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => {
                  setFilterModalVisible(false);
                  cargarDatosConRetry();
                }}
              >
                <Text style={styles.applyFiltersButtonText}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1AFF92" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => cargarDatosConRetry()}
        >
          <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
        </TouchableOpacity>
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
          <View style={styles.headerLeft}>
            <View style={styles.profilePic} />
            <Text style={styles.greeting}>¡Hola{userName ? `, ${userName}` : ''}!</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setFilterModalVisible(true)}
            >
              <Icon name="filter" size={24} color={Colors.PRIMARY} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.supportButton}
              onPress={handleContactSupport}
            >
              <Icon name="help-circle-outline" size={24} color={Colors.PRIMARY} />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subGreeting}>Mira tus reservas de hoy</Text>
        
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.chartTitle}>Canchas reservadas</Text>
              <Text style={styles.chartSubtitle}>
                {dateFilter === 'week' ? 'Última semana' : 
                 dateFilter === 'month' ? 'Último mes' : 'Últimos 3 meses'}
              </Text>
            </View>
            <View style={styles.activeFilters}>
              {paymentFilter !== 'all' && (
                <View style={styles.activeFilterTag}>
                  <Text style={styles.activeFilterText}>
                    {paymentFilter === 'paid' ? 'Pagados' : 'Pendientes'}
                  </Text>
                </View>
              )}
            </View>
          </View>
          {renderChart()}
          <Text style={styles.chartFooter}>
            {chartData && Array.isArray(chartData) ? chartData.reduce((a, b) => a + b.y, 0) : 0} canchas reservadas en total
          </Text>
        </View>

        <View style={styles.proximasReservasContainer}>
          <View style={styles.proximasReservasHeader}>
            <Text style={styles.proximasReservasTitle}>Últimas Reservas</Text>
            <Text style={styles.proximasReservasCount}>
              Mostrando {Math.min(5, reservas.length)} de {reservas.length}
            </Text>
          </View>
          {renderProximasReservas()}
        </View>
      </ScrollView>
      {renderDetalleReserva()}
      {renderFilterModal()}
    </SafeAreaView>
  );
};

// Componente wrapper con ErrorBoundary
const OwnerHomeScreen = () => {
  return (
    <ErrorBoundary>
      <OwnerHomeContent />
    </ErrorBoundary>
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
    justifyContent: 'space-between',
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1AFF92',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
  },
  supportButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterModalBody: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 25,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterOption: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  filterOptionActive: {
    backgroundColor: '#1AFF92',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
  },
  filterOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  applyFiltersButton: {
    backgroundColor: '#1AFF92',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  applyFiltersButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  activeFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  activeFilterTag: {
    backgroundColor: '#1AFF92',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  activeFilterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OwnerHomeScreen;