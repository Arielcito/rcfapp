import React from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  Pressable,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../infraestructure/utils/Colors";

const PlaceItem = ({ place, selectedDate = "", selectedTime = "" }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() =>
        navigation.navigate("booking", {
          place: place,
          date: selectedDate,
          time: selectedTime,
        })
      }
    >
      <Image source={{ uri: place.imageUrl }} style={styles.image} />
      <View style={styles.textContainer}>
        <View style={styles.infoContainer}>
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
            {place.name}
          </Text>
          <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
            {place.description}
          </Text>
        </View>
        <View style={styles.bottomContainer}>
          <Text style={styles.price}>$20.000</Text>
          <Pressable
            style={styles.button}
            onPress={() =>
              navigation.navigate("booking", {
                place: place,
                date: selectedDate,
                time: selectedTime,
              })
            }
          >
            <Text style={styles.buttonText}>Reservar</Text>
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
    width: Dimensions.get("screen").width * 0.9,
    marginHorizontal: 20,
    flexDirection: "row",
    height: 140, // Altura fija para mantener consistencia
    overflow: 'hidden',
  },
  image: {
    width: "40%",
    height: "100%",
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
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
  description: {
    color: Colors.GRAY,
    fontFamily: "montserrat",
    fontSize: 12,
    lineHeight: 16,
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
  button: {
    padding: 6,
    paddingHorizontal: 14,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 6,
  },
  buttonText: {
    fontFamily: "montserrat-medium",
    fontSize: 14,
    color: "white",
    textAlign: "center",
  },
});

export default PlaceItem;
