import { View, Text, ActivityIndicator, Image, FlatList, Pressable, Alert, ScrollView, StyleSheet, Linking } from 'react-native'
import React, { useState, useEffect } from 'react'
import Colors from '../../../infraestructure/utils/Colors'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { api } from '../../../infraestructure/api/api'
import { useCurrentUser } from '../../../application/context/CurrentUserContext'
import { fetchOwnerPlace } from '../../../infraestructure/api/places.api'

export default function OwnerProfileScreen() {
  const [user, setUser] = useState(null)
  const [predio, setPredio] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigation = useNavigation()
  const { logout } = useCurrentUser()

  const menu = [
    {
      id: 1,
      name: 'Soporte',
      icon: 'help-circle-outline'
    },
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
      console.log(response.data);
      setUser(response.data)
      
      if (response.data?.id) {
        const predioData = await fetchOwnerPlace(response.data.id)
        console.log(predioData);
        setPredio(predioData)
      }
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

  const handleContactSupport = () => {
    const phoneNumber = '+5491156569844';
    const message = 'Hola vengo de la app de rcf';
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(whatsappUrl)
      .then(supported => {
        if (supported) {
          return Linking.openURL(whatsappUrl);
        } else {
          Alert.alert(
            'Error',
            'No se puede abrir WhatsApp. Por favor, instala la aplicación.'
          );
        }
      })
      .catch(err => {
        console.error('Error al abrir WhatsApp:', err);
        Alert.alert('Error', 'No se pudo abrir WhatsApp');
      });
  };

  const renderUserInfo = () => {
    if (!user) return null;

    return (
      <View style={styles.userInfoContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color={Colors.PRIMARY} />
          </View>
          <Text style={styles.userName}>{user?.name || 'No disponible'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'No disponible'}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="person-outline" size={24} color={Colors.PRIMARY} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nombre</Text>
              <Text style={styles.infoValue}>{user?.name || 'No disponible'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={24} color={Colors.PRIMARY} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'No disponible'}</Text>
              {!user?.emailVerified && (
                <Text style={styles.verificationText}>Email no verificado</Text>
              )}
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="call-outline" size={24} color={Colors.PRIMARY} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{user?.telefono || 'No disponible'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={24} color={Colors.PRIMARY} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Dirección</Text>
              <Text style={styles.infoValue}>{user?.direccion || 'No disponible'}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={24} color={Colors.PRIMARY} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Fecha de Registro</Text>
              <Text style={styles.infoValue}>
                {new Date(user?.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) || 'No disponible'}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={24} color={Colors.PRIMARY} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Última Actualización</Text>
              <Text style={styles.infoValue}>
                {new Date(user?.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) || 'No disponible'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Información del Predio</Text>
          
          {predio ? (
            <>
              <View style={styles.infoItem}>
                <Ionicons name="business-outline" size={24} color={Colors.PRIMARY} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Nombre del Predio</Text>
                  <Text style={styles.infoValue}>{predio?.nombre || 'No disponible'}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="location-outline" size={24} color={Colors.PRIMARY} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Dirección</Text>
                  <Text style={styles.infoValue}>{predio?.direccion || 'No disponible'}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="call-outline" size={24} color={Colors.PRIMARY} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Teléfono</Text>
                  <Text style={styles.infoValue}>{predio?.telefono || 'No disponible'}</Text>
                </View>
              </View>


              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={24} color={Colors.PRIMARY} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Horario de Apertura</Text>
                  <Text style={styles.infoValue}>
                    {predio?.horarioApertura ? new Date(predio.horarioApertura).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                      timeZone: 'UTC'
                    }) : 'No disponible'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="time-outline" size={24} color={Colors.PRIMARY} />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Horario de Cierre</Text>
                  <Text style={styles.infoValue}>
                    {predio?.horarioCierre ? new Date(predio.horarioCierre).toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                      timeZone: 'UTC'
                    }) : 'No disponible'}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <Text style={styles.noPredioText}>No hay predio asociado</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mi
        <Text style={{ color: Colors.PRIMARY }}> Perfil</Text>
      </Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} color={Colors.PRIMARY} />
        </View>
      ) : (
        renderUserInfo()
      )}

      <FlatList
        data={menu}
        style={styles.menuContainer}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              item.id === 1 ? handleContactSupport()
                : item.id === 2 ? handleSignOut()
                  : navigation.navigate('appointments')
            }
            style={styles.menuItem}>
            <Ionicons name={item.icon} size={40} color={Colors.PRIMARY} />
            <Text style={styles.menuItemText}>{item.name}</Text>
          </Pressable>
        )}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    padding: 10,
    fontFamily: 'montserrat-medium',
    fontSize: 30,
    marginTop: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  userInfoContainer: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontFamily: 'montserrat-medium',
    fontSize: 24,
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontFamily: 'montserrat',
    fontSize: 16,
    color: Colors.GRAY,
  },
  infoSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'montserrat-medium',
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontFamily: 'montserrat',
    fontSize: 14,
    color: Colors.GRAY,
    marginBottom: 2,
  },
  infoValue: {
    fontFamily: 'montserrat-medium',
    fontSize: 16,
    color: '#333',
  },
  menuContainer: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 10,
  },
  menuItemText: {
    fontSize: 18,
    fontFamily: 'montserrat',
    marginLeft: 15,
  },
  verificationText: {
    fontFamily: 'montserrat',
    fontSize: 12,
    color: '#FFA000',
    marginTop: 2,
  },
  noPredioText: {
    fontFamily: 'montserrat',
    fontSize: 16,
    color: Colors.GRAY,
    textAlign: 'center',
    marginTop: 10,
  },
});