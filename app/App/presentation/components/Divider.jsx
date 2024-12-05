import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from '../../infraestructure/utils/Colors';
export default function Divider() {
    return (
        <View style={styles.container}>
          {/* Otros componentes */}
          <View style={styles.divider} />
          {/* Otros componentes */}
        </View>
      );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    divider: {
      height: 2,
      width: '100%', // Puedes ajustar el ancho según tus necesidades
      backgroundColor: Colors.PRIMARY, // Color del divisor
      
    },
  });