import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Colors from "../../../infraestructure/utils/Colors";
import { getDays } from "../../../infraestructure/utils/TimeDate";
import AppointmentItem from "./AppointmentItem";
import Divider from "../../components/Divider";
import { reservaApi } from "../../../infraestructure/api/reserva.api";
import { format, parseISO, compareDesc } from 'date-fns';
import { logger } from '../../../infraestructure/utils/logger';

const COMPONENT_NAME = 'OwnerAppointments';

export default function OwnerAppointments() {
  const [next7Days, setNext7Days] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reservas, setReservas] = useState([]);
  const [reservasFiltradas, setReservasFiltradas] = useState([]);

  useEffect(() => {
    logger.info(COMPONENT_NAME, 'Component mounted');
    const date = getDays();
    logger.debug(COMPONENT_NAME, 'Next 7 days calculated', { date });
    setNext7Days(date);
  }, []);

  const ordenarReservas = (reservasArray) => {
    try {
      logger.debug(COMPONENT_NAME, 'Ordenando reservas', { reservasArray });
      const sorted = [...reservasArray].sort((a, b) => 
        compareDesc(parseISO(a.fechaReserva), parseISO(b.fechaReserva))
      );
      logger.info(COMPONENT_NAME, 'Reservas ordenadas exitosamente', { count: sorted.length });
      return sorted;
    } catch (error) {
      logger.error(COMPONENT_NAME, 'Error al ordenar reservas', { error, reservasArray });
      return reservasArray;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      logger.info(COMPONENT_NAME, 'Iniciando fetch de reservas');
      try {
        const response = await reservaApi.obtenerTodasReservas();
        logger.debug(COMPONENT_NAME, 'Respuesta de API recibida', { response });
        const todasLasReservas = response.data || response;
        const reservasOrdenadas = ordenarReservas(todasLasReservas);
        logger.info(COMPONENT_NAME, 'Reservas procesadas y ordenadas', { 
          total: reservasOrdenadas.length,
          sample: reservasOrdenadas.slice(0, 2)
        });
        setReservas(reservasOrdenadas);
        setReservasFiltradas(reservasOrdenadas);
      } catch (error) {
        logger.error(COMPONENT_NAME, 'Error al cargar reservas', { error });
        console.error('Error al cargar reservas:', error);
      } finally {
        setLoading(false);
        logger.info(COMPONENT_NAME, 'Fetch de reservas completado');
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDate && reservas.length > 0) {
      logger.debug(COMPONENT_NAME, 'Filtrando reservas por fecha', { selectedDate });
      const reservasDelDia = reservas.filter(reserva => {
        try {
          const fechaReserva = format(parseISO(reserva.fechaHora), 'yyyy-MM-dd');
          return fechaReserva === selectedDate;
        } catch (error) {
          logger.error(COMPONENT_NAME, 'Error al procesar fecha de reserva', { 
            error, 
            reserva,
            selectedDate 
          });
          return false;
        }
      });
      logger.info(COMPONENT_NAME, 'Reservas filtradas por fecha', { 
        selectedDate,
        count: reservasDelDia.length 
      });
      setReservasFiltradas(reservasDelDia);
    } else {
      logger.debug(COMPONENT_NAME, 'Mostrando todas las reservas', { 
        selectedDate,
        totalReservas: reservas.length 
      });
      setReservasFiltradas(reservas);
    }
  }, [selectedDate, reservas]);

  const handleDateSelect = (fullDate) => {
    logger.info(COMPONENT_NAME, 'Fecha seleccionada', { 
      fullDate,
      wasSelected: selectedDate === fullDate 
    });
    if (selectedDate === fullDate) {
      setSelectedDate(null);
    } else {
      setSelectedDate(fullDate);
    }
  };
  
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>
        Mis Reservas
        <Text style={{ color: Colors.PRIMARY }}> Cancha</Text>
      </Text>
      <Text style={styles.subtitle}>Elegi la fecha</Text>
      <FlatList
        data={next7Days}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 20 }}
        renderItem={({ item }) => {
          const isSelected = selectedDate === item.fullDate;
          return (
            <TouchableOpacity
              style={[
                styles.dayButton,
                isSelected ? { backgroundColor: Colors.PRIMARY } : null,
              ]}
              onPress={() => handleDateSelect(item.fullDate)}
            >
              <View style={styles.dayHeader}>
                <Text
                  style={[
                    styles.dayText,
                    isSelected ? { color: Colors.WHITE } : { color: Colors.PRIMARY },
                  ]}
                >
                  {item.day}
                </Text>
              </View>
              <View>
                <Text
                  style={[
                    styles.dateText,
                    isSelected ? { color: Colors.WHITE } : null,
                  ]}
                >
                  {item.formmatedDate}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
      <Divider />
      
      {!loading ? (
        <>
          <Text style={styles.resultText}>
            {selectedDate ? 
              `Reservas para ${format(parseISO(selectedDate), 'dd/MM/yyyy')}` : 
              'Todas las reservas'}
            <Text style={styles.countText}> ({reservasFiltradas.length})</Text>
          </Text>
          <FlatList
            data={reservasFiltradas}
            horizontal={false}
            showsHorizontalScrollIndicator={false}
            style={styles.reservasList}
            renderItem={({ item }) => (
              <AppointmentItem reserva={item} />
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay reservas para esta fecha</Text>
              </View>
            )}
          />
        </>
      ) : (
        <ActivityIndicator style={styles.loading} size={"large"} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    zIndex: 10,
    padding: 10,
    width: "100%",
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "montserrat-medium",
    fontSize: 30,
    marginBottom: 20,
    marginTop: 30,
  },
  subtitle: {
    padding: 10,
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.PRIMARY,
  },
  countText: {
    fontSize: 14,
    color: '#666',
  },
  dayButton: {
    borderWidth: 2,
    borderRadius: 16,
    marginBottom: 30,
    width: 50,
    height: 50,
    alignItems: "center",
    marginRight: 10,
    borderColor: Colors.BLUE,
  },
  dayHeader: {
    backgroundColor: "#003366",
    width: "100%",
    height: 20,
    display: "flex",
    alignItems: "center",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  dayText: {
    fontFamily: "montserrat-medium",
    fontSize: 10,
    paddingTop: 5,
  },
  dateText: {
    fontFamily: "montserrat-medium",
    fontSize: 16,
  },
  reservasList: {
    paddingBottom: 400,
    marginBottom: 200,
    marginTop: 20,
  },
  loading: {
    height: "70%",
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});
