import { View, Text, ActivityIndicator, Image, FlatList, Pressable, Linking } from 'react-native'
import React from 'react'
import Colors from '../../../infraestructure/utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { FIREBASE_AUTH } from '../../../infraestructure/config/FirebaseConfig';
export default function OwnerProfileScreen() {
  const auth = FIREBASE_AUTH;
  const user = auth.currentUser;

  const menu=[
   
    {
      id:2,
      name:'Cerrar sesión',
      icon:'exit-outline'
    }
  ]
  const signOut=()=>{
    auth.signOut().then(()=>{
      console.log('Sign Out');
    }).catch((error)=>{
      console.log(error);
    })
  }
  const navigation=useNavigation();
  return (
    <View>
      <Text style={{padding:10,fontFamily:'montserrat-medium',
    fontSize:30, marginTop:30}}>Mi
     <Text style={{color:Colors.PRIMARY}}> Perfil</Text></Text>
    
    {!user&&<View style={{display:'flex',
  justifyContent:'center',alignItems:'center'}}>
      <ActivityIndicator size={'large'}
      color={Colors.PRIMARY}/>
    </View>}
    <View style={{alignItems:'center',marginTop:10}}>
      <Text style={{
        fontFamily:'montserrat-medium',
        fontSize:25,
        marginTop:10
      }}>{user?.fullName}</Text>
          <Text style={{
        fontFamily:'montserrat',
        fontSize:17,
        marginTop:5,
        color:Colors.GRAY
      }}>{user?.email}</Text>
    </View>
    <FlatList
      data={menu}
      style={{
        marginTop:50,
        marginHorizontal:50
      }}
      renderItem={({item,index})=>(
        <Pressable 
        onPress={()=>
          item.id==1?
          navigation.navigate('owner-pitches')
          :item.id==2?signOut()
          :navigation.navigate('appointments')

        }
        style={{
          display:'flex',
          flexDirection:'row',
          gap:20,
          alignItems:'center',
          
          margin:10,
         
        }}>
          <Ionicons name={item.icon} 
          size={40} color={Colors.PRIMARY} />
          <Text style={{
            fontSize:20,
            fontFamily:'montserrat'
          }}>{item.name}</Text>
        </Pressable>
      )}
    />
    </View>
  )
}