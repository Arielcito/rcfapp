import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native'
import Colors from '../../../infraestructure/utils/Colors';
import AppointmentFieldInfo from './AppointmentFieldInfo';
import BookingSection from './BookingSection';

export default function BookingScreen() {
  const param = useRoute().params;
  console.log('BookingScreen - Parámetros recibidos:', JSON.stringify(param));
  
  // Obtenemos los parámetros con los nombres correctos
  const date = param?.preselectedDate;
  const time = param?.preselectedTime;
  
  console.log('BookingScreen - Datos procesados:', {
    place: param?.place,
    preselectedDate: date,
    preselectedTime: time
  });

  return (
    <ScrollView>
      <AppointmentFieldInfo place={param?.place} />
      <BookingSection 
        place={param?.place} 
        preselectedDate={date} 
        preselectedTime={time} 
      />
    </ScrollView>
  )
}
