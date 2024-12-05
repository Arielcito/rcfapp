import { View, Text } from 'react-native'
import React from 'react'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../../infraestructure/utils/Colors';

export default function SearchBar({searchedLocation}) {
    
  return (
    <View style={{
        display:'flex',
        flexDirection:'row',
        marginTop:15,
        paddingHorizontal:5,
        backgroundColor:Colors.WHITE,
        borderRadius:6
    }}>
        <Ionicons name="location-sharp" size={24} 
        color={Colors.GRAY} style={{paddingTop:10,zIndex:100}} />
       <GooglePlacesAutocomplete
        placeholder='Donde queres jugar?'
        fetchDetails={true}
        onPress={(data, details = null) => {

            searchedLocation(details?.geometry?.location)
        }}
      query={{
        key: 'AIzaSyDiNmgWgB0CGoM1EG6CT846M83bpRdso-Q',
        language: 'es',
      }}
    />
    </View>
  )
}