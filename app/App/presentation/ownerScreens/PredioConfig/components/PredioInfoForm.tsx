import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { Predio, PredioFormData } from '../../../../types/predio';
import Colors from '../../../../infrastructure/utils/Colors';
import ButtonPrimary from '../../../components/ButtonPrimary';

interface PredioInfoFormProps {
  predio?: Predio;
  onSubmit: (data: PredioFormData) => void;
  isLoading?: boolean;
}

const PredioInfoForm: React.FC<PredioInfoFormProps> = ({
  predio,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<PredioFormData>({
    nombre: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    telefono: '',
    email: '',
    capacidadEstacionamiento: 0,
    tieneVestuarios: false,
    tieneCafeteria: false,
    horarioApertura: '',
    horarioCierre: '',
  });

  useEffect(() => {
    if (predio) {
      setFormData({
        nombre: predio.nombre,
        direccion: predio.direccion,
        ciudad: predio.ciudad,
        provincia: predio.provincia,
        telefono: predio.telefono || '',
        email: predio.email || '',
        capacidadEstacionamiento: predio.capacidadEstacionamiento || 0,
        tieneVestuarios: predio.tieneVestuarios || false,
        tieneCafeteria: predio.tieneCafeteria || false,
        horarioApertura: predio.horarioApertura || '',
        horarioCierre: predio.horarioCierre || '',
      });
    }
  }, [predio]);

  const handleSubmit = () => {
    if (!formData.nombre.trim()) {
      Alert.alert('Error', 'El nombre del predio es obligatorio');
      return;
    }
    
    if (!formData.direccion.trim()) {
      Alert.alert('Error', 'La dirección es obligatoria');
      return;
    }

    if (!formData.ciudad.trim()) {
      Alert.alert('Error', 'La ciudad es obligatoria');
      return;
    }

    if (!formData.provincia.trim()) {
      Alert.alert('Error', 'La provincia es obligatoria');
      return;
    }

    onSubmit(formData);
  };

  const updateField = (field: keyof PredioFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!predio) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando información del predio...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Básica</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre del Predio *</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(text) => updateField('nombre', text)}
            placeholder="Nombre del complejo deportivo"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dirección *</Text>
          <TextInput
            style={styles.input}
            value={formData.direccion}
            onChangeText={(text) => updateField('direccion', text)}
            placeholder="Dirección completa"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Ciudad *</Text>
            <TextInput
              style={styles.input}
              value={formData.ciudad}
              onChangeText={(text) => updateField('ciudad', text)}
              placeholder="Ciudad"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Provincia *</Text>
            <TextInput
              style={styles.input}
              value={formData.provincia}
              onChangeText={(text) => updateField('provincia', text)}
              placeholder="Provincia"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Contacto</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={formData.telefono}
            onChangeText={(text) => updateField('telefono', text)}
            placeholder="+54 11 1234-5678"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            placeholder="info@predio.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horarios de Operación</Text>
        
        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Horario de Apertura</Text>
            <TextInput
              style={styles.input}
              value={formData.horarioApertura}
              onChangeText={(text) => updateField('horarioApertura', text)}
              placeholder="08:00"
            />
          </View>

          <View style={[styles.inputGroup, styles.halfWidth]}>
            <Text style={styles.label}>Horario de Cierre</Text>
            <TextInput
              style={styles.input}
              value={formData.horarioCierre}
              onChangeText={(text) => updateField('horarioCierre', text)}
              placeholder="23:00"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicios e Instalaciones</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Capacidad de Estacionamiento</Text>
          <TextInput
            style={styles.input}
            value={formData.capacidadEstacionamiento.toString()}
            onChangeText={(text) => updateField('capacidadEstacionamiento', parseInt(text) || 0)}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Tiene Vestuarios</Text>
          <Switch
            value={formData.tieneVestuarios}
            onValueChange={(value) => updateField('tieneVestuarios', value)}
            trackColor={{ false: '#767577', true: Colors.PRIMARY }}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Tiene Cafetería</Text>
          <Switch
            value={formData.tieneCafeteria}
            onValueChange={(value) => updateField('tieneCafeteria', value)}
            trackColor={{ false: '#767577', true: Colors.PRIMARY }}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <ButtonPrimary
          text={isLoading ? 'Guardando...' : 'Guardar Cambios'}
          onPress={handleSubmit}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
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
    marginTop: 8,
  },
});

export default PredioInfoForm; 