import { View, StyleSheet, Pressable, Text, Modal, TouchableOpacity } from "react-native";
import React, { useState, useContext } from "react";
import UbicationIcon from "../../assets/icons/UbicationIcon";
import { UserLocationContext } from "../../../application/context/UserLocationContext";
import Colors from "../../../infraestructure/utils/Colors";
import * as Location from 'expo-location';

export default function Header() {
  const { location, setLocation } = useContext(UserLocationContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permiso de ubicación denegado');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      alert('Error al obtener la ubicación');
    } finally {
      setLoading(false);
    }
  };

  const handleLocationPress = () => {
    setIsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.locationButton}
        onPress={handleLocationPress}
      >
        <UbicationIcon width={25} height={25} />
        <Text style={styles.locationText}>
          {location ? "Cambiar ubicación" : "Establecer ubicación"}
        </Text>
      </Pressable>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Ubicación</Text>
            
            <TouchableOpacity
              style={styles.locationOption}
              onPress={getCurrentLocation}
              disabled={loading}
            >
              <Text style={styles.optionText}>
                {loading ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.WHITE,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: "montserrat-medium",
    color: Colors.PRIMARY,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: Colors.WHITE,
    borderRadius: 20,
    padding: 20,
    width: "80%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: "montserrat-bold",
    marginBottom: 20,
    textAlign: "center",
    color: Colors.PRIMARY,
  },
  locationOption: {
    backgroundColor: Colors.PRIMARY,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  optionText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: "montserrat-medium",
    textAlign: "center",
  },
  closeButton: {
    backgroundColor: Colors.GRAY,
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontFamily: "montserrat-medium",
    textAlign: "center",
  },
});
