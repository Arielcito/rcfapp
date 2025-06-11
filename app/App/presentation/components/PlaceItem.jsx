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
import Colors from "../../infrastructure/utils/Colors";
import moment from 'moment';
import type { Place } from "../../domain/entities/place.entity";
import type { Cancha } from "../../types/predio";

interface PlaceItemProps {
  place: Place;
  selectedDate: string;
  selectedTime: string | null;
  availableCourts: Cancha[];
  isTablet: boolean;
}

const PlaceItem: React.FC<PlaceItemProps> = ({ place, selectedDate, selectedTime, availableCourts, isTablet }) => {
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

  const formatDate = (date: string) => {
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

  const getAvailableCourtsText = () => {
    if (!availableCourts || availableCourts.length === 0) {
      return "Sin canchas disponibles";
    }
    
    if (availableCourts.length === 1) {
      return "1 cancha disponible";
    }
    
    return `${availableCourts.length} canchas disponibles`;
  };

  const getCourtTypesText = () => {
    if (!availableCourts || availableCourts.length === 0) {
      return "";
    }
    
    const types = [...new Set(availableCourts.map(court => court.tipo || 'Fútbol'))];
    if (types.length > 2) {
      return `${types.slice(0, 2).join(', ')} +${types.length - 2}`;
    }
    return types.join(', ');
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
        <View style={styles.headerInfo}>
          <Text style={[styles.title, isTablet && styles.tabletTitle]} numberOfLines={1} ellipsizeMode="tail">
            {place.nombre}
          </Text>
          <Text style={[styles.description, isTablet && styles.tabletDescription]} numberOfLines={1} ellipsizeMode="tail">
            {place.direccion}
          </Text>
        </View>
        
        {availableCourts && availableCourts.length > 0 && (
          <View style={styles.courtInfo}>
            <View style={styles.courtTypesContainer}>
              <Text style={[styles.courtTypesLabel, isTablet && styles.tabletCourtTypesLabel]}>
                Deportes:
              </Text>
              <Text style={[styles.courtTypes, isTablet && styles.tabletCourtTypes]} numberOfLines={1} ellipsizeMode="tail">
                {getCourtTypesText()}
              </Text>
            </View>
          </View>
        )}
        
        <View style={styles.bottomContainer}>
          <View style={styles.availabilityContainer}>
            <Text style={[styles.availability, isTablet && styles.tabletAvailability]}>
              {getAvailableCourtsText()}
            </Text>
          </View>
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
    height: 150,
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
    height: 190,
    margin: 8,
  },
  image: {
    width: "35%",
    height: "100%",
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    backgroundColor: '#f5f5f5',
  },
  tabletImage: {
    width: "40%",
  },
  textContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  headerInfo: {
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: "montserrat-medium",
    marginBottom: 4,
    color: '#1a1a1a',
  },
  tabletTitle: {
    fontSize: 18,
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
    lineHeight: 18,
  },
  courtInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  courtTypesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  courtTypesLabel: {
    color: Colors.GRAY,
    fontFamily: "montserrat-medium",
    fontSize: 10,
    marginRight: 4,
  },
  tabletCourtTypesLabel: {
    fontSize: 12,
  },
  courtTypes: {
    color: Colors.PRIMARY,
    fontFamily: "montserrat-medium",
    fontSize: 11,
    flex: 1,
  },
  tabletCourtTypes: {
    fontSize: 13,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  availabilityContainer: {
    flex: 1,
    marginRight: 8,
  },
  availability: {
    fontSize: 12,
    fontFamily: "montserrat-medium",
    color: Colors.GREEN,
  },
  tabletAvailability: {
    fontSize: 14,
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: Colors.SECONDARY,
    borderRadius: 8,
    shadowColor: Colors.SECONDARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  tabletButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  buttonText: {
    fontFamily: "montserrat-medium",
    fontSize: 13,
    color: "white",
    textAlign: "center",
  },
  tabletButtonText: {
    fontSize: 15,
  },
});

export default PlaceItem;
