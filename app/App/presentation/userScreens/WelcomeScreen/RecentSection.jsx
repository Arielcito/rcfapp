import { View, Text, FlatList } from 'react-native'
import React from 'react'
import SubHeading from '../../components/SubHeading'
import { predio } from '../../../../data';
import PredioItem from '../../components/PredioItem';
import PlaceItem from '../HomeScreen/PlaceItem';

export default function RecentSection() {
  const predios = predio.slice(0, 2);

  return (
    <View>
      <SubHeading subHeadingTitle={"Mis canchas recientes"} seelAll={false}/>
      <FlatList
        data={predio}
        renderItem={({item}) => (
            <PlaceItem place={item}/>
        )}
        keyExtractor={item => item.id}
        horizontal={true}
        />
    </View>
  )
}