"use client";
import TabBarBlurBackground from "@/components/TabBarBlurBackground";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Tabs, useSegments } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { theme } = useTheme();
  const { isLoaded, isSignedIn } = useAuth();
  const insets = useSafeAreaInsets();
  const segments = useSegments();

  // Animation state
  const [loading, setLoading] = useState(false);
  const [prevTab, setPrevTab] = useState<string>("");
  const slideAnim = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  // Detect tab changes
  useEffect(() => {
    const tabOrder = ["index", "stats", "profile"];
    if (!prevTab) {
      setPrevTab(segments[segments.length - 1] || "index");
      return;
    }
    const currentTab = segments[segments.length - 1] || "index";
    if (currentTab !== prevTab && !isAnimating.current) {
      isAnimating.current = true;
      setPrevTab(currentTab);
      setLoading(true);
      const prevIndex = tabOrder.indexOf(prevTab);
      const currIndex = tabOrder.indexOf(currentTab);
      const direction = currIndex > prevIndex ? 1 : -1;
      slideAnim.setValue(direction);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setLoading(false);
        isAnimating.current = false;
      });
    }
  }, [segments]);

  // Check if user is authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn]);

  // Don't render anything until auth is loaded
  if (!isLoaded || !isSignedIn) {
    return null;
  }

  // Helper for correct icon typing
  const getTabIcon = (
    route: { name: string },
    focused: boolean
  ): React.ComponentProps<typeof MaterialCommunityIcons>["name"] => {
    if (route.name === "index") return focused ? "home" : "home-outline";
    if (route.name === "stats")
      return focused ? "chart-bar" : "chart-bar-stacked";
    if (route.name === "profile")
      return focused ? "account" : "account-outline";
    return "home";
  };

  return (
    <View style={{ flex: 1 }}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        {loading && (
          <Animated.View
            pointerEvents="none"
            style={{
              ...StyleSheet.absoluteFillObject,
              zIndex: 1,
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [-1, 0, 1],
                    outputRange: [-50, 0, 50],
                  }),
                },
              ],
            }}
          >
            {/* This overlay will block interaction and animate during tab change, but is transparent otherwise */}
          </Animated.View>
        )}
        <Tabs
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => (
              <MaterialCommunityIcons
                name={getTabIcon(route, focused)}
                size={size}
                color={color}
              />
            ),
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
            tabBarBackground: () => <TabBarBlurBackground />, // floating blur
            tabBarStyle: {
              left: 0,
              right: 0,
              bottom: 0,
              elevation: 0,
              backgroundColor: "transparent",
              borderTopWidth: 0,
              borderRadius: 10,
              height: 60,
              shadowColor: "transparent",
            },
            tabBarLabelStyle: {
              fontFamily: "Roboto-Medium",
              fontSize: 12,
            },
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "bold" as const,
              fontFamily: "Roboto-Bold",
            },
            sceneContainerStyle: {
              paddingBottom: 64 + 16 + insets.bottom,
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.08)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
