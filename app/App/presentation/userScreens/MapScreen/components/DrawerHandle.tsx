import React from 'react';
import { View, StyleSheet } from 'react-native';

interface DrawerHandleProps {
  panHandlers: any;
}

export function DrawerHandle({ panHandlers }: DrawerHandleProps) {
  return (
    <View {...panHandlers}>
      <View style={styles.drawerHandle} />
    </View>
  );
}

const styles = StyleSheet.create({
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#DDD",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 10,
  },
}); 