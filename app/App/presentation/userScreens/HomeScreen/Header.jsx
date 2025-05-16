import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCurrentUser } from '../../../application/context/CurrentUserContext';
import Colors from '../../../infraestructure/utils/Colors';

const Header = ({ isTablet }) => {
  const { currentUser } = useCurrentUser();

  return (
    <View style={[styles.container, isTablet && styles.tabletContainer]}>
      <Text style={[styles.greeting, isTablet && styles.tabletGreeting]}>
        ⚽️ ¡Hola{currentUser?.name ? `, ${currentUser.name}` : ''}!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 0,
    backgroundColor: 'transparent',
    shadowColor: 'transparent',
    elevation: 0,
  },
  tabletContainer: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 22,
    fontFamily: 'montserrat-medium',
    color: Colors.PRIMARY,
    marginBottom: 0,
  },
  tabletGreeting: {
    fontSize: 28,
    textAlign: 'left',
  },
});

export default Header;
