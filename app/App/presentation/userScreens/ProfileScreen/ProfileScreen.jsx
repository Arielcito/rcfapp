import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { useCurrentUser } from "../../../application/context/CurrentUserContext";
import { useProfile } from "../../../application/hooks/useProfile";
import defaultAvatar from "../../assets/images/avatar.png";
import Colors from "../../../infrastructure/utils/Colors";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const { currentUser, logout } = useCurrentUser();
  const { data: profileData, isLoading: isLoadingProfile } = useProfile(currentUser?.id || "");

  const handleSignOut = async () => {
    try {
      await logout();
      navigator.navigate('userLoginStack');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const getImageSource = () => {
    if (profileData?.image) {
      return { uri: profileData.image };
    }
    return defaultAvatar;
  };

  if (isLoadingProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

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
              <Text style={styles.profileName}>{profileData?.name || "Sin nombre"}</Text>
              <Text style={styles.profileEmail}>{profileData?.email || "Sin email"}</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => navigation.navigate("edit-profile")}
            >
              <Text style={styles.editText}>editar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate("myBookingStack")}
        >
          <Text style={styles.menuText}>Mi historial</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate("termsAndCondition")}
        >
          <Text style={styles.menuText}>Términos y condiciones</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={handleSignOut}
        >
          <Text style={styles.menuText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.deleteAccountItem} 
          onPress={() => navigation.navigate("delete-account")}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 10,
    color: Colors.PRIMARY,
    fontSize: 16,
  },
  header: {
    backgroundColor: Colors.PRIMARY,
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
