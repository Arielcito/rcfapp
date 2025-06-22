import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Colors from '../../infrastructure/utils/Colors';

interface CalendarAppointmentCardProps {
  reserva: any;
  onPress?: () => void;
  compact?: boolean;
}

export default function CalendarAppointmentCard({ 
  reserva, 
  onPress, 
  compact = false 
}: CalendarAppointmentCardProps) {
  const fecha = parseISO(reserva.fechaHora);
  const hora = format(fecha, 'HH:mm', { locale: es });
  
  const getStatusColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pagado':
        return '#4CAF50';
      case 'pendiente':
        return '#FFC107';
      case 'cancelado':
        return '#f44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pagado':
        return 'Pagado';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  if (compact) {
    return (
      <TouchableOpacity 
        style={[styles.compactCard, { borderLeftColor: getStatusColor(reserva.estadoPago) }]}
        onPress={onPress}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactTime}>{hora}</Text>
          <Text style={styles.compactCancha} numberOfLines={1}>
            {reserva.cancha?.nombre || 'Cancha'}
          </Text>
        </View>
        <View style={[styles.compactStatus, { backgroundColor: getStatusColor(reserva.estadoPago) }]}>
          <Text style={styles.compactStatusText}>
            {getStatusText(reserva.estadoPago).charAt(0)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.fullCard} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{hora}</Text>
          <Text style={styles.durationText}>
            {reserva.duracion || 60} min
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(reserva.estadoPago) }]}>
          <Text style={styles.statusText}>
            {getStatusText(reserva.estadoPago)}
          </Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <Text style={styles.canchaText}>
          {reserva.cancha?.nombre || 'Cancha'}
        </Text>
        {reserva.predio?.nombre && (
          <Text style={styles.predioText}>
            {reserva.predio.nombre}
          </Text>
        )}
        <Text style={styles.priceText}>
          ${Number(reserva.precioTotal).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  compactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    marginVertical: 2,
    marginHorizontal: 4,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  compactContent: {
    flex: 1,
  },
  compactTime: {
    fontSize: 12,
    fontFamily: 'montserrat-medium',
    color: '#2d4150',
  },
  compactCancha: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  compactStatus: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactStatusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  fullCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'montserrat-medium',
    color: '#2d4150',
  },
  durationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  },
  canchaText: {
    fontSize: 14,
    fontFamily: 'montserrat-medium',
    color: '#2d4150',
    marginBottom: 4,
  },
  predioText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
}); 