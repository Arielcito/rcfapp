import { View, Text, ActivityIndicator, Image, FlatList, Pressable, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import Colors from '../../../infraestructure/utils/Colors'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { api } from '../../../infraestructure/api/api'
import { useCurrentUser } from '../../../application/context/CurrentUserContext'

export default function OwnerProfileScreen() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigation = useNavigation()
  const { logout } = useCurrentUser()

  const menu = [
    {
      id: 2,
      name: 'Cerrar sesión',
      icon: 'exit-outline'
    }
  ]

  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/me')
      setUser(response.data)
    } catch (error) {
      console.log('Error al obtener perfil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro que deseas cerrar sesión?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sí, cerrar sesión",
          onPress: async () => {
            try {
              console.log('Iniciando proceso de cierre de sesión...');
              setLoading(true);
              
              console.log('Llamando a logout del contexto...');
              await logout();
              console.log('Logout completado exitosamente');
              
              console.log('Redirigiendo a welcomePage...');
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'welcomePage'
                  }
                ]
              });
            } catch (error) {
              console.error('Error detallado al cerrar sesión:', {
                message: error.message,
                stack: error.stack,
                response: error.response?.data
              });
              Alert.alert(
                "Error",
                "Hubo un problema al cerrar sesión. Por favor, intenta nuevamente."
              );
            } finally {
              setLoading(false);
              console.log('Proceso de cierre de sesión finalizado');
            }
          }
        }
      ]
    );
  };

  return (
    <View>
      <Text style={{
        padding: 10,
        fontFamily: 'montserrat-medium',
        fontSize: 30,
        marginTop: 30
      }}>Mi
        <Text style={{ color: Colors.PRIMARY }}> Perfil</Text>
      </Text>

      {loading ? (
        <View style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <ActivityIndicator size={'large'} color={Colors.PRIMARY} />
        </View>
      ) : (
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <Text style={{
            fontFamily: 'montserrat-medium',
            fontSize: 25,
            marginTop: 10
          }}>{user?.fullName}</Text>
          <Text style={{
            fontFamily: 'montserrat',
            fontSize: 17,
            marginTop: 5,
            color: Colors.GRAY
          }}>{user?.email}</Text>
        </View>
      )}

      <FlatList
        data={menu}
        style={{
          marginTop: 50,
          marginHorizontal: 50
        }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              item.id === 1 ?
                navigation.navigate('owner-pitches')
                : item.id === 2 ? handleSignOut()
                  : navigation.navigate('appointments')
            }
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: 20,
              alignItems: 'center',
              margin: 10,
            }}>
            <Ionicons name={item.icon} size={40} color={Colors.PRIMARY} />
            <Text style={{
              fontSize: 20,
              fontFamily: 'montserrat'
            }}>{item.name}</Text>
          </Pressable>
        )}
      />
    </View>
  )
}