import { View, Text, StyleSheet, TextInput, ImageBackground } from "react-native";
import React, { useState, useEffect } from "react";
import { TouchableOpacity } from "react-native";
import * as WebBrowser from "expo-web-browser";
import Colors from "../../../infraestructure/utils/Colors";
import { useNavigation } from "@react-navigation/native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../../../infraestructure/config/FirebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import getListOfOwners from "../../../infraestructure/api/listOfOwners.api";
WebBrowser.maybeCompleteAuthSession();
export default function OwnerLoginScreen() {
  const [values, setValues] = useState({
    email: "",
    pwd: "",
  });
  const auth = FIREBASE_AUTH;
  const [listOfOwners, setListOfOwners] = useState([]);
  
  useEffect(() => {
    const fetchListOfOwners = async () => {
      const list = await getListOfOwners();
      setListOfOwners(list.map(owner => owner.email));
    };
    fetchListOfOwners();
  }, []);
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
    if (listOfOwners.includes(email)) {
      try {
        await signInWithEmailAndPassword(auth, email, pwd);
        //navigation.navigate("owner-appointments");
      } catch (error) {
        console.log(error);
        alert("Login Failed");
      }
    } else {
      alert("You are not an owner");
    }
  }

  return (
    <View>
      <ImageBackground
        source={image}
        resizeMode="contain"
        style={styles.image}
      />
      <View
        style={styles.containter}
      >
        <Text style={styles.heading}>Gestiona tus  
          <Text style={{color:Colors.PRIMARY}}>

           alquileres  
          </Text>
          
          y crece tu negocio!</Text>
        <View
          style={{
            padding: 20,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
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
            style={styles.button}
            onPress={() => Login()}
          >
            <Text style={styles.buttonText}>
              Entrar
            </Text>
          </TouchableOpacity>
          
          {/* Nuevo CTA para crear cuenta */}
          <TouchableOpacity
            onPress={() => WebBrowser.openBrowserAsync('https://tudominio.com/contacto')}
          >
            <Text style={styles.ctaText}>
              ¿Quieres unirte? Contacta con soporte para crear una cuenta
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    position: "relative",
    top: 0,
    right: -100,
    height: 200,
  },
  bgImage: {
    width: "100%",
    height: 150,
    marginTop: 20,
    objectFit: "cover",
  },
  heading: {
    fontSize: 25,
    fontFamily: "montserrat-bold",
    textAlign: "center",
  },
  input: {
    height: 60,
    width: 350,
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
  desc: {
    fontSize: 17,
    fontFamily: "montserrat",
    marginTop: 15,
    textAlign: "center",
    color: "#000",
    color: Colors.GRAY,
  },
  button: {
    backgroundColor: "#003366",
    height: 60,
    width: 350,
    borderRadius: 10,
    justifyContent: "center",
    marginTop: 40,
  },
  buttonText: {
    color: Colors.WHITE,
    textAlign: "center",
    fontFamily: "montserrat",
    fontSize: 17,
  },
  ctaText: {
    marginTop: 20,
    color: Colors.PRIMARY,
    textAlign: "center",
    fontFamily: "montserrat",
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
