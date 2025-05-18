import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../../infrastructure/utils/Colors";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FIREBASE_DB,
  FIREBASE_AUTH,
  FIREBASE_STORAGE,
} from "../../../infrastructure/config/FirebaseConfig";
import * as ImagePicker from "expo-image-picker";
import { CurrentPlaceContext } from "../../../application/context/CurrentPlaceContext";
import { useContext } from "react";
import OwnerPitchItem from "./OwnerPitchItem";
import { getPitchesByPlaceId } from "../../../infrastructure/api/pitches.api";

export default function OwnerPitches() {
  const { currentPlace } = useContext(CurrentPlaceContext);
  const [pitches, setPitches] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPitch, setNewPitch] = useState({
    deporte: "futbol",
    id_place: currentPlace.id,
    imageUrl: "",
    nombre: "",
    precio: "",
    sena: "",
    tipo: "",
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    const fetchPitches = async () => {
      const pitches = await getPitchesByPlaceId(currentPlace.id);
      setPitches(pitches);
    };
    fetchPitches();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (image) {
      const response = await fetch(image);
      const blob = await response.blob();
      const filename = image.substring(image.lastIndexOf("/") + 1);
      const storageRef = ref(FIREBASE_STORAGE, `pitches/${filename}`);

      try {
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
      } catch (error) {
        console.error("Error al subir la imagen:", error);
        return null;
      }
    }
    return null;
  };

  const addPitch = async () => {
    try {
      const imageUrl = await uploadImage();
      await addDoc(collection(FIREBASE_DB, "rcf-pitches"), {
        ...newPitch,
        precio: Number(newPitch.precio),
        id_place: currentPlace.id,
        imageUrl: imageUrl || "",
      });
      setModalVisible(false);
      setImage(null);
      fetchPitches();
    } catch (error) {
      console.error("Error al agregar cancha:", error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={styles.heading}>Mis canchas</Text>
      <FlatList
        data={pitches}
        renderItem={({ item }) => <OwnerPitchItem item={item} />}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add-circle-outline" size={70} color="#00CC44" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={pickImage}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
              <Text>Seleccionar imagen de la cancha</Text>
            )}
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la cancha"
            value={newPitch.nombre}
            onChangeText={(text) => setNewPitch({ ...newPitch, nombre: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Tipo (ej. 5)"
            value={newPitch.tipo}
            onChangeText={(text) => setNewPitch({ ...newPitch, tipo: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Precio"
            value={newPitch.precio}
            onChangeText={(text) => setNewPitch({ ...newPitch, precio: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Seña"
            value={newPitch.sena}
            onChangeText={(text) => setNewPitch({ ...newPitch, sena: text })}
          />
          <TouchableOpacity style={styles.addPitchButton} onPress={addPitch}>
            <Text style={styles.addPitchButtonText}>Agregar Cancha</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  cardPitches: {
    backgroundColor: "white",
    padding: 20,
    marginVertical: 20,
    height: 80,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
  },
  heading: {
    fontSize: 25,
    fontFamily: "montserrat-bold",
    textAlign: "left",
    marginTop: 50,
  },
  addButton: {
    alignItems: "center",
    marginTop: 20,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    height: 40,
    width: "100%",
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
  },
  addPitchButton: {
    backgroundColor: Colors.PRIMARY,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  addPitchButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: Colors.PRIMARY,
  },
  pitchName: {
    fontSize: 16,
    fontFamily: "montserrat",
    color: "#003366",
    fontWeight: "bold",
  },
  pitchType: {
    fontSize: 12,
    fontFamily: "montserrat",
    color: "#003366",
  },
  pitchPrice: {
    fontSize: 14,
    fontFamily: "montserrat",
    color: "#003366",
    fontWeight: "bold",
  },
  pitchImage: {
    width: 60,
    height: 60,
    borderRadius: 5,
    marginRight: 10,
  },
  imagePickerButton: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 20,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
});
