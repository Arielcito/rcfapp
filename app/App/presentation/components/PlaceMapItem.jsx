import React from "react";
import {
  View,
  Text,
  Image,
  Dimensions,
  Pressable,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../infraestructure/utils/Colors";
const PlaceMapItem = ({ place}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Image source={{ uri: place.imageUrl }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={styles.title}>
            {place.name}
          </Text>
          <Text style={styles.description}>{place.description}</Text>
          <View style={styles.bottomContainer}>
            <Text style={styles.price}>$20.000</Text>
            <Pressable
              onPress={() =>
                navigation.navigate("bookingDateTime", {
                  place: place,
                })
              }
              style={styles.button}
            >
              <Text style={styles.buttonText}>Ver cancha</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.WHITE,
    margin: 10,
    borderRadius: 10,
    width: Dimensions.get("screen").width * 0.9,
    marginHorizontal: 20,
  },
  contentContainer: {
    flexDirection: "row",
    borderRadius: 15,
  },
  image: {
    width: "40%",
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
    height: 140,
  },
  textContainer: {
    width: "60%",
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontFamily: "montserrat-medium",
  },
  description: {
    color: Colors.GRAY,
    fontFamily: "montserrat",
    marginBottom: 5,
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
    fontSize: 15,
    color: "white",
  },
});

export default PlaceMapItem;
