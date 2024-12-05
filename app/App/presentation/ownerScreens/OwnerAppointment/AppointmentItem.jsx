import { View, Text, Pressable } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../../infraestructure/utils/Colors";

export default function AppointmentItem({ item, appList, selectedTime }) {
  const navigation = useNavigation();

  const foundItem = appList?.find((app) => app.appointmentTime == item.time);
  
  return (
    <View
      style={[
        {
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
      ]}
    >
      <Text
        style={[
          {
            fontFamily: "montserrat-medium",
            fontSize: 25,
            marginBottom: 20,
          }
        ]}
      >
        {item.time}
      </Text>
      {foundItem ? (
        <Pressable
          style={{ borderColor: "red", borderWidth: 1, padding: 5 }}
          onPress={() =>
            navigation.navigate("appointment-info", {
              appointmentId: foundItem,
            })
          }
        >
          <Text style={{ color: "red" }}>Reservado</Text>
        </Pressable>
      ) : (
        <Text
          style={{
            borderColor: Colors.PRIMARY,
            borderWidth: 1,
            color: "green",
            paddingHorizontal: 10,
            borderRadius:99,
          }}
        >
          Disponible
        </Text>
      )}
    </View>
  );
}
