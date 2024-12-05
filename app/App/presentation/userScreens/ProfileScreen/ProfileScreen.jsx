import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { FIREBASE_AUTH } from "../../../infraestructure/config/FirebaseConfig";
import { useState, useEffect } from "react";
import { getProfileInfo } from "../../../infraestructure/api/user.api";
import { CurrentUserContext } from "../../../application/context/CurrentUserContext";
import { useContext } from "react";
import defaultAvatar from "../../assets/images/avatar.png";

const ProfileScreen = () => {
  const navigator = useNavigation();
  const auth = FIREBASE_AUTH;
  const { user, setUser } = useContext(CurrentUserContext);
  const [userData, setUserData] = useState(null);

  useEffect( () => {
    const fetchData = async () => {
      const userData = await getProfileInfo(user);
      setUserData(userData);
    };
    fetchData();
  
  }, []);

  const signOut = () => {
    console.log(auth)
    auth
      .signOut()
      .then(() => {
        console.log("Sign Out");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getImageSource = () => {
    if (userData?.imageUrl) {
      return { uri: userData.imageUrl };
    }
    return defaultAvatar;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Perfil</Text>
          <Ionicons name="menu-outline" size={30} color="white" />
        </View>
        <View style={styles.profileContainer}>
          <View style={styles.profileInfo}>
            <Image
              style={styles.profileImage}
              source={getImageSource()}
            />
            <View style={styles.profileText}>
              <Text style={styles.profileName}>{userData?.name || "Cargando..."}</Text>
              <Text style={styles.profileEmail}>{userData?.email || "Cargando..."}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigator.navigate("edit-profile")}
            >
              <Text style={styles.editText}>editar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <TouchableOpacity style={styles.menuItem}
         onPress={() => navigator.navigate("myBookingStack")}
        >
          <Text style={styles.menuText}>Mi historial</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}
           onPress={() => navigator.navigate("termsAndCondition")}
        >
          <Text style={styles.menuText}>Términos y condiciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => signOut()}>
          <Text style={styles.menuText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#0A4074",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  profileContainer: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileText: {
    flex: 1,
    marginLeft: 15,
  },
  profileName: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  profileEmail: {
    color: "white",
    fontSize: 14,
  },
  editButton: {
    paddingHorizontal: 10,
  },
  editText: {
    color: "lightgreen",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  statsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginTop: 15,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
  },
  statLabel: {
    color: "#0A4074",
    fontSize: 12,
  },
  statValue: {
    color: "#0A4074",
    fontSize: 18,
    fontWeight: "bold",
  },
  body: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  menuItem: {
    paddingVertical: 15,
  },
  menuText: {
    fontSize: 16,
    color: "#000000",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 30,
  },
});

export default ProfileScreen;
