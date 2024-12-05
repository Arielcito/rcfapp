import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where, setDoc } from "firebase/firestore";
import Colors from "../../../infraestructure/utils/Colors";
import {
  FIREBASE_AUTH,
  FIREBASE_DB,
} from "../../../infraestructure/config/FirebaseConfig";


export default function UserLoginScreen() {
  const [values, setValues] = useState({
    email: "",
    pwd: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const auth = FIREBASE_AUTH;
  const image = require("../../assets/images/geometrias-circulares.png");

  function handleChange(text, eventName) {
    setValues((prev) => {
      return {
        ...prev,
        [eventName]: text,
      };
    });
  }

  async function Login() {
    const { email, pwd } = values;
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pwd);
      const user = userCredential._tokenResponse;

      // Verificar el tipo de usuario
      const userDoc = await getDocs(
        query(collection(FIREBASE_DB, "users"), where("email", "==", user.email))
      );

      console.log(userDoc);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.userType === "user") {
          navigation.navigate("Tabs");
        } else {
          setError(
            "Esta cuenta no tiene permisos de usuario. Por favor, use la opción de inicio de sesión correcta."
          );
          await auth.signOut(); // Cerrar sesión si no es un usuario válido
        }
      } else {
        setError(
          "No se encontró información del usuario. Por favor, contacte al soporte."
        );
        await auth.signOut();
      }
    } catch (error) {
      console.log(error);
      setError(
        "Error de inicio de sesión. Por favor, verifique sus credenciales."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={image}
        resizeMode="contain"
        style={styles.image}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.heading}>
          Reserva tu
          <Text style={{ color: Colors.PRIMARY }}> cancha </Text>
          de manera sencilla
        </Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={(text) => handleChange(text, "email")}
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            onChangeText={(text) => handleChange(text, "pwd")}
            secureTextEntry={true}
          />
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => Login()}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('user-registration')}
          >
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </TouchableOpacity>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
      </View>
    </View>
  );
}
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  inputContainer: {
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  heading: {
    fontSize: 30,
    fontFamily: "montserrat-bold",
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    height: 60,
    width: width * 0.8,
    maxWidth: 350,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: "#003366",
    height: 60,
    width: width * 0.8,
    maxWidth: 350,
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 40,
  },
  loginButtonText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontFamily: "montserrat",
    fontSize: 17,
  },
  image: {
    width: 150,
    height: 150,
    position: "absolute",
    top: 0,
    right: 0,
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
  googleButton: {
    backgroundColor: "#4285F4",
    height: 60,
    width: width * 0.8,
    maxWidth: 350,
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 20,
  },
  googleButtonText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontFamily: "montserrat",
    fontSize: 17,
  },
  registerButton: {
    backgroundColor: Colors.SECONDARY,
    height: 60,
    width: width * 0.8,
    maxWidth: 350,
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 20,
  },
  registerButtonText: {
    color: Colors.PRIMARY,
    textAlign: "center",
    fontFamily: "montserrat",
    fontSize: 17,
  },
});
