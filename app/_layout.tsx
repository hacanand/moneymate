"use client";
import { useCallback, useState } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  Provider as PaperProvider,
  MD3DarkTheme,
  MD3LightTheme,
} from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ClerkProvider } from "@clerk/clerk-expo";
import * as SecureStore from "expo-secure-store";
import { ThemeProvider } from "../context/ThemeContext";
import { useColorScheme } from "react-native";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Clerk token cache
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
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
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ||
        "YOUR_CLERK_PUBLISHABLE_KEY"
      }
      tokenCache={tokenCache}
    >
      <ThemeProvider>
        <AppContent onLayoutRootView={onLayoutRootView} />
      </ThemeProvider>
    </ClerkProvider>
  );
}

function AppContent({
  onLayoutRootView,
}: {
  onLayoutRootView: () => Promise<void>;
}) {
  const { theme, isDark } = useTheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <PaperProvider theme={theme}>
          <StatusBar style={isDark ? "light" : "dark"} />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: theme.colors.primary,
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
                fontFamily: "Roboto-Bold",
              },
              contentStyle: {
                backgroundColor: theme.colors.background,
              },
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="loan-details"
              options={{ title: "Loan Details" }}
            />
          </Stack>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// This is a temporary hook to use the theme context
// It will be replaced by the actual hook from ThemeContext
function useTheme() {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === "dark");

  // Custom green theme colors
  const customGreenColors = {
    primary: "#2E7D32", // Dark green
    primaryContainer: "#A5D6A7", // Light green container
    secondary: "#4CAF50", // Medium green
    secondaryContainer: "#C8E6C9", // Light green container
    tertiary: "#1B5E20", // Darker green
    tertiaryContainer: "#81C784", // Medium green container
    success: "#4CAF50",
    error: "#F44336",
    warning: "#FF9800",
    info: "#2196F3",
  };

  // Light theme with green colors
  const lightTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      ...customGreenColors,
      background: "#F5F5F5",
      surface: "#FFFFFF",
      surfaceVariant: "#EEEEEE",
      onSurface: "#212121",
      onSurfaceVariant: "#757575",
      elevation: {
        level0: "transparent",
        level1: "#FFFFFF",
        level2: "#F5F5F5",
        level3: "#EEEEEE",
        level4: "#E0E0E0",
        level5: "#BDBDBD",
      },
    },
  };

  // Dark theme with green colors
  const darkTheme = {
    ...MD3DarkTheme,
    colors: {
      ...MD3DarkTheme.colors,
      ...customGreenColors,
      background: "#121212",
      surface: "#1E1E1E",
      surfaceVariant: "#2C2C2C",
      onSurface: "#FFFFFF",
      onSurfaceVariant: "#BBBBBB",
      elevation: {
        level0: "transparent",
        level1: "#1E1E1E",
        level2: "#222222",
        level3: "#272727",
        level4: "#2C2C2C",
        level5: "#333333",
      },
    },
  };

  // Get the current theme based on dark mode state
  const theme = isDark ? darkTheme : lightTheme;

  // This is a temporary implementation
  // The actual implementation will come from ThemeContext
  return { theme, isDark, toggleTheme: () => setIsDark(!isDark) };
}
