import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Colors from "../../infrastructure/utils/Colors";
const ButtonPrimary = ({ text, onPress }) => {
    return (
        <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{text}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: Colors.PRIMARY,
        padding: 10,
        borderRadius: 5,
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {   
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    }
});

export default ButtonPrimary;
