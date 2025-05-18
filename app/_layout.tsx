"use client";
import { ClerkProvider } from "@clerk/clerk-expo";
import { isLoaded, useFonts } from "expo-font";
import * as LocalAuthentication from "expo-local-authentication";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useCustomAlert } from "../components/CustomAlert";
import { ThemeProvider, useTheme } from "../context/ThemeContext";

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
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { showAlert, AlertComponent } = useCustomAlert();

  useEffect(() => {
    const checkBiometricAuth = async () => {
      try {
        // Check if biometric login is enabled
        const storedUserId = await SecureStore.getItemAsync(
          "biometric_user_id"
        );

        if (storedUserId) {
          // Biometric is enabled, authenticate
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: "Authenticate to access MoneyMate",
            fallbackLabel: "Use passcode",
            disableDeviceFallback: false,
          });

          if (result.success) {
            // Authentication successful
            setIsAuthenticated(true);
          } else {
            // Authentication failed
            showAlert({
              title: "Authentication Failed",
              message:
                "Biometric authentication is required to access the app.",
              buttons: [
                {
                  text: "Try Again",
                  onPress: () => checkBiometricAuth(),
                },
              ],
            });
          }
        } else {
          // Biometric not enabled, allow access
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Biometric authentication error:", error);
        // If there's an error, allow access but show a warning
        setIsAuthenticated(true);
        showAlert({
          title: "Authentication Error",
          message:
            "There was an error with biometric authentication. You can still access the app.",
          buttons: [{ text: "OK" }],
        });
      } finally {
        setIsAuthenticating(false);
      }
    };

    checkBiometricAuth();
  }, []);

  if (isAuthenticating) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <SafeAreaProvider
        onLayout={onLayoutRootView}
        style={{ flex: 1, backgroundColor: theme.colors.background }}
      >
        <PaperProvider theme={theme}>
          <StatusBar style={isDark ? "light" : "dark"} />
          {isAuthenticated ? (
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
                animation:  "slide_from_right", // Use native smooth slide animation
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="loan-details"
                options={{
                  title: "Loan Details",
                  animation: "slide_from_right",
                }}
              />
            </Stack>
          ) : (
            <View
              style={[
                styles.loadingContainer,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          )}
          <AlertComponent />
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
