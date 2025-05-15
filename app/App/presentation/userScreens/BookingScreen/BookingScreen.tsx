import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import React, { useState } from 'react'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Colors from '../../../infraestructure/utils/Colors';
import AppointmentFieldInfo from './AppointmentFieldInfo';
import BookingSection from './BookingSection';
import { Predio, Cancha } from '../../../types/booking';

interface BookingScreenParams {
  place?: Predio;
  preselectedDate?: string | Date;
  preselectedTime?: string;
}

type RootStackParamList = {
  'pitch-profile': {
    place?: Predio;
    selectedDate: any;
    selectedTime: string | null;
    selectedCancha: Cancha | null;
  };
  payment: {
    appointmentData: {
      place?: Predio;
      cancha: Cancha | null;
    };
    selectedDate: any;
    selectedTime: string | null;
  };
};

type BookingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function BookingScreen() {
  const param = useRoute().params as BookingScreenParams;
  const navigation = useNavigation<BookingScreenNavigationProp>();
  const [selectedCancha, setSelectedCancha] = useState<Cancha | null>(null);
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  console.log('BookingScreen - Parámetros recibidos:', JSON.stringify(param));
  
  // Obtenemos los parámetros con los nombres correctos
  const date = param?.preselectedDate;
  const time = param?.preselectedTime;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <AppointmentFieldInfo place={param?.place} />
        <BookingSection 
          place={param?.place} 
          preselectedDate={date} 
          preselectedTime={time}
          onCanchaSelect={setSelectedCancha}
          onDateSelect={setSelectedDate}
          onTimeSelect={setSelectedTime}
        />
      </ScrollView>

      <View style={styles.stickyButtonContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("pitch-profile", {
              place: param?.place,
              selectedDate: selectedDate,
              selectedTime: selectedTime,
              selectedCancha: selectedCancha
            });
          }}
          disabled={!selectedCancha}
          style={[styles.viewProfileButton, !selectedCancha && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>Ver Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("payment", {
              appointmentData: { place: param?.place, cancha: selectedCancha },
              selectedDate: selectedDate,
              selectedTime: selectedTime,
            });
          }}
          disabled={!selectedCancha}
          style={[styles.reserveButton, !selectedCancha && styles.disabledButton]}
        >
          <Text style={styles.buttonText}>Reservar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  stickyButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: 'white',
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  viewProfileButton: {
    backgroundColor: Colors.GRAY,
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  reserveButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});
