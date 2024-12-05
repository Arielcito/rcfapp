import { doc, updateDoc } from "firebase/firestore";
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ToastAndroid,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { FIREBASE_DB } from "../../../infraestructure/config/FirebaseConfig";
import Colors from "../../../infraestructure/utils/Colors";

export default function BookingItem({ place, setLoading }) {
  const db = FIREBASE_DB;
  const navigation = useNavigation();

  const handleCancel = async (appointmentId) => {
    setLoading(true);
    const appointmentRef = doc(
      db,
      "rfc-appointments-place",
      appointmentId.toString()
    );

    await updateDoc(appointmentRef, {
      Estado: "Cancelado",
    });
    setLoading(false);
    ToastAndroid.show("Reserva cancelada!", ToastAndroid.LONG);
  };

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("myBookingDescription", { place: place })
      }
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <Image source={{ uri: place.place.imageUrl }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={styles.title}>
            {place.place.name}
          </Text>
          <Text style={styles.description}>{place.place.description}</Text>
          <Text style={styles.description}>{place.appointmentDate}</Text>
          <Text style={styles.description}>{place.appointmentTime}</Text>
          <View style={styles.bottomContainer}>
            <Pressable
              onPress={() => handleCancel(place?.appointmentId)}
              style={[
                styles.dayButton,
                place?.Estado === "Reservado"
                  ? { backgroundColor: "red" }
                  : { backgroundColor: "grey" },
              ]}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontFamily: "montserrat",
                }}
              >
                {place?.Estado
                  ? place?.Estado === "Reservado"
                    ? "Cancelar"
                    : "Cancelado"
                  : "Cancelar"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

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
    paddingLeft: 10,
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
  dayButton: {
    borderWidth: 1,
    borderRadius: 99,
    padding: 5,
    paddingHorizontal: 20,
    alignItems: "center",
    marginRight: 10,
    borderColor: Colors.GRAY,
  },
});
