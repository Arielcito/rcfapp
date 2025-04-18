import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useCurrentUser } from '../../../application/context/CurrentUserContext';
import Colors from '../../../infraestructure/utils/Colors';

const Header = ({ isTablet }) => {
  const { currentUser } = useCurrentUser();

  return (
    <View style={[styles.container, isTablet && styles.tabletContainer]}>
      <View style={styles.greetingContainer}>
        <Text style={[styles.greeting, isTablet && styles.tabletGreeting]}>
          ¡Hola{currentUser?.name ? `, ${currentUser.name}!` : '!'}
        </Text>
        <Text style={[styles.subGreeting, isTablet && styles.tabletSubGreeting]}>
          ¿Dónde queres jugar hoy?
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  tabletContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  greetingContainer: {
    marginBottom: 10,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'montserrat-medium',
    color: Colors.WHITE,
    marginBottom: 5,
  },
  tabletGreeting: {
    fontSize: 32,
    textAlign: 'center',
  },
  subGreeting: {
    fontSize: 16,
    fontFamily: 'montserrat',
    color: Colors.WHITE,
    opacity: 0.9,
  },
  tabletSubGreeting: {
    fontSize: 20,
    textAlign: 'center',
  },
});

export default Header;
