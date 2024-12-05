import { View, Text,StyleSheet } from 'react-native'
import React from 'react'
import Colors from '../../infraestructure/utils/Colors'

export default function CaracteristicItem({name}) {
  return (
    <View style={styles.caracteristicItem}>
    <Text style={styles.caracteristicText}>{name}</Text>
  </View>
  )
}

const styles = StyleSheet.create({
  caracteristicItem: {
    backgroundColor: Colors.PRIMARY,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  caracteristicText: {
    color: 'white',
    fontWeight: 'bold',
  },
})