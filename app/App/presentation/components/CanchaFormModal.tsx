import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Cancha, CanchaFormData } from '../../types/predio';
import Colors from '../../infrastructure/utils/Colors';
import ButtonPrimary from './ButtonPrimary';

interface CanchaFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CanchaFormData) => void;
  cancha?: Cancha | null;
  isLoading?: boolean;
}

const CanchaFormModal: React.FC<CanchaFormModalProps> = ({
  visible,
  onClose,
  onSubmit,
  cancha,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CanchaFormData>({
    nombre: '',
    tipo: '',
    tipoSuperficie: '',
    capacidadJugadores: 0,
    longitud: 0,
    ancho: 0,
    tieneIluminacion: false,
    esTechada: false,
    precioPorHora: 0,
    estado: 'Excelente',
    equipamientoIncluido: '',
    requiereSeña: false,
    montoSeña: 0,
  });

  useEffect(() => {
    if (cancha) {
      setFormData({
        nombre: cancha.nombre,
        tipo: cancha.tipo || '',
        tipoSuperficie: cancha.tipoSuperficie || '',
        capacidadJugadores: cancha.capacidadJugadores || 0,
        longitud: cancha.longitud || 0,
        ancho: cancha.ancho || 0,
        tieneIluminacion: cancha.tieneIluminacion,
        esTechada: cancha.esTechada,
        precioPorHora: parseInt(cancha.precioPorHora) || 0,
        estado: cancha.estado || 'Excelente',
        equipamientoIncluido: cancha.equipamientoIncluido || '',
        requiereSeña: cancha.requiereSeña,
        montoSeña: cancha.montoSeña,
      });
    } else {
      // Reset form for new cancha
      setFormData({
        nombre: '',
        tipo: '',
        tipoSuperficie: '',
        capacidadJugadores: 0,
        longitud: 0,
        ancho: 0,
        tieneIluminacion: false,
        esTechada: false,
        precioPorHora: 0,
        estado: 'Excelente',
        equipamientoIncluido: '',
        requiereSeña: false,
        montoSeña: 0,
      });
    }
  }, [cancha, visible]);

  const handleSubmit = () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre de la cancha es obligatorio');
      return;
    }
    
    if (formData.precioPorHora <= 0) {
      Alert.alert('Error', 'El precio por hora debe ser mayor a 0');
      return;
    }

    onSubmit(formData);
  };

  const updateField = (field: keyof CanchaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {cancha ? 'Editar Cancha' : 'Nueva Cancha'}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Información Básica</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre *</Text>
              <TextInput
                style={styles.input}
                value={formData.nombre}
                onChangeText={(text) => updateField('nombre', text)}
                placeholder="Ej: Cancha 1 - Fútbol 11"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Deporte</Text>
              <TextInput
                style={styles.input}
                value={formData.tipo}
                onChangeText={(text) => updateField('tipo', text)}
                placeholder="Ej: Fútbol, Paddle, Tenis"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tipo de Superficie</Text>
              <TextInput
                style={styles.input}
                value={formData.tipoSuperficie}
                onChangeText={(text) => updateField('tipoSuperficie', text)}
                placeholder="Ej: Césped sintético, Cemento"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Dimensiones y Capacidad</Text>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Ancho (m)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.ancho.toString()}
                  onChangeText={(text) => updateField('ancho', parseInt(text) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Longitud (m)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.longitud.toString()}
                  onChangeText={(text) => updateField('longitud', parseInt(text) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Capacidad de Jugadores</Text>
              <TextInput
                style={styles.input}
                value={formData.capacidadJugadores.toString()}
                onChangeText={(text) => updateField('capacidadJugadores', parseInt(text) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Características</Text>
            
            <View style={styles.switchRow}>
              <Text style={styles.label}>Tiene Iluminación</Text>
              <Switch
                value={formData.tieneIluminacion}
                onValueChange={(value) => updateField('tieneIluminacion', value)}
                trackColor={{ false: '#767577', true: Colors.PRIMARY }}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Es Techada</Text>
              <Switch
                value={formData.esTechada}
                onValueChange={(value) => updateField('esTechada', value)}
                trackColor={{ false: '#767577', true: Colors.PRIMARY }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estado</Text>
              <TextInput
                style={styles.input}
                value={formData.estado}
                onChangeText={(text) => updateField('estado', text)}
                placeholder="Ej: Excelente, Muy bueno, Bueno"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Equipamiento Incluido</Text>
              <TextInput
                style={styles.input}
                value={formData.equipamientoIncluido}
                onChangeText={(text) => updateField('equipamientoIncluido', text)}
                placeholder="Ej: Arcos, redes, pelotas"
                multiline
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Precios y Seña</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Precio por Hora *</Text>
              <TextInput
                style={styles.input}
                value={formData.precioPorHora.toString()}
                onChangeText={(text) => updateField('precioPorHora', parseInt(text) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Requiere Seña</Text>
              <Switch
                value={formData.requiereSeña}
                onValueChange={(value) => updateField('requiereSeña', value)}
                trackColor={{ false: '#767577', true: Colors.PRIMARY }}
              />
            </View>

            {formData.requiereSeña && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Monto de Seña</Text>
                <TextInput
                  style={styles.input}
                  value={formData.montoSeña.toString()}
                  onChangeText={(text) => updateField('montoSeña', parseInt(text) || 0)}
                  keyboardType="numeric"
                  placeholder="0"
                />
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <ButtonPrimary
            text={isLoading ? 'Guardando...' : (cancha ? 'Actualizar' : 'Crear Cancha')}
            onPress={handleSubmit}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

export default CanchaFormModal; 