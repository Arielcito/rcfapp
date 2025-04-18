import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Platform, TouchableOpacity, Modal, TextInput, Button, Switch, ActivityIndicator } from 'react-native';
import { Colors } from '../../../infraestructure/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { FinanceService, FinanceEntry, FinanceCategory } from '../../../infraestructure/api/finance.api';
import { useAuth } from '../../../infraestructure/context/AuthContext';

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
  const { user } = useAuth();
  const [financeData, setFinanceData] = useState<FinanceEntry[]>([]);
  const [categories, setCategories] = useState<FinanceCategory[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isExpense, setIsExpense] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      if (!user?.predioId) {
        throw new Error('No se encontró el predio');
      }
      
      const [movimientos, categorias] = await Promise.all([
        FinanceService.getMovimientos(user.predioId),
        FinanceService.getCategorias()
      ]);
      
      setFinanceData(movimientos);
      setCategories(categorias);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEntry = async () => {
    try {
      if (!user?.predioId) {
        throw new Error('No se encontró el predio');
      }

      const numericAmount = parseFloat(amount);
      if (description.trim() && !isNaN(numericAmount) && numericAmount > 0) {
        const newEntry = await FinanceService.createMovimiento(user.predioId, {
          type: isExpense ? 'expense' : 'income',
          description: description.trim(),
          amount: numericAmount,
          predioId: user.predioId,
          categoriaId: selectedCategory
        });
        
        setFinanceData([newEntry, ...financeData]);
        setModalVisible(false);
        setDescription('');
        setAmount('');
        setSelectedCategory('');
      } else {
        setError('Por favor, ingresa una descripción y un monto válido.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el movimiento');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await FinanceService.deleteMovimiento(id);
      setFinanceData(financeData.filter(entry => entry.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el movimiento');
    }
  };

  // Calculate totals
  const totalIncome = financeData
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalExpenses = financeData
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const balance = totalIncome - totalExpenses;

  const openAddModal = () => {
    setIsExpense(false); // Default to income
    setDescription('');
    setAmount('');
    setSelectedCategory('');
    setModalVisible(true);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={loadData}
        >
          <Text style={styles.retryButtonText}>Reintentar</Text>
        </TouchableOpacity>
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

        {/* Summary Section - Styled similar to OwnerHomeScreen cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Ingresos</Text>
            <Text style={[styles.summaryAmount, styles.income]}>${totalIncome.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Egresos</Text>
            <Text style={[styles.summaryAmount, styles.expense]}>${totalExpenses.toFixed(2)}</Text>
          </View>
           <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={[styles.summaryAmount, balance >= 0 ? styles.income : styles.expense]}>
              ${balance.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* List Section - Styled similar to OwnerHomeScreen/OwnerAppointments lists */}
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>Movimientos Recientes</Text>
          {financeData.length > 0 ? (
            financeData.map((item) => (
              <View key={item.id} style={styles.listItem}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
                </View>
                <View style={styles.itemActions}>
                  <Text style={[styles.itemAmount, item.type === 'income' ? styles.income : styles.expense]}>
                    {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => handleDeleteEntry(item.id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.RED} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hay movimientos registrados.</Text>
          )}
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

            <View style={styles.modalBody}>
              {/* Type Selector (Income/Expense) */}
              <View style={styles.typeSelectorContainer}>
                <Text style={styles.modalLabel}>Tipo:</Text>
                <View style={styles.switchContainer}>
                    <Text style={[styles.switchLabel, !isExpense && styles.activeSwitchLabel]}>Ingreso</Text>
                    <Switch
                        trackColor={{ false: '#76c5a8', true: '#e87c7c' }} // Softer colors
                        thumbColor={isExpense ? '#F44336' : '#4CAF50'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={setIsExpense}
                        value={isExpense}
                    />
                    <Text style={[styles.switchLabel, isExpense && styles.activeSwitchLabel]}>Egreso</Text>
                </View>
              </View>

              {/* Category Selection */}
              <Text style={styles.modalLabel}>Categoría:</Text>
              <View style={styles.categoryContainer}>
                {categories
                  .filter(cat => cat.type === (isExpense ? 'expense' : 'income'))
                  .map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={[
                        styles.categoryButton,
                        selectedCategory === category.id && styles.selectedCategory
                      ]}
                      onPress={() => setSelectedCategory(category.id)}
                    >
                      <Text style={[
                        styles.categoryText,
                        selectedCategory === category.id && styles.selectedCategoryText
                      ]}>
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
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
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15, // Increased padding
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0', // Light separator
  },
  itemInfo: {
    flex: 1, // Take available space
    marginRight: 10,
  },
   itemDescription: {
    fontSize: 16,
    color: Colors.BLACK,
    marginBottom: 3,
    fontFamily: "montserrat-regular", // Consistent font
  },
  itemDate: {
    fontSize: 12,
    color: Colors.GRAY,
    fontFamily: "montserrat-regular", // Consistent font
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: "montserrat-bold", // Consistent font
  },
  income: {
    color: '#4CAF50', // Standard green for income
  },
  expense: {
    color: '#F44336', // Standard red for expense
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: Colors.GRAY,
    fontFamily: "montserrat-regular", // Consistent font
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: Colors.PRIMARY, // Use PRIMARY color
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8, // Add shadow for FAB
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    minHeight: '50%', // Adjust as needed
    maxHeight: '80%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 }, // Shadow for top edge
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
    marginTop: 'auto', // Push buttons to the bottom
    paddingTop: 20,
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
  errorText: {
    color: Colors.RED,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: Colors.WHITE,
    fontWeight: 'bold',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategory: {
    backgroundColor: Colors.PRIMARY,
  },
  categoryText: {
    color: Colors.GRAY,
  },
  selectedCategoryText: {
    color: Colors.WHITE,
  },
});

export default FinanceManagementScreen; 