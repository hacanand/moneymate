"use client";
import InitialLayout from "@/components/initialLayout";
import { ClerkProvider } from "@clerk/clerk-expo";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback } from "react";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Custom theme for MoneyMate
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#2E7D32", // Dark green
    accent: "#4CAF50", // Light green
    background: "#FFFFFF",
    statusBar: "#2E7D32",
    surface: "#F5F5F5",
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Roboto-Regular": require("../assets/fonts/Roboto-Regular.ttf"),
    "Roboto-Bold": require("../assets/fonts/Roboto-Bold.ttf"),
    "Roboto-Medium": require("../assets/fonts/Roboto-Medium.ttf"),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={
        Constants.expoConfig?.extra?.clerkPublishableKey ||
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
      }
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <SafeAreaProvider
            style={{
              flex: 1,

              paddingTop: Constants.statusBarHeight,
            }}
          >
            <PaperProvider theme={theme}>
              <StatusBar backgroundColor="transparent" translucent={true} />
              {/* <StatusBar style="auto" /> */}
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "fade_from_bottom",
                  animationDuration: 200,
                }}
              >
                <InitialLayout />
              </Stack>
            </PaperProvider>
          </SafeAreaProvider>
        </View>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
