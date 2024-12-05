import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons';

const OwnerHomeScreen = () => {
  const data = {
    labels: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
    datasets: [
      {
        data: [1, 2, 3, 4, 5, 6, 7],
        color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
        strokeWidth: 2
      }
    ]
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <View style={styles.profilePic} />
          <Text style={styles.greeting}>Hola Ariel!</Text>
          <Icon name="menu" size={24} color="#000" style={styles.menuIcon} />
        </View>
        <Text style={styles.subGreeting}>Mira tus reservas de hoy</Text>
        
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Canchas reservadas</Text>
          <Text style={styles.chartSubtitle}>Última semana</Text>
          <LineChart
            data={data}
            width={350}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              }
            }}
            bezier
            style={styles.chart}
          />
          <Text style={styles.chartFooter}>40 canchas reservadas en total</Text>
        </View>
      </ScrollView>
    
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  menuIcon: {
    marginLeft: 'auto',
  },
  subGreeting: {
    fontSize: 16,
    marginTop: 10,
    marginLeft: 20,
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartFooter: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
});

export default OwnerHomeScreen;