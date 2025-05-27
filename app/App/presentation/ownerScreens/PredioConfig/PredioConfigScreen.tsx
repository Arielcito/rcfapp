import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  usePredioConfig,
  usePredioCanchas,
  useCreateCancha,
  useUpdateCancha,
  useDeleteCancha,
  useUpdatePredio,
} from '../../../application/hooks/usePredioConfig';
import { Cancha, CanchaFormData, PredioFormData } from '../../../types/predio';
import Colors from '../../../infrastructure/utils/Colors';
import CanchaCard from '../../components/CanchaCard';
import CanchaFormModal from '../../components/CanchaFormModal';
import PredioInfoForm from './components/PredioInfoForm';
import { useCurrentUser } from '../../../application/context/CurrentUserContext';
import { useCurrentPlace } from '../../../application/context/CurrentPlaceContext';

type TabType = 'info' | 'canchas';

const PredioConfigScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCancha, setSelectedCancha] = useState<Cancha | null>(null);

  // Get current user and predio info
  const { currentUser } = useCurrentUser();
  const { currentPlace, isLoading: isLoadingPlace } = useCurrentPlace();

  // Queries
  const { data: canchas = [], isLoading: canchasLoading, refetch: refetchCanchas } = usePredioCanchas(currentPlace?.id || '');

  // Mutations
  const updatePredioMutation = useUpdatePredio();
  const createCanchaMutation = useCreateCancha();
  const updateCanchaMutation = useUpdateCancha();
  const deleteCanchaMutation = useDeleteCancha();

  const isLoading = isLoadingPlace || canchasLoading;

  // Si no hay predio, mostrar empty state
  if (!currentPlace) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="business" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No hay información del predio</Text>
          <Text style={styles.emptySubtitle}>
            No se encontró la información del predio. Por favor, contacta al administrador del sistema.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleRefresh = () => {
    refetchCanchas();
  };

  const handleUpdatePredio = async (data: PredioFormData) => {
    try {
      await updatePredioMutation.mutateAsync({
        predioId: currentPlace.id,
        data,
      });
      Alert.alert('Éxito', 'Información del predio actualizada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la información del predio');
    }
  };

  const handleCreateCancha = async (data: CanchaFormData) => {
    try {
      await createCanchaMutation.mutateAsync({
        predioId: currentPlace.id,
        data,
      });
      setModalVisible(false);
      setSelectedCancha(null);
      Alert.alert('Éxito', 'Cancha creada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la cancha');
    }
  };

  const handleUpdateCancha = async (data: CanchaFormData) => {
    if (!selectedCancha) return;
    
    try {
      await updateCanchaMutation.mutateAsync({
        predioId: currentPlace.id,
        canchaId: selectedCancha.id,
        data,
      });
      setModalVisible(false);
      setSelectedCancha(null);
      Alert.alert('Éxito', 'Cancha actualizada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la cancha');
    }
  };

  const handleDeleteCancha = async (canchaId: string) => {
    try {
      await deleteCanchaMutation.mutateAsync({
        predioId: currentPlace.id,
        canchaId,
      });
      Alert.alert('Éxito', 'Cancha eliminada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo eliminar la cancha');
    }
  };

  const handleEditCancha = (cancha: Cancha) => {
    setSelectedCancha(cancha);
    setModalVisible(true);
  };

  const handleNewCancha = () => {
    setSelectedCancha(null);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedCancha(null);
  };

  const renderTabButton = (tab: TabType, label: string, icon: string) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === tab ? Colors.PRIMARY : '#666'}
      />
      <Text style={[styles.tabLabel, activeTab === tab && styles.activeTabLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderInfoTab = () => (
    <PredioInfoForm
      predio={currentPlace}
      onSubmit={handleUpdatePredio}
      isLoading={updatePredioMutation.isPending}
    />
  );

  const renderCanchasTab = () => (
    <View style={styles.canchasContainer}>
      <View style={styles.canchasHeader}>
        <Text style={styles.canchasTitle}>
          Canchas ({canchas.length})
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleNewCancha}
        >
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Nueva Cancha</Text>
        </TouchableOpacity>
      </View>

      {canchas.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="football" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No hay canchas registradas</Text>
          <Text style={styles.emptySubtitle}>
            Agrega tu primera cancha para comenzar a recibir reservas
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={handleNewCancha}
          >
            <Text style={styles.emptyButtonText}>Agregar Cancha</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.canchasList}
        >
          {canchas.map((cancha) => (
            <CanchaCard
              key={cancha.id}
              cancha={cancha}
              onEdit={handleEditCancha}
              onDelete={handleDeleteCancha}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuración del Predio</Text>
      </View>

      <View style={styles.tabs}>
        {renderTabButton('info', 'Información', 'information-circle')}
        {renderTabButton('canchas', 'Canchas', 'football')}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={Colors.PRIMARY}
          />
        }
      >
        {activeTab === 'info' ? renderInfoTab() : renderCanchasTab()}
      </ScrollView>

      <CanchaFormModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSubmit={selectedCancha ? handleUpdateCancha : handleCreateCancha}
        cancha={selectedCancha}
        isLoading={createCanchaMutation.isPending || updateCanchaMutation.isPending}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.PRIMARY,
  },
  tabLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: Colors.PRIMARY,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  canchasContainer: {
    flex: 1,
    padding: 16,
  },
  canchasHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  canchasTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  canchasList: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PredioConfigScreen; 