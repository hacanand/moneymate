"use client";
import { Tabs } from "expo-router";
import { useTheme } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"] = "home";

          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "stats") {
            iconName = focused ? "chart-bar" : "chart-bar-stacked";
          } else if (route.name === "profile") {
            iconName = focused ? "account" : "account-outline";
          }

          return (
            <MaterialCommunityIcons name={iconName} size={size} color={color} />
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
      <Tabs.Screen
        name="index"
        options={{
          title: "MoneyMate",
          headerTitleAlign: "left",
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Statistics",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "My Profile",
        }}
      />
    </Tabs>
  );
}
