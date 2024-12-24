import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserLoginScreen from '../userScreens/UserLoginScreen/UserLoginScreen';
import UserRegistrationScreen from '../userScreens/UserLoginScreen/UserRegistrationScreen';
import PhoneVerificationScreen from '../userScreens/UserLoginScreen/PhoneVerificationScreen';
import TabUserNavigation from './TabUserNavigation';

const Stack = createNativeStackNavigator();

export default function LoginNavigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" component={UserLoginScreen} />
      <Stack.Screen name="user-registration" component={UserRegistrationScreen} />
      <Stack.Screen name="PhoneVerification" component={PhoneVerificationScreen} />
      <Stack.Screen name="MainApp" component={TabUserNavigation} />
    </Stack.Navigator>
  );
}