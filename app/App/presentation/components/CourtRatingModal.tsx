import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../infrastructure/utils/Colors';
import { submitCourtRating } from '../../infrastructure/api/court-ratings.api';
import { useCurrentUser } from '../../application/context/CurrentUserContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  appointmentId: number;
  pitchId: number;
  placeName?: string;
  onSuccess: () => void;
}

export const CourtRatingModal: React.FC<Props> = ({
  visible,
  onClose,
  appointmentId,
  pitchId,
  placeName,
  onSuccess,
}) => {
  const { currentUser } = useCurrentUser();
  const [rating, setRating] = useState(0);
  const [facilityQuality, setFacilityQuality] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [staff, setStaff] = useState(0);
  const [accessibility, setAccessibility] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setRating(0);
    setFacilityQuality(0);
    setCleanliness(0);
    setStaff(0);
    setAccessibility(0);
    setComment('');
  };

  const StarRating = ({ 
    value, 
    onPress, 
    label 
  }: { 
    value: number; 
    onPress: (rating: number) => void; 
    label: string 
  }) => (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onPress(star)}>
            <Ionicons
              name={star <= value ? 'star' : 'star-outline'}
              size={24}
              color={star <= value ? Colors.YELLOW : Colors.GRAY}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor califica la cancha con al menos 1 estrella');
      return;
    }

    if (!currentUser) {
      Alert.alert('Error', 'Usuario no encontrado');
      return;
    }

    setLoading(true);
    try {
      await submitCourtRating({
        userId: currentUser.id,
        appointmentId,
        pitchId,
        rating,
        comment: comment.trim() || undefined,
        ratingAspects: {
          facilityQuality: facilityQuality || rating,
          cleanliness: cleanliness || rating,
          staff: staff || rating,
          accessibility: accessibility || rating,
        },
      });
      
      Alert.alert('¡Gracias!', 'Tu calificación ha sido enviada correctamente');
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la calificación. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color={Colors.GRAY} />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>Califica la Cancha</Text>
            {placeName && <Text style={styles.placeName}>{placeName}</Text>}
            <Text style={styles.subtitle}>Tu opinión nos ayuda a mejorar</Text>

            <StarRating
              value={rating}
              onPress={setRating}
              label="⭐ Calificación General"
            />

            <View style={styles.separator} />

            <Text style={styles.aspectsTitle}>Aspectos específicos (opcional):</Text>
            
            <StarRating
              value={facilityQuality}
              onPress={setFacilityQuality}
              label="🏟️ Calidad de las instalaciones"
            />
            
            <StarRating
              value={cleanliness}
              onPress={setCleanliness}
              label="🧽 Limpieza"
            />
            
            <StarRating
              value={staff}
              onPress={setStaff}
              label="👥 Atención del personal"
            />
            
            <StarRating
              value={accessibility}
              onPress={setAccessibility}
              label="🚗 Accesibilidad y estacionamiento"
            />

            <View style={styles.commentContainer}>
              <Text style={styles.label}>💬 Comentarios (opcional)</Text>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Comparte tu experiencia en detalle..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.characterCount}>{comment.length}/500</Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.disabledButton]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Enviando...' : 'Enviar Calificación'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  closeButton: {
    padding: 5,
  },
  title: {
    fontSize: 22,
    fontFamily: 'montserrat-medium',
    color: Colors.PRIMARY,
    textAlign: 'center',
    marginBottom: 4,
  },
  placeName: {
    fontSize: 16,
    fontFamily: 'montserrat-medium',
    color: Colors.GRAY,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'montserrat-regular',
    color: Colors.GRAY,
    textAlign: 'center',
    marginBottom: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  ratingLabel: {
    fontSize: 14,
    fontFamily: 'montserrat-medium',
    color: Colors.GRAY,
    flex: 1,
  },
  stars: {
    flexDirection: 'row',
    gap: 5,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.GRAY_LIGHT,
    marginVertical: 20,
  },
  aspectsTitle: {
    fontSize: 16,
    fontFamily: 'montserrat-medium',
    color: Colors.PRIMARY,
    marginBottom: 15,
  },
  commentContainer: {
    marginTop: 20,
    marginBottom: 25,
  },
  label: {
    fontSize: 14,
    fontFamily: 'montserrat-medium',
    color: Colors.GRAY,
    marginBottom: 8,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.GRAY_LIGHT,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    fontFamily: 'montserrat-regular',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: Colors.GRAY,
    textAlign: 'right',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.GRAY_LIGHT,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.GRAY,
    fontFamily: 'montserrat-medium',
    fontSize: 16,
  },
  submitButton: {
    flex: 2,
    padding: 15,
    borderRadius: 10,
    backgroundColor: Colors.PRIMARY,
    alignItems: 'center',
  },
  submitButtonText: {
    color: Colors.WHITE,
    fontFamily: 'montserrat-medium',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
}); 