import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Colors from "../../../infrastructure/utils/Colors";
import { useCurrentUser } from "../../../application/context/CurrentUserContext";
import { useProfile, useUpdateProfile } from "../../../application/hooks/useProfile";
import { MaterialIcons } from '@expo/vector-icons';

const defaultAvatar = require("../../assets/images/avatar.png");

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const { currentUser } = useCurrentUser();
  const { data: profileData, isLoading: isLoadingProfile } = useProfile(currentUser?.id || "");
  const updateProfileMutation = useUpdateProfile();

  // Form validation state
  const [errors, setErrors] = useState({
    name: "",
    phone: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  // Update form data when profile data is loaded
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || "",
        phone: profileData.telefono || "",
      });
    }
  }, [profileData]);

  const validateForm = () => {
    const newErrors = {
      name: "",
      phone: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = "El teléfono debe tener 10 dígitos";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  const handleSave = async () => {
    if (!validateForm() || !currentUser?.id) return;

    const userData = {
      name: formData.name.trim(),
      telefono: formData.phone ? formData.phone.trim() : null,
      email: currentUser.email || "",
    };

    try {
      await updateProfileMutation.mutateAsync({
        userId: currentUser.id,
        data: userData,
      });
      navigation.goBack();
    } catch (error) {
      // Error handling is managed by the mutation
    }
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
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
          <Text style={styles.sectionTitle}>Datos personales</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="Ingresa tu nombre"
              placeholderTextColor="#999999"
              returnKeyType="next"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.disabledInputContainer}>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={currentUser?.email}
                editable={false}
                placeholder="correo@ejemplo.com"
                placeholderTextColor="#999999"
              />
              <MaterialIcons name="lock" size={20} color="#999999" style={styles.lockIcon} />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={formData.phone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
              placeholder="Ingresa tu teléfono"
              placeholderTextColor="#999999"
              keyboardType="phone-pad"
              returnKeyType="done"
              maxLength={10}
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={updateProfileMutation.isPending}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.saveButton,
                updateProfileMutation.isPending && styles.disabledButton
              ]}
              onPress={handleSave}
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  profilePictureContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 50,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  body: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#333333",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 5,
    fontWeight: "500",
  },
  input: {
    height: 45,
    borderColor: "#CCCCCC",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#000000",
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    marginTop: 5,
  },
  disabledInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  disabledInput: {
    backgroundColor: "#F5F5F5",
    color: "#999999",
    flex: 1,
  },
  lockIcon: {
    position: "absolute",
    right: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 30,
  },
  saveButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButton: {
    backgroundColor: "#F5F5F5",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 16,
    fontWeight: "600",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default EditProfileScreen;
