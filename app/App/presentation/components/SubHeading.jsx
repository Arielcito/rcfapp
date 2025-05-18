import { View, Text } from 'react-native'
import React from 'react'
import Colors from '../../infrastructure/utils/Colors'

export default function SubHeading({subHeadingTitle,seelAll=false}) {
  return (
    <View style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom:10,
        marginTop:10,
        paddingLeft:10,
    }}>
        <Text style={{
            fontSize: 20,
            fontFamily: 'montserrat-medium'
        }}>{subHeadingTitle}</Text>
       {seelAll? <Text style={{
            fontFamily: 'montserrat',
            color: Colors.PRIMARY
        }}>See All</Text>:null}
    </View>
  )
}