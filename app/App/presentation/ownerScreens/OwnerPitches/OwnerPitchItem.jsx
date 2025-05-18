import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { doc, deleteDoc } from "firebase/firestore";
import { FIREBASE_DB } from "../../../infrastructure/config/FirebaseConfig";

export default function OwnerPitchItem({ item, onEdit, onDelete }) {
  const handleEdit = () => {
    onEdit(item);
  };

  const handleDelete = () => {
    Alert.alert(
      "Confirmar eliminación",
      `¿Estás seguro de que quieres eliminar la cancha "${item.nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", onPress: () => deletePitch() }
      ]
    );
  };

  const deletePitch = async () => {
    try {
      await deleteDoc(doc(FIREBASE_DB, "rcf-pitches", item.id));
      onDelete(item.id);
    } catch (error) {
      console.error("Error al eliminar la cancha:", error);
      Alert.alert("Error", "No se pudo eliminar la cancha. Intente nuevamente.");
    }
  };

  return (
    <View style={styles.cardPitches}>
      <View style={styles.infoContainer}>
        <Text style={styles.pitchName}>{item.nombre}</Text>
        <Text style={styles.pitchType}>
          {item.deporte} {item.tipo}
        </Text>
        <Text style={styles.pitchPrice}>Precio: ${item.precio}</Text>
      </View>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
          <Ionicons name="pencil" size={24} color="#4A90E2" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.iconButton}>
          <Ionicons name="trash" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardPitches: {
    backgroundColor: "white",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoContainer: {
    flex: 1,
  },
  pitchName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  pitchType: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  pitchPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A90E2",
    marginTop: 5,
  },
  buttonsContainer: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
  },
});
