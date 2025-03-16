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
import Colors from "../../../infraestructure/utils/Colors";
import { updateAppointment } from "../../../infraestructure/api/appointments.api";

export default function BookingItem({ place, setLoading }) {
  const navigation = useNavigation();
  console.log("place", place)
  const handleCancel = async (appointmentId) => {
    setLoading(true);
    try {
      await updateAppointment(appointmentId.toString(), {
        estadoPago: "cancelado"
      });
      ToastAndroid.show("Reserva cancelada!", ToastAndroid.LONG);
    } catch (error) {
      console.error("Error al cancelar la reserva:", error);
      ToastAndroid.show("Error al cancelar la reserva", ToastAndroid.LONG);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("myBookingDescription", { place: place })
      }
      style={styles.container}
      activeOpacity={0.7}
    >
      <View style={styles.contentContainer}>
        <Image source={{ uri: place.place.imageUrl }} style={styles.image} />
        <View style={styles.textContainer}>
          <Text numberOfLines={1} style={styles.title}>
            {place.place.name}
          </Text>

          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateTime}>📅 {place.appointmentDate}</Text>
            <Text style={styles.dateTime}>⏰ {place.appointmentTime}</Text>
          </View>
          <View style={styles.bottomContainer}>
            <Pressable
              onPress={() => handleCancel(place?.appointmentId)}
              style={[
                styles.cancelButton,
                {
                  backgroundColor: place?.estado === "reservado" ? Colors.PRIMARY : "#E0E0E0",
                },
              ]}
            >
              <Text style={styles.cancelButtonText}>
                {place?.estado === "reservado" ? "Cancelar" : "Cancelado"}
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
    borderRadius: 15,
    width: Dimensions.get("screen").width * 0.9,
    marginHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  contentContainer: {
    flexDirection: "row",
    borderRadius: 15,
    overflow: "hidden",
  },
  image: {
    width: "40%",
    height: 160,
    resizeMode: "cover",
  },
  textContainer: {
    width: "60%",
    padding: 12,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 18,
    fontFamily: "montserrat-medium",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  description: {
    color: Colors.GRAY,
    fontFamily: "montserrat",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  dateTimeContainer: {
    marginBottom: 8,
  },
  dateTime: {
    fontFamily: "montserrat",
    fontSize: 14,
    color: "#424242",
    marginBottom: 4,
  },
  bottomContainer: {
    alignItems: "flex-start",
  },
  cancelButton: {
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: "montserrat-medium",
    color: "#FFF",
  },
});
