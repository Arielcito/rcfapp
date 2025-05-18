import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import { getProfileInfo } from "../../../infrastructure/api/user.api";
import { useCurrentUser } from "../../../application/context/CurrentUserContext";
import defaultAvatar from "../../assets/images/avatar.png";
import { api } from "../../../infrastructure/api/api";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = () => {
  const navigator = useNavigation();
  const { currentUser, logout } = useCurrentUser();
  const [additionalData, setAdditionalData] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setAdditionalData({
        name: currentUser.name,
        email: currentUser.email,
        imageUrl: currentUser.image || null
      });
    }
  }, [currentUser]);

  const signOut = async () => {
    try {
      await logout();
      navigator.navigate('userLoginStack');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const getImageSource = () => {
    if (additionalData?.imageUrl) {
      return { uri: additionalData.imageUrl };
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
              <Text style={styles.profileName}>{currentUser?.name || additionalData?.name || "Cargando..."}</Text>
              <Text style={styles.profileEmail}>{currentUser?.email || additionalData?.email || "Cargando..."}</Text>
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

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.deleteAccountItem} 
          onPress={() => navigator.navigate("delete-account")}
        >
          <Text style={styles.deleteAccountText}>Eliminar cuenta</Text>
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
  body: {
    flex: 1,
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
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  deleteAccountItem: {
    alignItems: 'center',
  },
  deleteAccountText: {
    color: '#FF3B30',
    fontSize: 16,
  },
});

export default ProfileScreen;
