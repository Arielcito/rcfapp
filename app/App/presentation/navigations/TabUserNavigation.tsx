import React from "react";
import { Platform, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Colors from "../../infraestructure/utils/Colors";

// Importaciones de pantallas
import HomeScreen from "../userScreens/HomeScreen/HomeScreen";
import ProfileScreen from "../userScreens/ProfileScreen/ProfileScreen";
import BookingScreen from "../userScreens/BookingScreen/BookingScreen";
import MyBookingsScreen from "../userScreens/MyBookingsScreen/MyBookingsScreen";
import PaymentScreen from "../userScreens/PaymentScreen/PaymentScreen";
import PitchProfileScreen from "../userScreens/PitchProfileScreen/PitchProfileScreen";
import EditProfileScreen from "../userScreens/ProfileScreen/EditProfileScreen";
import DeleteAccountScreen from "../userScreens/ProfileScreen/DeleteAccountScreen";
import MyBookingDescriptionScreen from "../userScreens/MyBookingsScreen/MyBookingDescriptionScreen";
import SuccessScreen from "../userScreens/SuccessScreen/SuccessScreen";
import MapScreen from "../userScreens/MapScreen/MapScreen";
import TermsAndCondition from "../userScreens/ProfileScreen/TermsAndCondition";
// Importaciones de iconos
import CalendarIcon from "../assets/icons/CalendarIcon";
import HomeIcon from "../assets/icons/HomeIcon";
import ProfileIcon from "../assets/icons/ProfileIcon";
import UbicationIcon from "../assets/icons/UbicationIcon";
import BookingDateTimeScreen from "../userScreens/BookingDateTime/BookingDateTimeScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Configuración común para las pestañas
const tabScreenOptions = {
  tabBarLabel: "",
  tabBarActiveTintColor: "black",
};

// Componente para el stack de perfil
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="profile" component={ProfileScreen} />
    <Stack.Screen name="myBooking" component={MyBookingsScreen} />
    <Stack.Screen name="termsAndCondition" component={TermsAndCondition} />
    <Stack.Screen name="delete-account" component={DeleteAccountScreen} options={{
      headerShown: true,
      headerTitle: "Eliminar cuenta",
      headerTintColor: "black",
    }} />
    <Stack.Screen
      name="myBookingDescription"
      component={MyBookingDescriptionScreen}
    />
  </Stack.Navigator>
);

// Componente para el stack de reservas
const BookingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="myBooking" component={MyBookingsScreen} />
    <Stack.Screen
      name="myBookingDescription"
      component={MyBookingDescriptionScreen}
    />
  </Stack.Navigator>
);

// Componente para las pestañas de usuario
const UserTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: {
        backgroundColor: Colors.WHITE,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      tabBarShowLabel: false,
      tabBarActiveTintColor: Colors.PRIMARY,
      tabBarInactiveTintColor: 'black',
      tabBarIcon: ({ color, focused }) => {
        let Icon;
        switch (route.name) {
          case 'home':
            Icon = CalendarIcon;
            break;
          case 'mapStack':
            Icon = UbicationIcon;
            break;
          case 'myBookingStack':
            Icon = HomeIcon;
            break;
          case 'profileTab':
            Icon = ProfileIcon;
            break;
          default:
            Icon = HomeIcon; // Fallback icon
        }
        return (
          <>
            {focused && (
              <View style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: Colors.PRIMARY,
                borderTopLeftRadius: 3,
                borderTopRightRadius: 3,
              }} />
            )}
            {Icon && <Icon width={25} height={25} color={color} />}
          </>
        );
      },
    })}
  >
    <Tab.Screen
      name="home"
      component={HomeScreen}
      options={{
        ...tabScreenOptions,
        tabBarIcon: () => <CalendarIcon width={25} height={25} />,
      }}
    />
    {Platform.OS === 'android' && (
      <Tab.Screen
        name="mapStack"
        component={MapStack}
        options={{
          ...tabScreenOptions,
          tabBarIcon: () => <UbicationIcon width={25} height={25} />,
        }}
      />
    )}
    <Tab.Screen
      name="myBookingStack"
      component={BookingStack}
      options={{
        ...tabScreenOptions,
        tabBarIcon: ({ color }) => (
          <HomeIcon width={25} height={25} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="profileTab"
      component={ProfileStack}
      options={{
        ...tabScreenOptions,
        tabBarIcon: () => <ProfileIcon width={25} height={25} />,
      }}
    />
  </Tab.Navigator>
);
const MapStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="map"
      component={MapScreen}
      options={{
        headerBackTitleVisible: false,
        headerTitle: "",
        headerTransparent: true,
        headerTintColor: "#fff",
      }}
    />
    <Stack.Screen name="bookingDateTime" component={BookingDateTimeScreen} options={{
        headerBackTitleVisible: false,
        headerTitle: "",
        headerTransparent: true,
        headerTintColor: "#fff",
      }} />
  </Stack.Navigator>
);
// Componente principal de navegación
export default function TabUserNavigation() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={UserTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="home"
        component={HomeScreen}
        options={{ title: "Mis reservas" }}
      />
      <Stack.Screen
        name="booking"
        component={BookingScreen}
        options={{
          headerBackTitleVisible: false,
          headerTitle: "",
          headerTransparent: true,
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="payment"
        component={PaymentScreen}
        options={{ title: "Pago" }}
      />
      <Stack.Screen
        name="successScreen"
        component={SuccessScreen}
        options={{
          headerBackTitleVisible: false,
          headerTitle: "",
          headerTransparent: true,
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="pitch-profile"
        component={PitchProfileScreen}
        options={{
          headerBackTitleVisible: false,
          headerTitle: "",
          headerTransparent: true,
          headerTintColor: "#fff",
        }}
      />
      <Stack.Screen
        name="edit-profile"
        component={EditProfileScreen}
        options={{
          headerBackTitleVisible: false,
          headerTitle: "Editar Perfil",
          headerTintColor: "black",
        }}
      />
    </Stack.Navigator>
  );
}
