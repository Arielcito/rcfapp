import React from 'react';
import { View, Button, StyleSheet } from 'react-native';
import { monitoringService } from './MonitoringService';
import { withPerformanceTracking, withErrorBoundary, logError, logInfo, logWarn } from './utils';
import { monitoringConstants } from './config';

export const TestMonitoring: React.FC = () => {
  // Prueba 1: Error simulado
  const testError = async () => {
    try {
      throw new Error('Este es un error de prueba');
    } catch (error) {
      logError('Error de prueba capturado', {
        errorType: 'test_error',
        timestamp: Date.now()
      });
    }
  };

  // Prueba 2: Rendimiento
  const testPerformance = async () => {
    await withPerformanceTracking('test_operation', async () => {
      // Simular una operación que toma tiempo
      await new Promise(resolve => setTimeout(resolve, 2000));
      logInfo('Operación de prueba completada', {
        duration: 2000,
        operationType: 'test'
      });
    });
  };

  // Prueba 3: Error Boundary
  const testErrorBoundary = async () => {
    await withErrorBoundary(
      async () => {
        throw new Error('Error dentro del boundary');
      },
      {
        operationType: 'error_boundary_test',
        customContext: 'test context'
      }
    );
  };

  // Prueba 4: Logs en diferentes niveles
  const testLogs = () => {
    logInfo('Mensaje de información de prueba', { type: 'test_log' });
    logWarn('Advertencia de prueba', { type: 'test_warning' });
    logError('Error de prueba', { type: 'test_error' });
  };

  // Prueba 5: Métricas de rendimiento personalizadas
  const testCustomMetric = async () => {
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, 1500));
    const endTime = Date.now();

    await monitoringService.trackPerformance({
      name: 'custom_test_metric',
      startTime,
      endTime,
      duration: endTime - startTime,
      attributes: {
        testType: 'custom',
        category: 'performance'
      }
    });
  };

  return (
    <View style={styles.container}>
      <Button 
        title="Probar Error" 
        onPress={testError}
      />
      <Button 
        title="Probar Rendimiento" 
        onPress={testPerformance}
      />
      <Button 
        title="Probar Error Boundary" 
        onPress={testErrorBoundary}
      />
      <Button 
        title="Probar Logs" 
        onPress={testLogs}
      />
      <Button 
        title="Probar Métrica Personalizada" 
        onPress={testCustomMetric}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10
  }
}); 