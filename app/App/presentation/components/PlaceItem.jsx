import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Dimensions,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Image } from 'expo-image';
import { useNavigation } from "@react-navigation/native";
import Colors from "../../infraestructure/utils/Colors";
import moment from 'moment';

const PlaceItem = ({ place, selectedDate, selectedTime, isTablet }) => {
  const navigation = useNavigation();
  const [imageError, setImageError] = useState(false);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const getImageSource = () => {
    if (imageError || !place.imagenUrl) {
      return require('../assets/images/default-place.jpg');
    }
    return { uri: place.imagenUrl };
  };

  const formatDate = (date) => {
    if (!date) return null;
    // Si ya es una cadena en formato YYYY-MM-DD, la devolvemos tal cual
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    // Si es un objeto moment, lo formateamos
    if (moment.isMoment(date)) {
      return date.format('YYYY-MM-DD');
    }
    // Si es otro tipo de fecha, intentamos convertirla
    try {
      return moment(date).format('YYYY-MM-DD');
    } catch (error) {
      console.error('PlaceItem - Error al formatear fecha:', error);
      return null;
    }
  };

  const handlePress = () => {
    const formattedDate = formatDate(selectedDate);
    
    console.log('PlaceItem - Datos de navegación:', {
      place: {
        id: place.id,
        nombre: place.nombre,
        direccion: place.direccion
      },
      selectedDate: formattedDate,
      selectedTime: selectedTime,
      originalDate: selectedDate
    });

    if (!formattedDate) {
      console.warn('PlaceItem - Advertencia: No hay fecha seleccionada o es inválida');
    }
    if (!selectedTime) {
      console.warn('PlaceItem - Advertencia: No hay hora seleccionada');
    }

    navigation.navigate("booking", {
      place,
      preselectedDate: formattedDate,
      preselectedTime: selectedTime,
    });
  };

  return (
    <TouchableOpacity
      style={[styles.container, isTablet && styles.tabletContainer]}
      onPress={handlePress}
    >
      <Image
        style={[styles.image, isTablet && styles.tabletImage]}
        source={getImageSource()}
        contentFit="cover"
        transition={300}
        onError={handleImageError}
      />
      <View style={styles.textContainer}>
        <View style={styles.infoContainer}>
          <Text style={[styles.title, isTablet && styles.tabletTitle]} numberOfLines={1} ellipsizeMode="tail">
            {place.nombre}
          </Text>
          <Text style={[styles.description, isTablet && styles.tabletDescription]} numberOfLines={2} ellipsizeMode="tail">
            {place.description}
          </Text>
        </View>
        <View style={styles.bottomContainer}>
          <Text style={[styles.price, isTablet && styles.tabletPrice]}>$20.000</Text>
          <Pressable
            style={[styles.button, isTablet && styles.tabletButton]}
            onPress={handlePress}
          >
            <Text style={[styles.buttonText, isTablet && styles.tabletButtonText]}>Reservar</Text>
          </Pressable>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    margin: 10,
    borderRadius: 15,
    width: Platform.OS === 'ios' ? '95%' : Dimensions.get("screen").width * 0.9,
    marginHorizontal: 20,
    flexDirection: "row",
    height: 140,
    overflow: 'hidden',
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabletContainer: {
    width: Platform.OS === 'ios' ? '45%' : '95%',
    height: 180,
    margin: 8,
  },
  image: {
    width: "40%",
    height: "100%",
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    backgroundColor: '#f5f5f5',
  },
  tabletImage: {
    width: "45%",
  },
  textContainer: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontFamily: "montserrat-medium",
    marginBottom: 4,
    color: '#1a1a1a',
  },
  tabletTitle: {
    fontSize: 20,
  },
  description: {
    color: Colors.GRAY,
    fontFamily: "montserrat",
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.8,
  },
  tabletDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  price: {
    fontSize: 16,
    fontFamily: "montserrat",
    color: "#003366",
    fontWeight: "bold",
  },
  tabletPrice: {
    fontSize: 18,
  },
  button: {
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 8,
    shadowColor: Colors.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  tabletButton: {
    padding: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    fontFamily: "montserrat-medium",
    fontSize: 14,
    color: "white",
    textAlign: "center",
  },
  tabletButtonText: {
    fontSize: 16,
  },
});

export default PlaceItem;
