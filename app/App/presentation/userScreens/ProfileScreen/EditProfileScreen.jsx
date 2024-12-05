import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ToastAndroid,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { updateDoc, doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import Colors from "../../../infraestructure/utils/Colors";
import { CurrentUserContext } from "../../../application/context/CurrentUserContext";
import { FIREBASE_DB } from "../../../infraestructure/config/FirebaseConfig";
import { getProfileInfo } from "../../../infraestructure/api/user.api";
import defaultAvatar from "../../assets/images/avatar.png";

const EditProfileScreen = () => {
  const { user, setUser } = useContext(CurrentUserContext);
  const [name, setName] = useState("");
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const db = FIREBASE_DB;

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getProfileInfo(user);
      console.log(userData)
      setName(userData.name);
      setPhone(userData.phone.toString());
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", user.email);
      
      const docSnap = await getDoc(userRef);
      
      const userData = {
        name: name,
        phone: phone,
        email: user.email,
      };

      if (docSnap.exists()) {
        await updateDoc(userRef, userData);
      } else {
        await setDoc(userRef, userData);
      }

      setUser({
        ...user,
        ...userData
      });

      ToastAndroid.show("Tus cambios han sido guardados!", ToastAndroid.LONG);
      navigation.goBack();
    } catch (error) {
      console.error("Error saving profile info: ", error);
      ToastAndroid.show("Error al guardar los cambios.", ToastAndroid.LONG);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profilePictureContainer}>
        <View style={styles.profilePicture}>
          <Image
            source={defaultAvatar}
            style={styles.profileImage}
          />
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Datos proporcionados</Text>

        <Text style={styles.label}>Nombre y Apellido</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="-"
          placeholderTextColor="#999999"
        />

        <Text style={styles.label}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="serato.arieli@gmail.com"
          placeholderTextColor="#999999"
          keyboardType="email-address"
          editable={false} // No se puede editar el email
        />

        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="-"
          placeholderTextColor="#999999"
          keyboardType="phone-pad"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack(null)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  profilePictureContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34A853",
    paddingVertical: 50,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#CCCCCC",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  body: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    color: "#333333",
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: "#000000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#CCCCCC",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  cancelButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default EditProfileScreen;
