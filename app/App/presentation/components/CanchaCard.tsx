import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cancha } from '../../types/predio';
import Colors from '../../infrastructure/utils/Colors';

interface CanchaCardProps {
  cancha: Cancha;
  onEdit: (cancha: Cancha) => void;
  onDelete: (canchaId: string) => void;
}

const CanchaCard: React.FC<CanchaCardProps> = ({ cancha, onEdit, onDelete }) => {
  const handleDelete = () => {
    Alert.alert(
      'Eliminar Cancha',
      `¿Estás seguro de que quieres eliminar "${cancha.nombre}"?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => onDelete(cancha.id),
        },
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{cancha.nombre}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(cancha)}
          >
            <Ionicons name="pencil" size={20} color={Colors.PRIMARY} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Tipo:</Text>
          <Text style={styles.value}>{cancha.tipo || 'No especificado'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Superficie:</Text>
          <Text style={styles.value}>{cancha.tipoSuperficie || 'No especificado'}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Dimensiones:</Text>
          <Text style={styles.value}>
            {cancha.ancho && cancha.longitud 
              ? `${cancha.ancho}m x ${cancha.longitud}m`
              : 'No especificado'
            }
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Capacidad:</Text>
          <Text style={styles.value}>
            {cancha.capacidadJugadores ? `${cancha.capacidadJugadores} jugadores` : 'No especificado'}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.label}>Precio por hora:</Text>
          <Text style={styles.price}>${cancha.precioPorHora}</Text>
        </View>
        
        <View style={styles.features}>
          {cancha.tieneIluminacion && (
            <View style={styles.feature}>
              <Ionicons name="bulb" size={16} color={Colors.PRIMARY} />
              <Text style={styles.featureText}>Iluminación</Text>
            </View>
          )}
          
          {cancha.esTechada && (
            <View style={styles.feature}>
              <Ionicons name="umbrella" size={16} color={Colors.PRIMARY} />
              <Text style={styles.featureText}>Techada</Text>
            </View>
          )}
          
          {cancha.requiereSeña && (
            <View style={styles.feature}>
              <Ionicons name="card" size={16} color={Colors.PRIMARY} />
              <Text style={styles.featureText}>Requiere seña</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  price: {
    fontSize: 16,
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
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
});

export default CanchaCard; 