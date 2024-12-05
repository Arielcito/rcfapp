import { View, Text, FlatList, Image } from 'react-native'
import React from 'react'

export default function PredioItem({predio}) {

  return (
    <View>
        <Image source={{uri: predio.imageUrl}} style={{width: 100, height: 100}}/>
        <Text>{predio.address}</Text>
        <Text>{predio.name}</Text>
    </View>
  )
}