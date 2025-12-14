import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useProxyStore } from "../state/proxyStore";

// Screens
import WelcomeScreen from "../screens/WelcomeScreen";
import ProfileSetupScreen from "../screens/ProfileSetupScreen";
import SocialsSetupScreen from "../screens/SocialsSetupScreen";
import RadarScreen from "../screens/RadarScreen";
import ConnectionsScreen from "../screens/ConnectionsScreen";
import HistoryScreen from "../screens/HistoryScreen";
import ProfileScreen from "../screens/ProfileScreen";
import UserDetailScreen from "../screens/UserDetailScreen";

export type RootStackParamList = {
  Welcome: undefined;
  ProfileSetup: undefined;
  SocialsSetup: undefined;
  MainTabs: undefined;
  UserDetail: { userId: string };
};

export type MainTabParamList = {
  Radar: undefined;
  Connections: undefined;
  History: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          height: 88,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#FF6B6B",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Radar"
        component={RadarScreen}
        options={{
          tabBarLabel: "Discover",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="radio" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Connections"
        component={ConnectionsScreen}
        options={{
          tabBarLabel: "Connections",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const isOnboarded = useProxyStore((s) => s.isOnboarded);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      {!isOnboarded ? (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          <Stack.Screen name="SocialsSetup" component={SocialsSetupScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="UserDetail"
            component={UserDetailScreen}
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
