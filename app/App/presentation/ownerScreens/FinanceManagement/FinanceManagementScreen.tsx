import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform, TouchableOpacity, Modal, TextInput, Button, Switch, ActivityIndicator } from 'react-native';
import Colors from '../../../infraestructure/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { FinanceService, FinanceEntry } from '../../../infraestructure/api/finance.api';
import { useCurrentUser } from '../../../application/context/CurrentUserContext';
import { useCurrentPlace } from '../../../application/context/CurrentPlaceContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Helper function to format date
const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  } catch (error) {
    return dateStr;
  }
};

const FinanceManagementScreen = () => {
  const { currentPlace, isLoading: isLoadingPlace } = useCurrentPlace();
  const [modalVisible, setModalVisible] = useState(false);
  const [isExpense, setIsExpense] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const queryClient = useQueryClient();

  const { data: financeData = [], isLoading, error } = useQuery({
    queryKey: ['movimientos', currentPlace?.id],
    queryFn: () => {
      if (!currentPlace?.id) {
        throw new Error('No se encontró el predio');
      }
      return FinanceService.getMovimientos(currentPlace.id);
    },
    enabled: !!currentPlace?.id,
  });

  const createMovimientoMutation = useMutation({
    mutationFn: (movimiento: Omit<FinanceEntry, 'id' | 'fechaMovimiento'>) => {
      if (!currentPlace?.id) {
        throw new Error('No se encontró el predio');
      }
      return FinanceService.createMovimiento(currentPlace.id, movimiento);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
      setModalVisible(false);
      setDescription('');
      setAmount('');
    },
  });

  const deleteMovimientoMutation = useMutation({
    mutationFn: (id: string) => FinanceService.deleteMovimiento(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimientos'] });
    },
  });

  const handleSaveEntry = async () => {
    try {
      const numericAmount = parseFloat(amount);
      if (description.trim() && !isNaN(numericAmount) && numericAmount > 0) {
        await createMovimientoMutation.mutateAsync({
          tipo: isExpense ? 'EGRESO' : 'INGRESO',
          concepto: description.trim(),
          monto: numericAmount,
          predioId: currentPlace?.id || '',
          categoriaId: '',
          metodoPago: 'EFECTIVO'
        });
      } else {
        throw new Error('Por favor, ingresa una descripción y un monto válido.');
      }
    } catch (err) {
      console.error('Error saving entry:', err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await deleteMovimientoMutation.mutateAsync(id);
    } catch (err) {
      console.error('Error deleting entry:', err);
    }
  };

  // Calculate totals
  const totalIncome = financeData
    .filter(entry => entry.tipo === 'INGRESO')
    .reduce((sum, entry) => sum + (entry.monto || 0), 0);

  const totalExpenses = financeData
    .filter(entry => entry.tipo === 'EGRESO')
    .reduce((sum, entry) => sum + (entry.monto || 0), 0);

  const balance = totalIncome - totalExpenses;

  const openAddModal = () => {
    setIsExpense(false); // Default to income
    setDescription('');
    setAmount('');
    setModalVisible(true);
  };

  if (isLoading || isLoadingPlace) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
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
           <Text style={styles.title}>Flujo de Fondos</Text>
        </View>

        {/* Summary Section - Show empty state for summary when no data */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Ingresos</Text>
            <Text style={[styles.summaryAmount, styles.income]}>
              $0.00
            </Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Egresos</Text>
            <Text style={[styles.summaryAmount, styles.expense]}>
              $0.00
            </Text>
          </View>
           <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={[styles.summaryAmount, styles.income]}>
              $0.00
            </Text>
          </View>
        </View>

        {/* List Section - Always show empty state when no data */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Movimientos Recientes</Text>
          <View style={styles.emptyStateContainer}>
            <Ionicons name="wallet-outline" size={60} color={Colors.GRAY} />
            <Text style={styles.emptyStateTitle}>No hay movimientos registrados</Text>
            <Text style={styles.emptyStateSubtitle}>Comienza agregando tu primer ingreso o egreso</Text>
            <TouchableOpacity 
              style={styles.emptyStateButton}
              onPress={openAddModal}
            >
              <Ionicons name="add" size={20} color={Colors.WHITE} />
              <Text style={styles.emptyStateButtonText}>Agregar Movimiento</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* Floating Action Button (FAB) */}
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={30} color={Colors.WHITE} />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Movimiento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.GRAY} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Type Selector (Income/Expense) */}
              <View style={styles.typeSelectorContainer}>
                <Text style={styles.modalLabel}>Tipo:</Text>
                <View style={styles.switchContainer}>
                    <Text style={[styles.switchLabel, !isExpense && styles.activeSwitchLabel]}>Ingreso</Text>
                    <Switch
                        trackColor={{ false: '#76c5a8', true: '#e87c7c' }}
                        thumbColor={isExpense ? '#F44336' : '#4CAF50'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={setIsExpense}
                        value={isExpense}
                    />
                    <Text style={[styles.switchLabel, isExpense && styles.activeSwitchLabel]}>Egreso</Text>
                </View>
              </View>

              {/* Description Input */}
              <Text style={styles.modalLabel}>Descripción:</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Alquiler Cancha 1"
                value={description}
                onChangeText={setDescription}
              />

              {/* Amount Input */}
              <Text style={styles.modalLabel}>Monto:</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
              />
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveEntry}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Standard light gray background
    paddingTop: Platform.OS === 'android' ? 25 : 0, 
  },
  scrollContent: {
    paddingBottom: 80, // Ensure content doesn't hide behind FAB
  },
  header: {
    padding: 20,
    paddingTop: 30, // More padding top like OwnerAppointments
    backgroundColor: Colors.WHITE, 
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  title: {
    fontSize: 24, // Slightly larger title
    fontWeight: 'bold',
    color: Colors.BLACK, // Using BLACK from palette
    fontFamily: "montserrat-medium", // Match font from OwnerAppointments
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 15,
    marginBottom: 20,
    backgroundColor: Colors.WHITE,
    paddingVertical: 20, // Increased padding
    paddingHorizontal: 10,
    borderRadius: 15, // More rounded corners
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  summaryBox: {
    alignItems: 'center',
    flex: 1, // Distribute space evenly
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.GRAY, // Using GRAY from palette
    marginBottom: 5,
    fontFamily: "montserrat-regular", // Consistent font
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: "montserrat-bold", // Consistent font
  },
  listContainer: {
    marginHorizontal: 15,
    backgroundColor: Colors.WHITE,
    padding: 20, // Increased padding
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginBottom: 15,
    fontFamily: "montserrat-bold", // Consistent font
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.BLACK,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: "montserrat-bold",
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: Colors.GRAY,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: "montserrat-regular",
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: Colors.WHITE,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: "montserrat-bold",
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 100,
    backgroundColor: Colors.PRIMARY,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1000,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dimmed background
    justifyContent: 'flex-end', // Aligns modal to bottom
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 15,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.BLACK,
    fontFamily: "montserrat-bold",
  },
  modalBody: {
    flex: 1,
    marginBottom: 80, // Space for fixed buttons
  },
  modalLabel: {
    fontSize: 16,
    color: Colors.GRAY,
    marginBottom: 8,
    fontFamily: "montserrat-medium",
  },
  input: {
    backgroundColor: '#f0f0f0', // Light background for input
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
    color: Colors.BLACK,
    fontFamily: "montserrat-regular",
  },
  typeSelectorContainer: {
    marginBottom: 20,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', // Space out elements
    backgroundColor: '#f0f0f0', 
    paddingVertical: 10,
    borderRadius: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: "montserrat-regular",
    color: Colors.GRAY,
  },
  activeSwitchLabel: {
    fontWeight: 'bold',
    color: Colors.BLACK, // Highlight active type
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: Colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  modalButton: {
    flex: 1, // Make buttons take equal width
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5, // Add space between buttons
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: Colors.GRAY,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: "montserrat-bold",
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
  },
  saveButtonText: {
    color: Colors.WHITE,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: "montserrat-bold",
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  income: {
    color: '#4CAF50', // Standard green for income
  },
  expense: {
    color: '#F44336', // Standard red for expense
  },
});

export default FinanceManagementScreen; 