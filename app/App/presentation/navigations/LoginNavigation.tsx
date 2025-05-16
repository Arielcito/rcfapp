import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserLoginScreen from '../userScreens/UserLoginScreen/UserLoginScreen';
import UserRegistrationScreen from '../userScreens/UserLoginScreen/UserRegistrationScreen';
import PhoneVerificationScreen from '../userScreens/UserLoginScreen/PhoneVerificationScreen';
import TabUserNavigation from './TabUserNavigation';
import OwnerLoginScreen
 from '../ownerScreens/OwnerLoginScreen/OwnerLoginScreen';
import WelcomeLoginScreen from '../screens/WelcomeLoginScreen/WelcomeLoginScreen';
import LoginScreen from '../screens/LoginScreen/LoginScreen';
import CompleteRegistrationScreen from '../userScreens/UserLoginScreen/CompleteRegistrationScreen';
import TabOwnerNavigation from './TabOwnerNavigation';
const Stack = createNativeStackNavigator();

export const LoginStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="welcomePage"
      component={WelcomeLoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="login"
      component={LoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="owner-login"
      component={OwnerLoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="user-login"
      component={UserLoginScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="user-registration"
      component={UserRegistrationScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen name="PhoneVerification" component={PhoneVerificationScreen} />
    <Stack.Screen name="CompleteRegistration" component={CompleteRegistrationScreen} />
    <Stack.Screen
      name="TabUserNavigation"
      component={TabUserNavigation}
      options={{ headerShown: false }}
    />
     <Stack.Screen
      name="TabOwnerNavigation"
      component={TabOwnerNavigation}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
);