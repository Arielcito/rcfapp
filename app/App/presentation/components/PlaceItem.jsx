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

const PlaceItem = ({ place, selectedDate = "", selectedTime = "", isTablet }) => {
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

  return (
    <TouchableOpacity
      style={[styles.container, isTablet && styles.tabletContainer]}
      onPress={() =>
        navigation.navigate("booking", {
          place: place,
          date: selectedDate,
          time: selectedTime,
        })
      }
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
            onPress={() =>
              navigation.navigate("booking", {
                place: place,
                date: selectedDate,
                time: selectedTime,
              })
            }
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
  },
  tabletTitle: {
    fontSize: 20,
  },
  description: {
    color: Colors.GRAY,
    fontFamily: "montserrat",
    fontSize: 12,
    lineHeight: 16,
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
    padding: 6,
    paddingHorizontal: 14,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 6,
  },
  tabletButton: {
    padding: 8,
    paddingHorizontal: 18,
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
