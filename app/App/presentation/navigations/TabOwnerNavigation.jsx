import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome } from "@expo/vector-icons";
import OwnerAppointments from "../ownerScreens/OwnerAppointment/OwnerAppointments";
import AppointmentInfo from "../ownerScreens/OwnerAppointment/AppointmentInfo";
import OwnerProfileScreen from "../ownerScreens/OwnerProfileScreen/OwnerProfileScreen";
import OwnerPitches from "../ownerScreens/OwnerPitches/OwnerPitches";
import Colors from "../../infraestructure/utils/Colors";
import OwnerHomeScreen from "../ownerScreens/OwnerHome/OwnerHomeScreen";
import FinanceManagementScreen from "../ownerScreens/FinanceManagement/FinanceManagementScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

export default function TabOwnerNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminTabs"
        component={AdminTabs}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="appointments"
      component={AppointmentStack}
      options={{
        tabBarLabel: "Reservas",
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="calendar" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="home"
      component={OwnerHomeScreen}
      options={{
        tabBarLabel: "Inicio",
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="finance"
      component={FinanceManagementScreen}
      options={{
        tabBarLabel: "Flujo de Fondos",
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="cash-outline" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="profile"
      component={OwnerProfileScreen}
      options={{
        tabBarLabel: "Perfil",
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarIcon: ({ color, size }) => (
          <FontAwesome name="user-circle" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const AppointmentStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="owner-appointments"
      component={OwnerAppointments}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="appointment-info"
      component={AppointmentInfo}
      options={{ title: "Informacion de la reserva" }}
    />
    <Stack.Screen
      name="owner-pitches"
      component={OwnerPitches}
      options={{
        headerBackTitleVisible: false,
        headerTitle: "",
        headerTransparent: true,
        headerTintColor: "#000",
        tabBarVisible: false,
      }}
    />
  </Stack.Navigator>
);
