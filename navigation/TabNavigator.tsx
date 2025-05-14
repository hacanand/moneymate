"use client";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { FC } from "react";
import { useTheme } from "react-native-paper";

// Import screens
import ProfileScreen from "../components/screens/ProfileScreen";
 
import StatsScreen from "../components/screens/StatsScreen";
import type { TabParamList } from "../types/navigation";
import HomeScreen from "@/components/screens/HomeScreen";

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator: FC = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = "home";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Stats") {
            iconName = focused ? "chart-bar" : "chart-bar-stacked";
          } else if (route.name === "Profile") {
            iconName = focused ? "account" : "account-outline";
          }

          return (
            <MaterialCommunityIcons
              name={iconName as keyof typeof MaterialCommunityIcons.glyphMap}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: "gray",
        tabBarLabelStyle: {
          fontFamily: "Roboto-Medium",
          fontSize: 12,
        },
        headerStyle: {
          backgroundColor: theme.colors.primary,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontFamily: "Roboto-Bold",
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "MoneyMate",
          headerTitleAlign: "left",
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: "Statistics",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "My Profile",
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
