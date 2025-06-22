import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from "react-native";
import { Calendar, Agenda } from 'react-native-calendars';
import Colors from "../../../infrastructure/utils/Colors";
import AppointmentItem from "./AppointmentItem";
import CalendarAppointmentCard from "../../components/CalendarAppointmentCard";
import { reservaApi } from "../../../infrastructure/api/reserva.api";
import { format, parseISO, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { logger } from '../../../infrastructure/utils/logger';
import Icon from "react-native-vector-icons/Ionicons";

const COMPONENT_NAME = 'OwnerAppointments';
const { width } = Dimensions.get('window');

const VIEW_TYPES = {
  DAY: 'day',
  WEEK: 'week',
  MONTH: 'month',
  AGENDA: 'agenda'
};

export default function OwnerAppointments() {
  const [loading, setLoading] = useState(false);
  const [reservas, setReservas] = useState([]);
  const [viewType, setViewType] = useState(VIEW_TYPES.MONTH);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState({});
  const [agendaItems, setAgendaItems] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    logger.info(COMPONENT_NAME, 'Component mounted');
    fetchReservas();
  }, []);

  const fetchReservas = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    logger.info(COMPONENT_NAME, 'Iniciando fetch de reservas', { isRefresh });
    try {
      const response = await reservaApi.obtenerTodasReservas();
      logger.debug(COMPONENT_NAME, 'Respuesta de API recibida', { response });
      const todasLasReservas = response.data || response;
      logger.info(COMPONENT_NAME, 'Reservas procesadas', { 
        total: todasLasReservas.length,
        sample: todasLasReservas.slice(0, 2)
      });
      setReservas(todasLasReservas);
      processReservasForCalendar(todasLasReservas);
    } catch (error) {
      logger.error(COMPONENT_NAME, 'Error al cargar reservas', { error });
      console.error('Error al cargar reservas:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
      logger.info(COMPONENT_NAME, 'Fetch de reservas completado');
    }
  };

  const processReservasForCalendar = (reservasArray) => {
    const marked = {};
    const agenda = {};

    reservasArray.forEach(reserva => {
      try {
        const fecha = parseISO(reserva.fechaHora);
        const fechaStr = format(fecha, 'yyyy-MM-dd');
        
        // Marcar fechas con reservas
        if (!marked[fechaStr]) {
          marked[fechaStr] = {
            marked: true,
            dots: [],
            selectedColor: Colors.PRIMARY
          };
        }
        
        // Agregar punto de color según el estado
        const estadoColor = reserva.estadoPago.toLowerCase() === 'pagado' ? '#4CAF50' : '#FFC107';
        marked[fechaStr].dots.push({
          color: estadoColor,
          selectedDotColor: estadoColor
        });

        // Preparar items para la agenda
        if (!agenda[fechaStr]) {
          agenda[fechaStr] = [];
        }
        agenda[fechaStr].push(reserva);
      } catch (error) {
        logger.error(COMPONENT_NAME, 'Error procesando reserva para calendario', { error, reserva });
      }
    });

    setMarkedDates(marked);
    setAgendaItems(agenda);
  };

  const getReservasForDate = (date) => {
    const fechaStr = format(date, 'yyyy-MM-dd');
    return reservas.filter(reserva => {
      try {
        const fechaReserva = format(parseISO(reserva.fechaHora), 'yyyy-MM-dd');
        return fechaReserva === fechaStr;
      } catch (error) {
        logger.error(COMPONENT_NAME, 'Error filtrando reserva por fecha', { error, reserva });
        return false;
      }
    });
  };

  const getReservasForWeek = (date) => {
    const startWeek = startOfWeek(date, { locale: es });
    const endWeek = endOfWeek(date, { locale: es });
    
    return reservas.filter(reserva => {
      try {
        const fechaReserva = parseISO(reserva.fechaHora);
        return fechaReserva >= startWeek && fechaReserva <= endWeek;
      } catch (error) {
        logger.error(COMPONENT_NAME, 'Error filtrando reserva por semana', { error, reserva });
        return false;
      }
    });
  };

  const handleDateSelect = (date) => {
    logger.info(COMPONENT_NAME, 'Fecha seleccionada', { date });
    // Aseguramos que la fecha se cree correctamente considerando la zona horaria local
    const selectedDateStr = date.dateString; // formato: 'YYYY-MM-DD'
    const [year, month, day] = selectedDateStr.split('-').map(Number);
    const newDate = new Date(year, month - 1, day); // month es 0-based en el constructor de Date
    setSelectedDate(newDate);
  };

  const navigateDate = (direction) => {
    let newDate;
    
    switch (viewType) {
      case VIEW_TYPES.DAY:
        newDate = direction === 'next' ? addDays(selectedDate, 1) : addDays(selectedDate, -1);
        break;
      case VIEW_TYPES.WEEK:
        newDate = direction === 'next' ? addWeeks(selectedDate, 1) : subWeeks(selectedDate, 1);
        break;
      case VIEW_TYPES.AGENDA:
        newDate = direction === 'next' ? addDays(selectedDate, 1) : subDays(selectedDate, 1);
        break;
      default:
        newDate = selectedDate;
    }
    
    setSelectedDate(newDate);
    logger.info(COMPONENT_NAME, 'Navegación de fecha', { direction, newDate });
  };

  const handleViewChange = (newViewType) => {
    logger.info(COMPONENT_NAME, 'Vista cambiada', { viewType: newViewType });
    setViewType(newViewType);
  };



  const renderViewSelector = () => (
    <View style={styles.viewSelector}>
      {Object.entries(VIEW_TYPES).map(([key, value]) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.viewButton,
            viewType === value && styles.viewButtonActive
          ]}
          onPress={() => handleViewChange(value)}
        >
          <Text style={[
            styles.viewButtonText,
            viewType === value && styles.viewButtonTextActive
          ]}>
            {key === 'DAY' ? 'Día' : key === 'WEEK' ? 'Semana' : key === 'MONTH' ? 'Mes' : 'Agenda'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDateNavigation = () => (
    <View style={styles.dateNavigation}>
      {viewType !== VIEW_TYPES.MONTH && (
        <>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateDate('prev')}
          >
            <Icon name="chevron-back" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.todayButton}
            onPress={() => setSelectedDate(new Date())}
          >
            <Text style={styles.todayButtonText}>Hoy</Text>
          </TouchableOpacity>
          
          <Text style={styles.currentDateText}>
            {viewType === VIEW_TYPES.DAY && format(selectedDate, 'EEEE, dd MMMM yyyy', { locale: es })}
            {viewType === VIEW_TYPES.WEEK && `${format(startOfWeek(selectedDate, { locale: es }), 'dd MMM', { locale: es })} - ${format(endOfWeek(selectedDate, { locale: es }), 'dd MMM yyyy', { locale: es })}`}
            {viewType === VIEW_TYPES.AGENDA && 'Agenda'}
          </Text>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateDate('next')}
          >
            <Icon name="chevron-forward" size={24} color={Colors.PRIMARY} />
          </TouchableOpacity>
        </>
      )}
      
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => fetchReservas(true)}
        disabled={refreshing}
      >
        <Icon 
          name="refresh" 
          size={20} 
          color={refreshing ? '#ccc' : Colors.PRIMARY} 
        />
      </TouchableOpacity>
    </View>
  );

  const renderDayView = () => {
    const reservasDelDia = getReservasForDate(selectedDate);
    
    return (
      <ScrollView style={styles.dayView}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>
            {format(selectedDate, 'EEEE, dd MMMM', { locale: es })}
          </Text>
          <Text style={styles.dayCount}>
            {reservasDelDia.length} reserva{reservasDelDia.length !== 1 ? 's' : ''}
          </Text>
        </View>
        
                 {reservasDelDia.length > 0 ? (
           reservasDelDia
             .sort((a, b) => parseISO(a.fechaHora) - parseISO(b.fechaHora))
             .map((reserva, index) => (
               <CalendarAppointmentCard 
                 key={reserva.id || index} 
                 reserva={reserva} 
                 compact={false}
                 onPress={() => {
                   // Aquí puedes agregar navegación o modal de detalles
                   logger.info(COMPONENT_NAME, 'Reserva seleccionada', { reserva });
                 }}
               />
             ))
         ) : (
           <View style={styles.emptyContainer}>
             <Text style={styles.emptyText}>No hay reservas para este día</Text>
           </View>
         )}
      </ScrollView>
    );
  };

  const renderWeekView = () => {
    const reservasDeLaSemana = getReservasForWeek(selectedDate);
    const startWeek = startOfWeek(selectedDate, { locale: es });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startWeek, i));
    
    return (
      <ScrollView style={styles.weekView}>
        <View style={styles.weekHeader}>
          {weekDays.map((day, index) => {
            const reservasDelDia = getReservasForDate(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.weekDayItem,
                  isToday && styles.weekDayToday,
                  isSelected && styles.weekDaySelected
                ]}
                onPress={() => setSelectedDate(day)}
              >
                <Text style={[
                  styles.weekDayText,
                  isToday && styles.weekDayTextToday,
                  isSelected && styles.weekDayTextSelected
                ]}>
                  {format(day, 'EEE', { locale: es })}
                </Text>
                <Text style={[
                  styles.weekDayNumber,
                  isToday && styles.weekDayNumberToday,
                  isSelected && styles.weekDayNumberSelected
                ]}>
                  {format(day, 'd')}
                </Text>
                {reservasDelDia.length > 0 && (
                  <View style={styles.weekDayDot}>
                    <Text style={styles.weekDayDotText}>{reservasDelDia.length}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        
                 <ScrollView style={styles.weekContent}>
           <Text style={styles.weekSelectedDay}>
             Reservas para {format(selectedDate, 'EEEE, dd MMMM', { locale: es })}
           </Text>
           <View style={styles.weekReservasList}>
             {getReservasForDate(selectedDate)
               .sort((a, b) => parseISO(a.fechaHora) - parseISO(b.fechaHora))
               .map((reserva, index) => (
                 <CalendarAppointmentCard 
                   key={reserva.id || index} 
                   reserva={reserva} 
                   compact={true}
                   onPress={() => {
                     logger.info(COMPONENT_NAME, 'Reserva seleccionada en vista semanal', { reserva });
                   }}
                 />
               ))}
             {getReservasForDate(selectedDate).length === 0 && (
               <View style={styles.emptyContainer}>
                 <Text style={styles.emptyText}>No hay reservas para este día</Text>
               </View>
             )}
           </View>
         </ScrollView>
      </ScrollView>
    );
  };

  const renderMonthView = () => (
    <View style={styles.monthView}>
      <Calendar
        current={format(selectedDate, 'yyyy-MM-dd')}
        onDayPress={handleDateSelect}
        markedDates={{
          ...markedDates,
          [format(selectedDate, 'yyyy-MM-dd')]: {
            ...markedDates[format(selectedDate, 'yyyy-MM-dd')],
            selected: true,
            selectedColor: Colors.PRIMARY
          }
        }}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: Colors.PRIMARY,
          selectedDayTextColor: '#ffffff',
          todayTextColor: Colors.PRIMARY,
          dayTextColor: '#2d4150',
          textDisabledColor: '#d9e1e8',
          dotColor: Colors.PRIMARY,
          selectedDotColor: '#ffffff',
          arrowColor: Colors.PRIMARY,
          monthTextColor: '#2d4150',
          indicatorColor: Colors.PRIMARY,
          textDayFontFamily: 'montserrat-medium',
          textMonthFontFamily: 'montserrat-medium',
          textDayHeaderFontFamily: 'montserrat-medium',
          textDayFontSize: 16,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 13
        }}
        markingType="multi-dot"
        locale="es"
      />
      
      <ScrollView style={styles.monthSelectedContent}>
                 <Text style={styles.monthSelectedTitle}>
           Reservas para {format(selectedDate, 'dd MMMM yyyy', { locale: es })}
         </Text>
         <View style={styles.monthReservasList}>
           {getReservasForDate(selectedDate)
             .sort((a, b) => parseISO(a.fechaHora) - parseISO(b.fechaHora))
             .map((reserva, index) => (
               <CalendarAppointmentCard 
                 key={reserva.id || index} 
                 reserva={reserva} 
                 compact={false}
                 onPress={() => {
                   logger.info(COMPONENT_NAME, 'Reserva seleccionada en vista mensual', { reserva });
                 }}
               />
             ))}
           {getReservasForDate(selectedDate).length === 0 && (
             <View style={styles.emptyContainer}>
               <Text style={styles.emptyText}>No hay reservas para esta fecha</Text>
             </View>
           )}
         </View>
      </ScrollView>
    </View>
  );

     const renderAgendaView = () => (
     <Agenda
       items={agendaItems}
       selected={format(selectedDate, 'yyyy-MM-dd')}
       renderItem={(item) => (
         <View style={styles.agendaItem}>
           <CalendarAppointmentCard 
             reserva={item} 
             compact={false}
             onPress={() => {
               logger.info(COMPONENT_NAME, 'Reserva seleccionada en agenda', { reserva: item });
             }}
           />
         </View>
       )}
       renderEmptyDate={() => (
         <View style={styles.emptyDateContainer}>
           <Text style={styles.emptyDateText}>No hay reservas</Text>
         </View>
       )}
       showClosingKnob={true}
       theme={{
         backgroundColor: '#ffffff',
         calendarBackground: '#ffffff',
         textSectionTitleColor: '#b6c1cd',
         selectedDayBackgroundColor: Colors.PRIMARY,
         selectedDayTextColor: '#ffffff',
         todayTextColor: Colors.PRIMARY,
         dayTextColor: '#2d4150',
         textDisabledColor: '#d9e1e8',
         dotColor: Colors.PRIMARY,
         selectedDotColor: '#ffffff',
         arrowColor: Colors.PRIMARY,
         monthTextColor: '#2d4150',
         indicatorColor: Colors.PRIMARY,
         agendaKnobColor: Colors.PRIMARY
       }}
       locale="es"
     />
   );

  const renderCurrentView = () => {
    switch (viewType) {
      case VIEW_TYPES.DAY:
        return renderDayView();
      case VIEW_TYPES.WEEK:
        return renderWeekView();
      case VIEW_TYPES.MONTH:
        return renderMonthView();
      case VIEW_TYPES.AGENDA:
        return renderAgendaView();
      default:
        return renderMonthView();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={styles.loadingText}>Cargando reservas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Mis Reservas
          <Text style={{ color: Colors.PRIMARY }}> Cancha</Text>
        </Text>
        
        {renderViewSelector()}
                 {renderDateNavigation()}
      </View>
      
      <View style={styles.content}>
        {renderCurrentView()}
      </View>
    </View>
  );
}

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#ffffff',
      paddingHorizontal: 20,
    },
    header: {
      paddingTop: 50,
      paddingBottom: 20,
    },
    title: {
      fontFamily: "montserrat-medium",
      fontSize: 30,
      marginBottom: 20,
      color: '#2d4150',
    },
    viewSelector: {
      flexDirection: 'row',
      backgroundColor: '#f5f5f5',
      borderRadius: 25,
      padding: 4,
      marginBottom: 20,
    },
    viewButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 20,
    },
    viewButtonActive: {
      backgroundColor: Colors.PRIMARY,
    },
    viewButtonText: {
      fontSize: 14,
      fontFamily: 'montserrat-medium',
      color: '#666',
    },
    viewButtonTextActive: {
      color: '#ffffff',
    },
    dateNavigation: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    navButton: {
      padding: 10,
      borderRadius: 20,
      backgroundColor: '#f5f5f5',
    },
    currentDateText: {
      fontSize: 18,
      fontFamily: 'montserrat-medium',
      color: '#2d4150',
      textAlign: 'center',
      flex: 1,
      textTransform: 'capitalize',
    },
    todayButton: {
      backgroundColor: Colors.PRIMARY,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginHorizontal: 8,
    },
    todayButtonText: {
      color: '#ffffff',
      fontSize: 12,
      fontFamily: 'montserrat-medium',
    },
  content: {
    flex: 1,
  },
  dayView: {
    flex: 1,
  },
  dayHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dayTitle: {
    fontSize: 20,
    fontFamily: 'montserrat-medium',
    color: '#2d4150',
    textTransform: 'capitalize',
  },
  dayCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  weekView: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  weekDayItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 2,
  },
  weekDayToday: {
    backgroundColor: '#e3f2fd',
  },
  weekDaySelected: {
    backgroundColor: Colors.PRIMARY,
  },
  weekDayText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  weekDayTextToday: {
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  weekDayTextSelected: {
    color: '#ffffff',
  },
  weekDayNumber: {
    fontSize: 16,
    fontFamily: 'montserrat-medium',
    color: '#2d4150',
    marginTop: 2,
  },
  weekDayNumberToday: {
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  weekDayNumberSelected: {
    color: '#ffffff',
  },
  weekDayDot: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  weekDayDotText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  weekContent: {
    flex: 1,
  },
  weekSelectedDay: {
    fontSize: 16,
    fontFamily: 'montserrat-medium',
    color: '#2d4150',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  monthView: {
    flex: 1,
  },
  monthSelectedContent: {
    flex: 1,
    marginTop: 20,
  },
  monthSelectedTitle: {
    fontSize: 16,
    fontFamily: 'montserrat-medium',
    color: '#2d4150',
    marginBottom: 10,
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyDateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyDateText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
     loadingText: {
     marginTop: 10,
     fontSize: 16,
     color: '#666',
   },
   weekReservasList: {
     flex: 1,
     paddingTop: 10,
   },
   monthReservasList: {
     flex: 1,
     paddingTop: 10,
   },
   agendaItem: {
     marginRight: 10,
     marginTop: 17,
   },

   refreshButton: {
     padding: 8,
     borderRadius: 16,
     backgroundColor: '#f5f5f5',
     marginHorizontal: 4,
   },
 });
