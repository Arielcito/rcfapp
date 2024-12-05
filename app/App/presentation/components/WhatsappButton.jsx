import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Linking } from "react-native";


const WhatsappButton = ({phoneNumber, message}) => {

  const handleWhatsApp = () => {
    
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    Linking.openURL(whatsappUrl);
  };

  return (
    <View style={styles.whatsappButtonContainer}>
      <TouchableOpacity onPress={handleWhatsApp} style={styles.whatsappButton}>
        <Ionicons
          name="logo-whatsapp"
          size={24}
          color="#fff"
          style={styles.whatsappIcon}
        />
        <Text style={styles.whatsappText}>Habla con el dueño</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    whatsappButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#25D366',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        justifyContent: 'center',
      },
      whatsappIcon: {
        marginRight: 10,
      },
      whatsappText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
      },
});

export default WhatsappButton;
