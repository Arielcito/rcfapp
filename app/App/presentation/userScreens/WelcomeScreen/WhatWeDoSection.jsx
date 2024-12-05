import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import SubHeading from '../../components/SubHeading'
import CircleCTA from '../../components/CircleCTA'

export default function WhatWeDoSection() {
  return (
    <View>
      <SubHeading subHeadingTitle={"Que hacemos hoy?"} seelAll={false}/>
      <View style={styles.circleContainer}>
        <CircleCTA ctaTitle={"Reservar"} ctaLink={"booking"}/>
        <CircleCTA ctaTitle={"Buscar"} ctaLink={"search-team"}/>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  circleContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10
  }
});