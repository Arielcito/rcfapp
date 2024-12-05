import { View, Text, StyleSheet, Pressable } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
export default function CircleCTA({ctaTitle, ctaLink}) {
  const navigation = useNavigation();

  return (
    <Pressable onPress={()=> navigation.navigate({ctaLink})} style={styles.ctaContainer}>
      <View style={styles.circle} />
      <Text>{ctaTitle}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  circle: {
    width:100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'blue',
  },
  ctaContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10
  }
});