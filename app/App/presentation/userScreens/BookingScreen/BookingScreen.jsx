import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import { useRoute } from '@react-navigation/native'
import Colors from '../../../infraestructure/utils/Colors';
import AppointmentFieldInfo from './AppointmentFieldInfo';
import BookingSection from './BookingSection';

export default function BookingScreen() {
  const param=useRoute().params;
  const date = useRoute().params.date;
  const time = useRoute().params.time
  return (
    <ScrollView >
        <AppointmentFieldInfo place={param.place}  />
        <BookingSection  place={param.place} preselectedDate={date} preselectedTime={time} />
    </ScrollView>
  )
}
