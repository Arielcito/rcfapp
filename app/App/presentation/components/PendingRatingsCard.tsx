import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../infrastructure/utils/Colors';
import { usePendingRatings } from '../../application/hooks/usePendingRatings';
import { CourtRatingModal } from './CourtRatingModal';
import type { AppointmentExtended } from '../../domain/entities/appointment-extended.entity';
import moment from 'moment';

export const PendingRatingsCard: React.FC = () => {
  const { pendingRatings, loading, hasPendingRatings, markAsRated, refreshPendingRatings, error } = usePendingRatings();
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentExtended | null>(null);

  if (!hasPendingRatings && !loading) {
    return null;
  }

  const handleRatePress = (appointment: AppointmentExtended) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleRatingSuccess = () => {
    if (selectedAppointment) {
      markAsRated(selectedAppointment.appointmentId);
    }
    setSelectedAppointment(null);
    refreshPendingRatings();
  };

  const renderPendingItem = ({ item }: { item: AppointmentExtended }) => {
    const appointmentDateTime = moment(`${item.appointmentDate} ${item.appointmentTime}`);
    const formattedDate = appointmentDateTime.format('DD/MM/YYYY');
    const formattedTime = appointmentDateTime.format('HH:mm');
    
    return (
      <View style={styles.pendingItem}>
        <View style={styles.appointmentInfo}>
          <Text style={styles.appointmentDate}>
            📅 {formattedDate} - {formattedTime}
          </Text>
          <Text style={styles.appointmentPlace}>
            {item.placeName || 'Cancha'} • Pitch {item.pitch}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.rateButton}
          onPress={() => handleRatePress(item)}
        >
          <Ionicons name="star-outline" size={16} color={Colors.WHITE} />
          <Text style={styles.rateButtonText}>Calificar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.PRIMARY} />
          <Text style={styles.loadingText}>Cargando partidos...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error al cargar calificaciones</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshPendingRatings}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (pendingRatings.length === 0) {
      return (
        <Text style={styles.emptyText}>
          No tienes partidos pendientes por calificar
        </Text>
      );
    }

    return (
      <FlatList
        data={pendingRatings}
        renderItem={renderPendingItem}
        keyExtractor={(item) => item.appointmentId.toString()}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    );
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="star-outline" size={24} color={Colors.YELLOW} />
            <Text style={styles.title}>Califica tus partidos</Text>
          </View>
          <TouchableOpacity onPress={refreshPendingRatings} disabled={loading}>
            <Ionicons 
              name="refresh" 
              size={20} 
              color={loading ? Colors.GRAY : Colors.PRIMARY} 
            />
          </TouchableOpacity>
        </View>
        
        {!loading && !error && (
          <Text style={styles.subtitle}>
            Tienes {pendingRatings.length} partido{pendingRatings.length !== 1 ? 's' : ''} por calificar
          </Text>
        )}

        {renderContent()}
      </View>

      {selectedAppointment && (
        <CourtRatingModal
          visible={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedAppointment(null);
          }}
          appointmentId={selectedAppointment.appointmentId}
          pitchId={selectedAppointment.pitch}
          placeName={selectedAppointment.placeName}
          onSuccess={handleRatingSuccess}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 15,
    marginVertical: 10,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'montserrat-medium',
    color: Colors.PRIMARY,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'montserrat-regular',
    color: Colors.GRAY,
    marginBottom: 15,
  },
  list: {
    maxHeight: 200,
  },
  pendingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY_LIGHT,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentDate: {
    fontSize: 14,
    fontFamily: 'montserrat-medium',
    color: Colors.GRAY,
    marginBottom: 4,
  },
  appointmentPlace: {
    fontSize: 12,
    fontFamily: 'montserrat-regular',
    color: Colors.GRAY,
  },
  rateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.YELLOW,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 4,
  },
  rateButtonText: {
    fontSize: 12,
    fontFamily: 'montserrat-medium',
    color: Colors.WHITE,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'montserrat-medium',
    color: Colors.GRAY,
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'montserrat-medium',
    color: Colors.RED,
    marginRight: 8,
  },
  retryButton: {
    padding: 12,
    backgroundColor: Colors.YELLOW,
    borderRadius: 15,
  },
  retryButtonText: {
    fontSize: 12,
    fontFamily: 'montserrat-medium',
    color: Colors.WHITE,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'montserrat-medium',
    color: Colors.GRAY,
    textAlign: 'center',
  },
}); 